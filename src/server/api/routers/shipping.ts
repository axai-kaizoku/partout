import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { shippingProfilesSchema } from "@/components/seller/shipping-profiles-form/validations";
import { db } from "@/server/db";
import { shippingProfiles } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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
    const result = await db.query.shippingProfiles.findMany({
      where: eq(shippingProfiles.sellerId, ctx.user.id),
      orderBy: (shippingProfiles, { asc }) => [asc(shippingProfiles.createdAt)]
    })
    return result;
  }),

  updateShippingProfile: privateProcedure.input(z.object({ id: z.string(), shippingProfile: z.object({ ...shippingProfilesSchema.shape }) })).mutation(async ({ ctx, input }) => {
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
        .set({
          ...input.shippingProfile,
          baseCost: parseInt(input.shippingProfile.baseCost),
          freeShippingThreshold: input.shippingProfile.freeShippingThreshold ? parseInt(input.shippingProfile.freeShippingThreshold) : null,
          estimatedDaysMin: input.shippingProfile.estimatedDaysMin ? parseInt(input.shippingProfile.estimatedDaysMin) : null,
          estimatedDaysMax: input.shippingProfile.estimatedDaysMax ? parseInt(input.shippingProfile.estimatedDaysMax) : null,
        })
        .where(eq(shippingProfiles.id, input.id))
        .returning();

      return updated;
    });
  }),

  deleteShippingProfile: privateProcedure.input(z.object({ id: z.string(), isDefault: z.boolean() })).mutation(async ({ input }) => {
    if (input.isDefault) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Default shipping profile cannot be deleted" })
    }
    const [result] = await db.delete(shippingProfiles).where(eq(shippingProfiles.id, input.id)).returning();
    if (result) {
      return result
    }
    return null;
  })
})