import { describe, it, expect } from 'vitest';
import { auditGlobalMarkets } from './global-market-audit.mjs';

describe('global research market registry', () => {
  const registry = { markets: [{ country: 'US', currency: 'USD', language: 'en' }, { country: 'IN', currency: 'INR', language: 'en' }] };
  it('accepts registered markets without enabling publication', () => {
    expect(auditGlobalMarkets(registry, { products: [{ id: 'desk', market: 'US' }] })).toMatchObject({ researchMarkets: 2, findings: [], publicationAuthorized: false });
  });
  it('rejects unregistered product market', () => {
    expect(auditGlobalMarkets(registry, { products: [{ id: 'desk', market: 'ZZ' }] }).findings[0].code).toBe('UNREGISTERED_MARKET');
  });
  it('flags duplicate market codes', () => {
    expect(auditGlobalMarkets({ markets: [registry.markets[0], registry.markets[0]] }, { products: [] }).findings[0].code).toBe('INVALID_MARKET');
  });
});
