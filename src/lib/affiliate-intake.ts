import { z } from 'zod';
import { AffiliateProgramSchema, isCanonicalHttpsHostname, type AffiliateProgram } from './schema.ts';

const ApprovalReferenceSchema = z.string().regex(/^approval-ref:[a-z0-9][a-z0-9_./:-]*$/);
const CredentialReferenceSchema = z.string().regex(/^credential-ref:[a-z0-9][a-z0-9_./:-]*$/);
const HttpsUrlSchema = z.url().refine((value) => new URL(value).protocol === 'https:', 'Evidence URLs must use HTTPS');
const ApprovedMarketSchema = z.enum(['US']);

const ProofSchema = z.object({
  reference: ApprovalReferenceSchema,
  sourceUrl: HttpsUrlSchema,
  date: z.iso.datetime(),
});

export const BranchAffiliateApprovalIntakeSchema = z.object({
  networkRegistration: ProofSchema.extend({ provider: z.literal('CJ') }),
  advertiserApproval: ProofSchema,
  programName: z.string().trim().min(1).max(120),
  approvedMarkets: z.array(ApprovedMarketSchema).min(1),
  approvedDestinationHosts: z.array(z.string().refine(isCanonicalHttpsHostname, 'Destination must be a canonical host')).min(1),
  restrictions: z.array(z.string().trim().min(1).max(500)).min(1),
  credentialReference: CredentialReferenceSchema,
  expiresAt: z.iso.datetime({ offset: true }).nullable(),
  reviewedAt: z.iso.datetime(),
  ownerAuthorization: z.object({
    authorized: z.literal(true),
    authorizedBy: z.string().trim().min(1).max(120),
    authorizedAt: z.iso.datetime(),
  }),
}).superRefine((intake, context) => {
  const networkUrl = new URL(intake.networkRegistration.sourceUrl);
  const advertiserUrl = new URL(intake.advertiserApproval.sourceUrl);
  if (networkUrl.hostname !== 'cj.com' && !networkUrl.hostname.endsWith('.cj.com')) {
    context.addIssue({ code: 'custom', path: ['networkRegistration', 'sourceUrl'], message: 'Network registration evidence must be from an official CJ host' });
  }
  if (advertiserUrl.hostname !== 'branchfurniture.com' && !advertiserUrl.hostname.endsWith('.branchfurniture.com')) {
    context.addIssue({ code: 'custom', path: ['advertiserApproval', 'sourceUrl'], message: 'Advertiser approval evidence must be from an official Branch host' });
  }
  if (new Set(intake.approvedDestinationHosts).size !== intake.approvedDestinationHosts.length) {
    context.addIssue({ code: 'custom', path: ['approvedDestinationHosts'], message: 'Approved destination hosts must be unique' });
  }
  const networkDate = Date.parse(intake.networkRegistration.date);
  const advertiserDate = Date.parse(intake.advertiserApproval.date);
  const reviewedAt = Date.parse(intake.reviewedAt);
  const authorizedAt = Date.parse(intake.ownerAuthorization.authorizedAt);
  if (authorizedAt < advertiserDate) {
    context.addIssue({ code: 'custom', path: ['ownerAuthorization', 'authorizedAt'], message: 'Owner authorization must follow advertiser approval evidence' });
  }
  if (reviewedAt < Math.max(networkDate, advertiserDate, authorizedAt)) {
    context.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'Intake review cannot predate either approval proof' });
  }
  if (intake.expiresAt && Date.parse(intake.expiresAt) <= advertiserDate) {
    context.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Program expiry must follow advertiser approval' });
  }
});

export type BranchAffiliateApprovalIntake = z.infer<typeof BranchAffiliateApprovalIntakeSchema>;

function isOfficialUrl(url: string, hostname: string): boolean {
  const parsed = new URL(url);
  return parsed.protocol === 'https:' && (parsed.hostname === hostname || parsed.hostname.endsWith(`.${hostname}`));
}

export function prepareBranchAffiliateApproval(
  current: AffiliateProgram,
  intakeInput: BranchAffiliateApprovalIntake,
  now = new Date(),
): AffiliateProgram {
  const intake = BranchAffiliateApprovalIntakeSchema.parse(intakeInput);
  if (!Number.isFinite(now.getTime())) throw new Error('Current time must be valid');
  if (current.id !== 'branch' || current.merchantName !== 'Branch') throw new Error('Branch approval evidence cannot update another merchant');
  if (current.status !== 'applied' && current.status !== 'pending') {
    throw new Error('Branch program must be applied or pending before advertiser approval');
  }
  if (Date.parse(intake.networkRegistration.date) > now.getTime() || Date.parse(intake.advertiserApproval.date) > now.getTime() || Date.parse(intake.ownerAuthorization.authorizedAt) > now.getTime() || Date.parse(intake.reviewedAt) > now.getTime()) {
    throw new Error('Registration, advertiser approval, owner authorization, and intake review dates cannot be in the future');
  }
  if (intake.expiresAt && Date.parse(intake.expiresAt) <= now.getTime()) throw new Error('Expired approval evidence cannot activate a program');
  if (!intake.approvedMarkets.includes('US')) throw new Error('Branch approval must include the US market before enabling US offers');
  if (!intake.approvedDestinationHosts.every(isCanonicalHttpsHostname)) throw new Error('All approved destination hosts must be canonical HTTPS hostnames');
  if (!isOfficialUrl(intake.networkRegistration.sourceUrl, 'cj.com') || !isOfficialUrl(intake.advertiserApproval.sourceUrl, 'branchfurniture.com')) {
    throw new Error('Separate official CJ registration and Branch advertiser approval evidence are required');
  }

  return AffiliateProgramSchema.parse({
    ...current,
    programName: intake.programName,
    networkName: intake.networkRegistration.provider,
    networkRegistrationEvidence: {
      provider: intake.networkRegistration.provider,
      reference: intake.networkRegistration.reference,
      registeredAt: intake.networkRegistration.date,
      sourceUrl: intake.networkRegistration.sourceUrl,
    },
    programRestrictions: intake.restrictions,
    allowedRegions: intake.approvedMarkets,
    approvedDestinationDomains: intake.approvedDestinationHosts,
    approvalEvidence: {
      reference: intake.advertiserApproval.reference,
      reviewedAt: intake.reviewedAt,
      sourceUrl: intake.advertiserApproval.sourceUrl,
    },
    approvalDate: intake.advertiserApproval.date,
    trackingIdReference: intake.credentialReference,
    status: 'approved',
    expiresAt: intake.expiresAt,
    reviewNotes: `Owner-authorized intake reviewed by ${intake.ownerAuthorization.authorizedBy}. Store secrets outside the repository.`,
    lastReviewedAt: intake.reviewedAt,
  });
}
