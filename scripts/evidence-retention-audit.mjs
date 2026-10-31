import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyEvidenceLedger } from './evidence-ledger.mjs';

// Offline governance preflight; this does not delete, encrypt, or publish evidence.
export function auditEvidenceRetention(ledger, { now, maxAgeDays = 30 } = {}) {
  if (!verifyEvidenceLedger(ledger)) return { valid: false, findings: [{ code: 'INVALID_LEDGER' }], publicationAuthorized: false };
  const clock = now === undefined ? Date.now() : Date.parse(now);
  if (!Number.isFinite(clock) || !Number.isSafeInteger(maxAgeDays) || maxAgeDays < 1 || maxAgeDays > 365) return { valid: false, findings: [{ code: 'INVALID_POLICY' }], publicationAuthorized: false };
  const findings = [];
  for (const [index, record] of ledger.records.entries()) {
    const observed = Date.parse(record.evidence.observedAt);
    if (!Number.isFinite(observed)) findings.push({ index, code: 'MISSING_OBSERVATION_TIME' });
    else if (observed > clock + 300000) findings.push({ index, code: 'FUTURE_OBSERVATION' });
    else if (clock - observed > maxAgeDays * 86400000) findings.push({ index, code: 'STALE_EVIDENCE' });
  }
  return { valid: findings.length === 0, findings, policy: { maxAgeDays, action: 'flag_for_manual_review_only' }, publicationAuthorized: false };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/evidence-retention-audit.mjs <ledger.json>');
  const ledger = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
  const result = auditEvidenceRetention(ledger);
  console.log(JSON.stringify(result));
  if (!result.valid) process.exitCode = 1;
}
