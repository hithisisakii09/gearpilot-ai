import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
}
function sha(value) { return createHash('sha256').update(value).digest('hex'); }
export function buildEvidenceLedger(intake, { generatedAt = new Date().toISOString() } = {}) {
  if (!intake || intake.valid !== true || !Array.isArray(intake.accepted) || (intake.errors ?? []).length) throw new Error('Only fully validated intake is eligible');
  if (!Number.isFinite(Date.parse(generatedAt))) throw new Error('Invalid timestamp');
  const records = [];
  let previousHash = '0'.repeat(64);
  for (const item of intake.accepted) {
    if (item.reviewStatus !== 'pending_review' || item.publicationAuthorized !== false) throw new Error('Evidence is not quarantined');
    const evidenceHash = sha(canonical(item));
    const chainHash = sha(previousHash + ':' + evidenceHash);
    records.push({ evidenceHash, previousHash, chainHash, evidence: item });
    previousHash = chainHash;
  }
  return { version: 1, generatedAt, status: 'unreviewed', publicationAuthorized: false, recordCount: records.length, rootHash: previousHash, records };
}
export function verifyEvidenceLedger(ledger) {
  if (!ledger || ledger.version !== 1 || ledger.publicationAuthorized !== false || ledger.status !== 'unreviewed' || !Array.isArray(ledger.records) || ledger.recordCount !== ledger.records.length) return false;
  let previousHash = '0'.repeat(64);
  for (const record of ledger.records) {
    if (record.evidence?.reviewStatus !== 'pending_review' || record.evidence?.publicationAuthorized !== false) return false;
    const evidenceHash = sha(canonical(record.evidence));
    const chainHash = sha(previousHash + ':' + evidenceHash);
    if (record.evidenceHash !== evidenceHash || record.previousHash !== previousHash || record.chainHash !== chainHash) return false;
    previousHash = chainHash;
  }
  return ledger.rootHash === previousHash;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const input = process.argv[2];
  if (!input) throw new Error('Usage: node scripts/evidence-ledger.mjs <validated-intake.json>');
  const ledger = buildEvidenceLedger(JSON.parse(readFileSync(resolve(input), 'utf8')));
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(resolve('artifacts/evidence-ledger.json'), JSON.stringify(ledger, null, 2) + '\n');
  if (!verifyEvidenceLedger(ledger)) throw new Error('Ledger integrity failure');
  console.log(JSON.stringify({ records: ledger.recordCount, rootHash: ledger.rootHash, publicationAuthorized: false }));
}
