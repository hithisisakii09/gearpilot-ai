import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function auditResearchQueue(queue, registry) {
  const findings = [];
  const markets = new Map((registry.markets ?? []).map(m => [m.country, m]));
  const ids = new Set();
  for (const task of queue.tasks ?? []) {
    if (ids.has(task.id)) findings.push({ code: 'DUPLICATE_TASK', id: task.id });
    ids.add(task.id);
    const market = markets.get(task.country);
    if (!market) findings.push({ code: 'UNKNOWN_COUNTRY', id: task.id });
    else if (task.currency !== market.currency || task.language !== market.language) findings.push({ code: 'MARKET_METADATA_MISMATCH', id: task.id });
    if (task.publicationAuthorized !== false || task.status !== 'pending_primary_source_research') findings.push({ code: 'UNSAFE_TASK_STATE', id: task.id });
    if (!['standing_desk', 'ergonomic_chair', 'monitor_arm', 'docking_station'].includes(task.category)) findings.push({ code: 'INVALID_CATEGORY', id: task.id });
  }
  return { valid: findings.length === 0, tasks: (queue.tasks ?? []).length, findings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const filename = process.argv[2];
  if (!filename) throw new Error('Usage: node scripts/research-queue-audit.mjs <queue.json>');
  const queue = JSON.parse(readFileSync(resolve(filename), 'utf8'));
  const registry = JSON.parse(readFileSync(new URL('../config/global-markets.json', import.meta.url), 'utf8'));
  const result = auditResearchQueue(queue, registry);
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) process.exitCode = 1;
}
