import { describe, expect, it } from 'vitest';
import affiliateProgramData from '../src/data/affiliate-programs.json';
import candidates from '../src/data/candidates.json';
import demo from '../src/data/demo.json';
import { isVerifiedOfferEligible } from '../src/lib/eligibility';
import { buildPublicProductProfile } from '../src/lib/product-profile';
import { AffiliateRegistrySchema, CatalogSchema, ProductSchema } from '../src/lib/schema';

const now = new Date('2026-10-29T18:00:00Z');
const candidate = CatalogSchema.shape.products.element.parse(candidates.products[0]);
const verifiedProduct = ProductSchema.parse({
  ...candidate,
  dataStatus: 'verified',
  configuration: {
    id: 'branch-duo-48x24-black-oak',
    label: '48x24 desktop, oak finish, black frame',
    exactModel: 'Duo Standing Desk',
    sku: 'TEST-ONLY',
    desktopWidthInches: 48,
    desktopDepthInches: 24,
    selectedOptions: { desktop: '48x24', finish: 'Oak veneer', frame: 'Black' },
  },
  specificationReferences: Object.fromEntries(Object.entries(candidate.specificationReferences).map(([key, reference]) => [key, { ...reference, status: 'verified' }])),
  editorialApproval: {
    collector: 'Evidence collector',
    reviewer: 'Independent reviewer',
    reviewedAt: now.toISOString(),
    sourceIds: candidate.sources.map((source) => source.id),
  },
});
const authorization = {
  authorized: true as const,
  productId: verifiedProduct.id,
  authorizedBy: 'Authorized owner',
  authorizedAt: now.toISOString(),
};
const affiliateRegistry = AffiliateRegistrySchema.parse(affiliateProgramData);

describe('product-only publication gate', () => {
  it('does not publish unverified products even with authorization', () => {
    const unverified = ProductSchema.parse(candidate);
    expect(buildPublicProductProfile(unverified, { ...authorization, productId: unverified.id }, now)).toBeNull();
  });

  it('requires explicit, product-scoped owner authorization after independent editorial review', () => {
    expect(buildPublicProductProfile(verifiedProduct, null, now)).toBeNull();
    expect(buildPublicProductProfile(verifiedProduct, { ...authorization, authorized: false }, now)).toBeNull();
    expect(buildPublicProductProfile(verifiedProduct, { ...authorization, productId: 'another-product' }, now)).toBeNull();
    expect(buildPublicProductProfile(verifiedProduct, { ...authorization, authorizedAt: '2026-10-28T00:00:00Z' }, now)).toBeNull();
    expect(buildPublicProductProfile(verifiedProduct, authorization, now)).not.toBeNull();
  });

  it('does not create an offer or claim price, shipping, stock, return terms, or an affiliate URL', () => {
    const profile = buildPublicProductProfile(verifiedProduct, authorization, now);
    expect(profile).not.toBeNull();
    expect(profile).not.toHaveProperty('priceCents');
    expect(profile).not.toHaveProperty('mandatoryShippingCents');
    expect(profile).not.toHaveProperty('availability');
    expect(profile).not.toHaveProperty('affiliateUrl');
    expect(profile?.returns).toMatch(/UNKNOWN/);
    expect(profile?.warranty).toMatch(/coverage details.*UNKNOWN/);
  });

  it('does not let product publication automatically make a synthetic offer eligible', () => {
    const syntheticOffer = CatalogSchema.shape.offers.element.parse(demo.offers[0]);
    expect(buildPublicProductProfile(verifiedProduct, authorization, now)).not.toBeNull();
    expect(isVerifiedOfferEligible(verifiedProduct, syntheticOffer, now)).toBe(false);
  });

  it('allows an informational product profile without affiliate approval, but exposes no affiliate URL', () => {
    expect(affiliateRegistry.programs.every((program) => program.status === 'not_applied')).toBe(true);
    const profile = buildPublicProductProfile(verifiedProduct, authorization, now);
    expect(profile).not.toBeNull();
    expect(profile).not.toHaveProperty('affiliateUrl');
    expect(profile).not.toHaveProperty('purchaseUrl');
  });

  it('keeps demo product records ineligible for product-only publication', () => {
    const demoProduct = CatalogSchema.shape.products.element.parse(demo.products[0]);
    expect(buildPublicProductProfile(demoProduct, { ...authorization, productId: demoProduct.id }, now)).toBeNull();
  });
});
