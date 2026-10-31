import { describe, expect, it } from 'vitest';
import { auditPromotionEvidence } from './audit-promotion-evidence.mjs';

const clock = new Date('2026-10-31T12:00:00.000Z');
const observation = (ends, overrides = {}) => ({
  id: 'vari-promo-1',
  productId: 'vari-comfortedge-60x30',
  observedAt: '2026-10-29T05:05:00.000Z',
  sourceMetadata: { promotionEnds: ends },
  ...overrides,
});

describe('read-only promotional evidence audit', () => {
  it('flags a promotion that has expired, without changing the original record', () => {
    const data = { observations: [observation('2026-10-30T23:59:00-06:00')] };
    const before = structuredClone(data);
    expect(auditPromotionEvidence(data, clock)).toEqual([{
      severity: 'blocker',
      code: 'EXPIRED_PROMOTION_EVIDENCE',
      observationId: 'vari-promo-1',
      productId: 'vari-comfortedge-60x30',
      promotionEnds: '2026-10-30T23:59:00-06:00',
    }]);
    expect(data).toEqual(before);
  });
  it('does not flag an unexpired promotion', () => {
    expect(auditPromotionEvidence({ observations: [observation('2026-11-18T23:59:00-06:00')] }, clock)).toEqual([]);
  });
  it('does not flag ordinary observations with no promotional deadline', () => {
    expect(auditPromotionEvidence({ observations: [{ id: 'ordinary', sourceMetadata: {} }] }, clock)).toEqual([]);
  });
  it('fails closed on invalid promotional deadline', () => {
    expect(auditPromotionEvidence({ observations: [observation('not-a-timestamp')] }, clock)).toEqual([{
      severity: 'blocker',
      code: 'INVALID_PROMOTION_DEADLINE',
      observationId: 'vari-promo-1',
      productId: 'vari-comfortedge-60x30',
    }]);
  });
  it('rejects impossible calendar dates rather than accepting Date.parse normalization', () => {
    expect(auditPromotionEvidence({ observations: [observation('2026-02-30T12:00:00Z')] }, clock)).toEqual([{
      severity: 'blocker',
      code: 'INVALID_PROMOTION_DEADLINE',
      observationId: 'vari-promo-1',
      productId: 'vari-comfortedge-60x30',
    }]);
  });
  it('flags evidence captured after the promotion deadline', () => {
    const data = { observations: [observation('2026-11-18T00:00:00Z', { observedAt: '2026-11-19T00:00:00Z' })] };
    expect(auditPromotionEvidence(data, clock)).toEqual([{
      severity: 'blocker',
      code: 'OBSERVED_AFTER_PROMOTION_DEADLINE',
      observationId: 'vari-promo-1',
      productId: 'vari-comfortedge-60x30',
    }]);
  });
  it('rejects a malformed observation timestamp when promotion metadata exists', () => {
    const data = { observations: [observation('2026-11-18T00:00:00Z', { observedAt: 'invalid' })] };
    expect(auditPromotionEvidence(data, clock)).toEqual([{
      severity: 'blocker',
      code: 'INVALID_PROMOTION_OBSERVED_AT',
      observationId: 'vari-promo-1',
      productId: 'vari-comfortedge-60x30',
    }]);
  });
  it('rejects invalid clock values rather than silently accepting evidence', () => {
    expect(() => auditPromotionEvidence({ observations: [] }, new Date('invalid'))).toThrow('Invalid audit clock');
  });
});
