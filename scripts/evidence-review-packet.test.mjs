import { describe, expect, it } from 'vitest';
import { buildEvidenceLedger } from './evidence-ledger.mjs';
import { buildReviewPacket, auditReviewPacket } from './evidence-review-packet.mjs';
const intake = () => ({ valid: true, errors: [], accepted: [{ taskId: 't1', sku: 'SKU1', productName: 'Desk', country: 'US', currency: 'USD', sourceUrl: 'https://example.com/desk', observedAt: '2026-10-31T00:00:00Z', reviewStatus: 'pending_review', publicationAuthorized: false }] });
describe('offline independent-review packet', () => {
  it('creates a non-publishing packet with two-reviewer policy', () => { const p = buildReviewPacket(buildEvidenceLedger(intake())); expect(p.approvalPolicy.authenticatedApproversRequired).toBe(2); expect(p.publicationAuthorized).toBe(false); expect(p.entries[0].approvalCount).toBe(0); });
  it('generates stable IDs from the ledger root', () => { const l = buildEvidenceLedger(intake()); expect(buildReviewPacket(l).packetId).toBe(buildReviewPacket(l).packetId); });
  it('rejects tampered ledger', () => { const l = buildEvidenceLedger(intake()); l.records[0].evidence.sku = 'tampered'; expect(() => buildReviewPacket(l)).toThrow('INVALID_LEDGER'); });
  it('detects packet tampering', () => { const l = buildEvidenceLedger(intake()); const p = buildReviewPacket(l); p.entries[0].approvalCount = 2; expect(auditReviewPacket(p,l)).toEqual({ valid: false, code: 'PACKET_TAMPERED' }); });
  it('does not allow a review decision to be forged', () => { const l = buildEvidenceLedger(intake()); const p = buildReviewPacket(l); p.reviewDecision = 'approved'; expect(auditReviewPacket(p,l).valid).toBe(false); });
});
