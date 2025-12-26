import z from "zod";
import { decodeVin } from "@/lib/vin-decoder";
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

  getModelsByMake: publicProcedure
    .input(z.object({ makeId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.vehicleModels.findMany({
        where: (model, { eq }) => eq(model.makeId, input.makeId),
        columns: {
          id: true,
          name: true,
        },
        orderBy: (model, { asc }) => asc(model.name),
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
      // Check if model already exists for this make
      const existingModel = await db.query.vehicleModels.findFirst({
        where: (model, { and, eq, ilike }) =>
          and(eq(model.makeId, input.makeId), ilike(model.name, input.name)),
      });

      if (existingModel) {
        return existingModel.id;
      }

      // Create new model if it doesn't exist
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

  /**
   * Decode VIN and fetch compatible models
   * This mutation:
   * 1. Validates and decodes the VIN using NHTSA API
   * 2. Finds or creates the make in the database
   * 3. Finds or creates the model in the database
   * 4. Returns compatibility information to be added to the part
   */
  decodeVinAndFetchModels: publicProcedure
    .input(z.object({ vin: z.string().length(17) }))
    .mutation(async ({ input }) => {
      // Decode VIN using NHTSA API
      const decoded = await decodeVin(input.vin);

      if (decoded.errorCode) {
        throw new Error(decoded.errorText ?? "Failed to decode VIN");
      }

      if (!decoded.make || !decoded.model || !decoded.modelYear) {
        throw new Error("Could not extract vehicle information from VIN");
      }

      // Find or create the make
      let make = await db.query.vehicleMakes.findFirst({
        where: (m, { ilike }) => ilike(m.name, decoded.make!),
      });

      if (!make) {
        const [newMake] = await db
          .insert(vehicleMakes)
          .values({
            name: decoded.make,
            slug: decoded.make.toLowerCase().replace(/\s+/g, "-"),
            isActive: true,
          })
          .returning();
        make = newMake;
      }

      if (!make) {
        throw new Error("Failed to create or find vehicle make");
      }

      // Find or create the model
      let model = await db.query.vehicleModels.findFirst({
        where: (m, { and, eq, ilike }) =>
          and(eq(m.makeId, make.id), ilike(m.name, decoded.model!)),
      });

      if (!model) {
        const [newModel] = await db
          .insert(vehicleModels)
          .values({
            name: decoded.model,
            makeId: make.id,
            slug: decoded.model.toLowerCase().replace(/\s+/g, "-"),
            yearStart: decoded.modelYear,
            yearEnd: decoded.modelYear,
            isActive: true,
          })
          .returning();
        model = newModel;
      }

      if (!model) {
        throw new Error("Failed to create or find vehicle model");
      }

      // Return the compatibility information
      return {
        success: true,
        data: {
          makeId: make.id,
          makeName: make.name,
          modelId: model.id,
          modelName: model.name,
          year: decoded.modelYear,
          yearStart: decoded.modelYear,
          yearEnd: decoded.modelYear,
          engine: decoded.engine,
          trim: decoded.trim,
        },
      };
    }),
});
