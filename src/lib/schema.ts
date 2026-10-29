import { z } from 'zod';

export const MAX_FUTURE_TIMESTAMP_MS = 36 * 60 * 60 * 1000;
const TimestampSchema = z.iso.datetime({ offset: true }).superRefine((value, context) => {
  if (Date.parse(value) > Date.now() + MAX_FUTURE_TIMESTAMP_MS) context.addIssue({ code: 'custom', message: 'Timestamp is too far in the future' });
});

export const MarketSchema = z.enum(['US']);
export const CategorySchema = z.enum(['standing_desk', 'ergonomic_chair', 'monitor_arm', 'docking_station']);
export const DataStatusSchema = z.enum(['verified', 'partially_verified', 'unverified', 'demo']);
export const AvailabilitySchema = z.enum(['in_stock', 'out_of_stock', 'discontinued', 'unknown']);
export const AffiliateProgramStatusSchema = z.enum(['approved', 'pending', 'not_participating', 'unavailable']);
export const AffiliateProgramLifecycleStatusSchema = z.enum(['not_applied', 'applied', 'pending', 'approved', 'rejected', 'suspended', 'expired']);
export const ImageUsagePermissionSchema = z.enum(['licensed', 'manufacturer_authorized', 'unknown', 'not_provided']);
export const SourceKindSchema = z.enum(['manufacturer_product_page', 'manufacturer_specification', 'authorized_merchant', 'manual']);

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
  reference: z.string().min(1).max(200),
  reviewedAt: TimestampSchema,
  sourceUrl: z.url().optional(),
  note: z.string().min(1).max(500).optional(),
});

export const AffiliateProgramSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  merchantName: z.string().min(1),
  officialWebsite: z.url(),
  applicationUrl: z.url().nullable(),
  programName: z.string().min(1).nullable(),
  networkName: z.string().min(1).nullable(),
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
  if (needsApprovalProof && !program.approvalDate) context.addIssue({ code: 'custom', path: ['approvalDate'], message: 'Approved programs require an approval date' });
  if (needsApprovalProof && !program.trackingIdReference) context.addIssue({ code: 'custom', path: ['trackingIdReference'], message: 'Approved programs require a credential reference' });
  if (needsApprovalProof && program.approvedDestinationDomains.length === 0) context.addIssue({ code: 'custom', path: ['approvedDestinationDomains'], message: 'Approved programs require at least one approved destination domain' });
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
  specifications: DeskSpecificationsSchema.optional(),
  specificationReferences: z.record(z.string(), SpecificationReferenceSchema).default({}),
  image: ProductImageSchema.optional(),
  pros: z.array(z.string().min(1)).default([]),
  cons: z.array(z.string().min(1)).default([]),
  comparisonAttributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  shippingInformation: z.string().min(1).nullable().default(null),
  sourceUrls: z.array(z.url()).default([]),
  sources: z.array(SourceSchema).default([]),
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
  if (product.dataStatus === 'verified') {
    if (!product.officialManufacturerUrl) context.addIssue({ code: 'custom', path: ['officialManufacturerUrl'], message: 'Verified products require an official manufacturer URL' });
    if (product.sources.length === 0) context.addIssue({ code: 'custom', path: ['sources'], message: 'Verified products require at least one source' });
    if (!product.specificationReferences.identity) context.addIssue({ code: 'custom', path: ['specificationReferences', 'identity'], message: 'Verified products require identity provenance' });
    documentedSpecificationKeys.forEach((key) => {
      const value = product.specifications?.[key];
      if (value !== undefined && !product.specificationReferences[key]) context.addIssue({ code: 'custom', path: ['specificationReferences', key], message: `Documented ${key} requires a specification reference` });
    });
  }
});

export const PriceObservationSchema = z.object({
  priceCents: z.number().int().nonnegative(),
  currency: z.literal('USD'),
  seller: z.string().min(1),
  sourceUrl: z.url(),
  observedAt: TimestampSchema,
  mandatoryShippingCents: z.number().int().nonnegative().nullable(),
});

export const AvailabilityObservationSchema = z.object({
  availability: AvailabilitySchema,
  sourceUrl: z.url(),
  observedAt: TimestampSchema,
});

export const OfferSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  productId: z.string().min(1),
  retailer: z.string().min(1),
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
