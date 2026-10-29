import { z } from 'zod';
import { isSpecificationReviewDue } from './eligibility.ts';
import { ProductSchema, TimestampSchema, type Product } from './schema.ts';

export const ProductPublicationAuthorizationSchema = z.object({
  authorized: z.literal(true),
  productId: z.string().min(1),
  authorizedBy: z.string().trim().min(1).max(120),
  authorizedAt: TimestampSchema,
});

export type ProductPublicationAuthorization = z.infer<typeof ProductPublicationAuthorizationSchema>;

export type PublicProductProfile = {
  id: string;
  brand: string;
  manufacturer: string;
  model: string;
  market: 'US';
  configuration: NonNullable<Product['configuration']>;
  specifications: Array<{
    label: string;
    value: string;
    verifiedAt: string;
    sourceUrl: string;
  }>;
  warranty: string;
  returns: 'UNKNOWN — no approved product-level return evidence';
  sources: Array<{ url: string; observedAt: string }>;
  editorialReview: { reviewer: string; reviewedAt: string };
};

const specificationLabels: Record<string, string> = {
  electric: 'Adjustment',
  desktopWidthInches: 'Desktop width',
  desktopDepthInches: 'Desktop depth',
  minHeightInches: 'Minimum height',
  maxHeightInches: 'Maximum height',
  liftCapacityLbs: 'Lift capacity',
  warrantyYears: 'Manufacturer-stated warranty duration',
  materials: 'Materials',
  dimensionsNote: 'Dimensions note',
};

function specificationValue(value: unknown, key: string): string {
  if (typeof value === 'boolean') return value ? 'Electric' : 'Non-electric';
  if (typeof value === 'number') {
    const unit = key.endsWith('Inches') ? ' in' : key === 'liftCapacityLbs' ? ' lb' : key === 'warrantyYears' ? ' years' : '';
    return `${value}${unit}`;
  }
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

export function buildPublicProductProfile(
  productInput: Product,
  authorizationInput: unknown,
  now = new Date(),
): PublicProductProfile | null {
  const parsedProduct = ProductSchema.safeParse(productInput);
  const parsedAuthorization = ProductPublicationAuthorizationSchema.safeParse(authorizationInput);
  if (!parsedProduct.success || !parsedAuthorization.success || !Number.isFinite(now.getTime())) return null;

  const product = parsedProduct.data;
  const authorization = parsedAuthorization.data;
  const approval = product.editorialApproval;
  if (product.dataStatus !== 'verified' || !product.configuration || !product.officialManufacturerUrl || !approval) return null;
  if (authorization.productId !== product.id
    || Date.parse(authorization.authorizedAt) > now.getTime()
    || Date.parse(authorization.authorizedAt) < Date.parse(approval.reviewedAt)
    || Date.parse(approval.reviewedAt) > now.getTime()
    || approval.collector.trim().toLowerCase() === approval.reviewer.trim().toLowerCase()
    || isSpecificationReviewDue(product, now)) return null;

  const sourceById = new Map(product.sources.map((source) => [source.id, source]));
  const citedSourceIds = new Set(approval.sourceIds);
  const specificationRows = Object.entries(product.specifications ?? {}).flatMap(([key, value]) => {
    const reference = product.specificationReferences[key];
    const source = reference ? sourceById.get(reference.sourceId) : undefined;
    if (value === undefined || reference?.status !== 'verified' || !source || !citedSourceIds.has(source.id)
      || (source.kind !== 'manufacturer_product_page' && source.kind !== 'manufacturer_specification')
      || new URL(source.url).protocol !== 'https:') return [];
    return [{
      label: specificationLabels[key] ?? key,
      value: specificationValue(value, key),
      verifiedAt: reference.verifiedAt,
      sourceUrl: source.url,
    }];
  });
  const identityReference = product.specificationReferences.identity;
  const identitySource = identityReference ? sourceById.get(identityReference.sourceId) : undefined;
  const officialSource = product.sources.find((source) => source.url === product.officialManufacturerUrl
    && (source.kind === 'manufacturer_product_page' || source.kind === 'manufacturer_specification')
    && new URL(source.url).protocol === 'https:');
  if (identityReference?.status !== 'verified' || !identitySource
    || (identitySource.kind !== 'manufacturer_product_page' && identitySource.kind !== 'manufacturer_specification')
    || new URL(identitySource.url).protocol !== 'https:'
    || !citedSourceIds.has(identitySource.id)
    || !officialSource
    || !citedSourceIds.has(officialSource.id)
    || specificationRows.length === 0) return null;

  const citedSources = approval.sourceIds
    .map((sourceId) => sourceById.get(sourceId))
    .filter((source): source is NonNullable<typeof source> => source !== undefined);

  return {
    id: product.id,
    brand: product.brand,
    manufacturer: product.manufacturer,
    model: product.model,
    market: product.market,
    configuration: product.configuration,
    specifications: specificationRows,
    warranty: product.specifications?.warrantyYears !== undefined
      ? `${product.specifications.warrantyYears} years stated in manufacturer specifications; coverage details and order-specific applicability are UNKNOWN.`
      : 'UNKNOWN — no verified manufacturer warranty duration',
    returns: 'UNKNOWN — no approved product-level return evidence',
    sources: citedSources.map((source) => ({ url: source.url, observedAt: source.observedAt })),
    editorialReview: { reviewer: approval.reviewer, reviewedAt: approval.reviewedAt },
  };
}
