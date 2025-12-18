import z from "zod";

export const shippingProfilesSchema = z.object({
  name: z.string().min(1, "Name is required"),
  baseCost: z.string().min(0, "Base cost must be non-negative"),
  freeShippingThreshold: z
    .string()
    .min(0, "Free shipping threshold must be non-negative")
    .optional(),
  estimatedDaysMin: z
    .string()
    .min(0, "Estimated days min must be non-negative")
    .optional(),
  estimatedDaysMax: z
    .string()
    .min(0, "Estimated days max must be non-negative")
    .optional(),
  carrier: z.string().min(1, "Carrier is required"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
