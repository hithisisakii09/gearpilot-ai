import { describe, expect, it } from 'vitest';
import registryData from '../src/data/affiliate-programs.json';
import candidates from '../src/data/candidates.json';
import { resolveAffiliateLink } from '../src/lib/affiliate';
import { AVAILABILITY_FRESHNESS_MS, PRICE_FRESHNESS_MS } from '../src/lib/eligibility';
import { AffiliateProgramSchema, AffiliateRegistrySchema, OfferSchema, ProductSchema } from '../src/lib/schema';

const now = new Date('2026-10-29T00:00:00Z');
const configurationId = 'branch-duo-48x24-test';
const reviewEvidence = { evidenceNotes: 'Approved test fixture.', evidenceQuality: 'primary' as const, reviewStatus: 'approved' as const, reviewer: 'Test reviewer', reviewedAt: now.toISOString(), sourceMetadata: {} };
const registry = AffiliateRegistrySchema.parse(registryData);
const verifiedProduct = ProductSchema.parse({ ...candidates.products[0], dataStatus: 'verified' });
const priceObservation = (overrides: Record<string, unknown> = {}) => ({ configurationId, priceCents: 49900, currency: 'USD', seller: 'Branch', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), mandatoryShippingCents: 0, shippingStatus: 'free', ...reviewEvidence, ...overrides });
const availabilityObservation = (overrides: Record<string, unknown> = {}) => ({ configurationId, availability: 'in_stock', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), ...reviewEvidence, ...overrides });
const verifiedOffer = (overrides: Record<string, unknown> = {}) => OfferSchema.parse({
  id: 'branch-duo-affiliate', productId: verifiedProduct.id, retailer: 'Branch', configurationId, market: 'US', dataStatus: 'verified', currency: 'USD', priceCents: 49900, mandatoryShippingCents: 0, priceVerifiedAt: now.toISOString(), priceObservations: [priceObservation()], availability: 'in_stock', availabilityObservedAt: now.toISOString(), availabilityObservations: [availabilityObservation()], affiliateProgramStatus: 'approved', affiliateProgramId: 'branch', affiliateUrl: 'https://shop.branchfurniture.com/products/duo', sourceUrls: ['https://www.branchfurniture.com/products/duo-standing-desk'], reviewNotes: null, lastUpdatedAt: now.toISOString(), ...overrides,
});
const approvedProgram = (overrides: Record<string, unknown> = {}) => AffiliateProgramSchema.parse({
  id: 'branch', merchantName: 'Branch', officialWebsite: 'https://www.branchfurniture.com/', applicationUrl: null, programName: 'Branch partner program', networkName: null, allowedRegions: ['US'], approvedDestinationDomains: ['branchfurniture.com'], approvalEvidence: { reference: 'credential-ref:affiliate/branch/approval-record', reviewedAt: '2026-10-29T00:00:00Z' }, approvalDate: '2026-10-29T00:00:00Z', trackingIdReference: 'credential-ref:affiliate/branch/tracking-id', status: 'approved', expiresAt: null, reviewNotes: 'Test fixture only; no real approval is asserted.', lastReviewedAt: '2026-10-29T00:00:00Z', ...overrides,
});

describe('affiliate registry and resolver', () => {
  it('tracks researched merchants without asserting a program approval', () => {
    expect(registry.programs).toHaveLength(8);
    expect(registry.programs.every((program) => program.status === 'not_applied')).toBe(true);
    expect(registry.programs.every((program) => program.approvedDestinationDomains.length === 0 && program.trackingIdReference === null)).toBe(true);
  });
  it.each(['pending', 'rejected', 'suspended', 'expired'] as const)('blocks %s programs', (status) => {
    const program = approvedProgram({ status, approvedDestinationDomains: [], approvalEvidence: null, approvalDate: null, trackingIdReference: null, expiresAt: status === 'expired' ? '2026-10-28T00:00:00Z' : null });
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer(), [program], now)).toBeNull();
  });
  it('rejects an approved program missing a tracking-ID reference', () => {
    expect(() => approvedProgram({ trackingIdReference: null })).toThrow(/credential reference/);
  });
  it.each([
    '',
    '*.branchfurniture.com',
    'https://branchfurniture.com',
    '127.0.0.1',
    'localhost',
    'BranchFurniture.com',
    'branchfurniture.com.',
    ' branchfurniture.com',
    'branchfurniture..com',
  ])('rejects a non-canonical or ambiguous destination domain: %j', (domain) => {
    expect(() => approvedProgram({ approvedDestinationDomains: [domain] })).toThrow(/canonical HTTPS hostname/);
  });
  it('blocks destinations outside the program allowlist and merchant mismatches', () => {
    const program = approvedProgram();
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer({ affiliateUrl: 'https://evil.example/path' }), [program], now)).toBeNull();
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer({ retailer: 'Different merchant' }), [program], now)).toBeNull();
  });
  it.each([
    'http://shop.branchfurniture.com/products/duo',
    'https://branchfurniture.com.evil.example/products/duo',
    'https://user:password@shop.branchfurniture.com/products/duo',
    'javascript:alert(1)',
  ])('never resolves an unsafe affiliate destination: %s', (affiliateUrl) => {
    const offer = { ...verifiedOffer(), affiliateUrl };
    expect(resolveAffiliateLink(verifiedProduct, offer, [approvedProgram()], now)).toBeNull();
  });
  it('requires verified product and offer records before monetization', () => {
    const program = approvedProgram();
    expect(resolveAffiliateLink({ ...verifiedProduct, dataStatus: 'demo' }, verifiedOffer(), [program], now)).toBeNull();
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer({ dataStatus: 'partially_verified' }), [program], now)).toBeNull();
  });
  it.each([
    ['missing price observation', { priceObservations: [] }],
    ['missing mandatory shipping', { mandatoryShippingCents: null, priceObservations: [priceObservation({ mandatoryShippingCents: null, shippingStatus: 'unknown' })] }],
    ['missing stock observation', { availabilityObservations: [] }],
    ['invalid price observation', { priceObservations: [priceObservation({ priceCents: 49899 })] }],
    ['invalid stock observation', { availabilityObservations: [availabilityObservation({ availability: 'out_of_stock' })] }],
    ['unreviewed price observation', { priceObservations: [priceObservation({ reviewStatus: 'pending_review', reviewer: null, reviewedAt: null })] }],
    ['unreviewed stock observation', { availabilityObservations: [availabilityObservation({ reviewStatus: 'pending_review', reviewer: null, reviewedAt: null })] }],
  ])('blocks an approved but ineligible offer with %s', (_label, overrides) => {
    const offer = verifiedOffer();
    Object.assign(offer, overrides);
    expect(resolveAffiliateLink(verifiedProduct, offer, [approvedProgram()], now)).toBeNull();
  });
  it('blocks approved offers whose source observations are stale', () => {
    const stalePriceAt = new Date(now.getTime() - PRICE_FRESHNESS_MS - 1).toISOString();
    const stalePrice = verifiedOffer({
      priceVerifiedAt: stalePriceAt,
      priceObservations: [priceObservation({ observedAt: stalePriceAt, reviewedAt: stalePriceAt })],
    });
    const staleStockAt = new Date(now.getTime() - AVAILABILITY_FRESHNESS_MS - 1).toISOString();
    const staleStock = verifiedOffer({
      availabilityObservedAt: staleStockAt,
      availabilityObservations: [availabilityObservation({ observedAt: staleStockAt, reviewedAt: staleStockAt })],
    });
    expect(resolveAffiliateLink(verifiedProduct, stalePrice, [approvedProgram()], now)).toBeNull();
    expect(resolveAffiliateLink(verifiedProduct, staleStock, [approvedProgram()], now)).toBeNull();
  });
  it('returns sponsored, safe attributes only after all gates pass', () => {
    const resolved = resolveAffiliateLink(verifiedProduct, verifiedOffer(), [approvedProgram()], now);
    expect(resolved).toEqual({ href: 'https://shop.branchfurniture.com/products/duo', rel: 'sponsored nofollow noopener noreferrer' });
  });
});
