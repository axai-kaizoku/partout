import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { addressSchema } from "@/components/seller/address-form/validations";
import { db } from "@/server/db";
import { addresses } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const addressRouter = createTRPCRouter({
  createAddress: privateProcedure.input(addressSchema).mutation(async ({ ctx, input }) => {
    return await db.transaction(async (tx) => {
      // Check if user has any existing addresses
      const existingAddresses = await tx.query.addresses.findMany({
        where: eq(addresses.userId, ctx.user.id),
      });

      // If this is the first address, automatically make it default
      const shouldBeDefault = existingAddresses.length === 0 || input.isDefault;

      if (shouldBeDefault && existingAddresses.length > 0) {
        // Unset other defaults if this is being set as default
        await tx.update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, ctx.user.id));
      }

      const [newAddress] = await tx.insert(addresses)
        .values({ ...input, userId: ctx.user.id, isDefault: shouldBeDefault })
        .returning();

      return newAddress;
    });
  }),

  getAllAddresses: privateProcedure.query(async ({ ctx }) => {
    const result = await db.query.addresses.findMany({
      where: eq(addresses.userId, ctx.user.id),
      orderBy: (addresses, { asc }) => [asc(addresses.createdAt)],
    });
    return result;
  }),

  updateAddress: privateProcedure.input(z.object({ id: z.string(), address: z.object({ ...addressSchema.shape }) })).mutation(async ({ ctx, input }) => {
    return await db.transaction(async (tx) => {
      if (input.address.isDefault) {
        const updatedAddresses = await tx.update(addresses)
          .set({ isDefault: false })
          .where(
            and(
              eq(addresses.userId, ctx.user.id),
              ne(addresses.id, input.id)
            )
          ).returning();
        console.log(updatedAddresses)
      }

      const [updated] = await tx.update(addresses)
        .set({
          ...input.address,
        })
        .where(eq(addresses.id, input.id))
        .returning();

      return updated;
    });
  }),

  deleteAddress: privateProcedure.input(z.object({ id: z.string(), isDefault: z.boolean() })).mutation(async ({ input }) => {
    if (input.isDefault) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Default address cannot be deleted" })
    }
    const [result] = await db.delete(addresses).where(eq(addresses.id, input.id)).returning();
    if (result) {
      return result
    }
    return null;
  })
})