import type { AffiliateProgram, Offer, Product } from './schema';

export type AffiliateLink = { href: string; rel: 'sponsored nofollow noopener noreferrer' };

function domainIsAllowed(destination: URL, allowedDomains: string[]): boolean {
  return allowedDomains.some((domain) => destination.hostname === domain || destination.hostname.endsWith(`.${domain}`));
}

function isActiveApprovedProgram(program: AffiliateProgram, now: Date): boolean {
  return program.status === 'approved'
    && program.allowedRegions.includes('US')
    && program.approvalEvidence !== null
    && program.approvalDate !== null
    && program.trackingIdReference !== null
    && (program.expiresAt === null || Date.parse(program.expiresAt) > now.getTime());
}

/**
 * Produces a referral destination only after product verification, offer verification,
 * registry approval evidence, program credential reference, and destination allowlisting pass.
 * It never creates URLs, tracking parameters, or tracking identifiers.
 */
export function resolveAffiliateLink(product: Product, offer: Offer, programs: AffiliateProgram[], now = new Date()): AffiliateLink | null {
  if (product.dataStatus !== 'verified' || offer.dataStatus !== 'verified') return null;
  if (offer.availability !== 'in_stock' || offer.affiliateProgramStatus !== 'approved' || !offer.affiliateProgramId || !offer.affiliateUrl) return null;
  const program = programs.find((entry) => entry.id === offer.affiliateProgramId);
  if (!program || program.merchantName.trim().toLowerCase() !== offer.retailer.trim().toLowerCase() || !isActiveApprovedProgram(program, now)) return null;
  try {
    const destination = new URL(offer.affiliateUrl);
    if (destination.protocol !== 'https:' || !domainIsAllowed(destination, program.approvedDestinationDomains)) return null;
  } catch {
    return null;
  }
  return { href: offer.affiliateUrl, rel: 'sponsored nofollow noopener noreferrer' };
}

/** Legacy offer-only helper: intentionally refuses to activate links without registry proof. */
export function getApprovedAffiliateLink(_offer: Offer): AffiliateLink | null {
  return null;
}
