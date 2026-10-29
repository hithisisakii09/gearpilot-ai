import type { Offer, Product } from './schema.ts';
import { isVerifiedOfferEligible } from './eligibility.ts';
export { AVAILABILITY_FRESHNESS_MS, isAvailabilityFresh, isPriceFresh, PRICE_FRESHNESS_MS } from './eligibility.ts';

export type Preference = 'value' | 'quality' | 'workspace_fit';
export type Workspace = 'compact' | 'standard' | 'large';
export type Criteria = { budgetCents: number; minDesktopWidthInches: number; minDesktopDepthInches?: number; targetMinHeightInches?: number; targetMaxHeightInches?: number; minLiftCapacityLbs?: number; electricRequired: boolean; workspace: Workspace; preference: Preference; market: 'US'; now?: Date };
export type Recommendation = { product: Product; offer: Offer; totalCents: number; score: number; breakdown: Record<'price' | 'desktop' | 'height' | 'capacity' | 'warranty' | 'evidence', number>; explanation: string[] };
const weights: Record<Preference, Recommendation['breakdown']> = {
  value: { price: 40, desktop: 15, height: 10, capacity: 15, warranty: 15, evidence: 5 },
  quality: { price: 10, desktop: 15, height: 20, capacity: 25, warranty: 25, evidence: 5 },
  workspace_fit: { price: 15, desktop: 35, height: 20, capacity: 15, warranty: 10, evidence: 5 },
};
const workspaceMinimums: Record<Workspace, { width: number; depth: number }> = { compact: { width: 40, depth: 20 }, standard: { width: 48, depth: 24 }, large: { width: 60, depth: 30 } };

function normalise(value: number | undefined, maximum: number): number { return value === undefined || maximum <= 0 ? 0 : Math.min(100, (value / maximum) * 100); }
function isEligibleEvidence(product: Product, offer: Offer, now: Date): boolean {
  if (product.dataStatus === 'demo' && offer.dataStatus === 'demo') return true;
  return isVerifiedOfferEligible(product, offer, now);
}
export function recommend(products: Product[], offers: Offer[], criteria: Criteria): Recommendation[] {
  if (!Number.isInteger(criteria.budgetCents) || criteria.budgetCents <= 0) throw new Error('Budget must be a positive integer in cents');
  const positiveValues: Array<[string, number | undefined]> = [
    ['Minimum desktop width', criteria.minDesktopWidthInches],
    ['Minimum desktop depth', criteria.minDesktopDepthInches],
    ['Minimum height', criteria.targetMinHeightInches],
    ['Maximum height', criteria.targetMaxHeightInches],
    ['Minimum lift capacity', criteria.minLiftCapacityLbs],
  ];
  for (const [label, value] of positiveValues) {
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) throw new Error(`${label} must be a finite positive number`);
  }
  if (criteria.targetMinHeightInches !== undefined && criteria.targetMaxHeightInches !== undefined && criteria.targetMinHeightInches > criteria.targetMaxHeightInches) {
    throw new Error('Minimum height must not exceed maximum height');
  }
  if (!Object.prototype.hasOwnProperty.call(workspaceMinimums, criteria.workspace)) throw new Error('Workspace must be a supported option');
  if (!Object.prototype.hasOwnProperty.call(weights, criteria.preference)) throw new Error('Preference must be a supported option');
  if (criteria.market !== 'US') throw new Error('Market must be US');
  if (typeof criteria.electricRequired !== 'boolean') throw new Error('Electric-adjustment requirement must be boolean');
  if (criteria.now !== undefined && (!(criteria.now instanceof Date) || !Number.isFinite(criteria.now.getTime()))) throw new Error('Current time must be a valid date');
  const now = criteria.now ?? new Date();
  const workspaceMinimum = workspaceMinimums[criteria.workspace];
  const requiredWidth = Math.max(criteria.minDesktopWidthInches, workspaceMinimum.width);
  const requiredDepth = Math.max(criteria.minDesktopDepthInches ?? 0, workspaceMinimum.depth);
  const eligible = products.flatMap((product) => {
    const specs = product.specifications;
    return offers.filter((offer) => {
      const totalCents = offer.priceCents === null || offer.mandatoryShippingCents === null ? Number.POSITIVE_INFINITY : offer.priceCents + offer.mandatoryShippingCents;
      return product.category === 'standing_desk' && product.market === criteria.market && offer.productId === product.id && offer.market === criteria.market && totalCents <= criteria.budgetCents && specs !== undefined && specs.desktopWidthInches !== undefined && specs.desktopWidthInches >= requiredWidth && (specs.desktopDepthInches ?? 0) >= requiredDepth && (criteria.targetMinHeightInches === undefined || (specs.minHeightInches ?? Number.POSITIVE_INFINITY) <= criteria.targetMinHeightInches) && (criteria.targetMaxHeightInches === undefined || (specs.maxHeightInches ?? 0) >= criteria.targetMaxHeightInches) && (criteria.minLiftCapacityLbs === undefined || (specs.liftCapacityLbs ?? 0) >= criteria.minLiftCapacityLbs) && (!criteria.electricRequired || specs.electric === true) && isEligibleEvidence(product, offer, now);
    }).map((offer) => ({ product, offer, totalCents: offer.priceCents! + offer.mandatoryShippingCents! }));
  });
  if (eligible.length === 0) return [];
  const maximums = { desktop: Math.max(...eligible.map(({ product }) => product.specifications?.desktopWidthInches ?? 0)), height: Math.max(...eligible.map(({ product }) => (product.specifications?.maxHeightInches ?? 0) - (product.specifications?.minHeightInches ?? 0))), capacity: Math.max(...eligible.map(({ product }) => product.specifications?.liftCapacityLbs ?? 0)), warranty: Math.max(...eligible.map(({ product }) => product.specifications?.warrantyYears ?? 0)) };
  const cheapest = Math.min(...eligible.map((item) => item.totalCents));
  return eligible.map(({ product, offer, totalCents }) => {
    const specs = product.specifications!;
    const breakdown = { price: Math.round((cheapest / totalCents) * 1000) / 10, desktop: normalise(specs.desktopWidthInches, maximums.desktop), height: normalise((specs.maxHeightInches ?? 0) - (specs.minHeightInches ?? 0), maximums.height), capacity: normalise(specs.liftCapacityLbs, maximums.capacity), warranty: normalise(specs.warrantyYears, maximums.warranty), evidence: product.dataStatus === 'verified' && offer.dataStatus === 'verified' ? 100 : 0 };
    const score = (Object.keys(breakdown) as Array<keyof typeof breakdown>).reduce((sum, key) => sum + breakdown[key] * (weights[criteria.preference][key] / 100), 0);
    const dataLabel = product.dataStatus === 'demo' ? 'Synthetic demonstration record; it is not a real product recommendation.' : `Verified product and offer evidence observed ${offer.priceVerifiedAt}.`;
    return { product, offer, totalCents, score: Math.round(score * 10) / 10, breakdown, explanation: [`Known total: $${(totalCents / 100).toFixed(2)} including mandatory shipping.`, `Desktop: ${specs.desktopWidthInches ?? 'unknown'} inches wide${specs.desktopDepthInches ? ` × ${specs.desktopDepthInches} inches deep` : ''}.`, `Height range: ${specs.minHeightInches ?? 'unknown'}–${specs.maxHeightInches ?? 'unknown'} inches; lift capacity: ${specs.liftCapacityLbs ?? 'unknown'} lb.`, `Ranked for ${criteria.preference.replace('_', ' ')} using published price, dimensions, capacity, warranty, and evidence status. Affiliate terms are excluded from scoring.`, dataLabel] };
  }).sort((a, b) => b.score - a.score || a.totalCents - b.totalCents || a.product.id.localeCompare(b.product.id));
}
