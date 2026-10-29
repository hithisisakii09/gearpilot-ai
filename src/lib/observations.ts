import { resolveAffiliateLink } from './affiliate.ts';
import { AVAILABILITY_FRESHNESS_MS, PRICE_FRESHNESS_MS, isSpecificationReviewDue, isVerifiedOfferEligible, timestampIsFresh } from './eligibility.ts';
import type { AffiliateProgram, Catalog, CommercialObservation, ObservationCollection, Product } from './schema.ts';

export type ObservationProblem = { key: string; observationIds: string[]; message: string };

function observationKey(observation: CommercialObservation): string {
  return [observation.productId, observation.offerId, observation.configuration.id, observation.merchant.toLowerCase(), observation.sourceUrl, observation.observedAt].join('|');
}

export function findDuplicateObservations(observations: CommercialObservation[]): ObservationProblem[] {
  const groups = new Map<string, string[]>();
  observations.forEach((observation) => {
    const key = observationKey(observation);
    groups.set(key, [...(groups.get(key) ?? []), observation.id]);
  });
  return [...groups.entries()].filter(([, ids]) => ids.length > 1).map(([key, observationIds]) => ({ key, observationIds, message: 'Duplicate observation for the same product, offer, configuration, source, and timestamp.' }));
}

export function findConflictingObservations(observations: CommercialObservation[]): ObservationProblem[] {
  const groups = new Map<string, CommercialObservation[]>();
  observations.forEach((observation) => {
    const key = [observation.productId, observation.offerId, observation.configuration.id, observation.merchant.toLowerCase(), observation.observedAt].join('|');
    groups.set(key, [...(groups.get(key) ?? []), observation]);
  });
  return [...groups.entries()].flatMap(([key, group]) => {
    if (group.length < 2) return [];
    const facts = new Set(group.map((item) => `${item.priceCents}:${item.mandatoryShippingCents}:${item.shippingStatus}:${item.availability}`));
    return facts.size > 1 ? [{ key, observationIds: group.map((item) => item.id), message: 'Conflicting commercial facts for the same configuration and timestamp.' }] : [];
  });
}

export function validateObservationReferences(collection: ObservationCollection, products: Product[]): string[] {
  const productById = new Map(products.map((product) => [product.id, product]));
  const errors: string[] = [];
  collection.observations.forEach((observation) => {
    const product = productById.get(observation.productId);
    if (!product) errors.push(`Observation ${observation.id} references missing product ${observation.productId}.`);
    else if (product.manufacturer.trim().toLowerCase() !== observation.manufacturer.trim().toLowerCase()) errors.push(`Observation ${observation.id} conflicts with the product manufacturer.`);
    else if (product.model.trim().toLowerCase() !== observation.configuration.exactModel.trim().toLowerCase()) errors.push(`Observation ${observation.id} conflicts with the product model/configuration reference.`);
  });
  collection.candidateAssessments.forEach((assessment) => {
    const product = productById.get(assessment.productId);
    if (!product) errors.push(`Assessment references missing product ${assessment.productId}.`);
    else if (product.manufacturer.trim().toLowerCase() !== assessment.manufacturer.trim().toLowerCase()) errors.push(`Assessment for ${assessment.productId} conflicts with the product manufacturer.`);
  });
  return errors;
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
  const freshPriceObservations = collection.observations.filter((item) => item.priceCents !== null && item.mandatoryShippingCents !== null && timestampIsFresh(item.observedAt, PRICE_FRESHNESS_MS, now)).length;
  const freshStockObservations = collection.observations.filter((item) => item.availability === 'in_stock' && timestampIsFresh(item.observedAt, AVAILABILITY_FRESHNESS_MS, now)).length;
  const staleObservations = collection.observations.filter((item) => {
    const priceStale = item.priceCents !== null && !timestampIsFresh(item.observedAt, PRICE_FRESHNESS_MS, now);
    const stockStale = item.availability === 'in_stock' && !timestampIsFresh(item.observedAt, AVAILABILITY_FRESHNESS_MS, now);
    return priceStale || stockStale;
  }).length;
  const missingShippingFromObservations = collection.observations.filter((item) => item.shippingStatus === 'unknown' || item.mandatoryShippingCents === null).length;
  const assessedWithoutShipping = collection.candidateAssessments.filter((item) => item.shippingStatus === 'unknown' && !collection.observations.some((observation) => observation.productId === item.productId)).length;
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
    conflictingObservations: findConflictingObservations(collection.observations).length,
    duplicateObservations: findDuplicateObservations(collection.observations).length,
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
