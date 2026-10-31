import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyEvidenceLedger } from './evidence-ledger.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
export function buildReviewPacket(ledger) {
  if (!verifyEvidenceLedger(ledger)) throw new Error('INVALID_LEDGER');
  const entries = ledger.records.map((record, index) => ({
    index,
    evidenceHash: record.evidenceHash,
    chainHash: record.chainHash,
    taskId: record.evidence.taskId,
    sourceUrl: record.evidence.sourceUrl ?? null,
    observedAt: record.evidence.observedAt ?? null,
    identity: { sku: record.evidence.sku ?? null, productName: record.evidence.productName ?? null },
    market: { country: record.evidence.country ?? null, currency: record.evidence.currency ?? null },
    reviewStatus: 'pending_review',
    approvalCount: 0,
    publicationAuthorized: false
  }));
  return {
    version: 1,
    ledgerRootHash: ledger.rootHash,
    packetId: hash('review-packet-v1:' + ledger.rootHash),
    entries,
    approvalPolicy: { authenticatedApproversRequired: 2, independentCollectorRequired: true, bypassAllowed: false },
    status: 'awaiting_independent_review',
    reviewDecision: null,
    publicationAuthorized: false
  };
}
export function auditReviewPacket(packet, ledger) {
  if (!verifyEvidenceLedger(ledger)) return { valid: false, code: 'INVALID_LEDGER' };
  const expected = buildReviewPacket(ledger);
  return { valid: JSON.stringify(packet) === JSON.stringify(expected), code: JSON.stringify(packet) === JSON.stringify(expected) ? 'OK' : 'PACKET_TAMPERED' };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/evidence-review-packet.mjs <ledger.json>');
  const ledger = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8'));
  const packet = buildReviewPacket(ledger);
  if (!auditReviewPacket(packet, ledger).valid) throw new Error('Packet integrity check failed');
  mkdirSync(resolve('artifacts'), { recursive: true });
  writeFileSync(resolve('artifacts/evidence-review-packet.json'), JSON.stringify(packet, null, 2) + '\n');
  console.log(JSON.stringify({ entries: packet.entries.length, packetId: packet.packetId, publicationAuthorized: false }));
}
