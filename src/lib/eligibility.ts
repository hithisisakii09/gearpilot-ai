import { AvailabilityObservationSchema, PriceObservationSchema, type Offer, type Product } from './schema.ts';

export const PRICE_FRESHNESS_MS = 7 * 24 * 60 * 60 * 1000;
export const SHIPPING_FRESHNESS_MS = PRICE_FRESHNESS_MS;
export const AVAILABILITY_FRESHNESS_MS = 3 * 24 * 60 * 60 * 1000;
export const SPECIFICATION_REVIEW_MS = 180 * 24 * 60 * 60 * 1000;

export type EvidenceIssueCode =
  | 'missing_product_verification' | 'missing_offer_verification' | 'missing_product_sources' | 'missing_configuration'
  | 'missing_product_editorial_approval' | 'unverified_product_identity' | 'unverified_product_specification'
  | 'missing_price' | 'missing_price_observation' | 'missing_shipping' | 'missing_stock_observation'
  | 'missing_warranty_evidence' | 'unreviewed_warranty_evidence' | 'invalid_warranty_evidence'
  | 'missing_return_policy_evidence' | 'unreviewed_return_policy_evidence' | 'invalid_return_policy_evidence'
  | 'invalid_price_observation' | 'invalid_stock_observation' | 'unreviewed_price_observation' | 'unreviewed_stock_observation'
  | 'stale_price' | 'stale_shipping' | 'stale_stock' | 'future_price_observation' | 'future_stock_observation'
  | 'conflicting_price_observations' | 'conflicting_stock_observations';

export type EvidenceIssue = { code: EvidenceIssueCode; field: 'product' | 'configuration' | 'price' | 'shipping' | 'stock' | 'warranty' | 'returns'; message: string };

function parsedTimestamp(timestamp: unknown): number | null {
  if (typeof timestamp !== 'string') return null;
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? parsed : null;
}

export function timestampIsFresh(timestamp: unknown, maxAgeMs: number, now = new Date()): boolean {
  const observedAt = parsedTimestamp(timestamp);
  return observedAt !== null && Number.isFinite(now.getTime()) && observedAt <= now.getTime() && now.getTime() - observedAt <= maxAgeMs;
}

function matchingPriceObservations(offer: Offer) {
  if (!Array.isArray(offer.priceObservations)) return [];
  return offer.priceObservations.flatMap((candidate) => {
    const parsed = PriceObservationSchema.safeParse(candidate);
    if (!parsed.success) return [];
    const observation = parsed.data;
    return observation.configurationId === offer.configurationId
      && observation.priceCents === offer.priceCents
      && observation.mandatoryShippingCents === offer.mandatoryShippingCents
      && observation.currency === offer.currency
      && observation.seller.trim().toLowerCase() === offer.retailer.trim().toLowerCase()
      && observation.observedAt === offer.priceVerifiedAt ? [observation] : [];
  });
}

function matchingStockObservations(offer: Offer) {
  if (!Array.isArray(offer.availabilityObservations)) return [];
  return offer.availabilityObservations.flatMap((candidate) => {
    const parsed = AvailabilityObservationSchema.safeParse(candidate);
    if (!parsed.success) return [];
    const observation = parsed.data;
    return observation.configurationId === offer.configurationId
      && observation.availability === offer.availability
      && observation.observedAt === offer.availabilityObservedAt ? [observation] : [];
  });
}

function hasConflictingPriceObservations(offer: Offer): boolean {
  const relevant = offer.priceObservations.filter((item) => item.configurationId === offer.configurationId && item.observedAt === offer.priceVerifiedAt);
  return new Set(relevant.map((item) => `${item.priceCents}:${item.mandatoryShippingCents}:${item.currency}:${item.seller.trim().toLowerCase()}`)).size > 1;
}

function hasConflictingStockObservations(offer: Offer): boolean {
  const relevant = offer.availabilityObservations.filter((item) => item.configurationId === offer.configurationId && item.observedAt === offer.availabilityObservedAt);
  return new Set(relevant.map((item) => item.availability)).size > 1;
}

function policyEvidenceIsIndependentlyApproved(evidence: NonNullable<Offer['warrantyEvidence']>, configurationId: string, now: Date): boolean {
  const observedAt = parsedTimestamp(evidence.observedAt);
  const reviewedAt = parsedTimestamp(evidence.reviewedAt);
  return evidence.configurationId === configurationId
    && evidence.reviewStatus === 'approved'
    && evidence.evidenceQuality !== 'unverified'
    && evidence.collectedBy !== null
    && evidence.reviewer !== null
    && evidence.collectedBy.trim().toLowerCase() !== evidence.reviewer.trim().toLowerCase()
    && observedAt !== null
    && reviewedAt !== null
    && reviewedAt >= observedAt
    && reviewedAt <= now.getTime()
    && evidence.sourceUrl.startsWith('https://');
}

export function getOfferEvidenceIssues(product: Product, offer: Offer, now = new Date()): EvidenceIssue[] {
  const issues: EvidenceIssue[] = [];
  if (product.dataStatus !== 'verified') issues.push({ code: 'missing_product_verification', field: 'product', message: 'Product is not verified.' });
  if (offer.dataStatus !== 'verified') issues.push({ code: 'missing_offer_verification', field: 'product', message: 'Offer is not verified.' });
  if (!Array.isArray(product.sources) || product.sources.length === 0) issues.push({ code: 'missing_product_sources', field: 'product', message: 'Product source provenance is missing.' });
  if (!product.editorialApproval) issues.push({ code: 'missing_product_editorial_approval', field: 'product', message: 'Independent product editorial approval is missing.' });
  else if (product.editorialApproval.collector.trim().toLowerCase() === product.editorialApproval.reviewer.trim().toLowerCase()
    || !product.editorialApproval.sourceIds.length
    || product.editorialApproval.sourceIds.some((sourceId) => !product.sources.some((source) => source.id === sourceId))
    || parsedTimestamp(product.editorialApproval.reviewedAt) === null
    || Date.parse(product.editorialApproval.reviewedAt) > now.getTime()) {
    issues.push({ code: 'missing_product_editorial_approval', field: 'product', message: 'Product editorial approval is invalid or does not reference its evidence.' });
  }
  if (product.specificationReferences.identity?.status !== 'verified') {
    issues.push({ code: 'unverified_product_identity', field: 'product', message: 'Product identity lacks independently verified source provenance.' });
  }
  if (Object.keys(product.specifications ?? {}).some((key) => product.specificationReferences[key]?.status !== 'verified')) {
    issues.push({ code: 'unverified_product_specification', field: 'product', message: 'One or more published product specifications lack independently verified source provenance.' });
  }
  if (!offer.configurationId) issues.push({ code: 'missing_configuration', field: 'configuration', message: 'Offer is not tied to an exact configuration.' });
  if (!offer.warrantyEvidence) issues.push({ code: 'missing_warranty_evidence', field: 'warranty', message: 'Configuration-specific warranty evidence is missing.' });
  else if (offer.warrantyEvidence.reviewStatus !== 'approved') issues.push({ code: 'unreviewed_warranty_evidence', field: 'warranty', message: 'Warranty evidence lacks independent human approval.' });
  else if (!offer.configurationId || !policyEvidenceIsIndependentlyApproved(offer.warrantyEvidence, offer.configurationId, now)) {
    issues.push({ code: 'invalid_warranty_evidence', field: 'warranty', message: 'Warranty evidence is invalid or does not match the exact configuration.' });
  }
  if (!offer.returnPolicyEvidence) issues.push({ code: 'missing_return_policy_evidence', field: 'returns', message: 'Configuration-specific return-policy evidence is missing.' });
  else if (offer.returnPolicyEvidence.reviewStatus !== 'approved') issues.push({ code: 'unreviewed_return_policy_evidence', field: 'returns', message: 'Return-policy evidence lacks independent human approval.' });
  else if (!offer.configurationId || !policyEvidenceIsIndependentlyApproved(offer.returnPolicyEvidence, offer.configurationId, now)) {
    issues.push({ code: 'invalid_return_policy_evidence', field: 'returns', message: 'Return-policy evidence is invalid or does not match the exact configuration.' });
  }
  if (!Number.isInteger(offer.priceCents) || offer.priceCents! < 0) issues.push({ code: 'missing_price', field: 'price', message: 'A non-negative USD price is required.' });
  if (!Number.isInteger(offer.mandatoryShippingCents) || offer.mandatoryShippingCents! < 0) issues.push({ code: 'missing_shipping', field: 'shipping', message: 'Mandatory shipping must be known; unknown is not free.' });

  const priceAt = parsedTimestamp(offer.priceVerifiedAt);
  const matchingPrices = matchingPriceObservations(offer);
  if (offer.priceObservations.length === 0) issues.push({ code: 'missing_price_observation', field: 'price', message: 'Price and shipping require a source observation.' });
  else if (matchingPrices.length === 0) issues.push({ code: 'invalid_price_observation', field: 'price', message: 'No price observation matches the offer configuration and snapshot.' });
  if (matchingPrices.length > 0 && !matchingPrices.some((item) => item.reviewStatus === 'approved')) issues.push({ code: 'unreviewed_price_observation', field: 'price', message: 'Matching price evidence lacks explicit human approval.' });
  if (hasConflictingPriceObservations(offer)) issues.push({ code: 'conflicting_price_observations', field: 'price', message: 'Price observations conflict for the same configuration and timestamp.' });
  if (priceAt !== null && priceAt > now.getTime()) issues.push({ code: 'future_price_observation', field: 'price', message: 'Price observation is in the future relative to the supplied clock.' });
  else if (priceAt !== null && now.getTime() - priceAt > PRICE_FRESHNESS_MS) {
    issues.push({ code: 'stale_price', field: 'price', message: 'Price observation is older than seven days.' });
    issues.push({ code: 'stale_shipping', field: 'shipping', message: 'Shipping observation is older than seven days.' });
  }

  const stockAt = parsedTimestamp(offer.availabilityObservedAt);
  const matchingStocks = matchingStockObservations(offer);
  if (offer.availability !== 'in_stock') issues.push({ code: 'invalid_stock_observation', field: 'stock', message: 'Only in-stock offers are eligible.' });
  if (offer.availabilityObservations.length === 0) issues.push({ code: 'missing_stock_observation', field: 'stock', message: 'Stock requires a source observation.' });
  else if (matchingStocks.length === 0) issues.push({ code: 'invalid_stock_observation', field: 'stock', message: 'No stock observation matches the offer configuration and snapshot.' });
  if (matchingStocks.length > 0 && !matchingStocks.some((item) => item.reviewStatus === 'approved')) issues.push({ code: 'unreviewed_stock_observation', field: 'stock', message: 'Matching stock evidence lacks explicit human approval.' });
  if (hasConflictingStockObservations(offer)) issues.push({ code: 'conflicting_stock_observations', field: 'stock', message: 'Stock observations conflict for the same configuration and timestamp.' });
  if (stockAt !== null && stockAt > now.getTime()) issues.push({ code: 'future_stock_observation', field: 'stock', message: 'Stock observation is in the future relative to the supplied clock.' });
  else if (stockAt !== null && now.getTime() - stockAt > AVAILABILITY_FRESHNESS_MS) issues.push({ code: 'stale_stock', field: 'stock', message: 'In-stock observation is older than three days.' });
  return issues;
}

export function getMissingEvidence(product: Product, offer: Offer, now = new Date()): EvidenceIssue[] {
  return getOfferEvidenceIssues(product, offer, now).filter((issue) => issue.code.startsWith('missing_') || issue.code.startsWith('unreviewed_'));
}

export function getExpiredEvidence(product: Product, offer: Offer, now = new Date()): EvidenceIssue[] {
  return getOfferEvidenceIssues(product, offer, now).filter((issue) => issue.code.startsWith('stale_'));
}

export function getConflictingEvidence(product: Product, offer: Offer, now = new Date()): EvidenceIssue[] {
  return getOfferEvidenceIssues(product, offer, now).filter((issue) => issue.code.startsWith('conflicting_'));
}

export function isPriceFresh(offer: Offer, now = new Date()): boolean {
  return Number.isInteger(offer.priceCents) && offer.priceCents! >= 0
    && matchingPriceObservations(offer).some((item) => item.reviewStatus === 'approved' && timestampIsFresh(item.observedAt, PRICE_FRESHNESS_MS, now));
}

export function isShippingFresh(offer: Offer, now = new Date()): boolean {
  return Number.isInteger(offer.mandatoryShippingCents) && offer.mandatoryShippingCents! >= 0
    && matchingPriceObservations(offer).some((item) => item.reviewStatus === 'approved' && timestampIsFresh(item.observedAt, SHIPPING_FRESHNESS_MS, now));
}

export function isAvailabilityFresh(offer: Offer, now = new Date()): boolean {
  return offer.availability === 'in_stock'
    && matchingStockObservations(offer).some((item) => item.reviewStatus === 'approved' && timestampIsFresh(item.observedAt, AVAILABILITY_FRESHNESS_MS, now));
}

export const isStockFresh = isAvailabilityFresh;

export function isSpecificationReviewDue(product: Product, now = new Date()): boolean {
  const timestamps = Object.values(product.specificationReferences).map((reference) => parsedTimestamp(reference.verifiedAt)).filter((value): value is number => value !== null);
  return timestamps.length === 0 || timestamps.some((verifiedAt) => verifiedAt > now.getTime() || now.getTime() - verifiedAt >= SPECIFICATION_REVIEW_MS);
}

/** Shared real-offer publication gate used by recommendations and affiliate links. */
export function isVerifiedOfferEligible(product: Product, offer: Offer, now = new Date()): boolean {
  return getOfferEvidenceIssues(product, offer, now).length === 0;
}
