import z from "zod";
import { db } from "@/server/db";
import { categories, vehicleMakes, vehicleModels } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const partInfoRouter = createTRPCRouter({
  // Queries
  getCategories: publicProcedure.query(async () => {
    return await db.query.categories.findMany();
  }),

  getCategoriesForDropdown: publicProcedure.query(async () => {
    return await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
  }),

  getMakes: publicProcedure.query(async () => {
    return await db.query.vehicleMakes.findMany();
  }),

  getMakesForDropdown: publicProcedure.query(async () => {
    return await db.query.vehicleMakes.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
  }),

  // Mutations
  createMockCategories: publicProcedure.mutation(async () => {
    await db.insert(categories).values([
      {
        name: "Engine Parts",
        slug: "engine-parts",
        description: "All engine related components",
        imageUrl: null,
        parentId: null,
        sortOrder: 1,
      },
      {
        name: "Brake System",
        slug: "brake-system",
        description: "Brake rotors, pads, calipers, ABS parts",
        imageUrl: null,
        parentId: null,
        sortOrder: 2,
      },
      {
        name: "Electrical",
        slug: "electrical",
        description: "Electrical components and wiring parts",
        imageUrl: null,
        parentId: null,
        sortOrder: 3,
      },
      {
        name: "Body Parts",
        slug: "body-parts",
        description: "Exterior body components and panels",
        imageUrl: null,
        parentId: null,
        sortOrder: 4,
      },
      {
        name: "Suspension",
        slug: "suspension",
        description: "Shocks, struts, control arms, bushings",
        imageUrl: null,
        parentId: null,
        sortOrder: 5,
      },
      {
        name: "Exhaust",
        slug: "exhaust",
        description: "Exhaust systems, mufflers, catalytic converters",
        imageUrl: null,
        parentId: null,
        sortOrder: 6,
      },
      {
        name: "Interior",
        slug: "interior",
        description: "Seats, dashboards, trim parts",
        imageUrl: null,
        parentId: null,
        sortOrder: 7,
      },
      {
        name: "Exterior",
        slug: "exterior",
        description: "Bumpers, mirrors, grills, exterior trims",
        imageUrl: null,
        parentId: null,
        sortOrder: 8,
      },
      {
        name: "Tools",
        slug: "tools",
        description: "Automotive tools and workshop equipment",
        imageUrl: null,
        parentId: null,
        sortOrder: 9,
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "General automotive accessories and addons",
        imageUrl: null,
        parentId: null,
        sortOrder: 10,
      },
    ]);
  }),

  createMockMakes: publicProcedure.mutation(async () => {
    await db.insert(vehicleMakes).values([
      {
        name: "Toyota",
        slug: "toyota",
        logoUrl: null,
      },
      {
        name: "Honda",
        slug: "honda",
        logoUrl: null,
      },
      {
        name: "Hyundai",
        slug: "hyundai",
        logoUrl: null,
      },
      {
        name: "Ford",
        slug: "ford",
        logoUrl: null,
      },
      {
        name: "Chevrolet",
        slug: "chevrolet",
        logoUrl: null,
      },
      {
        name: "BMW",
        slug: "bmw",
        logoUrl: null,
      },
      {
        name: "Mercedes-Benz",
        slug: "mercedes-benz",
        logoUrl: null,
      },
      {
        name: "Audi",
        slug: "audi",
        logoUrl: null,
      },
      {
        name: "Volkswagen",
        slug: "volkswagen",
        logoUrl: null,
      },
      {
        name: "Nissan",
        slug: "nissan",
        logoUrl: null,
      },
      {
        name: "Kia",
        slug: "kia",
        logoUrl: null,
      },
      {
        name: "Tata Motors",
        slug: "tata-motors",
        logoUrl: null,
      },
      {
        name: "Mahindra",
        slug: "mahindra",
        logoUrl: null,
      },
      {
        name: "Renault",
        slug: "renault",
        logoUrl: null,
      },
      {
        name: "Skoda",
        slug: "skoda",
        logoUrl: null,
      },
      {
        name: "Jeep",
        slug: "jeep",
        logoUrl: null,
      },
      {
        name: "Volvo",
        slug: "volvo",
        logoUrl: null,
      },
      {
        name: "Land Rover",
        slug: "land-rover",
        logoUrl: null,
      },
      {
        name: "Porsche",
        slug: "porsche",
        logoUrl: null,
      },
      {
        name: "Lexus",
        slug: "lexus",
        logoUrl: null,
      },
    ]);
  }),

  createModelForMake: publicProcedure
    .input(
      z.object({
        makeId: z.string(),
        name: z.string(),
        yearStart: z.number().optional().nullable(),
        yearEnd: z.number().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      const [model] = await db
        .insert(vehicleModels)
        .values({
          name: input.name,
          makeId: input.makeId,
          slug: input.name.toLowerCase().replace(" ", "-"),
          yearStart: input.yearStart,
          yearEnd: input.yearEnd,
          isActive: true,
        })
        .returning();

      if (model) {
        return model.id;
      }

      return null;
    }),
});
