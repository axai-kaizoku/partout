import z from "zod";
import { db } from "@/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const sellerRouter = createTRPCRouter({
  getSellerById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const data = await db.transaction(async (tx) => {
      const seller = await tx.query.profiles.findFirst({
        where: (profile, { eq, and }) =>
          and(eq(profile.id, input), eq(profile.isSeller, true)),
        columns: {
          name: true,
          id: true,
          createdAt: true,
          email: true,
          imageUrl: true,
          phone: true,
          totalSales: true,
          totalPurchases: true,
        },
        with: {
          part: {
            columns: {
              id: true,
              title: true,
              condition: true,
              status: true,
              price: true,
              createdAt: true,
            },
            with: {
              partImages: {
                columns: {
                  url: true,
                },
                where: (img, { eq }) => eq(img.isPrimary, true),
                limit: 1,
              },
            },
            where: (part, { eq }) => eq(part.status, "active"),
            orderBy: (orderBy, { desc }) => desc(orderBy.createdAt),
          },
        },
      });
      return seller;
    });
    return data;
    // const seller = await db.query.parts.findMany({
    //   where: (part, { eq }) => eq(part.sellerId, input),
    //   with: {
    //     partImages: {
    //       columns: {
    //         url: true,
    //       },
    //       where: (img, { eq }) => eq(img.isPrimary, true),
    //     },
    //   },
    // });
    // return seller;
  }),
});
