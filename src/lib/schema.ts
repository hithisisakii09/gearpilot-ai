import { z } from 'zod';
export const ProductSchema = z.object({
  id: z.string().min(1), brand: z.string().min(1), model: z.string().min(1),
  category: z.enum(['standing_desk','ergonomic_chair','monitor_arm','docking_station']),
  market: z.literal('US'), isDemo: z.boolean(), electric: z.boolean().optional(),
  widthInches: z.number().positive().optional(), minHeightInches: z.number().positive().optional(),
  maxHeightInches: z.number().positive().optional(), liftCapacityKg: z.number().positive().optional(),
  warrantyYears: z.number().nonnegative().optional(),
  mechanicalScore: z.number().min(0).max(100), usabilityScore: z.number().min(0).max(100),
  featureScore: z.number().min(0).max(100), evidenceScore: z.number().min(0).max(100),
  evidence: z.array(z.object({claim: z.string(), url: z.url(), observedAt: z.string(), status: z.enum(['verified','unverified','disputed'])})).default([])
});
export const OfferSchema = z.object({
  id: z.string(), productId: z.string(), merchant: z.string(), market: z.literal('US'),
  currency: z.literal('USD'), itemPriceCents: z.number().int().nonnegative(),
  mandatoryShippingCents: z.number().int().nonnegative().nullable(), available: z.boolean(),
  lastVerifiedAt: z.string(), approvedDataUse: z.boolean(), affiliateUrl: z.url().optional()
});
export type Product = z.infer<typeof ProductSchema>;
export type Offer = z.infer<typeof OfferSchema>;
