import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateEvidenceIntake(submissions, queue) {
  const errors = [];
  const ids = new Set();
  const tasks = new Map((queue.tasks ?? []).map(task => [task.id, task]));
  const accepted = [];
  for (const [index, entry] of submissions.entries()) {
    const task = tasks.get(entry.taskId);
    if (!task) { errors.push({ index, code: 'UNKNOWN_TASK' }); continue; }
    if (ids.has(entry.taskId + ':' + entry.sku + ':' + entry.sourceUrl)) { errors.push({ index, code: 'DUPLICATE_EVIDENCE' }); continue; }
    ids.add(entry.taskId + ':' + entry.sku + ':' + entry.sourceUrl);
    let url;
    try { url = new URL(entry.sourceUrl); } catch { errors.push({ index, code: 'INVALID_URL' }); continue; }
    if (url.protocol !== 'https:' || url.username || url.password || !/^[a-z0-9.-]+$/i.test(url.hostname) || !url.hostname.includes('.') || /^(localhost|.*\\.local|.*\\.internal)$/i.test(url.hostname) || /^(?:\\d{1,3}\\.){3}\\d{1,3}$/.test(url.hostname)) { errors.push({ index, code: 'UNSAFE_SOURCE_URL' }); continue; }
    if (entry.country !== task.country || entry.currency !== task.currency || entry.category !== task.category) { errors.push({ index, code: 'TASK_MARKET_MISMATCH' }); continue; }
    if (typeof entry.sku !== 'string' || !entry.sku.trim() || typeof entry.productName !== 'string' || !entry.productName.trim()) { errors.push({ index, code: 'MISSING_IDENTITY' }); continue; }
    if (!['manufacturer_product_page', 'manufacturer_specification', 'authorized_merchant'].includes(entry.sourceKind)) { errors.push({ index, code: 'UNSUPPORTED_SOURCE_KIND' }); continue; }
    if (entry.priceMinorUnits !== null && (!Number.isSafeInteger(entry.priceMinorUnits) || entry.priceMinorUnits < 0)) { errors.push({ index, code: 'INVALID_PRICE' }); continue; }
    if (!/^\\d{4}-\\d{2}-\\d{2}T/.test(entry.observedAt ?? '') || !Number.isFinite(Date.parse(entry.observedAt))) { errors.push({ index, code: 'INVALID_OBSERVED_AT' }); continue; }
    accepted.push({ taskId: entry.taskId, country: entry.country, currency: entry.currency, category: entry.category, sku: entry.sku.trim(), productName: entry.productName.trim(), sourceUrl: url.href, sourceKind: entry.sourceKind, priceMinorUnits: entry.priceMinorUnits, observedAt: entry.observedAt, reviewStatus: 'pending_review', publicationAuthorized: false });
  }
  return { valid: errors.length === 0, accepted, errors, publicationAuthorized: false };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const [queuePath, submissionsPath] = process.argv.slice(2);
  if (!queuePath || !submissionsPath) throw new Error('Usage: node scripts/research-evidence-intake.mjs <queue.json> <submissions.json>');
  const queue = JSON.parse(readFileSync(resolve(queuePath), 'utf8'));
  const submissions = JSON.parse(readFileSync(resolve(submissionsPath), 'utf8'));
  if (!Array.isArray(submissions)) throw new Error('Submissions must be an array');
  const result = validateEvidenceIntake(submissions, queue);
  const output = resolve('artifacts/research-evidence-review.json');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ valid: result.valid, accepted: result.accepted.length, errors: result.errors, publicationAuthorized: false }));
  if (!result.valid) process.exitCode = 1;
}
