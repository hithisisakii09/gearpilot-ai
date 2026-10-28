import type { Product, Offer } from './schema';
export type Preference = 'value' | 'quality' | 'features';
export type Criteria = { budgetCents: number; minWidthInches: number; electricRequired: boolean; preference: Preference; market: 'US' };
export type Recommendation = { product: Product; offer: Offer; totalCents: number; score: number; breakdown: Record<string,number>; explanation: string[] };
const weights: Record<Preference, Record<string,number>> = {
  value: {price:0.30, mechanical:0.20, warranty:0.20, usability:0.15, features:0.10, evidence:0.05},
  quality: {price:0.10, mechanical:0.30, warranty:0.35, usability:0.10, features:0.10, evidence:0.05},
  features: {price:0.10, mechanical:0.20, warranty:0.15, usability:0.15, features:0.35, evidence:0.05}
};
export function recommend(products: Product[], offers: Offer[], c: Criteria): Recommendation[] {
  if (!Number.isInteger(c.budgetCents) || c.budgetCents <= 0) throw new Error('Invalid budget');
  const eligible = products.flatMap(product => offers.filter(offer =>
    offer.productId === product.id && product.category === 'standing_desk' && product.market === c.market &&
    offer.market === c.market && offer.available && offer.approvedDataUse &&
    offer.mandatoryShippingCents !== null &&
    offer.itemPriceCents + offer.mandatoryShippingCents <= c.budgetCents &&
    product.widthInches !== undefined && product.widthInches >= c.minWidthInches &&
    (!c.electricRequired || product.electric === true) &&
    (product.isDemo || (product.evidence.length > 0 && product.evidence.every(e => e.status === 'verified')))
  ).map(offer => ({product,offer,totalCents:offer.itemPriceCents + offer.mandatoryShippingCents!})));
  if (!eligible.length) return [];
  const lowest = Math.min(...eligible.map(x => x.totalCents));
  return eligible.map(x => {
    const price = c.budgetCents === lowest ? 100 : 100 * (c.budgetCents - x.totalCents) / (c.budgetCents - lowest);
    const warranty = Math.min(100, (x.product.warrantyYears ?? 0) * 20);
    const breakdown = {price,mechanical:x.product.mechanicalScore,warranty,usability:x.product.usabilityScore,features:x.product.featureScore,evidence:x.product.evidenceScore};
    const score = Object.entries(weights[c.preference]).reduce((sum,[k,w])=>sum+breakdown[k as keyof typeof breakdown]*w,0);
    return {...x,score:Math.round(score*10)/10,breakdown,explanation:[`Within $${c.budgetCents/100} budget including known mandatory shipping.`,`Desktop width: ${x.product.widthInches} inches.`,`Warranty: ${x.product.warrantyYears ?? 'unknown'} years.`,`Ranked by ${c.preference}; affiliate payouts do not affect scores.`]};
  }).sort((a,b)=>b.score-a.score || a.totalCents-b.totalCents || a.product.id.localeCompare(b.product.id));
}
