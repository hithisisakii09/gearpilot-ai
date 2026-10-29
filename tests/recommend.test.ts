import { describe, expect, it } from 'vitest';
import candidates from '../src/data/candidates.json';
import demo from '../src/data/demo.json';
import { getApprovedAffiliateLink } from '../src/lib/affiliate';
import { AVAILABILITY_FRESHNESS_MS, PRICE_FRESHNESS_MS, recommend, type Criteria } from '../src/lib/recommend';
import { CatalogSchema, OfferSchema } from '../src/lib/schema';
import { kilogramsToPounds, millimetresToInches } from '../src/lib/units';

const demoCatalog = CatalogSchema.parse(demo);
const candidateCatalog = CatalogSchema.parse(candidates);
const now = new Date('2026-10-29T00:00:00Z');
const configurationId = 'branch-duo-48x24-test';
const reviewEvidence = { evidenceNotes: 'Approved test fixture.', evidenceQuality: 'primary' as const, reviewStatus: 'approved' as const, reviewer: 'Test reviewer', reviewedAt: now.toISOString(), sourceMetadata: {} };
const criteria: Criteria = { budgetCents: 50000, minDesktopWidthInches: 48, minDesktopDepthInches: 24, targetMinHeightInches: 28, targetMaxHeightInches: 47, minLiftCapacityLbs: 150, electricRequired: true, workspace: 'standard', preference: 'value', market: 'US', now };

function priceObservation(overrides: Record<string, unknown> = {}) {
  return { configurationId, priceCents: 49900, currency: 'USD', seller: 'Branch', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), mandatoryShippingCents: 0, shippingStatus: 'free', ...reviewEvidence, ...overrides };
}
function availabilityObservation(overrides: Record<string, unknown> = {}) {
  return { configurationId, availability: 'in_stock', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), ...reviewEvidence, ...overrides };
}

function verifiedProduct() {
  const product = structuredClone(candidateCatalog.products[0]!);
  product.dataStatus = 'verified';
  return product;
}
function verifiedOffer(overrides: Record<string, unknown> = {}) {
  return OfferSchema.parse({
    id: 'branch-duo-direct', productId: 'branch-duo-standing-desk', retailer: 'Branch', configurationId, market: 'US', dataStatus: 'verified', currency: 'USD', priceCents: 49900, mandatoryShippingCents: 0, priceVerifiedAt: now.toISOString(), priceObservations: [priceObservation()], availability: 'in_stock', availabilityObservedAt: now.toISOString(), availabilityObservations: [availabilityObservation()], affiliateProgramStatus: 'unavailable', sourceUrls: ['https://www.branchfurniture.com/products/duo-standing-desk'], reviewNotes: null, lastUpdatedAt: now.toISOString(), ...overrides,
  });
}

describe('catalog contracts and ingestion', () => {
  it('accepts the demo catalog and a 10-record partially verified candidate queue', () => {
    expect(demoCatalog.catalogStatus).toBe('demo');
    expect(candidateCatalog.products).toHaveLength(10);
    expect(candidateCatalog.offers).toHaveLength(0);
  });
  it('rejects a verified product without official provenance', () => {
    const invalid = structuredClone(demo); invalid.products[0]!.dataStatus = 'verified';
    expect(() => CatalogSchema.parse(invalid)).toThrow(/official manufacturer URL/);
  });
  it('rejects duplicate product IDs and offers that reference missing products', () => {
    const duplicate = structuredClone(demo); duplicate.products.push(structuredClone(duplicate.products[0]!));
    expect(() => CatalogSchema.parse(duplicate)).toThrow(/Product IDs must be unique/);
    const missing = structuredClone(demo); missing.offers[0]!.productId = 'missing-product';
    expect(() => CatalogSchema.parse(missing)).toThrow(/reference a catalog product/);
  });
  it('rejects conflicting dimensions, negative prices, unsupported currency, and future timestamps', () => {
    const product = structuredClone(candidateCatalog.products[0]!); product.specifications!.minHeightInches = 48; product.specifications!.maxHeightInches = 22;
    expect(() => CatalogSchema.parse({ catalogStatus: 'partially_verified', lastUpdatedAt: '2026-10-29T00:00:00Z', reviewNotes: null, products: [product], offers: [] })).toThrow(/Minimum desk height/);
    expect(() => OfferSchema.parse({ ...demoCatalog.offers[0], priceCents: -1 })).toThrow();
    expect(() => OfferSchema.parse({ ...demoCatalog.offers[0], currency: 'EUR' })).toThrow();
    expect(() => OfferSchema.parse({ ...demoCatalog.offers[0], priceVerifiedAt: '2099-01-01T00:00:00Z' })).toThrow(/future/);
  });
  it('requires price and stock timestamps for non-demo observed values', () => {
    expect(() => OfferSchema.parse({ ...verifiedOffer(), priceVerifiedAt: null })).toThrow(/Known prices require an observation timestamp/);
    expect(() => OfferSchema.parse({ ...verifiedOffer(), availabilityObservedAt: null })).toThrow(/Known availability requires an observation timestamp/);
  });
  it('converts documented units consistently without treating unknown values as zero', () => {
    expect(kilogramsToPounds(100)).toBe(220.46);
    expect(millimetresToInches(762)).toBe(30);
    expect(() => kilogramsToPounds(-1)).toThrow(/non-negative/);
  });
});

describe('recommendation eligibility and scores', () => {
  it('filters demo records by dimensions, adjustment, range, capacity, and known shipping', () => {
    const results = recommend(demoCatalog.products, demoCatalog.offers, criteria);
    expect(results.map((result) => result.product.id)).toEqual(['demo-desk-b', 'demo-desk-a']);
  });
  it('does not expose partially verified research candidates without sourced price and stock observations', () => {
    expect(recommend(candidateCatalog.products, candidateCatalog.offers, criteria)).toEqual([]);
  });
  it('rejects stale price or availability observations and accepts current verified evidence', () => {
    const product = verifiedProduct();
    const current = verifiedOffer();
    expect(recommend([product], [current], criteria)).toHaveLength(1);
    const stalePriceAt = new Date(now.getTime() - PRICE_FRESHNESS_MS - 1).toISOString();
    const stalePrice = verifiedOffer({ priceVerifiedAt: stalePriceAt, priceObservations: [priceObservation({ observedAt: stalePriceAt, reviewedAt: stalePriceAt })] });
    expect(recommend([product], [stalePrice], criteria)).toEqual([]);
    const staleStockAt = new Date(now.getTime() - AVAILABILITY_FRESHNESS_MS - 1).toISOString();
    const staleStock = verifiedOffer({ availabilityObservedAt: staleStockAt, availabilityObservations: [availabilityObservation({ observedAt: staleStockAt, reviewedAt: staleStockAt })] });
    expect(recommend([product], [staleStock], criteria)).toEqual([]);
  });
  it('requires matching source observations for verified price, shipping, and stock snapshots', () => {
    const product = verifiedProduct();
    const missingPriceObservation = verifiedOffer();
    missingPriceObservation.priceObservations = [];
    expect(recommend([product], [missingPriceObservation], criteria)).toEqual([]);
    const missingStockObservation = verifiedOffer();
    missingStockObservation.availabilityObservations = [];
    expect(recommend([product], [missingStockObservation], criteria)).toEqual([]);
    expect(recommend([product], [verifiedOffer({ priceObservations: [priceObservation({ mandatoryShippingCents: null, shippingStatus: 'unknown' })] })], criteria)).toEqual([]);
  });
  it('does not treat missing specifications or shipping as a hard-filter pass', () => {
    const product = verifiedProduct(); product.specifications!.desktopDepthInches = undefined;
    const offer = verifiedOffer();
    expect(recommend([product], [offer], criteria)).toEqual([]);
    expect(recommend(demoCatalog.products, demoCatalog.offers.map((item) => ({ ...item, mandatoryShippingCents: null })), criteria)).toEqual([]);
  });
  it('applies workspace minimums and provides a deterministic empty result', () => {
    const compact = recommend(demoCatalog.products, demoCatalog.offers, { ...criteria, workspace: 'compact', minDesktopWidthInches: 40, minDesktopDepthInches: 20, electricRequired: false, minLiftCapacityLbs: 90, targetMinHeightInches: undefined, targetMaxHeightInches: undefined });
    const large = recommend(demoCatalog.products, demoCatalog.offers, { ...criteria, workspace: 'large', minDesktopWidthInches: 40, minDesktopDepthInches: 20 });
    expect(compact).toHaveLength(3);
    expect(large).toEqual([]);
  });
  it('is deterministic and ranking remains independent from affiliate status or URL', () => {
    const approved = demoCatalog.offers.map((offer) => OfferSchema.parse(offer.id === 'demo-offer-a' ? { ...offer, affiliateProgramStatus: 'approved', affiliateProgramId: 'branch', affiliateUrl: 'https://merchant.example/approved-link' } : offer));
    const baseline = recommend(demoCatalog.products, demoCatalog.offers, criteria);
    expect(recommend(demoCatalog.products, approved, criteria).map((item) => [item.product.id, item.score])).toEqual(baseline.map((item) => [item.product.id, item.score]));
    expect(recommend(demoCatalog.products, demoCatalog.offers, criteria)).toEqual(baseline);
  });
});

describe('affiliate safety and demo identification', () => {
  it('blocks unapproved affiliate destinations and labels demo recommendations', () => {
    expect(getApprovedAffiliateLink(demoCatalog.offers[0]!)).toBeNull();
    expect(recommend(demoCatalog.products, demoCatalog.offers, criteria)[0]?.explanation.at(-1)).toMatch(/Synthetic demonstration/);
  });
  it('does not allow legacy offer-only approval without registry proof', () => {
    const approved = OfferSchema.parse({ ...demoCatalog.offers[0], affiliateProgramStatus: 'approved', affiliateProgramId: 'branch', affiliateUrl: 'https://merchant.example/approved-link' });
    expect(getApprovedAffiliateLink(approved)).toBeNull();
  });
});
