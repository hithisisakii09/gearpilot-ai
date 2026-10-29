import { describe, expect, it } from 'vitest';
import candidates from '../src/data/candidates.json';
import observationsData from '../src/data/observations.json';
import registryData from '../src/data/affiliate-programs.json';
import { PRICE_FRESHNESS_MS, timestampIsFresh } from '../src/lib/eligibility';
import { createCatalogQualityReport, findConflictingObservations, findDuplicateObservations, validateObservationReferences } from '../src/lib/observations';
import { AffiliateRegistrySchema, CatalogSchema, CommercialObservationSchema, ObservationCollectionSchema } from '../src/lib/schema';

const catalog = CatalogSchema.parse(candidates);
const collection = ObservationCollectionSchema.parse(observationsData);
const registry = AffiliateRegistrySchema.parse(registryData);
const now = new Date('2026-10-29T05:05:00Z');
const base = collection.observations[0]!;

describe('commercial observation contracts', () => {
  it('accepts exact, primary-source USD observations without auto-approving them', () => {
    expect(base.priceCents).toBe(36999);
    expect(base.configuration.selectedOptions.sku).toBe('401512');
    expect(base.reviewStatus).toBe('pending_review');
  });

  it('rejects negative or malformed prices and unsupported currency', () => {
    expect(() => CommercialObservationSchema.parse({ ...base, priceCents: -1 })).toThrow();
    expect(() => CommercialObservationSchema.parse({ ...base, priceCents: 12.5 })).toThrow();
    expect(() => CommercialObservationSchema.parse({ ...base, currency: 'CAD' })).toThrow();
  });

  it('keeps unknown shipping null and treats explicit free shipping as zero', () => {
    expect(CommercialObservationSchema.parse({ ...base, shippingStatus: 'unknown', mandatoryShippingCents: null }).mandatoryShippingCents).toBeNull();
    expect(() => CommercialObservationSchema.parse({ ...base, shippingStatus: 'unknown', mandatoryShippingCents: 0 })).toThrow(/Unknown shipping/);
    expect(CommercialObservationSchema.parse({ ...base, shippingStatus: 'free', mandatoryShippingCents: 0 }).mandatoryShippingCents).toBe(0);
    expect(() => CommercialObservationSchema.parse({ ...base, shippingStatus: 'free', mandatoryShippingCents: 1 })).toThrow(/Free shipping/);
  });

  it('rejects future dates beyond the policy and handles timezone boundaries deterministically', () => {
    const future = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    expect(() => CommercialObservationSchema.parse({ ...base, observedAt: future })).toThrow(/future/);
    expect(() => CommercialObservationSchema.parse({ ...base, observedAt: 'not-a-timestamp' })).toThrow();
    expect(() => CommercialObservationSchema.parse({ ...base, observedAt: '2026-10-29T05:05:00+05:30' })).toThrow();
    const boundaryNow = new Date('2026-11-05T00:00:00-05:00');
    expect(timestampIsFresh('2026-10-29T05:00:00Z', PRICE_FRESHNESS_MS, boundaryNow)).toBe(true);
    expect(timestampIsFresh('2026-10-29T04:59:59.999Z', PRICE_FRESHNESS_MS, boundaryNow)).toBe(false);
    expect(timestampIsFresh('2026-11-05T05:00:00.001Z', PRICE_FRESHNESS_MS, boundaryNow)).toBe(false);
  });

  it('requires HTTPS source provenance and exact configuration details', () => {
    expect(() => CommercialObservationSchema.parse({ ...base, sourceUrl: undefined })).toThrow();
    expect(() => CommercialObservationSchema.parse({ ...base, sourceUrl: 'http://example.com/evidence' })).toThrow(/HTTPS/);
    expect(() => CommercialObservationSchema.parse({ ...base, configuration: { ...base.configuration, exactModel: '' } })).toThrow();
  });

  it('requires reviewer identity and timestamp only for reviewed evidence', () => {
    expect(() => CommercialObservationSchema.parse({ ...base, reviewStatus: 'approved' })).toThrow(/reviewer/);
    const approved = CommercialObservationSchema.parse({ ...base, reviewStatus: 'approved', reviewer: 'Editorial reviewer', reviewedAt: now.toISOString() });
    expect(approved.reviewStatus).toBe('approved');
    expect(() => CommercialObservationSchema.parse({ ...base, reviewer: 'Premature reviewer', reviewedAt: now.toISOString() })).toThrow(/Unreviewed evidence/);
    expect(() => CommercialObservationSchema.parse({ ...base, evidenceQuality: 'unverified', reviewStatus: 'approved', reviewer: 'Editorial reviewer', reviewedAt: now.toISOString() })).toThrow(/Unverified sources cannot be approved/);
  });
});

describe('observation validation and quality reporting', () => {
  it('detects duplicate and conflicting observations without conflating different configurations', () => {
    const duplicate = { ...base, id: 'duplicate-evidence' };
    expect(findDuplicateObservations([base, duplicate])).toHaveLength(1);
    const conflict = { ...base, id: 'conflicting-evidence', priceCents: base.priceCents! + 1, sourceUrl: 'https://www.vari.com/conflict-evidence' };
    expect(findConflictingObservations([base, conflict])).toHaveLength(1);
    const differentConfiguration = { ...conflict, configuration: { ...conflict.configuration, id: 'different-configuration' } };
    expect(findConflictingObservations([base, differentConfiguration])).toEqual([]);
  });

  it('rejects incorrect product references and conflicting product models', () => {
    const missingProduct = ObservationCollectionSchema.parse({ ...collection, observations: [{ ...base, id: 'missing-product-evidence', productId: 'missing-product' }] });
    expect(validateObservationReferences(missingProduct, catalog.products)).toEqual([expect.stringMatching(/missing product/)]);
    const wrongModel = ObservationCollectionSchema.parse({ ...collection, observations: [{ ...base, id: 'wrong-model-evidence', configuration: { ...base.configuration, exactModel: 'Different Model' } }] });
    expect(validateObservationReferences(wrongModel, catalog.products)).toEqual([expect.stringMatching(/model\/configuration/)]);
    const wrongAssessmentManufacturer = ObservationCollectionSchema.parse({ ...collection, candidateAssessments: [{ ...collection.candidateAssessments[0]!, manufacturer: 'Different manufacturer' }] });
    expect(validateObservationReferences(wrongAssessmentManufacturer, catalog.products)).toEqual([expect.stringMatching(/Assessment.*manufacturer/)]);
  });

  it('accepts out-of-stock, preorder, and unknown evidence without calling it fresh in-stock evidence', () => {
    expect(CommercialObservationSchema.parse({ ...base, availability: 'out_of_stock' }).availability).toBe('out_of_stock');
    expect(CommercialObservationSchema.parse({ ...base, availability: 'preorder' }).availability).toBe('preorder');
    expect(CommercialObservationSchema.parse({ ...base, availability: 'unknown' }).availability).toBe('unknown');
    const altered = ObservationCollectionSchema.parse({ ...collection, observations: collection.observations.map((item) => ({ ...item, availability: 'unknown' })) });
    expect(createCatalogQualityReport(catalog, altered, registry.programs, now).freshStockObservations).toBe(0);
  });

  it('evaluates freshness from a supplied clock and reports catalog quality accurately', () => {
    expect(createCatalogQualityReport(catalog, collection, registry.programs, now)).toMatchObject({
      totalResearchCandidates: 10,
      fullyVerifiedProducts: 0,
      partiallyVerifiedProducts: 10,
      verifiedOffers: 0,
      eligibleOffers: 0,
      freshPriceObservations: 2,
      freshStockObservations: 2,
      staleObservations: 0,
      missingShippingEvidence: 8,
      conflictingObservations: 0,
      duplicateObservations: 0,
      approvedAffiliatePrograms: 0,
      activeAffiliateLinks: 0,
      reviewedObservations: 0,
      pendingReviewObservations: 2,
    });
    const later = new Date(now.getTime() + PRICE_FRESHNESS_MS + 1);
    expect(createCatalogQualityReport(catalog, collection, registry.programs, later).staleObservations).toBe(2);
    expect(createCatalogQualityReport(catalog, collection, registry.programs, later)).toEqual(createCatalogQualityReport(catalog, collection, registry.programs, later));
  });
});
