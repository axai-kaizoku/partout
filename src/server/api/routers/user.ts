import { db } from "@/server/db";
import { profiles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "../trpc";
import z from "zod";

export const userRouter = createTRPCRouter({
  getUser: privateProcedure.query(async ({ ctx }) => {
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, ctx.user.id),
    })
    return user;
  }),

  updateSellerStatus: privateProcedure
    .input(z.object({ isSeller: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updatedProfile] = await db.update(profiles)
        .set({ isSeller: input.isSeller })
        .where(eq(profiles.id, ctx.user.id))
        .returning();

      return updatedProfile;
    })
})