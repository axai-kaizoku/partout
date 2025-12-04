import { z } from "zod";
import { db } from "@/server/db";
import { partCompatibility, parts, partShipping } from "@/server/db/schema";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";

export const partRouter = createTRPCRouter({
  // Queries
  getHomePageParts: publicProcedure.query(async () => {
    const data = await db.transaction((tx) => {
      const parts = tx.query.parts.findMany({
        with: {
          partImages: {
            columns: {
              url: true
            },
            where: (img, { eq }) => eq(img.isPrimary, true),
          },
          seller: {
            columns: {
              name: true,
            },
            with: {
              addresses: {
                where: (address, { eq }) => eq(address.isDefault, true),
                columns: {
                  city: true,
                  state: true,
                }
              }
            }
          },
          partCompatibility: {
            columns: {
              yearStart: true,
              yearEnd: true,
            },
            with: {
              make: {
                columns: {
                  name: true
                }
              },
              model: {
                columns: {
                  name: true
                }
              }
            }
          }
        },
        limit: 6
      })
      return parts;
    });
    return data;
  }),

  getPartById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const data = await db.transaction((tx) => {
      const part = tx.query.parts.findFirst({
        where: (part, { eq }) => eq(part.id, input),
        with: {
          partImages: {
            columns: {
              url: true
            },
            where: (img, { eq }) => eq(img.isPrimary, true),
          },
          seller: {
            columns: {
              name: true,
              createdAt: true,
            },
            with: {
              addresses: {
                where: (address, { eq }) => eq(address.isDefault, true),
                columns: {
                  city: true,
                  state: true,
                }
              }
            }
          },
          partShipping: {
            columns: {
              shippingProfileId: true,
            },
            with: {
              shippingProfile: {
                columns: {
                  name: true,
                  baseCost: true,
                  carrier: true,
                  freeShippingThreshold: true,
                  estimatedDaysMin: true,
                  estimatedDaysMax: true,
                }
              }
            }
          },
          partCompatibility: {
            columns: {
              yearStart: true,
              yearEnd: true,
            },
            with: {
              make: {
                columns: {
                  name: true
                }
              },
              model: {
                columns: {
                  name: true
                }
              }
            }
          }
        },
      })
      return part;
    });
    return data;
  }),


  getPartsByUserId: privateProcedure.query(async ({ ctx }) => {
    const data = await db.transaction((tx) => {
      const parts = tx.query.parts.findMany({
        where: (part, { eq }) => eq(part.sellerId, ctx.user.id),
        with: {
          partImages: {
            columns: {
              url: true
            },
            where: (img, { eq }) => eq(img.isPrimary, true),
          },
        },
      })
      return parts;
    });
    return data;
  }),

  // Mutations
  createPart: privateProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        categoryId: z.string(),
        condition: z.string(),
        partNumber: z.string(),
        oem: z.string(),
        material: z.string(),
        warranty: z.string(),
        quantity: z.number(),
        weight: z.number().optional(),
        dimensions: z.string(),
        brand: z.string(),
        price: z.number(),
        originalPrice: z.number().optional(),
        currency: z.string(),
        isNegotiable: z.boolean(),
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
        quantity: input.quantity,
        weight: input.weight,
        dimensions: input.dimensions,
        brand: input.brand,
        price: input.price,
        originalPrice: input.originalPrice,
        currency: input.currency,
        isNegotiable: input.isNegotiable,
        sellerId: ctx.user.id,
      }).returning();

      if (newPart) {
        return newPart.id;
      }

      return null;
    }),


  createPartShipping: privateProcedure
    .input(
      z.object({
        partId: z.string(),
        shippingProfileId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newPartShipping] = await db.insert(partShipping).values({
        partId: input.partId,
        shippingProfileId: input.shippingProfileId,
        sellerId: ctx.user.id,
      }).returning();

      if (newPartShipping) {
        return newPartShipping.id;
      }

      return null;
    }),


  createPartCompatibility: privateProcedure
    .input(
      z.object({
        partId: z.string(),
        makeId: z.string(),
        modelId: z.string(),
        yearStart: z.number().optional().nullable(),
        yearEnd: z.number().optional().nullable(),
        engine: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newPartCompatibility] = await db.insert(partCompatibility).values({
        partId: input.partId,
        makeId: input.makeId,
        modelId: input.modelId,
        yearStart: input.yearStart,
        yearEnd: input.yearEnd,
        engine: input.engine,
      }).returning();

      if (newPartCompatibility) {
        return newPartCompatibility.id;
      }

      return null;
    }),
});
