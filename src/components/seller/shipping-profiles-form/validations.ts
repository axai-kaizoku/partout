import z from 'zod'

export const shippingProfilesSchema = z.object({
  sellerId: z.string().min(1, "Seller ID is required"),
  name: z.string().min(1, "Name is required"),
  baseCost: z.number().min(0, "Base cost must be non-negative"),
  freeShippingThreshold: z.number().min(0, "Free shipping threshold must be non-negative"),
  estimatedDaysMin: z.number().min(0, "Estimated days min must be non-negative"),
  estimatedDaysMax: z.number().min(0, "Estimated days max must be non-negative"),
  carrier: z.string().min(1, "Carrier is required"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
})
