import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { shippingProfilesSchema } from "@/components/seller/shipping-profiles-form/validations";
import { db } from "@/server/db";
import { shippingProfiles } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const shippingRouter = createTRPCRouter({
  createShippingProfile: privateProcedure.input(shippingProfilesSchema).mutation(async ({ ctx, input }) => {
    return await db.transaction(async (tx) => {
      if (input.isDefault) {
        await tx.update(shippingProfiles)
          .set({ isDefault: false })
          .where(eq(shippingProfiles.sellerId, ctx.user.id));
      }

      const [newAddress] = await tx.insert(shippingProfiles)
        .values({
          ...input,
          baseCost: parseInt(input.baseCost),
          freeShippingThreshold: input.freeShippingThreshold ? parseInt(input.freeShippingThreshold) : null,
          estimatedDaysMin: input.estimatedDaysMin ? parseInt(input.estimatedDaysMin) : null,
          estimatedDaysMax: input.estimatedDaysMax ? parseInt(input.estimatedDaysMax) : null,
          sellerId: ctx.user.id
        })
        .returning();

      return newAddress;
    });
  }),

  getAllShippingProfiles: privateProcedure.query(async ({ ctx }) => {
    const result = await db.select().from(shippingProfiles).where(eq(shippingProfiles.sellerId, ctx.user.id));
    return result;
  }),

  updateShippingProfile: privateProcedure.input(z.object({ id: z.string(), shippingProfile: shippingProfilesSchema.shape })).mutation(async ({ ctx, input }) => {
    return await db.transaction(async (tx) => {
      if (input.shippingProfile.isDefault === true) {
        await tx.update(shippingProfiles)
          .set({ isDefault: false })
          .where(
            and(
              eq(shippingProfiles.sellerId, ctx.user.id),
              ne(shippingProfiles.id, input.id)
            )
          );
      }

      const [updated] = await tx.update(shippingProfiles)
        .set({ ...input.shippingProfile })
        .where(eq(shippingProfiles.id, input.id))
        .returning();

      return updated;
    });
  }),

  deleteShippingProfile: privateProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const [result] = await db.delete(shippingProfiles).where(eq(shippingProfiles.id, input.id)).returning();
    if (result) {
      return result
    }
    return null;
  })
})