import z from "zod";

export const basicInfoSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.string().min(1, "Condition is required"),
  partNumber: z.string().min(1, "Part number is required"),
  oem: z.string().min(1, "OEM is required"),
  material: z.string().optional(),
  warranty: z.string().optional(),
  quantity: z.string().min(1, "Quantity is required"),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
});

const modelCompatibilitySchema = z.object({
  id: z.string(),
  makeId: z.string().min(1, "Make is required"),
  makeName: z.string(),
  modelId: z.string().nullable(),
  modelName: z.string().min(1, "Model is required"),
  yearStart: z.string().optional(),
  yearEnd: z.string().optional(),
  engine: z.string().optional(),
  trim: z.string().optional(),
  isNewModel: z.boolean(),
});

export const vehicleDetailsSchema = z
  .object({
    brand: z.string().min(1, "Brand is required"),
    compatibleModels: z
      .array(modelCompatibilitySchema)
      .min(1, "At least one model is required"),
  })
  .refine(
    (data) => {
      // Validate year ranges for all compatibility entries
      return (
        data.compatibleModels?.every((compat) => {
          if (compat.yearStart && compat.yearEnd) {
            return parseInt(compat.yearStart) <= parseInt(compat.yearEnd);
          }
          return true;
        }) ?? true
      );
    },
    {
      message: "Year start must be before or equal to year end",
      path: ["compatibleModels"],
    },
  );

export const modelCompatibilityEntrySchema = z.object({
  makeId: z.string().min(1, "Make is required"),
  modelId: z.string().optional(),
  modelName: z.string().min(1, "Model is required"),
  yearStart: z.string().optional(),
  yearEnd: z.string().optional(),
  engine: z.string().optional(),
  trim: z.string().optional(),
});

export const pricingShippingSchema = z.object({
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  isNegotiable: z.boolean().optional(),
  partShippingId: z.string().min(1, "Shipping is required"),
});
