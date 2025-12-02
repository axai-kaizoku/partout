import z from "zod"

export const basicInfoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  partNumber: z.string().min(1, "Part number is required"),
  oem: z.string().min(1, "OEM is required"),
  material: z.string().optional(),
  warranty: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
})


export const vehicleDetailsSchema = z.object({
  makeId: z.string().optional(),
  modelId: z.string().optional(),
  yearStart: z.string().optional(),
  yearEnd: z.string().optional(),
  engine: z.string().optional(),
  trim: z.string().optional(),
  brand: z.string().optional(),
})

export const pricingShippingSchema = z.object({
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  isNegotiable: z.boolean().optional(),
  shippingCost: z.string().optional(),
  freeShippingThreshold: z.string().optional(),
  estimatedDaysMin: z.string().optional(),
  estimatedDaysMax: z.string().optional(),
  carrier: z.string().optional(),
})
