import { resolveAffiliateLink } from './affiliate.ts';
import { AVAILABILITY_FRESHNESS_MS, PRICE_FRESHNESS_MS, isSpecificationReviewDue, isVerifiedOfferEligible, timestampIsFresh } from './eligibility.ts';
import { CommercialObservationSchema, EditorialReviewEventSchema, ManufacturerProductObservationSchema, ObservationCollectionSchema } from './schema.ts';
import type { AffiliateProgram, Catalog, CommercialObservation, EditorialReviewDecision, Observation, ObservationCollection, Product } from './schema.ts';

export type ObservationProblem = { key: string; observationIds: string[]; message: string };

export type EditorialDecisionInput = {
  observationId: string;
  decision: EditorialReviewDecision;
  reviewer: string;
  reviewedAt: string;
  rejectionReason?: string;
};

export function isCommercialObservation(observation: Observation): observation is CommercialObservation {
  return 'offerId' in observation;
}

export function prepareObservationIngestion(
  existing: ObservationCollection,
  incoming: ObservationCollection,
  products: Product[],
  collectorName: string,
  ingestedAt: string,
  now = new Date(),
): ObservationCollection {
  const parsedExisting = ObservationCollectionSchema.parse(existing);
  const parsedIncoming = ObservationCollectionSchema.parse(incoming);
  const collector = collectorName.trim();
  const ingestedAtMs = Date.parse(ingestedAt);
  if (!collector) throw new Error('Evidence collector identity is required');
  if (!Number.isFinite(ingestedAtMs) || new Date(ingestedAtMs).toISOString() !== ingestedAt || ingestedAtMs > now.getTime()) {
    throw new Error('Ingestion timestamp must be canonical UTC and not in the future');
  }
  if (parsedIncoming.observations.length === 0 || parsedIncoming.reviewEvents.length > 0) {
    throw new Error('Ingestion requires one or more unreviewed observations and no review events');
  }
  if (parsedIncoming.observations.some((item) => (
    (item.reviewStatus !== 'draft' && item.reviewStatus !== 'pending_review')
    || item.reviewer !== null
    || item.reviewedAt !== null
    || item.rejectionReason !== null
    || item.collectedBy?.toLowerCase() !== collector.toLowerCase()
    || Date.parse(item.observedAt) > ingestedAtMs
  ))) {
    throw new Error('Each ingested observation must be unreviewed, timestamped, collected by the named collector, and observed no later than ingestion');
  }
  const merged = ObservationCollectionSchema.parse({
    lastUpdatedAt: ingestedAt,
    observations: [...parsedExisting.observations, ...parsedIncoming.observations],
    candidateAssessments: [
      ...parsedExisting.candidateAssessments.filter((existingAssessment) => (
        !parsedIncoming.candidateAssessments.some((assessment) => assessment.productId === existingAssessment.productId)
      )),
      ...parsedIncoming.candidateAssessments,
    ],
    reviewEvents: parsedExisting.reviewEvents,
  });
  const existingAssessments = new Map(parsedExisting.candidateAssessments.map((assessment) => [assessment.productId, assessment]));
  if (parsedIncoming.candidateAssessments.some((assessment) => {
    const previous = existingAssessments.get(assessment.productId);
    return Date.parse(assessment.assessedAt) > ingestedAtMs
      || (previous !== undefined && Date.parse(assessment.assessedAt) < Date.parse(previous.assessedAt));
  })) {
    throw new Error('Candidate assessment updates must not be future-dated or older than the existing assessment');
  }
  const referenceErrors = validateObservationReferences(merged, products);
  const duplicates = findDuplicateObservations(merged.observations);
  const conflicts = findConflictingObservations(merged.observations);
  if (referenceErrors.length || duplicates.length || conflicts.length) {
    throw new Error(JSON.stringify({ referenceErrors, duplicates, conflicts }));
  }
  return merged;
}

export function applyEditorialDecision(collection: ObservationCollection, input: EditorialDecisionInput, now = new Date()): ObservationCollection {
  const parsedCollection = ObservationCollectionSchema.parse(collection);
  const observationIndex = parsedCollection.observations.findIndex((item) => item.id === input.observationId);
  if (observationIndex < 0) throw new Error(`Unknown observation: ${input.observationId}`);
  const observation = parsedCollection.observations[observationIndex]!;
  if (observation.reviewStatus !== 'draft' && observation.reviewStatus !== 'pending_review') {
    throw new Error(`Observation ${input.observationId} already has a terminal review decision`);
  }
  const reviewer = input.reviewer.trim();
  if (!reviewer) throw new Error('Reviewer identity is required');
  if (!observation.collectedBy) throw new Error('A named evidence collector is required before independent review');
  if (observation.collectedBy.toLowerCase() === reviewer.toLowerCase()) throw new Error('The reviewer must be different from the evidence collector');
  const reviewedAtMs = Date.parse(input.reviewedAt);
  if (!Number.isFinite(reviewedAtMs) || reviewedAtMs > now.getTime()) throw new Error('Review timestamp must be valid and not in the future');
  if (reviewedAtMs < Date.parse(observation.observedAt)) throw new Error('Review timestamp cannot predate the evidence');

  const rejectionReason = input.decision === 'rejected' ? input.rejectionReason?.trim() ?? '' : null;
  if (input.decision === 'rejected' && !rejectionReason) throw new Error('Rejected evidence requires a reason');
  if (input.decision === 'approved' && isCommercialObservation(observation)) {
    if (observation.priceCents === null || !timestampIsFresh(observation.observedAt, PRICE_FRESHNESS_MS, new Date(reviewedAtMs))) {
      throw new Error('Price evidence must be present and fresh within seven days to approve');
    }
    if (observation.shippingStatus === 'unknown' || observation.mandatoryShippingCents === null) {
      throw new Error('Mandatory shipping evidence is required to approve');
    }
    if (observation.availability === 'unknown' || !timestampIsFresh(observation.observedAt, AVAILABILITY_FRESHNESS_MS, new Date(reviewedAtMs))) {
      throw new Error('Availability evidence must be present and fresh within three days to approve');
    }
  }

  const updatedObservation = (isCommercialObservation(observation)
    ? CommercialObservationSchema
    : ManufacturerProductObservationSchema).parse({
    ...observation,
    reviewStatus: input.decision,
    reviewer,
    reviewedAt: input.reviewedAt,
    rejectionReason,
  });
  const event = EditorialReviewEventSchema.parse({
    id: `review-${observation.id}-${reviewedAtMs}`,
    observationId: observation.id,
    collector: observation.collectedBy,
    decision: input.decision,
    reviewer,
    reviewedAt: input.reviewedAt,
    sourceUrl: observation.sourceUrl,
    evidenceObservedAt: observation.observedAt,
    rejectionReason,
  });
  const observations = [...parsedCollection.observations];
  observations[observationIndex] = updatedObservation;
  return ObservationCollectionSchema.parse({
    ...parsedCollection,
    lastUpdatedAt: input.reviewedAt,
    observations,
    reviewEvents: [...parsedCollection.reviewEvents, event],
  });
}

function observationKey(observation: Observation): string {
  if (!isCommercialObservation(observation)) {
    return ['manufacturer_product', observation.productId, observation.configuration.id, observation.sourceUrl, observation.observedAt].join('|');
  }
  return ['commercial', observation.productId, observation.offerId, observation.configuration.id, observation.merchant.toLowerCase(), observation.sourceUrl, observation.observedAt].join('|');
}

export function findDuplicateObservations(observations: Observation[]): ObservationProblem[] {
  const groups = new Map<string, string[]>();
  observations.forEach((observation) => {
    const key = observationKey(observation);
    groups.set(key, [...(groups.get(key) ?? []), observation.id]);
  });
  return [...groups.entries()].filter(([, ids]) => ids.length > 1).map(([key, observationIds]) => ({ key, observationIds, message: 'Duplicate observation for the same product, offer, configuration, source, and timestamp.' }));
}

export function findConflictingObservations(observations: Observation[]): ObservationProblem[] {
  const groups = new Map<string, CommercialObservation[]>();
  observations.filter(isCommercialObservation).forEach((observation) => {
    const key = [observation.productId, observation.offerId, observation.configuration.id, observation.merchant.toLowerCase(), observation.observedAt].join('|');
    groups.set(key, [...(groups.get(key) ?? []), observation]);
  });
  const commercialConflicts = [...groups.entries()].flatMap(([key, group]) => {
    if (group.length < 2) return [];
    const facts = new Set(group.map((item) => `${item.priceCents}:${item.mandatoryShippingCents}:${item.shippingStatus}:${item.availability}`));
    return facts.size > 1 ? [{ key, observationIds: group.map((item) => item.id), message: 'Conflicting commercial facts for the same configuration and timestamp.' }] : [];
  });
  const manufacturerGroups = new Map<string, Extract<Observation, { observationType: 'manufacturer_product' }> []>();
  observations.filter((item): item is Extract<Observation, { observationType: 'manufacturer_product' }> => !isCommercialObservation(item)).forEach((observation) => {
    const key = [observation.productId, observation.configuration.id, observation.sourceUrl, observation.observedAt].join('|');
    manufacturerGroups.set(key, [...(manufacturerGroups.get(key) ?? []), observation]);
  });
  const manufacturerConflicts = [...manufacturerGroups.entries()].flatMap(([key, group]) => {
    if (group.length < 2) return [];
    const facts = new Set(group.map((item) => JSON.stringify({
      configuration: {
        ...item.configuration,
        selectedOptions: Object.fromEntries(Object.entries(item.configuration.selectedOptions).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)),
      },
      currency: item.currency,
      priceCents: item.priceCents,
      availability: item.availability,
    })));
    return facts.size > 1 ? [{ key, observationIds: group.map((item) => item.id), message: 'Conflicting manufacturer-page claims for the same configuration, source, and timestamp.' }] : [];
  });
  return [...commercialConflicts, ...manufacturerConflicts];
}

export function validateObservationReferences(collection: ObservationCollection, products: Product[]): string[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const assessmentByProductId = new Map(collection.candidateAssessments.map((assessment) => [assessment.productId, assessment]));
  const errors: string[] = [];
  collection.observations.forEach((observation) => {
    const product = productById.get(observation.productId);
    if (!product) errors.push(`Observation ${observation.id} references missing product ${observation.productId}.`);
    else if (product.manufacturer.trim().toLowerCase() !== observation.manufacturer.trim().toLowerCase()) errors.push(`Observation ${observation.id} conflicts with the product manufacturer.`);
    else if (product.model.trim().toLowerCase() !== observation.configuration.exactModel.trim().toLowerCase()) errors.push(`Observation ${observation.id} conflicts with the product model/configuration reference.`);
    const assessment = assessmentByProductId.get(observation.productId);
    const assessmentConfiguration = assessment?.exactConfiguration;
    if (!isCommercialObservation(observation) && !assessmentConfiguration) {
      errors.push(`Manufacturer observation ${observation.id} requires an exact candidate assessment configuration.`);
    }
    if (product
      && product.model.trim().toLowerCase() === observation.configuration.exactModel.trim().toLowerCase()
      && assessmentConfiguration
      && !sameProductConfiguration(observation.configuration, assessmentConfiguration)) {
      errors.push(`Observation ${observation.id} does not match the candidate's assessed exact configuration.`);
    }
    if (product && !isCommercialObservation(observation)
      && (!assessment
        || observation.productUrl !== product.officialManufacturerUrl
        || observation.sourceUrl !== product.officialManufacturerUrl
        || assessment.productUrl !== product.officialManufacturerUrl
        || !assessment.sourceUrls.includes(observation.sourceUrl))) {
      errors.push(`Manufacturer observation ${observation.id} and its candidate assessment must cite the product's official manufacturer URL.`);
    }
  });
  collection.candidateAssessments.forEach((assessment) => {
    const product = productById.get(assessment.productId);
    if (!product) errors.push(`Assessment references missing product ${assessment.productId}.`);
    else if (product.manufacturer.trim().toLowerCase() !== assessment.manufacturer.trim().toLowerCase()) errors.push(`Assessment for ${assessment.productId} conflicts with the product manufacturer.`);
  });
  return errors;
}

function sameProductConfiguration(
  left: Observation['configuration'],
  right: NonNullable<ObservationCollection['candidateAssessments'][number]['exactConfiguration']>,
): boolean {
  const leftOptions = Object.entries(left.selectedOptions).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  const rightOptions = Object.entries(right.selectedOptions).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  return left.id === right.id
    && left.label === right.label
    && left.exactModel === right.exactModel
    && left.sku === right.sku
    && left.desktopWidthInches === right.desktopWidthInches
    && left.desktopDepthInches === right.desktopDepthInches
    && JSON.stringify(leftOptions) === JSON.stringify(rightOptions);
}

export type CatalogQualityReport = {
  generatedAt: string;
  totalResearchCandidates: number;
  fullyVerifiedProducts: number;
  partiallyVerifiedProducts: number;
  verifiedOffers: number;
  eligibleOffers: number;
  freshPriceObservations: number;
  freshStockObservations: number;
  staleObservations: number;
  specificationReviewsDue: number;
  missingShippingEvidence: number;
  conflictingObservations: number;
  duplicateObservations: number;
  approvedAffiliatePrograms: number;
  activeAffiliateLinks: number;
  reviewedObservations: number;
  pendingReviewObservations: number;
};

export function createCatalogQualityReport(catalog: Catalog, collection: ObservationCollection, programs: AffiliateProgram[], now = new Date()): CatalogQualityReport {
  const commercialObservations = collection.observations.filter(isCommercialObservation);
  const freshPriceObservations = commercialObservations.filter((item) => item.priceCents !== null && item.mandatoryShippingCents !== null && timestampIsFresh(item.observedAt, PRICE_FRESHNESS_MS, now)).length;
  const freshStockObservations = commercialObservations.filter((item) => item.availability === 'in_stock' && timestampIsFresh(item.observedAt, AVAILABILITY_FRESHNESS_MS, now)).length;
  const staleObservations = commercialObservations.filter((item) => {
    const priceStale = item.priceCents !== null && !timestampIsFresh(item.observedAt, PRICE_FRESHNESS_MS, now);
    const stockStale = item.availability === 'in_stock' && !timestampIsFresh(item.observedAt, AVAILABILITY_FRESHNESS_MS, now);
    return priceStale || stockStale;
  }).length;
  const missingShippingFromObservations = commercialObservations.filter((item) => item.shippingStatus === 'unknown' || item.mandatoryShippingCents === null).length;
  const assessedWithoutShipping = collection.candidateAssessments.filter((item) => item.shippingStatus === 'unknown' && !commercialObservations.some((observation) => observation.productId === item.productId)).length;
  const productById = new Map(catalog.products.map((product) => [product.id, product]));
  const eligibleOffers = catalog.offers.filter((offer) => {
    const product = productById.get(offer.productId);
    return product ? isVerifiedOfferEligible(product, offer, now) : false;
  }).length;
  const activeAffiliateLinks = catalog.offers.filter((offer) => {
    const product = productById.get(offer.productId);
    return product ? resolveAffiliateLink(product, offer, programs, now) !== null : false;
  }).length;
  return {
    generatedAt: now.toISOString(),
    totalResearchCandidates: catalog.products.length,
    fullyVerifiedProducts: catalog.products.filter((product) => product.dataStatus === 'verified').length,
    partiallyVerifiedProducts: catalog.products.filter((product) => product.dataStatus === 'partially_verified').length,
    verifiedOffers: catalog.offers.filter((offer) => offer.dataStatus === 'verified').length,
    eligibleOffers,
    freshPriceObservations,
    freshStockObservations,
    staleObservations,
    specificationReviewsDue: catalog.products.filter((product) => isSpecificationReviewDue(product, now)).length,
    missingShippingEvidence: missingShippingFromObservations + assessedWithoutShipping,
    conflictingObservations: findConflictingObservations(commercialObservations).length,
    duplicateObservations: findDuplicateObservations(commercialObservations).length,
    approvedAffiliatePrograms: programs.filter((program) => program.status === 'approved').length,
    activeAffiliateLinks,
    reviewedObservations: collection.observations.filter((item) => item.reviewStatus === 'approved' || item.reviewStatus === 'rejected').length,
    pendingReviewObservations: collection.observations.filter((item) => item.reviewStatus === 'pending_review' || item.reviewStatus === 'draft').length,
  };
}

export function qualityReportMarkdown(report: CatalogQualityReport): string {
  const rows = Object.entries(report).filter(([key]) => key !== 'generatedAt').map(([key, value]) => `| ${key} | ${value} |`).join('\n');
  return `# Phase 3.3 data quality report\n\nGenerated at: ${report.generatedAt}\n\n| Metric | Count |\n| --- | ---: |\n${rows}\n\nEvidence completeness and affiliate approval are independent. A fresh observation does not become a verified offer until explicit human review and catalog promotion are complete.\n`;
}
