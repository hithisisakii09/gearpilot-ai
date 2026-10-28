import { z } from 'zod';

const TimestampSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Expected an ISO-8601-compatible timestamp',
});

export const MarketSchema = z.enum(['US']);
export const CategorySchema = z.enum(['standing_desk', 'ergonomic_chair', 'monitor_arm', 'docking_station']);
export const DataStatusSchema = z.enum(['demo', 'verified']);
export const AvailabilitySchema = z.enum(['in_stock', 'out_of_stock', 'discontinued', 'unknown']);
export const AffiliateProgramStatusSchema = z.enum(['approved', 'pending', 'not_participating', 'unavailable']);

export const ProductImageSchema = z.object({ url: z.url(), attribution: z.string().min(1) });

export const DeskSpecificationsSchema = z.object({
  electric: z.boolean(),
  desktopWidthInches: z.number().positive().optional(),
  desktopDepthInches: z.number().positive().optional(),
  minHeightInches: z.number().positive().optional(),
  maxHeightInches: z.number().positive().optional(),
  liftCapacityLbs: z.number().positive().optional(),
  warrantyYears: z.number().nonnegative().optional(),
}).superRefine((specifications, context) => {
  if (specifications.minHeightInches !== undefined && specifications.maxHeightInches !== undefined && specifications.minHeightInches >= specifications.maxHeightInches) {
    context.addIssue({ code: 'custom', message: 'Minimum desk height must be lower than maximum desk height' });
  }
});

export const ProductSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  brand: z.string().min(1),
  model: z.string().min(1),
  category: CategorySchema,
  market: MarketSchema,
  dataStatus: DataStatusSchema,
  specifications: DeskSpecificationsSchema.optional(),
  image: ProductImageSchema.optional(),
  pros: z.array(z.string().min(1)).default([]),
  cons: z.array(z.string().min(1)).default([]),
  comparisonAttributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  sourceUrls: z.array(z.url()).default([]),
  lastUpdatedAt: TimestampSchema,
}).superRefine((product, context) => {
  if (product.dataStatus === 'verified' && product.sourceUrls.length === 0) context.addIssue({ code: 'custom', path: ['sourceUrls'], message: 'Verified products require at least one source URL' });
  if (product.category === 'standing_desk' && !product.specifications) context.addIssue({ code: 'custom', path: ['specifications'], message: 'Standing desks require desk specifications' });
});

export const OfferSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/),
  productId: z.string().min(1),
  retailer: z.string().min(1),
  market: MarketSchema,
  dataStatus: DataStatusSchema,
  currency: z.literal('USD'),
  priceCents: z.number().int().nonnegative(),
  mandatoryShippingCents: z.number().int().nonnegative().nullable(),
  priceVerifiedAt: TimestampSchema,
  availability: AvailabilitySchema,
  affiliateProgramStatus: AffiliateProgramStatusSchema,
  affiliateUrl: z.url().optional(),
  sourceUrls: z.array(z.url()).default([]),
  lastUpdatedAt: TimestampSchema,
}).superRefine((offer, context) => {
  if (offer.affiliateProgramStatus === 'approved' && !offer.affiliateUrl) context.addIssue({ code: 'custom', path: ['affiliateUrl'], message: 'Approved affiliate offers require an approved affiliate URL' });
  if (offer.affiliateProgramStatus !== 'approved' && offer.affiliateUrl) context.addIssue({ code: 'custom', path: ['affiliateUrl'], message: 'Only approved affiliate offers may include an affiliate URL' });
  if (offer.dataStatus === 'verified' && offer.sourceUrls.length === 0) context.addIssue({ code: 'custom', path: ['sourceUrls'], message: 'Verified offers require at least one source URL' });
});

export const CatalogSchema = z.object({
  catalogStatus: DataStatusSchema,
  lastUpdatedAt: TimestampSchema,
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
