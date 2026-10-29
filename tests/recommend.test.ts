import { describe, expect, it } from 'vitest';
import candidates from '../src/data/candidates.json';
import demo from '../src/data/demo.json';
import { getApprovedAffiliateLink } from '../src/lib/affiliate';
import { getOfferEvidenceIssues } from '../src/lib/eligibility';
import { AVAILABILITY_FRESHNESS_MS, PRICE_FRESHNESS_MS, recommend, type Criteria } from '../src/lib/recommend';
import { CatalogSchema, OfferSchema, PriceObservationSchema } from '../src/lib/schema';
import { kilogramsToPounds, millimetresToInches } from '../src/lib/units';

const demoCatalog = CatalogSchema.parse(demo);
const candidateCatalog = CatalogSchema.parse(candidates);
const now = new Date('2026-10-29T00:00:00Z');
const configurationId = 'branch-duo-48x24-test';
const reviewEvidence = { evidenceNotes: 'Approved test fixture.', evidenceQuality: 'primary' as const, reviewStatus: 'approved' as const, collectedBy: 'Evidence collector', reviewer: 'Test reviewer', reviewedAt: now.toISOString(), sourceMetadata: {} };
const criteria: Criteria = { budgetCents: 50000, minDesktopWidthInches: 48, minDesktopDepthInches: 24, targetMinHeightInches: 28, targetMaxHeightInches: 47, minLiftCapacityLbs: 150, electricRequired: true, workspace: 'standard', preference: 'value', market: 'US', now };

function priceObservation(overrides: Record<string, unknown> = {}) {
  return { configurationId, priceCents: 49900, currency: 'USD', seller: 'Branch', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), mandatoryShippingCents: 0, shippingStatus: 'free', ...reviewEvidence, ...overrides };
}
function availabilityObservation(overrides: Record<string, unknown> = {}) {
  return { configurationId, availability: 'in_stock', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), ...reviewEvidence, ...overrides };
}

function verifiedProduct() {
  const product = candidateCatalog.products[0]!;
  return CatalogSchema.shape.products.element.parse({
    ...product,
    dataStatus: 'verified',
    configuration: { id: configurationId, label: 'Synthetic verified-test Branch Duo 48x24', exactModel: 'Duo Standing Desk', sku: 'TEST-ONLY', desktopWidthInches: 48, desktopDepthInches: 24, selectedOptions: { desktop: '48x24' } },
    specificationReferences: Object.fromEntries(Object.entries(product.specificationReferences).map(([key, reference]) => [key, { ...reference, status: 'verified' }])),
    editorialApproval: { collector: 'Product evidence collector', reviewer: 'Independent product reviewer', reviewedAt: now.toISOString(), sourceIds: product.sources.map((source) => source.id) },
  });
}
function policyEvidence() {
  return {
    configurationId,
    sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk',
    observedAt: now.toISOString(),
    ...reviewEvidence,
  };
}
function verifiedOffer(overrides: Record<string, unknown> = {}) {
  return OfferSchema.parse({
    id: 'branch-duo-direct', productId: 'branch-duo-standing-desk', retailer: 'Branch', configurationId, market: 'US', dataStatus: 'verified', currency: 'USD', priceCents: 49900, mandatoryShippingCents: 0, priceVerifiedAt: now.toISOString(), priceObservations: [priceObservation()], availability: 'in_stock', availabilityObservedAt: now.toISOString(), availabilityObservations: [availabilityObservation()], warrantyEvidence: policyEvidence(), returnPolicyEvidence: policyEvidence(), affiliateProgramStatus: 'unavailable', sourceUrls: ['https://www.branchfurniture.com/products/duo-standing-desk'], reviewNotes: null, lastUpdatedAt: now.toISOString(), ...overrides,
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
  it('requires independent product approval and verified identity/specification sources', () => {
    const product = verifiedProduct();
    expect(() => CatalogSchema.shape.products.element.parse({ ...product, configuration: null })).toThrow(/exact product configuration/);
    expect(() => CatalogSchema.shape.products.element.parse({ ...product, configuration: { ...product.configuration!, exactModel: 'Different model' } })).toThrow(/must match the product model/);
    expect(() => CatalogSchema.shape.products.element.parse({ ...product, configuration: { ...product.configuration!, desktopWidthInches: 60 } })).toThrow(/must match the verified desktop specification/);
    expect(() => CatalogSchema.shape.products.element.parse({ ...product, editorialApproval: null })).toThrow(/independent editorial approval/);
    expect(() => CatalogSchema.shape.products.element.parse({ ...product, editorialApproval: { ...product.editorialApproval!, collector: 'Same person', reviewer: 'Same person' } })).toThrow(/independent from the evidence collector/);
    expect(() => CatalogSchema.shape.products.element.parse({ ...product, specificationReferences: { ...product.specificationReferences, identity: { ...product.specificationReferences.identity!, status: 'partially_verified' } } })).toThrow(/independently verified identity/);
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
  it('requires exact-configuration independently reviewed warranty and return evidence for verified offers', () => {
    const offer = verifiedOffer();
    expect(() => OfferSchema.parse({ ...offer, warrantyEvidence: null })).toThrow(/reviewed warranty evidence/);
    expect(() => OfferSchema.parse({ ...offer, returnPolicyEvidence: { ...offer.returnPolicyEvidence!, configurationId: 'different-configuration' } })).toThrow(/match the exact offer configuration/);
    expect(() => OfferSchema.parse({ ...offer, warrantyEvidence: { ...offer.warrantyEvidence!, collectedBy: 'Same person', reviewer: 'Same person' } })).toThrow(/independent from the evidence collector/);
  });
  it('requires a named evidence collector distinct from the reviewer for approved price evidence', () => {
    expect(() => PriceObservationSchema.parse(priceObservation({ collectedBy: null }))).toThrow(/named collector/);
    expect(() => PriceObservationSchema.parse(priceObservation({ collectedBy: 'Test reviewer' }))).toThrow(/independent from the evidence collector/);
    expect(() => PriceObservationSchema.parse(priceObservation({ reviewedAt: '2026-10-28T00:00:00Z' }))).toThrow(/cannot predate the evidence/);
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
  it('reports publication blockers for Branch Duo and FlexiSpot E7 using non-publishing fixtures', () => {
    for (const productId of ['branch-duo-standing-desk', 'flexispot-e7']) {
      const product = candidateCatalog.products.find((candidate) => candidate.id === productId)!;
      const dryRunOffer = OfferSchema.parse({
        ...demoCatalog.offers[0]!,
        id: `${productId}-dry-run`,
        productId,
        dataStatus: 'partially_verified',
        configurationId: undefined,
        priceCents: null,
        mandatoryShippingCents: null,
        priceVerifiedAt: null,
        availability: 'unknown',
        availabilityObservedAt: null,
      });
      const issues = getOfferEvidenceIssues(product, dryRunOffer, now);
      expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
        'missing_product_verification',
        'missing_offer_verification',
        'missing_product_editorial_approval',
        'unverified_product_identity',
        'unverified_product_specification',
        'missing_configuration',
        'missing_warranty_evidence',
        'missing_return_policy_evidence',
        'missing_price',
        'missing_shipping',
        'missing_stock_observation',
      ]));
    }
    expect(candidateCatalog.products.filter((product) => product.dataStatus === 'verified')).toHaveLength(0);
    expect(candidateCatalog.offers).toHaveLength(0);
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
  it('blocks recommendation when required policy evidence is absent, unreviewed, or for another configuration', () => {
    const product = verifiedProduct();
    const missing = verifiedOffer();
    Object.assign(missing, { warrantyEvidence: null });
    expect(recommend([product], [missing], criteria)).toEqual([]);

    const pending = verifiedOffer();
    Object.assign(pending, { returnPolicyEvidence: { ...pending.returnPolicyEvidence!, reviewStatus: 'pending_review', reviewer: null, reviewedAt: null } });
    expect(recommend([product], [pending], criteria)).toEqual([]);

    const mismatched = verifiedOffer();
    Object.assign(mismatched, { warrantyEvidence: { ...mismatched.warrantyEvidence!, configurationId: 'other-configuration' } });
    expect(recommend([product], [mismatched], criteria)).toEqual([]);
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
  it.each([
    ['non-finite width', { minDesktopWidthInches: Number.NaN }],
    ['non-finite height', { targetMinHeightInches: Number.POSITIVE_INFINITY }],
    ['inverted height range', { targetMinHeightInches: 48, targetMaxHeightInches: 28 }],
    ['invalid workspace', { workspace: 'unknown' }],
    ['prototype workspace key', { workspace: '__proto__' }],
    ['invalid preference', { preference: 'commission' }],
    ['prototype preference key', { preference: '__proto__' }],
    ['invalid market', { market: 'CA' }],
    ['invalid date', { now: new Date(Number.NaN) }],
  ])('rejects malformed user criteria: %s', (_label, overrides) => {
    expect(() => recommend(demoCatalog.products, demoCatalog.offers, { ...criteria, ...overrides } as Criteria)).toThrow();
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
