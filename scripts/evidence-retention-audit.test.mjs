import { describe, expect, it } from 'vitest';
import { buildEvidenceLedger } from './evidence-ledger.mjs';
import { auditEvidenceRetention } from './evidence-retention-audit.mjs';
const make = (observedAt = '2026-10-30T00:00:00Z') => buildEvidenceLedger({ valid: true, errors: [], accepted: [{ taskId: 't1', sku: 'a', observedAt, reviewStatus: 'pending_review', publicationAuthorized: false }] });
describe('offline evidence retention audit', () => {
  it('accepts recent evidence without authorizing publication', () => expect(auditEvidenceRetention(make(), { now: '2026-10-31T00:00:00Z' })).toMatchObject({ valid: true, publicationAuthorized: false }));
  it('flags stale evidence', () => expect(auditEvidenceRetention(make('2026-01-01T00:00:00Z'), { now: '2026-10-31T00:00:00Z' }).findings[0].code).toBe('STALE_EVIDENCE'));
  it('flags future observations', () => expect(auditEvidenceRetention(make('2026-11-02T00:00:00Z'), { now: '2026-10-31T00:00:00Z' }).findings[0].code).toBe('FUTURE_OBSERVATION'));
  it('rejects malformed observation dates', () => expect(auditEvidenceRetention(make('not-a-date'), { now: '2026-10-31T00:00:00Z' }).findings[0].code).toBe('MISSING_OBSERVATION_TIME'));
  it('rejects tampered evidence', () => { const l = make(); l.records[0].evidence.sku = 'changed'; expect(auditEvidenceRetention(l).findings[0].code).toBe('INVALID_LEDGER'); });
  it('rejects invalid policy settings', () => expect(auditEvidenceRetention(make(), { now: '2026-10-31T00:00:00Z', maxAgeDays: 0 }).valid).toBe(false));
});
