import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/server/db";
import { profiles } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUser: privateProcedure.query(async ({ ctx }) => {
    const user = await db.query.profiles.findFirst({
      where: eq(profiles.id, ctx.user.id),
      with: {
        addresses: {
          where(fields, operators) {
            return operators.eq(fields.isDefault, true);
          },
          columns: {
            city: true,
            state: true,
          },
        },
      },
    });
    return user;
  }),

  updateSellerStatus: privateProcedure
    .input(z.object({ isSeller: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const [updatedProfile] = await db
        .update(profiles)
        .set({ isSeller: input.isSeller })
        .where(eq(profiles.id, ctx.user.id))
        .returning();

      return updatedProfile;
    }),
});
