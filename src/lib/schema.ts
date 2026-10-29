import { z } from 'zod';

export const MAX_FUTURE_TIMESTAMP_MS = 36 * 60 * 60 * 1000;
export const TimestampSchema = z.iso.datetime().superRefine((value, context) => {
  if (Date.parse(value) > Date.now() + MAX_FUTURE_TIMESTAMP_MS) context.addIssue({ code: 'custom', message: 'Timestamp is too far in the future' });
});

export const MarketSchema = z.enum(['US']);
export const CategorySchema = z.enum(['standing_desk', 'ergonomic_chair', 'monitor_arm', 'docking_station']);
export const DataStatusSchema = z.enum(['verified', 'partially_verified', 'unverified', 'demo']);
export const AvailabilitySchema = z.enum(['in_stock', 'out_of_stock', 'preorder', 'discontinued', 'unknown']);
export const AffiliateProgramStatusSchema = z.enum(['approved', 'pending', 'not_participating', 'unavailable']);
export const AffiliateProgramLifecycleStatusSchema = z.enum(['not_applied', 'applied', 'pending', 'approved', 'rejected', 'suspended', 'expired']);
export const ImageUsagePermissionSchema = z.enum(['licensed', 'manufacturer_authorized', 'unknown', 'not_provided']);
export const SourceKindSchema = z.enum(['manufacturer_product_page', 'manufacturer_specification', 'authorized_merchant', 'manual']);
export const EvidenceQualitySchema = z.enum(['primary', 'authorized_secondary', 'unverified']);
export const EvidenceReviewStatusSchema = z.enum(['draft', 'pending_review', 'approved', 'rejected']);
export const ShippingStatusSchema = z.enum(['known', 'free', 'unknown']);

const HttpsUrlSchema = z.url().superRefine((value, context) => {
  try {
    if (new URL(value).protocol !== 'https:') context.addIssue({ code: 'custom', message: 'Evidence URLs must use HTTPS' });
  } catch {
    context.addIssue({ code: 'custom', message: 'Evidence URL is invalid' });
  }
});

export const ProductConfigurationSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  label: z.string().min(1).max(300),
  exactModel: z.string().min(1).max(200),
  sku: z.string().trim().min(1).max(100).nullable().default(null),
  desktopWidthInches: z.number().positive().nullable(),
  desktopDepthInches: z.number().positive().nullable(),
  selectedOptions: z.record(z.string(), z.string().min(1)).default({}),
});

const EvidenceReviewFields = {
  evidenceNotes: z.string().min(1).max(1000),
  evidenceQuality: EvidenceQualitySchema,
  reviewStatus: EvidenceReviewStatusSchema,
  reviewer: z.string().trim().min(1).max(120).nullable(),
  reviewedAt: TimestampSchema.nullable(),
  rejectionReason: z.string().trim().min(1).max(1000).nullable().default(null),
  sourceMetadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
};

function validateReviewFields(record: { evidenceQuality: z.infer<typeof EvidenceQualitySchema>; reviewStatus: z.infer<typeof EvidenceReviewStatusSchema>; reviewer: string | null; reviewedAt: string | null; rejectionReason: string | null }, context: z.RefinementCtx): void {
  const reviewed = record.reviewStatus === 'approved' || record.reviewStatus === 'rejected';
  if (reviewed && !record.reviewer) context.addIssue({ code: 'custom', path: ['reviewer'], message: 'Reviewed evidence requires a reviewer' });
  if (reviewed && !record.reviewedAt) context.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'Reviewed evidence requires a review timestamp' });
  if (!reviewed && (record.reviewer || record.reviewedAt || record.rejectionReason)) context.addIssue({ code: 'custom', message: 'Unreviewed evidence cannot include reviewer decision metadata' });
  if (record.reviewStatus === 'approved' && record.evidenceQuality === 'unverified') context.addIssue({ code: 'custom', path: ['evidenceQuality'], message: 'Unverified sources cannot be approved' });
  if (record.reviewStatus === 'approved' && record.rejectionReason) context.addIssue({ code: 'custom', path: ['rejectionReason'], message: 'Approved evidence cannot include a rejection reason' });
  if (record.reviewStatus === 'rejected' && !record.rejectionReason) context.addIssue({ code: 'custom', path: ['rejectionReason'], message: 'Rejected evidence requires a reason' });
}

export function isCanonicalHttpsHostname(value: string): boolean {
  if (value.length === 0 || value.length > 253 || value !== value.trim() || value !== value.toLowerCase()) return false;
  if (!value.includes('.') || value.startsWith('.') || value.endsWith('.') || value.includes('*')) return false;
  const labels = value.split('.');
  if (labels.some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) return false;
  if (labels.every((label) => /^\d+$/.test(label)) || /^\d+$/.test(labels.at(-1)!)) return false;
  try {
    const url = new URL(`https://${value}/`);
    return url.protocol === 'https:' && url.hostname === value && url.host === value && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

const DomainSchema = z.string().superRefine((value, context) => {
  if (!isCanonicalHttpsHostname(value)) context.addIssue({ code: 'custom', message: 'Destination domain must be a canonical HTTPS hostname' });
});
const CredentialReferenceSchema = z.string().regex(/^credential-ref:[a-z0-9][a-z0-9_./:-]*$/);

export const AffiliateApprovalEvidenceSchema = z.object({
  reference: z.string().regex(/^approval-ref:[a-z0-9][a-z0-9_./:-]*$/),
  reviewedAt: TimestampSchema,
  sourceUrl: HttpsUrlSchema.optional(),
  note: z.string().min(1).max(500).optional(),
});

export const AffiliateNetworkRegistrationEvidenceSchema = z.object({
  provider: z.string().min(1).max(100),
  reference: z.string().regex(/^approval-ref:[a-z0-9][a-z0-9_./:-]*$/),
  registeredAt: TimestampSchema,
  sourceUrl: HttpsUrlSchema,
});

export const AffiliateProgramSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  merchantName: z.string().min(1),
  officialWebsite: z.url(),
  applicationUrl: z.url().nullable(),
  programName: z.string().min(1).nullable(),
  networkName: z.string().min(1).nullable(),
  networkRegistrationEvidence: AffiliateNetworkRegistrationEvidenceSchema.nullable().default(null),
  programRestrictions: z.array(z.string().trim().min(1).max(500)).default([]),
  allowedRegions: z.array(MarketSchema).default([]),
  approvedDestinationDomains: z.array(DomainSchema).default([]),
  approvalEvidence: AffiliateApprovalEvidenceSchema.nullable(),
  approvalDate: TimestampSchema.nullable(),
  trackingIdReference: CredentialReferenceSchema.nullable(),
  status: AffiliateProgramLifecycleStatusSchema,
  expiresAt: z.iso.datetime({ offset: true }).nullable(),
  reviewNotes: z.string().min(1).nullable(),
  lastReviewedAt: TimestampSchema,
}).superRefine((program, context) => {
  const needsApprovalProof = program.status === 'approved';
  if (needsApprovalProof && !program.programName) context.addIssue({ code: 'custom', path: ['programName'], message: 'Approved programs require a program name' });
  if (needsApprovalProof && !program.approvalEvidence) context.addIssue({ code: 'custom', path: ['approvalEvidence'], message: 'Approved programs require approval evidence' });
  if (needsApprovalProof && !program.approvalEvidence?.sourceUrl) context.addIssue({ code: 'custom', path: ['approvalEvidence', 'sourceUrl'], message: 'Approved programs require an official approval source URL' });
  if (needsApprovalProof && !program.approvalDate) context.addIssue({ code: 'custom', path: ['approvalDate'], message: 'Approved programs require an approval date' });
  if (needsApprovalProof && !program.trackingIdReference) context.addIssue({ code: 'custom', path: ['trackingIdReference'], message: 'Approved programs require a credential reference' });
  if (needsApprovalProof && program.approvedDestinationDomains.length === 0) context.addIssue({ code: 'custom', path: ['approvedDestinationDomains'], message: 'Approved programs require at least one approved destination domain' });
  if (needsApprovalProof && program.allowedRegions.length === 0) context.addIssue({ code: 'custom', path: ['allowedRegions'], message: 'Approved programs require at least one approved market' });
  if (needsApprovalProof && program.programRestrictions.length === 0) context.addIssue({ code: 'custom', path: ['programRestrictions'], message: 'Approved programs require documented program restrictions' });
  if (needsApprovalProof && program.networkName?.trim().toLowerCase() === 'cj' && !program.networkRegistrationEvidence) {
    context.addIssue({ code: 'custom', path: ['networkRegistrationEvidence'], message: 'CJ programs require separate network registration evidence' });
  }
  if (needsApprovalProof && program.networkName?.trim().toLowerCase() === 'cj' && program.networkRegistrationEvidence) {
    const networkHost = new URL(program.networkRegistrationEvidence.sourceUrl).hostname;
    if (program.networkRegistrationEvidence.provider.trim().toLowerCase() !== 'cj' || (networkHost !== 'cj.com' && !networkHost.endsWith('.cj.com'))) {
      context.addIssue({ code: 'custom', path: ['networkRegistrationEvidence'], message: 'CJ registration evidence must identify CJ and use an official CJ host' });
    }
  }
  if (needsApprovalProof && program.id === 'branch' && program.approvalEvidence?.sourceUrl) {
    const approvalHost = new URL(program.approvalEvidence.sourceUrl).hostname;
    if (approvalHost !== 'branchfurniture.com' && !approvalHost.endsWith('.branchfurniture.com')) {
      context.addIssue({ code: 'custom', path: ['approvalEvidence', 'sourceUrl'], message: 'Branch approval evidence must use an official Branch host' });
    }
  }
  if (needsApprovalProof && program.approvalDate && program.approvalEvidence && Date.parse(program.approvalEvidence.reviewedAt) < Date.parse(program.approvalDate)) {
    context.addIssue({ code: 'custom', path: ['approvalEvidence', 'reviewedAt'], message: 'Approval evidence review cannot predate program approval' });
  }
  if (program.status !== 'approved' && program.approvedDestinationDomains.length > 0) context.addIssue({ code: 'custom', path: ['approvedDestinationDomains'], message: 'Only approved programs may have approved destination domains' });
  if (program.status === 'expired' && !program.expiresAt) context.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Expired programs require an expiry timestamp' });
});

export const AffiliateRegistrySchema = z.object({
  lastReviewedAt: TimestampSchema,
  programs: z.array(AffiliateProgramSchema),
}).superRefine((registry, context) => {
  const ids = new Set<string>();
  for (const [index, program] of registry.programs.entries()) {
    if (ids.has(program.id)) context.addIssue({ code: 'custom', path: ['programs', index, 'id'], message: 'Affiliate program IDs must be unique' });
    ids.add(program.id);
  }
});

export const SourceSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  publisher: z.string().min(1),
  url: z.url(),
  kind: SourceKindSchema,
  observedAt: TimestampSchema,
  notes: z.string().min(1).optional(),
});

export const SpecificationReferenceSchema = z.object({
  sourceId: z.string().min(1),
  verifiedAt: TimestampSchema,
  status: DataStatusSchema,
  note: z.string().min(1).optional(),
});

export const ProductEditorialApprovalSchema = z.object({
  collector: z.string().trim().min(1).max(120),
  reviewer: z.string().trim().min(1).max(120),
  reviewedAt: TimestampSchema,
  sourceIds: z.array(z.string().min(1)).min(1),
}).superRefine((approval, context) => {
  if (approval.collector.toLowerCase() === approval.reviewer.toLowerCase()) {
    context.addIssue({ code: 'custom', path: ['reviewer'], message: 'Product reviewer must be independent from the evidence collector' });
  }
});

export const ProductImageSchema = z.object({
  url: z.url(),
  attribution: z.string().min(1),
  usagePermissionStatus: ImageUsagePermissionSchema,
  sourceId: z.string().min(1),
});

export const DeskSpecificationsSchema = z.object({
  electric: z.boolean().optional(),
  desktopWidthInches: z.number().positive().optional(),
  desktopDepthInches: z.number().positive().optional(),
  minHeightInches: z.number().positive().optional(),
  maxHeightInches: z.number().positive().optional(),
  liftCapacityLbs: z.number().positive().optional(),
  warrantyYears: z.number().nonnegative().optional(),
  materials: z.array(z.string().min(1)).optional(),
  dimensionsNote: z.string().min(1).optional(),
}).superRefine((specifications, context) => {
  if (specifications.minHeightInches !== undefined && specifications.maxHeightInches !== undefined && specifications.minHeightInches >= specifications.maxHeightInches) {
    context.addIssue({ code: 'custom', message: 'Minimum desk height must be lower than maximum desk height' });
  }
});

const documentedSpecificationKeys = ['electric', 'desktopWidthInches', 'desktopDepthInches', 'minHeightInches', 'maxHeightInches', 'liftCapacityLbs', 'warrantyYears', 'materials', 'dimensionsNote'] as const;

export const ProductSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  brand: z.string().min(1),
  manufacturer: z.string().min(1),
  model: z.string().min(1),
  category: CategorySchema,
  market: MarketSchema,
  dataStatus: DataStatusSchema,
  officialManufacturerUrl: z.url().nullable(),
  configuration: ProductConfigurationSchema.nullable().default(null),
  specifications: DeskSpecificationsSchema.optional(),
  specificationReferences: z.record(z.string(), SpecificationReferenceSchema).default({}),
  image: ProductImageSchema.optional(),
  pros: z.array(z.string().min(1)).default([]),
  cons: z.array(z.string().min(1)).default([]),
  comparisonAttributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  shippingInformation: z.string().min(1).nullable().default(null),
  sourceUrls: z.array(z.url()).default([]),
  sources: z.array(SourceSchema).default([]),
  editorialApproval: ProductEditorialApprovalSchema.nullable().default(null),
  reviewNotes: z.string().min(1).nullable().default(null),
  lastUpdatedAt: TimestampSchema,
}).superRefine((product, context) => {
  const sourceIds = new Set(product.sources.map((source) => source.id));
  const declaredSourceUrls = new Set(product.sources.map((source) => source.url));
  product.sourceUrls.forEach((url, index) => {
    if (!declaredSourceUrls.has(url)) context.addIssue({ code: 'custom', path: ['sourceUrls', index], message: 'Source URL must be represented in sources' });
  });
  Object.entries(product.specificationReferences).forEach(([key, reference]) => {
    if (!sourceIds.has(reference.sourceId)) context.addIssue({ code: 'custom', path: ['specificationReferences', key, 'sourceId'], message: 'Specification reference must point to a product source' });
  });
  if (product.image && !sourceIds.has(product.image.sourceId)) context.addIssue({ code: 'custom', path: ['image', 'sourceId'], message: 'Image source must point to a product source' });
  product.editorialApproval?.sourceIds.forEach((sourceId, index) => {
    if (!sourceIds.has(sourceId)) context.addIssue({ code: 'custom', path: ['editorialApproval', 'sourceIds', index], message: 'Product approval must reference a product source' });
  });
  if (product.editorialApproval) {
    if (new Set(product.editorialApproval.sourceIds).size !== product.editorialApproval.sourceIds.length) {
      context.addIssue({ code: 'custom', path: ['editorialApproval', 'sourceIds'], message: 'Product approval source IDs must be unique' });
    }
    const latestEvidenceAt = Math.max(...product.editorialApproval.sourceIds.map((sourceId) => {
      const source = product.sources.find((candidate) => candidate.id === sourceId);
      return source ? Date.parse(source.observedAt) : Number.NEGATIVE_INFINITY;
    }));
    if (Date.parse(product.editorialApproval.reviewedAt) < latestEvidenceAt) {
      context.addIssue({ code: 'custom', path: ['editorialApproval', 'reviewedAt'], message: 'Product approval cannot predate its cited evidence' });
    }
  }
  if (product.dataStatus === 'verified') {
    if (!product.officialManufacturerUrl) context.addIssue({ code: 'custom', path: ['officialManufacturerUrl'], message: 'Verified products require an official manufacturer URL' });
    if (!product.configuration) context.addIssue({ code: 'custom', path: ['configuration'], message: 'Verified products require an exact product configuration' });
    else {
      if (product.configuration.exactModel.trim() !== product.model.trim()) context.addIssue({ code: 'custom', path: ['configuration', 'exactModel'], message: 'Verified product configuration must match the product model' });
      if (Object.keys(product.configuration.selectedOptions).length === 0) context.addIssue({ code: 'custom', path: ['configuration', 'selectedOptions'], message: 'Verified product configuration requires selected options' });
      if (product.configuration.desktopWidthInches !== null && product.specifications?.desktopWidthInches !== undefined && product.configuration.desktopWidthInches !== product.specifications.desktopWidthInches) {
        context.addIssue({ code: 'custom', path: ['configuration', 'desktopWidthInches'], message: 'Configuration width must match the verified desktop specification' });
      }
      if (product.configuration.desktopDepthInches !== null && product.specifications?.desktopDepthInches !== undefined && product.configuration.desktopDepthInches !== product.specifications.desktopDepthInches) {
        context.addIssue({ code: 'custom', path: ['configuration', 'desktopDepthInches'], message: 'Configuration depth must match the verified desktop specification' });
      }
    }
    if (product.sources.length === 0) context.addIssue({ code: 'custom', path: ['sources'], message: 'Verified products require at least one source' });
    if (!product.specificationReferences.identity) context.addIssue({ code: 'custom', path: ['specificationReferences', 'identity'], message: 'Verified products require identity provenance' });
    else if (product.specificationReferences.identity.status !== 'verified') context.addIssue({ code: 'custom', path: ['specificationReferences', 'identity', 'status'], message: 'Verified products require independently verified identity evidence' });
    if (!product.editorialApproval) context.addIssue({ code: 'custom', path: ['editorialApproval'], message: 'Verified products require independent editorial approval' });
    documentedSpecificationKeys.forEach((key) => {
      const value = product.specifications?.[key];
      if (value !== undefined && !product.specificationReferences[key]) context.addIssue({ code: 'custom', path: ['specificationReferences', key], message: `Documented ${key} requires a specification reference` });
      else if (value !== undefined && product.specificationReferences[key]?.status !== 'verified') context.addIssue({ code: 'custom', path: ['specificationReferences', key, 'status'], message: `Verified products require independently verified ${key} evidence` });
    });
  }
});

function validateIndependentReview(record: {
  collectedBy: string | null;
  reviewStatus: z.infer<typeof EvidenceReviewStatusSchema>;
  reviewer: string | null;
  reviewedAt: string | null;
  observedAt: string;
}, context: z.RefinementCtx): void {
  const reviewed = record.reviewStatus === 'approved' || record.reviewStatus === 'rejected';
  if (reviewed && !record.collectedBy) context.addIssue({ code: 'custom', path: ['collectedBy'], message: 'Reviewed evidence requires a named collector' });
  if (reviewed && record.collectedBy?.toLowerCase() === record.reviewer?.trim().toLowerCase()) {
    context.addIssue({ code: 'custom', path: ['reviewer'], message: 'The reviewer must be independent from the evidence collector' });
  }
  if (record.reviewedAt && Date.parse(record.reviewedAt) < Date.parse(record.observedAt)) {
    context.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'Review cannot predate the evidence' });
  }
}

export const PriceObservationSchema = z.object({
  configurationId: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  priceCents: z.number().int().nonnegative(),
  currency: z.literal('USD'),
  seller: z.string().min(1),
  sourceUrl: HttpsUrlSchema,
  observedAt: TimestampSchema,
  collectedBy: z.string().trim().min(1).max(120).nullable().default(null),
  mandatoryShippingCents: z.number().int().nonnegative().nullable(),
  shippingStatus: ShippingStatusSchema,
  ...EvidenceReviewFields,
}).superRefine((observation, context) => {
  validateReviewFields(observation, context);
  validateIndependentReview(observation, context);
  if (observation.shippingStatus === 'unknown' && observation.mandatoryShippingCents !== null) context.addIssue({ code: 'custom', path: ['mandatoryShippingCents'], message: 'Unknown shipping must remain null' });
  if (observation.shippingStatus === 'free' && observation.mandatoryShippingCents !== 0) context.addIssue({ code: 'custom', path: ['mandatoryShippingCents'], message: 'Free shipping must be recorded as zero cents' });
  if (observation.shippingStatus === 'known' && observation.mandatoryShippingCents === null) context.addIssue({ code: 'custom', path: ['mandatoryShippingCents'], message: 'Known shipping requires an amount' });
});

export const AvailabilityObservationSchema = z.object({
  configurationId: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  availability: AvailabilitySchema,
  sourceUrl: HttpsUrlSchema,
  observedAt: TimestampSchema,
  collectedBy: z.string().trim().min(1).max(120).nullable().default(null),
  ...EvidenceReviewFields,
}).superRefine((observation, context) => {
  validateReviewFields(observation, context);
  validateIndependentReview(observation, context);
});

export const PolicyEvidenceSchema = z.object({
  configurationId: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  sourceUrl: HttpsUrlSchema,
  observedAt: TimestampSchema,
  collectedBy: z.string().trim().min(1).max(120).nullable().default(null),
  ...EvidenceReviewFields,
}).superRefine((evidence, context) => {
  validateReviewFields(evidence, context);
  validateIndependentReview(evidence, context);
});

export const CommercialObservationSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  productId: z.string().min(1),
  offerId: z.string().min(1),
  manufacturer: z.string().min(1),
  merchant: z.string().min(1),
  collectedBy: z.string().trim().min(1).max(120).nullable().default(null),
  configuration: ProductConfigurationSchema,
  currency: z.literal('USD'),
  priceCents: z.number().int().nonnegative().nullable(),
  mandatoryShippingCents: z.number().int().nonnegative().nullable(),
  shippingStatus: ShippingStatusSchema,
  availability: AvailabilitySchema,
  productUrl: HttpsUrlSchema,
  sourceUrl: HttpsUrlSchema,
  observedAt: TimestampSchema,
  ...EvidenceReviewFields,
}).superRefine((observation, context) => {
  validateReviewFields(observation, context);
  const reviewed = observation.reviewStatus === 'approved' || observation.reviewStatus === 'rejected';
  if (reviewed && !observation.collectedBy) context.addIssue({ code: 'custom', path: ['collectedBy'], message: 'A named collector is required to establish independent review' });
  if (reviewed && observation.collectedBy?.toLowerCase() === observation.reviewer?.trim().toLowerCase()) {
    context.addIssue({ code: 'custom', path: ['reviewer'], message: 'The reviewer must be different from the evidence collector' });
  }
  if (observation.shippingStatus === 'unknown' && observation.mandatoryShippingCents !== null) context.addIssue({ code: 'custom', path: ['mandatoryShippingCents'], message: 'Unknown shipping must remain null' });
  if (observation.shippingStatus === 'free' && observation.mandatoryShippingCents !== 0) context.addIssue({ code: 'custom', path: ['mandatoryShippingCents'], message: 'Free shipping must be recorded as zero cents' });
  if (observation.shippingStatus === 'known' && observation.mandatoryShippingCents === null) context.addIssue({ code: 'custom', path: ['mandatoryShippingCents'], message: 'Known shipping requires an amount' });
});

export const EditorialReviewDecisionSchema = z.enum(['approved', 'rejected']);

export const EditorialReviewEventSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  observationId: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  collector: z.string().trim().min(1).max(120),
  decision: EditorialReviewDecisionSchema,
  reviewer: z.string().trim().min(1).max(120),
  reviewedAt: TimestampSchema,
  sourceUrl: HttpsUrlSchema,
  evidenceObservedAt: TimestampSchema,
  rejectionReason: z.string().trim().min(1).max(1000).nullable().default(null),
}).superRefine((event, context) => {
  if (Date.parse(event.reviewedAt) < Date.parse(event.evidenceObservedAt)) context.addIssue({ code: 'custom', path: ['reviewedAt'], message: 'Review cannot predate the evidence' });
  if (event.collector.toLowerCase() === event.reviewer.toLowerCase()) context.addIssue({ code: 'custom', path: ['reviewer'], message: 'The reviewer must be different from the evidence collector' });
  if (event.decision === 'approved' && event.rejectionReason) context.addIssue({ code: 'custom', path: ['rejectionReason'], message: 'Approved review events cannot include a rejection reason' });
  if (event.decision === 'rejected' && !event.rejectionReason) context.addIssue({ code: 'custom', path: ['rejectionReason'], message: 'Rejected review events require a reason' });
});

export const CandidateVerificationAssessmentSchema = z.object({
  productId: z.string().min(1),
  manufacturer: z.string().min(1),
  exactConfiguration: ProductConfigurationSchema.nullable(),
  productUrl: HttpsUrlSchema,
  sourceUrls: z.array(HttpsUrlSchema).min(1),
  assessedAt: TimestampSchema,
  priceStatus: z.enum(['observed', 'missing', 'ambiguous']),
  shippingStatus: ShippingStatusSchema,
  availability: AvailabilitySchema,
  missingEvidence: z.array(z.enum(['exact_configuration', 'price', 'mandatory_shipping', 'availability', 'human_review'])),
  notes: z.string().min(1).max(1500),
});

export const ObservationCollectionSchema = z.object({
  lastUpdatedAt: TimestampSchema,
  observations: z.array(CommercialObservationSchema),
  candidateAssessments: z.array(CandidateVerificationAssessmentSchema),
  reviewEvents: z.array(EditorialReviewEventSchema).default([]),
}).superRefine((collection, context) => {
  const observationIds = new Set<string>();
  const observationById = new Map<string, z.infer<typeof CommercialObservationSchema>>();
  collection.observations.forEach((observation, index) => {
    if (observationIds.has(observation.id)) context.addIssue({ code: 'custom', path: ['observations', index, 'id'], message: 'Observation IDs must be unique' });
    observationIds.add(observation.id);
    observationById.set(observation.id, observation);
  });
  const eventIds = new Set<string>();
  const eventObservationIds = new Set<string>();
  collection.reviewEvents.forEach((event, index) => {
    if (eventIds.has(event.id)) context.addIssue({ code: 'custom', path: ['reviewEvents', index, 'id'], message: 'Review event IDs must be unique' });
    eventIds.add(event.id);
    if (eventObservationIds.has(event.observationId)) context.addIssue({ code: 'custom', path: ['reviewEvents', index, 'observationId'], message: 'Each observation may have only one terminal editorial decision' });
    eventObservationIds.add(event.observationId);
    const observation = observationById.get(event.observationId);
    if (!observation) {
      context.addIssue({ code: 'custom', path: ['reviewEvents', index, 'observationId'], message: 'Review event must reference an observation' });
      return;
    }
    if (observation.reviewStatus !== event.decision || observation.collectedBy !== event.collector || observation.reviewer !== event.reviewer || observation.reviewedAt !== event.reviewedAt || observation.rejectionReason !== event.rejectionReason || observation.sourceUrl !== event.sourceUrl || observation.observedAt !== event.evidenceObservedAt) {
      context.addIssue({ code: 'custom', path: ['reviewEvents', index], message: 'Review event must match the observation decision and evidence provenance' });
    }
  });
  collection.observations.forEach((observation, index) => {
    if ((observation.reviewStatus === 'approved' || observation.reviewStatus === 'rejected') && !eventObservationIds.has(observation.id)) {
      context.addIssue({ code: 'custom', path: ['observations', index, 'reviewStatus'], message: 'Terminal editorial decisions require an audit event' });
    }
  });
  const assessedProducts = new Set<string>();
  collection.candidateAssessments.forEach((assessment, index) => {
    if (assessedProducts.has(assessment.productId)) context.addIssue({ code: 'custom', path: ['candidateAssessments', index, 'productId'], message: 'Candidate assessments must be unique by product' });
    assessedProducts.add(assessment.productId);
  });
});

export const OfferSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  productId: z.string().min(1),
  retailer: z.string().min(1),
  configurationId: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/).optional(),
  market: MarketSchema,
  dataStatus: DataStatusSchema,
  currency: z.literal('USD'),
  priceCents: z.number().int().nonnegative().nullable(),
  mandatoryShippingCents: z.number().int().nonnegative().nullable(),
  priceVerifiedAt: TimestampSchema.nullable(),
  priceObservations: z.array(PriceObservationSchema).default([]),
  availability: AvailabilitySchema,
  availabilityObservedAt: TimestampSchema.nullable().default(null),
  availabilityObservations: z.array(AvailabilityObservationSchema).default([]),
  warrantyEvidence: PolicyEvidenceSchema.nullable().default(null),
  returnPolicyEvidence: PolicyEvidenceSchema.nullable().default(null),
  affiliateProgramStatus: AffiliateProgramStatusSchema,
  affiliateProgramId: z.string().min(1).optional(),
  affiliateUrl: z.url().optional(),
  sourceUrls: z.array(z.url()).default([]),
  reviewNotes: z.string().min(1).nullable().default(null),
  lastUpdatedAt: TimestampSchema,
}).superRefine((offer, context) => {
  if (offer.affiliateProgramStatus === 'approved' && !offer.affiliateUrl) context.addIssue({ code: 'custom', path: ['affiliateUrl'], message: 'Approved affiliate offers require an approved affiliate URL' });
  if (offer.affiliateProgramStatus === 'approved' && !offer.affiliateProgramId) context.addIssue({ code: 'custom', path: ['affiliateProgramId'], message: 'Approved affiliate offers require an affiliate program ID' });
  if (offer.affiliateProgramStatus !== 'approved' && offer.affiliateUrl) context.addIssue({ code: 'custom', path: ['affiliateUrl'], message: 'Only approved affiliate offers may include an affiliate URL' });
  if (offer.priceCents !== null && !offer.priceVerifiedAt) context.addIssue({ code: 'custom', path: ['priceVerifiedAt'], message: 'Known prices require an observation timestamp' });
  if (offer.priceCents !== null && offer.priceObservations.length === 0 && offer.dataStatus !== 'demo') context.addIssue({ code: 'custom', path: ['priceObservations'], message: 'Non-demo prices require a sourced price observation' });
  if (offer.availability !== 'unknown' && !offer.availabilityObservedAt && offer.dataStatus !== 'demo') context.addIssue({ code: 'custom', path: ['availabilityObservedAt'], message: 'Known availability requires an observation timestamp' });
  if (offer.dataStatus === 'verified' && offer.sourceUrls.length === 0 && offer.priceObservations.length === 0 && offer.availabilityObservations.length === 0) context.addIssue({ code: 'custom', message: 'Verified offers require source evidence' });
  if (offer.dataStatus === 'verified' && !offer.configurationId) context.addIssue({ code: 'custom', path: ['configurationId'], message: 'Verified offers require an exact configuration ID' });
  if (offer.dataStatus === 'verified') {
    for (const [field, evidence] of [['warrantyEvidence', offer.warrantyEvidence], ['returnPolicyEvidence', offer.returnPolicyEvidence]] as const) {
      if (!evidence) context.addIssue({ code: 'custom', path: [field], message: `Verified offers require reviewed ${field === 'warrantyEvidence' ? 'warranty' : 'return-policy'} evidence` });
      else {
        if (evidence.configurationId !== offer.configurationId) context.addIssue({ code: 'custom', path: [field, 'configurationId'], message: 'Policy evidence must match the exact offer configuration' });
        if (evidence.reviewStatus !== 'approved') context.addIssue({ code: 'custom', path: [field, 'reviewStatus'], message: 'Verified offers require independently approved policy evidence' });
      }
    }
  }
});

export const CatalogSchema = z.object({
  catalogStatus: DataStatusSchema,
  lastUpdatedAt: TimestampSchema,
  reviewNotes: z.string().min(1).nullable().default(null),
  products: z.array(ProductSchema),
  offers: z.array(OfferSchema),
}).superRefine((catalog, context) => {
  const productIds = new Set<string>();
  for (const [index, product] of catalog.products.entries()) {
    if (productIds.has(product.id)) context.addIssue({ code: 'custom', path: ['products', index, 'id'], message: 'Product IDs must be unique' });
    productIds.add(product.id);
  }
  const offerIds = new Set<string>();
  for (const [index, offer] of catalog.offers.entries()) {
    if (offerIds.has(offer.id)) context.addIssue({ code: 'custom', path: ['offers', index, 'id'], message: 'Offer IDs must be unique' });
    offerIds.add(offer.id);
    if (!productIds.has(offer.productId)) context.addIssue({ code: 'custom', path: ['offers', index, 'productId'], message: 'Offer must reference a catalog product' });
  }
});

export type Product = z.infer<typeof ProductSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type AffiliateProgram = z.infer<typeof AffiliateProgramSchema>;
export type AffiliateRegistry = z.infer<typeof AffiliateRegistrySchema>;
export type CommercialObservation = z.infer<typeof CommercialObservationSchema>;
export type EditorialReviewEvent = z.infer<typeof EditorialReviewEventSchema>;
export type EditorialReviewDecision = z.infer<typeof EditorialReviewDecisionSchema>;
export type ObservationCollection = z.infer<typeof ObservationCollectionSchema>;
export type CandidateVerificationAssessment = z.infer<typeof CandidateVerificationAssessmentSchema>;
