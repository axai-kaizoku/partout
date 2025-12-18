import z from "zod";

export const addressSchema = z.object({
  fullName: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().default("US"),
  phone: z.string(),
  isDefault: z.boolean().default(false),
});
