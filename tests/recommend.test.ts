import { describe, expect, it } from 'vitest';
import demo from '../src/data/demo.json';
import { getApprovedAffiliateLink } from '../src/lib/affiliate';
import { recommend, type Criteria } from '../src/lib/recommend';
import { CatalogSchema, OfferSchema } from '../src/lib/schema';

const catalog = CatalogSchema.parse(demo);
const criteria: Criteria = { budgetCents: 50000, minDesktopWidthInches: 48, minDesktopDepthInches: 24, targetMinHeightInches: 28, targetMaxHeightInches: 47, minLiftCapacityLbs: 150, electricRequired: true, workspace: 'standard', preference: 'value', market: 'US' };

describe('catalog validation', () => {
  it('accepts the explicitly labeled demonstration catalog', () => expect(catalog.catalogStatus).toBe('demo'));
  it('rejects a verified product without provenance', () => {
    const invalid = structuredClone(demo); invalid.products[0]!.dataStatus = 'verified';
    expect(() => CatalogSchema.parse(invalid)).toThrow(/source URL/);
  });
  it('rejects offers pointing to a missing product', () => {
    const invalid = structuredClone(demo); invalid.offers[0]!.productId = 'missing-product';
    expect(() => CatalogSchema.parse(invalid)).toThrow(/reference a catalog product/);
  });
  it('requires an approved URL before an offer is marked approved', () => {
    const invalid = { ...catalog.offers[0], affiliateProgramStatus: 'approved' };
    expect(() => OfferSchema.parse(invalid)).toThrow(/require an approved affiliate URL/);
  });
});

describe('recommendation engine', () => {
  it('filters on desktop dimensions, adjustment, range, capacity, availability, and known shipping', () => {
    const results = recommend(catalog.products, catalog.offers, criteria);
    expect(results.map((result) => result.product.id)).toEqual(['demo-desk-b', 'demo-desk-a']);
    expect(results.every((result) => result.product.specifications?.electric && result.offer.availability === 'in_stock')).toBe(true);
  });
  it('excludes offers exceeding landed budget or missing mandatory shipping', () => {
    const changed = catalog.offers.map((offer) => offer.productId === 'demo-desk-a' ? { ...offer, mandatoryShippingCents: 20000 } : { ...offer, mandatoryShippingCents: null });
    expect(recommend(catalog.products, changed, criteria)).toHaveLength(0);
  });
  it('applies workspace minimums as well as the explicit desk dimensions', () => {
    const compact = recommend(catalog.products, catalog.offers, { ...criteria, workspace: 'compact', minDesktopWidthInches: 40, minDesktopDepthInches: 20, electricRequired: false, minLiftCapacityLbs: 90, targetMinHeightInches: undefined, targetMaxHeightInches: undefined });
    const large = recommend(catalog.products, catalog.offers, { ...criteria, workspace: 'large', minDesktopWidthInches: 40, minDesktopDepthInches: 20 });
    expect(compact).toHaveLength(3);
    expect(large).toHaveLength(0);
  });
  it('is deterministic and excludes affiliate terms from scores and rank', () => {
    const approved = catalog.offers.map((offer) => OfferSchema.parse(offer.id === 'demo-offer-a' ? { ...offer, affiliateProgramStatus: 'approved', affiliateUrl: 'https://merchant.example/approved-link' } : offer));
    const baseline = recommend(catalog.products, catalog.offers, criteria);
    const withAffiliate = recommend(catalog.products, approved, criteria);
    expect(withAffiliate.map((item) => [item.product.id, item.score])).toEqual(baseline.map((item) => [item.product.id, item.score]));
    expect(recommend(catalog.products, catalog.offers, criteria)).toEqual(baseline);
  });
});

describe('affiliate link handling', () => {
  it('does not create a link for missing or unavailable program data', () => expect(getApprovedAffiliateLink(catalog.offers[0]!)).toBeNull());
  it('returns sponsored attributes only for an in-stock approved destination', () => {
    const approved = OfferSchema.parse({ ...catalog.offers[0], affiliateProgramStatus: 'approved', affiliateUrl: 'https://merchant.example/approved-link' });
    expect(getApprovedAffiliateLink(approved)).toEqual({ href: 'https://merchant.example/approved-link', rel: 'sponsored nofollow noopener noreferrer' });
  });
});
