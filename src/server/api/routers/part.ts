import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";
import { db } from "@/server/db";

export const partRouter = createTRPCRouter({
  // Queries
  getHomePageParts: publicProcedure.query(async () => {
    return await db.query.parts.findMany();
  }),

  // Mutations
  createPart: privateProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        image: z.string(),
        stock: z.number(),
        category: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.insert(parts).values(input);
    }),
});
