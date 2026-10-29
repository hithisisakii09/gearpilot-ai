import { describe, expect, it } from 'vitest';
import candidates from '../src/data/candidates.json';
import observationsData from '../src/data/observations.json';
import registryData from '../src/data/affiliate-programs.json';
import { PRICE_FRESHNESS_MS, timestampIsFresh } from '../src/lib/eligibility';
import { applyEditorialDecision, createCatalogQualityReport, findConflictingObservations, findDuplicateObservations, prepareObservationIngestion, validateObservationReferences } from '../src/lib/observations';
import { AffiliateRegistrySchema, CatalogSchema, CommercialObservationSchema, EditorialReviewEventSchema, ObservationCollectionSchema } from '../src/lib/schema';

const catalog = CatalogSchema.parse(candidates);
const collection = ObservationCollectionSchema.parse(observationsData);
const registry = AffiliateRegistrySchema.parse(registryData);
const now = new Date('2026-10-29T05:05:00Z');
const base = collection.observations[0]!;
const collectedCollection = ObservationCollectionSchema.parse({
  ...collection,
  observations: collection.observations.map((observation) => ({ ...observation, collectedBy: 'Evidence collector' })),
});

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
    const approved = CommercialObservationSchema.parse({ ...base, collectedBy: 'Evidence collector', reviewStatus: 'approved', reviewer: 'Editorial reviewer', reviewedAt: now.toISOString() });
    expect(approved.reviewStatus).toBe('approved');
    expect(() => CommercialObservationSchema.parse({ ...base, collectedBy: 'Same person', reviewStatus: 'approved', reviewer: 'same person', reviewedAt: now.toISOString() })).toThrow(/different from the evidence collector/);
    expect(() => CommercialObservationSchema.parse({ ...base, reviewer: 'Premature reviewer', reviewedAt: now.toISOString() })).toThrow(/Unreviewed evidence/);
    expect(() => CommercialObservationSchema.parse({ ...base, collectedBy: 'Evidence collector', evidenceQuality: 'unverified', reviewStatus: 'approved', reviewer: 'Editorial reviewer', reviewedAt: now.toISOString() })).toThrow(/Unverified sources cannot be approved/);
    expect(() => CommercialObservationSchema.parse({ ...base, collectedBy: 'Evidence collector', reviewStatus: 'rejected', reviewer: 'Editorial reviewer', reviewedAt: now.toISOString() })).toThrow(/requires a reason/);
    expect(CommercialObservationSchema.parse({ ...base, collectedBy: 'Evidence collector', reviewStatus: 'rejected', reviewer: 'Editorial reviewer', reviewedAt: now.toISOString(), rejectionReason: 'SKU did not match.' }).rejectionReason).toBe('SKU did not match.');
  });
});

describe('human editorial decision workflow', () => {
  const reviewedAt = '2026-10-29T06:00:00.000Z';
  const reviewNow = new Date(reviewedAt);

  it('ingests named-collector evidence as pending review without changing prior observations', () => {
    const observedAt = '2026-10-29T05:10:00.000Z';
    const incoming = ObservationCollectionSchema.parse({
      lastUpdatedAt: observedAt,
      observations: [{
        ...collectedCollection.observations[0]!,
        id: 'vari-essential-401512-recheck',
        observedAt,
        evidenceNotes: 'Fresh evidence captured for workflow testing only.',
      }],
      candidateAssessments: [],
      reviewEvents: [],
    });
    const ingested = prepareObservationIngestion(collection, incoming, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow);
    expect(ingested.observations).toHaveLength(3);
    expect(ingested.observations[0]).toEqual(collection.observations[0]);
    expect(ingested.observations[2]).toMatchObject({
      id: 'vari-essential-401512-recheck',
      collectedBy: 'Evidence collector',
      reviewStatus: 'pending_review',
      reviewer: null,
    });
    expect(ingested.reviewEvents).toEqual([]);
    expect(collection.observations).toHaveLength(2);
  });

  it('rejects mismatched collectors, duplicate evidence, conflicting evidence, and pre-reviewed ingestion', () => {
    const observedAt = '2026-10-29T05:10:00.000Z';
    const incomingObservation = {
      ...collectedCollection.observations[0]!,
      id: 'vari-essential-401512-recheck',
      observedAt,
      evidenceNotes: 'Fresh evidence captured for workflow testing only.',
    };
    const incoming = ObservationCollectionSchema.parse({
      lastUpdatedAt: observedAt,
      observations: [incomingObservation],
      candidateAssessments: [],
      reviewEvents: [],
    });
    expect(() => prepareObservationIngestion(collection, incoming, catalog.products, 'Different collector', '2026-10-29T05:15:00.000Z', reviewNow)).toThrow(/collected by the named collector/);
    expect(() => prepareObservationIngestion(collection, incoming, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow)).not.toThrow();

    const duplicate = ObservationCollectionSchema.parse({
      ...incoming,
      observations: [{ ...incomingObservation, id: 'vari-essential-401512-copy', observedAt: base.observedAt }],
    });
    expect(() => prepareObservationIngestion(collection, duplicate, catalog.products, 'Evidence collector', '2026-10-29T06:00:00.000Z', reviewNow)).toThrow(/duplicates/);

    const conflict = ObservationCollectionSchema.parse({
      ...incoming,
      observations: [{ ...incomingObservation, id: 'vari-essential-401512-conflict', observedAt: base.observedAt, priceCents: base.priceCents! + 1 }],
    });
    expect(() => prepareObservationIngestion(collection, conflict, catalog.products, 'Evidence collector', '2026-10-29T06:00:00.000Z', reviewNow)).toThrow(/conflicts/);
    expect(() => prepareObservationIngestion(collection, incoming, catalog.products, 'Evidence collector', '2026-10-29T05:00:00.000Z', reviewNow)).toThrow(/no later than ingestion/);
  });

  it('records an explicit approval with source provenance and an immutable decision event without promoting a product', () => {
    const decided = applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'approved',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
    }, reviewNow);
    expect(decided.observations[0]).toMatchObject({
      reviewStatus: 'approved',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
      rejectionReason: null,
    });
    expect(decided.reviewEvents).toEqual([expect.objectContaining({
      observationId: base.id,
      collector: 'Evidence collector',
      decision: 'approved',
      sourceUrl: base.sourceUrl,
      evidenceObservedAt: base.observedAt,
    })]);
    expect(decided.candidateAssessments).toEqual(collection.candidateAssessments);
    expect(() => applyEditorialDecision(decided, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Second reviewer',
      reviewedAt,
      rejectionReason: 'Duplicate decision attempt.',
    }, reviewNow)).toThrow(/already has a terminal review decision/);
  });

  it('requires rejection rationale and preserves the decision and reason in the audit event', () => {
    expect(() => applyEditorialDecision(collection, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
      rejectionReason: 'Collector identity is missing.',
    }, reviewNow)).toThrow(/named evidence collector/);
    expect(() => applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
    }, reviewNow)).toThrow(/requires a reason/);
    const decided = applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
      rejectionReason: 'Current page evidence did not match the recorded SKU.',
    }, reviewNow);
    expect(decided.observations[0]?.reviewStatus).toBe('rejected');
    expect(decided.reviewEvents[0]?.rejectionReason).toMatch(/did not match/);
  });

  it('blocks approval when price/shipping/stock evidence is missing or stale', () => {
    expect(() => applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'approved',
      reviewer: 'Independent editorial reviewer',
      reviewedAt: '2026-11-06T05:05:00.000Z',
    }, new Date('2026-11-06T05:05:00.000Z'))).toThrow(/fresh within seven days/);

    const fourDaysLater = '2026-11-02T05:05:00.000Z';
    expect(() => applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'approved',
      reviewer: 'Independent editorial reviewer',
      reviewedAt: fourDaysLater,
    }, new Date(fourDaysLater))).toThrow(/fresh within three days/);

    const missingShipping = ObservationCollectionSchema.parse({
      ...collectedCollection,
      observations: [{ ...collectedCollection.observations[0]!, shippingStatus: 'unknown', mandatoryShippingCents: null }],
    });
    expect(() => applyEditorialDecision(missingShipping, {
      observationId: base.id,
      decision: 'approved',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
    }, reviewNow)).toThrow(/shipping evidence is required/);

    const missingPrice = ObservationCollectionSchema.parse({
      ...collectedCollection,
      observations: [{ ...collectedCollection.observations[0]!, priceCents: null }],
    });
    expect(() => applyEditorialDecision(missingPrice, {
      observationId: base.id,
      decision: 'approved',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
    }, reviewNow)).toThrow(/Price evidence must be present/);
  });

  it('rejects future or pre-evidence decisions and invalid audit trail references', () => {
    expect(() => applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Independent editorial reviewer',
      reviewedAt: '2026-10-29T04:00:00.000Z',
      rejectionReason: 'Incorrect configuration.',
    }, reviewNow)).toThrow(/cannot predate the evidence/);
    expect(() => applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Independent editorial reviewer',
      reviewedAt: '2026-10-29T07:00:00.000Z',
      rejectionReason: 'Incorrect configuration.',
    }, reviewNow)).toThrow(/not in the future/);

    const decided = applyEditorialDecision(collectedCollection, {
      observationId: base.id,
      decision: 'rejected',
      reviewer: 'Independent editorial reviewer',
      reviewedAt,
      rejectionReason: 'Incorrect configuration.',
    }, reviewNow);
    expect(() => ObservationCollectionSchema.parse({ ...decided, reviewEvents: [] })).toThrow(/audit event/);
    expect(() => ObservationCollectionSchema.parse({
      ...decided,
      reviewEvents: [{ ...decided.reviewEvents[0], sourceUrl: 'https://www.vari.com/other' }],
    })).toThrow(/match the observation decision and evidence provenance/);
    expect(() => EditorialReviewEventSchema.parse({ ...decided.reviewEvents[0], reviewer: 'Evidence collector' })).toThrow(/different from the evidence collector/);
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
