import type { Offer } from './schema';

export type AffiliateLink = { href: string; rel: 'sponsored nofollow noopener noreferrer' };

/** Returns a destination only when the catalog contains an approved program and approved URL. */
export function getApprovedAffiliateLink(offer: Offer): AffiliateLink | null {
  if (offer.availability !== 'in_stock' || offer.affiliateProgramStatus !== 'approved' || !offer.affiliateUrl) return null;
  return { href: offer.affiliateUrl, rel: 'sponsored nofollow noopener noreferrer' };
}
