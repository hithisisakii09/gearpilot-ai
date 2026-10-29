import { describe, expect, it } from 'vitest';
import registryData from '../src/data/affiliate-programs.json';
import candidates from '../src/data/candidates.json';
import { resolveAffiliateLink } from '../src/lib/affiliate';
import { prepareBranchAffiliateApproval, BranchAffiliateApprovalIntakeSchema } from '../src/lib/affiliate-intake';
import { AVAILABILITY_FRESHNESS_MS, PRICE_FRESHNESS_MS } from '../src/lib/eligibility';
import { AffiliateProgramSchema, AffiliateRegistrySchema, OfferSchema, ProductSchema } from '../src/lib/schema';

const now = new Date('2026-10-29T00:00:00Z');
const configurationId = 'branch-duo-48x24-test';
const reviewEvidence = { evidenceNotes: 'Approved test fixture.', evidenceQuality: 'primary' as const, reviewStatus: 'approved' as const, collectedBy: 'Evidence collector', reviewer: 'Test reviewer', reviewedAt: now.toISOString(), sourceMetadata: {} };
const registry = AffiliateRegistrySchema.parse(registryData);
const verifiedProduct = ProductSchema.parse({
  ...candidates.products[0],
  dataStatus: 'verified',
  configuration: { id: configurationId, label: 'Synthetic verified-test Branch Duo 48x24', exactModel: 'Duo Standing Desk', sku: 'TEST-ONLY', desktopWidthInches: 48, desktopDepthInches: 24, selectedOptions: { desktop: '48x24' } },
  specificationReferences: Object.fromEntries(Object.entries(candidates.products[0]!.specificationReferences).map(([key, reference]) => [key, { ...reference, status: 'verified' }])),
  editorialApproval: { collector: 'Product evidence collector', reviewer: 'Independent product reviewer', reviewedAt: now.toISOString(), sourceIds: candidates.products[0]!.sources.map((source) => source.id) },
});
const priceObservation = (overrides: Record<string, unknown> = {}) => ({ configurationId, priceCents: 49900, currency: 'USD', seller: 'Branch', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), mandatoryShippingCents: 0, shippingStatus: 'free', ...reviewEvidence, ...overrides });
const availabilityObservation = (overrides: Record<string, unknown> = {}) => ({ configurationId, availability: 'in_stock', sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), ...reviewEvidence, ...overrides });
const policyEvidence = () => ({ configurationId, sourceUrl: 'https://www.branchfurniture.com/products/duo-standing-desk', observedAt: now.toISOString(), ...reviewEvidence });
const verifiedOffer = (overrides: Record<string, unknown> = {}) => OfferSchema.parse({
  id: 'branch-duo-affiliate', productId: verifiedProduct.id, retailer: 'Branch', configurationId, market: 'US', dataStatus: 'verified', currency: 'USD', priceCents: 49900, mandatoryShippingCents: 0, priceVerifiedAt: now.toISOString(), priceObservations: [priceObservation()], availability: 'in_stock', availabilityObservedAt: now.toISOString(), availabilityObservations: [availabilityObservation()], warrantyEvidence: policyEvidence(), returnPolicyEvidence: policyEvidence(), affiliateProgramStatus: 'approved', affiliateProgramId: 'branch', affiliateUrl: 'https://shop.branchfurniture.com/products/duo', sourceUrls: ['https://www.branchfurniture.com/products/duo-standing-desk'], reviewNotes: null, lastUpdatedAt: now.toISOString(), ...overrides,
});
const approvedProgram = (overrides: Record<string, unknown> = {}) => AffiliateProgramSchema.parse({
  id: 'branch', merchantName: 'Branch', officialWebsite: 'https://www.branchfurniture.com/', applicationUrl: null, programName: 'Branch partner program', networkName: null, allowedRegions: ['US'], programRestrictions: ['Synthetic test restriction'], approvedDestinationDomains: ['branchfurniture.com'], approvalEvidence: { reference: 'approval-ref:affiliate/branch/approval-record', reviewedAt: '2026-10-29T00:00:00Z', sourceUrl: 'https://www.branchfurniture.com/pages/affiliate-program' }, approvalDate: '2026-10-29T00:00:00Z', trackingIdReference: 'credential-ref:affiliate/branch/tracking-id', status: 'approved', expiresAt: null, reviewNotes: 'Test fixture only; no real approval is asserted.', lastReviewedAt: '2026-10-29T00:00:00Z', ...overrides,
});

const pendingBranchProgram = () => AffiliateProgramSchema.parse({
  ...registry.programs.find((program) => program.id === 'branch')!,
  status: 'pending',
  reviewNotes: 'Synthetic transition-test fixture.',
});
const approvalIntake = (overrides: Record<string, unknown> = {}) => ({
  networkRegistration: {
    provider: 'CJ',
    reference: 'approval-ref:cj/registration/test-record',
    sourceUrl: 'https://public.cj.com/account',
    date: '2026-10-28T10:00:00Z',
  },
  advertiserApproval: {
    reference: 'approval-ref:branch/acceptance/test-record',
    sourceUrl: 'https://www.branchfurniture.com/pages/affiliate-program',
    date: '2026-10-29T09:00:00Z',
  },
  programName: 'Branch partner program',
  approvedMarkets: ['US'],
  approvedDestinationHosts: ['branchfurniture.com', 'shop.branchfurniture.com'],
  restrictions: ['No paid search unless separately authorized by current terms.'],
  credentialReference: 'credential-ref:affiliate/branch/tracking-id',
  expiresAt: null,
  ownerAuthorization: { authorized: true, authorizedBy: 'Authorized owner', authorizedAt: '2026-10-29T10:00:00Z' },
  reviewedAt: '2026-10-29T11:00:00Z',
  ...overrides,
});

describe('affiliate registry and resolver', () => {
  it('tracks researched merchants without asserting a program approval', () => {
    expect(registry.programs).toHaveLength(8);
    expect(registry.programs.filter((program) => program.id !== 'branch').every((program) => program.status === 'not_applied')).toBe(true);
    expect(registry.programs.every((program) => program.approvedDestinationDomains.length === 0 && program.trackingIdReference === null)).toBe(true);
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer(), registry.programs, now)).toBeNull();
  });
  it('records only the owner-supplied Branch pending application evidence without inferring approval', () => {
    const branch = registry.programs.find((program) => program.id === 'branch')!;
    expect(branch).toMatchObject({
      status: 'pending',
      networkName: 'CJ',
      programName: 'Branch - Program Terms',
      applicationEvidence: {
        reference: 'owner-evidence:cj/relationship-history/branch-program-terms',
        sourceType: 'owner_supplied_cj_screenshot',
        observedOn: '2026-10-29',
        advertiserId: '5885920',
      },
      approvalEvidence: null,
      approvalDate: null,
      approvedDestinationDomains: [],
      trackingIdReference: null,
    });
    expect(registry.programs.filter((program) => program.id !== 'branch').every((program) => program.status === 'not_applied')).toBe(true);
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer(), [branch], now)).toBeNull();
    expect(JSON.stringify(branch)).not.toMatch(/w-?8ben|bank|account number|routing number|tax id|password/i);
  });
  it('requires safe, date-only application provenance for a pending Branch record', () => {
    const branch = registry.programs.find((program) => program.id === 'branch')!;
    expect(() => AffiliateProgramSchema.parse({ ...branch, applicationEvidence: null })).toThrow(/application status requires application evidence/);
    expect(() => AffiliateProgramSchema.parse({
      ...branch,
      applicationEvidence: { ...branch.applicationEvidence!, reference: 'screenshot contents or secret' },
    })).toThrow();
    expect(() => AffiliateProgramSchema.parse({
      ...branch,
      applicationEvidence: { ...branch.applicationEvidence!, observedOn: '2026-10-29T13:45:00Z' },
    })).toThrow();
  });
  it('requires documented terms on approved programs and separate CJ registration evidence', () => {
    expect(() => approvedProgram({ programRestrictions: [] })).toThrow(/documented program restrictions/);
    expect(() => approvedProgram({ allowedRegions: [] })).toThrow(/approved market/);
    expect(() => approvedProgram({ networkName: 'CJ', networkRegistrationEvidence: null })).toThrow(/separate network registration evidence/);
    expect(() => approvedProgram({ approvalEvidence: { reference: 'approval-ref:affiliate/branch/approval-record', reviewedAt: '2026-10-28T00:00:00Z', sourceUrl: 'https://branch.example/approval' } })).toThrow(/official Branch host/);
    expect(() => approvedProgram({
      networkName: 'CJ',
      networkRegistrationEvidence: { provider: 'Other network', reference: 'approval-ref:cj/registration/test-record', registeredAt: '2026-10-28T00:00:00Z', sourceUrl: 'https://public.cj.com/account' },
    })).toThrow(/identify CJ and use an official CJ host/);
    expect(() => approvedProgram({ approvalDate: '2026-10-30T00:00:00Z' })).toThrow(/cannot predate program approval/);
  });
  it('prepares Branch approval only from separate official proof, a supported market, restrictions, a safe reference, and owner authorization', () => {
    const current = pendingBranchProgram();
    const intake = BranchAffiliateApprovalIntakeSchema.parse(approvalIntake());
    const prepared = prepareBranchAffiliateApproval(current, intake, new Date('2026-10-29T12:00:00Z'));
    expect(prepared).toMatchObject({
      status: 'approved',
      networkName: 'CJ',
      networkRegistrationEvidence: {
        provider: 'CJ',
        reference: 'approval-ref:cj/registration/test-record',
      },
      approvalEvidence: {
        reference: 'approval-ref:branch/acceptance/test-record',
      },
      allowedRegions: ['US'],
      approvedDestinationDomains: ['branchfurniture.com', 'shop.branchfurniture.com'],
      programRestrictions: ['No paid search unless separately authorized by current terms.'],
      trackingIdReference: 'credential-ref:affiliate/branch/tracking-id',
    });
    expect(current.status).toBe('pending');
    expect(registry.programs.find((program) => program.id === 'branch')?.status).toBe('pending');
  });
  it.each([
    ['not owner-authorized', { ownerAuthorization: { authorized: false, authorizedBy: 'Owner', authorizedAt: '2026-10-29T10:00:00Z' } }],
    ['CJ proof from an untrusted host', { networkRegistration: { provider: 'CJ', reference: 'approval-ref:cj/registration/test-record', sourceUrl: 'https://cj.com.evil.example/account', date: '2026-10-28T10:00:00Z' } }],
    ['Branch proof from an untrusted host', { advertiserApproval: { reference: 'approval-ref:branch/acceptance/test-record', sourceUrl: 'https://branchfurniture.com.evil.example/approval', date: '2026-10-29T09:00:00Z' } }],
    ['same-domain proof reused for both decisions', { networkRegistration: { provider: 'CJ', reference: 'approval-ref:cj/registration/test-record', sourceUrl: 'https://www.branchfurniture.com/account', date: '2026-10-28T10:00:00Z' } }],
    ['credential secret instead of a reference', { credentialReference: 'shh-super-secret-token' }],
    ['no documented restrictions', { restrictions: [] }],
    ['invalid destination hostname', { approvedDestinationHosts: ['https://shop.branchfurniture.com/path'] }],
    ['unsupported market', { approvedMarkets: ['CA'] }],
    ['review predating approval', { reviewedAt: '2026-10-29T08:00:00Z' }],
    ['authorization predating approval', { ownerAuthorization: { authorized: true, authorizedBy: 'Authorized owner', authorizedAt: '2026-10-29T08:00:00Z' } }],
    ['expiry predating approval', { expiresAt: '2026-10-29T08:30:00Z' }],
  ])('rejects approval intake with %s', (_label, overrides) => {
    expect(() => BranchAffiliateApprovalIntakeSchema.parse(approvalIntake(overrides))).toThrow();
  });
  it('rejects future-dated proof, authorization, review, and expired approval evidence', () => {
    const current = pendingBranchProgram();
    const futureProof = BranchAffiliateApprovalIntakeSchema.parse(approvalIntake({
      advertiserApproval: { reference: 'approval-ref:branch/acceptance/test-record', sourceUrl: 'https://www.branchfurniture.com/pages/affiliate-program', date: '2026-10-30T09:00:00Z' },
      ownerAuthorization: { authorized: true, authorizedBy: 'Authorized owner', authorizedAt: '2026-10-30T10:00:00Z' },
      reviewedAt: '2026-10-30T11:00:00Z',
    }));
    expect(() => prepareBranchAffiliateApproval(current, futureProof, new Date('2026-10-29T12:00:00Z'))).toThrow(/cannot be in the future/);

    const futureAuthorization = BranchAffiliateApprovalIntakeSchema.parse(approvalIntake({
      ownerAuthorization: { authorized: true, authorizedBy: 'Authorized owner', authorizedAt: '2026-10-30T10:00:00Z' },
      reviewedAt: '2026-10-30T11:00:00Z',
    }));
    expect(() => prepareBranchAffiliateApproval(current, futureAuthorization, new Date('2026-10-29T12:00:00Z'))).toThrow(/cannot be in the future/);

    const expired = BranchAffiliateApprovalIntakeSchema.parse(approvalIntake({ expiresAt: '2026-10-29T11:30:00Z' }));
    expect(() => prepareBranchAffiliateApproval(current, expired, new Date('2026-10-29T12:00:00Z'))).toThrow(/Expired approval evidence/);
  });
  it('does not transition a merchant that has not been applied to or one other than Branch', () => {
    const intake = BranchAffiliateApprovalIntakeSchema.parse(approvalIntake());
    const notAppliedBranch = { ...registry.programs.find((program) => program.id === 'branch')!, status: 'not_applied' as const, applicationEvidence: null };
    expect(() => prepareBranchAffiliateApproval(notAppliedBranch, intake)).toThrow(/must be applied or pending/);
    expect(() => prepareBranchAffiliateApproval({ ...pendingBranchProgram(), id: 'flexispot', merchantName: 'FlexiSpot' }, intake)).toThrow(/cannot update another merchant/);
  });
  it.each(['pending', 'rejected', 'suspended', 'expired'] as const)('blocks %s programs', (status) => {
    const program = approvedProgram({
      status,
      applicationEvidence: status === 'pending' ? {
        reference: 'owner-evidence:cj/relationship-history/branch-program-terms',
        sourceType: 'owner_supplied_cj_screenshot',
        observedOn: '2026-10-29',
        advertiserId: '5885920',
      } : null,
      approvedDestinationDomains: [],
      approvalEvidence: null,
      approvalDate: null,
      trackingIdReference: null,
      expiresAt: status === 'expired' ? '2026-10-28T00:00:00Z' : null,
    });
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer(), [program], now)).toBeNull();
  });
  it('rejects an approved program missing a tracking-ID reference', () => {
    expect(() => approvedProgram({ trackingIdReference: null })).toThrow(/credential reference/);
  });
  it.each([
    '',
    '*.branchfurniture.com',
    'https://branchfurniture.com',
    '127.0.0.1',
    'localhost',
    'BranchFurniture.com',
    'branchfurniture.com.',
    ' branchfurniture.com',
    'branchfurniture..com',
  ])('rejects a non-canonical or ambiguous destination domain: %j', (domain) => {
    expect(() => approvedProgram({ approvedDestinationDomains: [domain] })).toThrow(/canonical HTTPS hostname/);
  });
  it('blocks destinations outside the program allowlist and merchant mismatches', () => {
    const program = approvedProgram();
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer({ affiliateUrl: 'https://evil.example/path' }), [program], now)).toBeNull();
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer({ retailer: 'Different merchant' }), [program], now)).toBeNull();
  });
  it.each([
    'http://shop.branchfurniture.com/products/duo',
    'https://branchfurniture.com.evil.example/products/duo',
    'https://user:password@shop.branchfurniture.com/products/duo',
    'javascript:alert(1)',
  ])('never resolves an unsafe affiliate destination: %s', (affiliateUrl) => {
    const offer = { ...verifiedOffer(), affiliateUrl };
    expect(resolveAffiliateLink(verifiedProduct, offer, [approvedProgram()], now)).toBeNull();
  });
  it('requires verified product and offer records before monetization', () => {
    const program = approvedProgram();
    expect(resolveAffiliateLink({ ...verifiedProduct, dataStatus: 'demo' }, verifiedOffer(), [program], now)).toBeNull();
    expect(resolveAffiliateLink(verifiedProduct, verifiedOffer({ dataStatus: 'partially_verified' }), [program], now)).toBeNull();
  });
  it('blocks affiliate links when policy evidence or independent product approval is absent', () => {
    const productWithoutReview = { ...verifiedProduct, editorialApproval: null };
    expect(resolveAffiliateLink(productWithoutReview, verifiedOffer(), [approvedProgram()], now)).toBeNull();

    const offerWithoutWarranty = verifiedOffer();
    Object.assign(offerWithoutWarranty, { warrantyEvidence: null });
    expect(resolveAffiliateLink(verifiedProduct, offerWithoutWarranty, [approvedProgram()], now)).toBeNull();

    const offerWithUnreviewedReturns = verifiedOffer();
    Object.assign(offerWithUnreviewedReturns, { returnPolicyEvidence: { ...offerWithUnreviewedReturns.returnPolicyEvidence!, reviewStatus: 'pending_review', reviewer: null, reviewedAt: null } });
    expect(resolveAffiliateLink(verifiedProduct, offerWithUnreviewedReturns, [approvedProgram()], now)).toBeNull();
  });
  it.each([
    ['missing price observation', { priceObservations: [] }],
    ['missing mandatory shipping', { mandatoryShippingCents: null, priceObservations: [priceObservation({ mandatoryShippingCents: null, shippingStatus: 'unknown' })] }],
    ['missing stock observation', { availabilityObservations: [] }],
    ['invalid price observation', { priceObservations: [priceObservation({ priceCents: 49899 })] }],
    ['invalid stock observation', { availabilityObservations: [availabilityObservation({ availability: 'out_of_stock' })] }],
    ['unreviewed price observation', { priceObservations: [priceObservation({ reviewStatus: 'pending_review', reviewer: null, reviewedAt: null })] }],
    ['unreviewed stock observation', { availabilityObservations: [availabilityObservation({ reviewStatus: 'pending_review', reviewer: null, reviewedAt: null })] }],
  ])('blocks an approved but ineligible offer with %s', (_label, overrides) => {
    const offer = verifiedOffer();
    Object.assign(offer, overrides);
    expect(resolveAffiliateLink(verifiedProduct, offer, [approvedProgram()], now)).toBeNull();
  });
  it('blocks approved offers whose source observations are stale', () => {
    const stalePriceAt = new Date(now.getTime() - PRICE_FRESHNESS_MS - 1).toISOString();
    const stalePrice = verifiedOffer({
      priceVerifiedAt: stalePriceAt,
      priceObservations: [priceObservation({ observedAt: stalePriceAt, reviewedAt: stalePriceAt })],
    });
    const staleStockAt = new Date(now.getTime() - AVAILABILITY_FRESHNESS_MS - 1).toISOString();
    const staleStock = verifiedOffer({
      availabilityObservedAt: staleStockAt,
      availabilityObservations: [availabilityObservation({ observedAt: staleStockAt, reviewedAt: staleStockAt })],
    });
    expect(resolveAffiliateLink(verifiedProduct, stalePrice, [approvedProgram()], now)).toBeNull();
    expect(resolveAffiliateLink(verifiedProduct, staleStock, [approvedProgram()], now)).toBeNull();
  });
  it('returns sponsored, safe attributes only after all gates pass', () => {
    const resolved = resolveAffiliateLink(verifiedProduct, verifiedOffer(), [approvedProgram()], now);
    expect(resolved).toEqual({ href: 'https://shop.branchfurniture.com/products/duo', rel: 'sponsored nofollow noopener noreferrer' });
  });
});
