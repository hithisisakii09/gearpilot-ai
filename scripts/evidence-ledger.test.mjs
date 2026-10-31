import { describe, it, expect } from 'vitest';
import { buildEvidenceLedger, verifyEvidenceLedger } from './evidence-ledger.mjs';
const evidence = { taskId: '2026-10-31:IN:standing_desk', sku: 'SKU-1', reviewStatus: 'pending_review', publicationAuthorized: false };
const intake = { valid: true, errors: [], accepted: [evidence] };
describe('research evidence integrity ledger', () => {
  it('builds a verifiable ledger', () => { const ledger = buildEvidenceLedger(intake, { generatedAt: '2026-10-31T00:00:00Z' }); expect(ledger.recordCount).toBe(1); expect(verifyEvidenceLedger(ledger)).toBe(true); });
  it('detects evidence tampering', () => { const ledger = buildEvidenceLedger(intake); ledger.records[0].evidence.sku = 'CHANGED'; expect(verifyEvidenceLedger(ledger)).toBe(false); });
  it('detects deleted records', () => { const ledger = buildEvidenceLedger(intake); ledger.records = []; expect(verifyEvidenceLedger(ledger)).toBe(false); });
  it('rejects unvalidated intake', () => expect(() => buildEvidenceLedger({ ...intake, valid: false })).toThrow());
  it('rejects preapproved or publishable evidence', () => expect(() => buildEvidenceLedger({ ...intake, accepted: [{ ...evidence, publicationAuthorized: true }] })).toThrow());
  it('uses stable canonical hashes independent of property order', () => { const a = buildEvidenceLedger(intake, { generatedAt: '2026-10-31T00:00:00Z' }); const b = buildEvidenceLedger({ ...intake, accepted: [{ publicationAuthorized: false, reviewStatus: 'pending_review', sku: 'SKU-1', taskId: '2026-10-31:IN:standing_desk' }] }, { generatedAt: '2026-10-31T00:00:00Z' }); expect(a.rootHash).toBe(b.rootHash); });
});
