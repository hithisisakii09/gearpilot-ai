import { AvailabilityObservationSchema, PriceObservationSchema, type Offer, type Product } from './schema';

export const PRICE_FRESHNESS_MS = 7 * 24 * 60 * 60 * 1000;
export const AVAILABILITY_FRESHNESS_MS = 3 * 24 * 60 * 60 * 1000;

function timestampIsFresh(timestamp: unknown, maxAgeMs: number, now: Date): timestamp is string {
  if (typeof timestamp !== 'string' || !Number.isFinite(now.getTime())) return false;
  const observedAt = Date.parse(timestamp);
  return Number.isFinite(observedAt) && observedAt <= now.getTime() && now.getTime() - observedAt <= maxAgeMs;
}

export function isPriceFresh(offer: Offer, now = new Date()): boolean {
  if (!Number.isInteger(offer.priceCents) || offer.priceCents! < 0) return false;
  if (!Number.isInteger(offer.mandatoryShippingCents) || offer.mandatoryShippingCents! < 0) return false;
  if (!timestampIsFresh(offer.priceVerifiedAt, PRICE_FRESHNESS_MS, now) || !Array.isArray(offer.priceObservations)) return false;

  return offer.priceObservations.some((candidate) => {
    const parsed = PriceObservationSchema.safeParse(candidate);
    if (!parsed.success) return false;
    const observation = parsed.data;
    return observation.priceCents === offer.priceCents
      && observation.mandatoryShippingCents === offer.mandatoryShippingCents
      && observation.currency === offer.currency
      && observation.observedAt === offer.priceVerifiedAt
      && timestampIsFresh(observation.observedAt, PRICE_FRESHNESS_MS, now);
  });
}

export function isAvailabilityFresh(offer: Offer, now = new Date()): boolean {
  if (offer.availability !== 'in_stock') return false;
  if (!timestampIsFresh(offer.availabilityObservedAt, AVAILABILITY_FRESHNESS_MS, now) || !Array.isArray(offer.availabilityObservations)) return false;

  return offer.availabilityObservations.some((candidate) => {
    const parsed = AvailabilityObservationSchema.safeParse(candidate);
    if (!parsed.success) return false;
    const observation = parsed.data;
    return observation.availability === 'in_stock'
      && observation.observedAt === offer.availabilityObservedAt
      && timestampIsFresh(observation.observedAt, AVAILABILITY_FRESHNESS_MS, now);
  });
}

/** Shared real-offer publication gate used by recommendations and affiliate links. */
export function isVerifiedOfferEligible(product: Product, offer: Offer, now = new Date()): boolean {
  return product.dataStatus === 'verified'
    && offer.dataStatus === 'verified'
    && Array.isArray(product.sources)
    && product.sources.length > 0
    && isPriceFresh(offer, now)
    && isAvailabilityFresh(offer, now);
}
