import { TRPCError } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { shippingProfilesSchema } from "@/components/seller/shipping-profiles-form/validations";
import { db } from "@/server/db";
import { shippingProfiles } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const shippingRouter = createTRPCRouter({
  createShippingProfile: privateProcedure
    .input(shippingProfilesSchema)
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // Check if user has any existing shipping profiles
        const existingProfiles = await tx.query.shippingProfiles.findMany({
          where: eq(shippingProfiles.sellerId, ctx.user.id),
        });

        // If this is the first shipping profile, automatically make it default
        const shouldBeDefault =
          existingProfiles.length === 0 || input.isDefault;

        if (shouldBeDefault && existingProfiles.length > 0) {
          // Unset other defaults if this is being set as default
          await tx
            .update(shippingProfiles)
            .set({ isDefault: false })
            .where(eq(shippingProfiles.sellerId, ctx.user.id));
        }

        const [newProfile] = await tx
          .insert(shippingProfiles)
          .values({
            ...input,
            estimatedDaysMin: input.estimatedDaysMin
              ? parseInt(input.estimatedDaysMin, 10)
              : null,
            estimatedDaysMax: input.estimatedDaysMax
              ? parseInt(input.estimatedDaysMax, 10)
              : null,
            sellerId: ctx.user.id,
            isDefault: shouldBeDefault,
          })
          .returning();

        return newProfile;
      });
    }),

  getAllShippingProfiles: privateProcedure.query(async ({ ctx }) => {
    const result = await db.query.shippingProfiles.findMany({
      where: eq(shippingProfiles.sellerId, ctx.user.id),
      orderBy: (shippingProfiles, { asc }) => [asc(shippingProfiles.createdAt)],
    });
    return result;
  }),

  updateShippingProfile: privateProcedure
    .input(
      z.object({
        id: z.string(),
        shippingProfile: z.object({ ...shippingProfilesSchema.shape }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        if (input.shippingProfile.isDefault === true) {
          await tx
            .update(shippingProfiles)
            .set({ isDefault: false })
            .where(
              and(
                eq(shippingProfiles.sellerId, ctx.user.id),
                ne(shippingProfiles.id, input.id),
              ),
            );
        }

        const [updated] = await tx
          .update(shippingProfiles)
          .set({
            ...input.shippingProfile,
            estimatedDaysMin: input.shippingProfile.estimatedDaysMin
              ? parseInt(input.shippingProfile.estimatedDaysMin, 10)
              : null,
            estimatedDaysMax: input.shippingProfile.estimatedDaysMax
              ? parseInt(input.shippingProfile.estimatedDaysMax, 10)
              : null,
          })
          .where(eq(shippingProfiles.id, input.id))
          .returning();

        return updated;
      });
    }),

  deleteShippingProfile: privateProcedure
    .input(z.object({ id: z.string(), isDefault: z.boolean() }))
    .mutation(async ({ input }) => {
      if (input.isDefault) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Default shipping profile cannot be deleted",
        });
      }
      const [result] = await db
        .delete(shippingProfiles)
        .where(eq(shippingProfiles.id, input.id))
        .returning();
      if (result) {
        return result;
      }
      return null;
    }),
});
