import { describe, expect, it } from 'vitest';
import candidates from '../src/data/candidates.json';
import observationsData from '../src/data/observations.json';
import registryData from '../src/data/affiliate-programs.json';
import { PRICE_FRESHNESS_MS, timestampIsFresh } from '../src/lib/eligibility';
import { applyEditorialDecision, createCatalogQualityReport, findConflictingObservations, findDuplicateObservations, isCommercialObservation, prepareObservationIngestion, validateObservationReferences } from '../src/lib/observations';
import { AffiliateRegistrySchema, CatalogSchema, CommercialObservationSchema, EditorialReviewEventSchema, ManufacturerProductObservationSchema, ObservationCollectionSchema } from '../src/lib/schema';

const catalog = CatalogSchema.parse(candidates);
const collection = ObservationCollectionSchema.parse(observationsData);
const registry = AffiliateRegistrySchema.parse(registryData);
const now = new Date('2026-10-29T05:05:00Z');
const base = collection.observations[0]!;
const collectedCollection = ObservationCollectionSchema.parse({
  ...collection,
  observations: collection.observations.map((observation) => ({ ...observation, collectedBy: 'Evidence collector' })),
});
const branchProduct = catalog.products.find((product) => product.id === 'branch-duo-standing-desk')!;
const branchConfiguration = {
  id: 'branch-duo-36x24-woodgrain-white',
  label: '36x24 desktop, Woodgrain top, White legs',
  exactModel: 'Duo Standing Desk',
  sku: null,
  desktopWidthInches: 36,
  desktopDepthInches: 24,
  selectedOptions: { desktopSize: '36x24', top: 'Woodgrain', legColor: 'White', accessories: 'None' },
};
const manufacturerObservation = ManufacturerProductObservationSchema.parse({
  id: 'branch-duo-36x24-woodgrain-white-20261029',
  observationType: 'manufacturer_product',
  productId: branchProduct.id,
  manufacturer: 'Branch',
  collectedBy: 'akhil',
  configuration: branchConfiguration,
  currency: 'USD',
  priceCents: 54900,
  mandatoryShippingCents: null,
  shippingStatus: 'unknown',
  availability: 'in_stock',
  productUrl: branchProduct.officialManufacturerUrl,
  sourceUrl: branchProduct.officialManufacturerUrl,
  observedAt: '2026-10-29T17:12:00Z',
  evidenceNotes: 'Test fixture based on owner-supplied manufacturer-page claims; not checkout-confirmed.',
  evidenceQuality: 'primary',
  reviewStatus: 'pending_review',
  reviewer: null,
  reviewedAt: null,
  rejectionReason: null,
  sourceMetadata: { sourceType: 'manufacturer_product_page', testFixture: true },
});
const branchAssessment = {
  ...collection.candidateAssessments.find((assessment) => assessment.productId === branchProduct.id)!,
  exactConfiguration: branchConfiguration,
  assessedAt: '2026-10-29T18:10:00.000Z',
  priceStatus: 'observed' as const,
  shippingStatus: 'unknown' as const,
  availability: 'in_stock' as const,
  missingEvidence: ['mandatory_shipping', 'human_review'] as const,
  notes: 'Test-only exact variant fixture; shipping destination and cart state are not confirmed.',
};

describe('commercial observation contracts', () => {
  it('accepts exact, primary-source USD observations without auto-approving them', () => {
    expect(base.priceCents).toBe(36999);
    expect(base.configuration.selectedOptions.sku).toBe('401512');
    expect(base.reviewStatus).toBe('pending_review');
    expect(collection.observations).toHaveLength(2);
    expect(collection.observations.every(isCommercialObservation)).toBe(true);
  });
});

describe('manufacturer-only observation contracts', () => {
    it('accepts a source-backed manufacturer page observation without a commercial offer', () => {
      expect(manufacturerObservation).toMatchObject({
        observationType: 'manufacturer_product',
        productId: branchProduct.id,
        priceCents: 54900,
        shippingStatus: 'unknown',
        mandatoryShippingCents: null,
        reviewStatus: 'pending_review',
        reviewer: null,
        configuration: { id: 'branch-duo-36x24-woodgrain-white', sku: null },
      });
      expect(isCommercialObservation(manufacturerObservation)).toBe(false);
      expect(() => ManufacturerProductObservationSchema.parse({
        ...manufacturerObservation,
        offerId: 'invented-offer',
        merchant: 'Branch',
      })).toThrow();
      expect(() => ObservationCollectionSchema.parse({
        lastUpdatedAt: manufacturerObservation.observedAt,
        observations: [{ ...manufacturerObservation, offerId: 'invented-offer', merchant: 'Branch' }],
        candidateAssessments: [],
        reviewEvents: [],
      })).toThrow();
      expect(() => CommercialObservationSchema.parse({
        ...manufacturerObservation,
        observationType: undefined,
        merchant: 'Branch',
      })).toThrow();
      const defaultPending = ManufacturerProductObservationSchema.parse({
        ...manufacturerObservation,
        reviewStatus: undefined,
        reviewer: undefined,
        reviewedAt: undefined,
      });
      expect(defaultPending).toMatchObject({
        reviewStatus: 'pending_review',
        reviewer: null,
        reviewedAt: null,
      });
    });

    it('requires an exact assessment, official source, and matching product configuration for intake', () => {
      const incoming = ObservationCollectionSchema.parse({
        lastUpdatedAt: '2026-10-29T18:15:00.000Z',
        observations: [manufacturerObservation],
        candidateAssessments: [branchAssessment],
        reviewEvents: [],
      });
      const merged = prepareObservationIngestion(
        collection,
        incoming,
        catalog.products,
        'akhil',
        '2026-10-29T18:15:00.000Z',
        new Date('2026-10-29T18:15:00Z'),
      );
      expect(merged.observations.at(-1)).toMatchObject({ reviewStatus: 'pending_review', reviewer: null });
      expect(merged.candidateAssessments.find((assessment) => assessment.productId === branchProduct.id)?.exactConfiguration).toEqual(branchConfiguration);
      const withoutBranchAssessment = ObservationCollectionSchema.parse({
        ...collection,
        candidateAssessments: collection.candidateAssessments.filter((assessment) => assessment.productId !== branchProduct.id),
      });
      expect(() => prepareObservationIngestion(withoutBranchAssessment, ObservationCollectionSchema.parse({
        ...incoming,
        candidateAssessments: [],
      }), catalog.products, 'akhil', '2026-10-29T18:15:00.000Z', new Date('2026-10-29T18:15:00.000Z'))).toThrow(/requires an exact candidate assessment/);
      expect(() => prepareObservationIngestion(collection, ObservationCollectionSchema.parse({
        ...incoming,
        observations: [{ ...manufacturerObservation, configuration: { ...branchConfiguration, desktopWidthInches: 48 } }],
      }), catalog.products, 'akhil', '2026-10-29T18:15:00.000Z', new Date('2026-10-29T18:15:00.000Z'))).toThrow(/assessed exact configuration/);
      expect(() => prepareObservationIngestion(collection, ObservationCollectionSchema.parse({
        ...incoming,
        observations: [{ ...manufacturerObservation, sourceUrl: 'https://example.com/product' }],
      }), catalog.products, 'akhil', '2026-10-29T18:15:00.000Z', new Date('2026-10-29T18:15:00.000Z'))).toThrow();
      expect(() => prepareObservationIngestion(collection, ObservationCollectionSchema.parse({
        ...incoming,
        candidateAssessments: [{
          ...branchAssessment,
          sourceUrls: ['https://example.com/product'],
        }],
      }), catalog.products, 'akhil', '2026-10-29T18:15:00.000Z', new Date('2026-10-29T18:15:00.000Z'))).toThrow(/candidate assessment must cite/);
    });

    it('isolates manufacturer duplicates and conflicts from commercial freshness and offer eligibility', () => {
      const duplicateManufacturer = { ...manufacturerObservation, id: 'branch-duo-manufacturer-duplicate' };
      const conflictingManufacturer = { ...manufacturerObservation, id: 'branch-duo-manufacturer-conflict', priceCents: 55000 };
      const sameIdDifferentVariant = {
        ...manufacturerObservation,
        id: 'branch-duo-manufacturer-variant-conflict',
        configuration: { ...branchConfiguration, selectedOptions: { ...branchConfiguration.selectedOptions, top: 'Oak' } },
      };
      expect(findDuplicateObservations([manufacturerObservation, duplicateManufacturer])).toHaveLength(1);
      expect(findConflictingObservations([manufacturerObservation, conflictingManufacturer])).toHaveLength(1);
      expect(findConflictingObservations([manufacturerObservation, sameIdDifferentVariant])).toHaveLength(1);
      const withManufacturerEvidence = ObservationCollectionSchema.parse({
        ...collection,
        observations: [...collection.observations, manufacturerObservation],
      });
      expect(findDuplicateObservations(withManufacturerEvidence.observations)).toEqual([]);
      expect(findConflictingObservations(withManufacturerEvidence.observations)).toEqual([]);
      expect(createCatalogQualityReport(catalog, withManufacturerEvidence, registry.programs, now)).toMatchObject({
        eligibleOffers: 0,
        freshPriceObservations: 2,
        freshStockObservations: 2,
        missingShippingEvidence: 8,
        conflictingObservations: 0,
        duplicateObservations: 0,
      });
      expect(catalog.offers).toHaveLength(0);
    });

    it('supports independent evidence review without automatically verifying a product', () => {
      const pending = ObservationCollectionSchema.parse({
        lastUpdatedAt: '2026-10-29T18:15:00.000Z',
        observations: [manufacturerObservation],
        candidateAssessments: [branchAssessment],
        reviewEvents: [],
      });
      const reviewed = applyEditorialDecision(pending, {
        observationId: manufacturerObservation.id,
        decision: 'approved',
        reviewer: 'Independent editorial reviewer',
        reviewedAt: '2026-10-29T18:30:00.000Z',
      }, new Date('2026-10-29T18:30:00.000Z'));
      expect(reviewed.observations[0]).toMatchObject({ reviewStatus: 'approved', reviewer: 'Independent editorial reviewer' });
      expect(reviewed.reviewEvents).toHaveLength(1);
      expect(branchProduct.dataStatus).toBe('partially_verified');
      expect(catalog.offers).toHaveLength(0);
      expect(() => applyEditorialDecision(pending, {
        observationId: manufacturerObservation.id,
        decision: 'approved',
        reviewer: 'akhil',
        reviewedAt: '2026-10-29T18:30:00.000Z',
      }, new Date('2026-10-29T18:30:00.000Z'))).toThrow(/different from the evidence collector/);
    });
});

describe('commercial observation contracts', () => {
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

  it('ingests an exact configuration assessment alongside evidence and rejects variant mismatches', () => {
    const observedAt = '2026-10-29T05:10:00.000Z';
    const observation = {
      ...collectedCollection.observations[0]!,
      id: 'vari-essential-401512-recheck',
      observedAt,
      evidenceNotes: 'Fresh evidence captured for workflow testing only.',
    };
    const updatedAssessment = {
      ...collection.candidateAssessments.find((assessment) => assessment.productId === observation.productId)!,
      assessedAt: observedAt,
      notes: 'Configuration recorded for workflow testing only.',
    };
    const incoming = ObservationCollectionSchema.parse({
      lastUpdatedAt: observedAt,
      observations: [observation],
      candidateAssessments: [updatedAssessment],
      reviewEvents: [],
    });
    const ingested = prepareObservationIngestion(collection, incoming, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow);
    expect(ingested.candidateAssessments.find((assessment) => assessment.productId === observation.productId)).toEqual(updatedAssessment);
    expect(ingested.observations.at(-1)?.reviewStatus).toBe('pending_review');

    const mismatchedObservation = {
      ...observation,
      configuration: { ...observation.configuration, id: 'vari-essential-other-variant' },
    };
    const mismatched = ObservationCollectionSchema.parse({
      ...incoming,
      observations: [mismatchedObservation],
    });
    expect(() => prepareObservationIngestion(collection, mismatched, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow)).toThrow(/assessed exact configuration/);

    const sameIdWrongOptions = ObservationCollectionSchema.parse({
      ...incoming,
      observations: [{
        ...observation,
        configuration: {
          ...observation.configuration,
          selectedOptions: { ...observation.configuration.selectedOptions, finish: 'Different finish' },
        },
      }],
    });
    expect(() => prepareObservationIngestion(collection, sameIdWrongOptions, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow)).toThrow(/assessed exact configuration/);

    const futureAssessment = ObservationCollectionSchema.parse({
      ...incoming,
      candidateAssessments: [{ ...updatedAssessment, assessedAt: '2026-10-29T05:16:00.000Z' }],
    });
    expect(() => prepareObservationIngestion(collection, futureAssessment, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow)).toThrow(/future-dated/);

    const staleAssessment = ObservationCollectionSchema.parse({
      ...incoming,
      candidateAssessments: [{ ...updatedAssessment, assessedAt: '2026-10-29T05:04:00.000Z' }],
    });
    expect(() => prepareObservationIngestion(collection, staleAssessment, catalog.products, 'Evidence collector', '2026-10-29T05:15:00.000Z', reviewNow)).toThrow(/older than the existing assessment/);
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
    expect(catalog.products.find((product) => product.id === base.productId)?.dataStatus).toBe('partially_verified');
    expect(catalog.offers).toHaveLength(0);
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
