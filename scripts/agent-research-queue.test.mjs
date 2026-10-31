import { describe, it, expect } from 'vitest';
import { planResearch } from './agent-research-queue.mjs';
const markets = { markets: [{ country: 'US', currency: 'USD', language: 'en' }, { country: 'IN', currency: 'INR', language: 'en' }, { country: 'JP', currency: 'JPY', language: 'ja' }] };
describe('multi-country research queue', () => {
  it('schedules multiple markets without publishing', () => {
    const tasks = planResearch(markets, { products: [] }, { date: '2026-10-31', batchSize: 3 });
    expect(new Set(tasks.map(t => t.country)).size).toBe(3);
    expect(tasks.every(t => !t.publicationAuthorized && t.status === 'pending_primary_source_research')).toBe(true);
  });
  it('is deterministic and idempotent for a date', () => {
    const a = planResearch(markets, { products: [] }, { date: '2026-10-31', batchSize: 3 });
    expect(a).toEqual(planResearch(markets, { products: [] }, { date: '2026-10-31', batchSize: 3 }));
  });

  it('rejects malformed and impossible calendar dates', () => {
    for (const date of ['2026-2-01', '2026-02-30', 'not-a-date', '2026-13-01']) {
      expect(() => planResearch(markets, {}, { date })).toThrow('Invalid date');
    }
  });
  it('rejects invalid batches', () => {
    expect(() => planResearch(markets, {}, { batchSize: 0 })).toThrow();
  });
});
