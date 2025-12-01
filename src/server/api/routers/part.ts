import { z } from "zod";
import { basicInfoSchema, pricingShippingSchema, vehicleDetailsSchema } from "@/components/seller/new-listing-form/validations";
import { db } from "@/server/db";
import { parts } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

export const partRouter = createTRPCRouter({
  // Queries
  getHomePageParts: publicProcedure.query(async () => {
    return await db.query.parts.findMany();
  }),

  // Mutations
  createPart: privateProcedure
    .input(
      z.object({
        ...basicInfoSchema.shape,
        ...vehicleDetailsSchema.shape,
        ...pricingShippingSchema.shape,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newPart] = await db.insert(parts).values({
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        condition: input.condition,
        partNumber: input.partNumber,
        oem: input.oem,
        material: input.material,
        warranty: input.warranty,
        quantity: parseInt(input.quantity),
        weight: input.weight,
        dimensions: input.dimensions,
        brand: input.brand,
        price: input.price,
        originalPrice: input.originalPrice,
        currency: input.currency,
        isNegotiable: input.isNegotiable,
        sellerId: ctx.user.id,
      }).returning();

      return newPart;
    }),
});
