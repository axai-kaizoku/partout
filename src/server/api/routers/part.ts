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
							url: true,
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
								},
							},
						},
					},
					partCompatibility: {
						columns: {
							yearStart: true,
							yearEnd: true,
						},
						with: {
							make: {
								columns: {
									name: true,
								},
							},
							model: {
								columns: {
									name: true,
								},
							},
						},
					},
				},
				orderBy: (orderBy, { desc }) => desc(orderBy.createdAt),
				limit: 6,
			});
			return parts;
		});
		return data;
	}),

	_getSearchResults: publicProcedure
		.input(
			z.object({
				search: z.string().optional(),
				filters: z
					.object({
						category: z.string().optional(),
						brand: z.string().optional(),
						model: z.string().optional(),
						year: z.string().optional(),
						condition: z.string().optional(),
						priceRange: z.array(z.number()).optional(),
						location: z.string().optional(),
						negotiable: z.boolean().optional(),
					})
					.optional(),
				sort: z.enum(["relevance", "price-high", "price-low"]).optional(),
			}),
		)
		.query(async ({ input }) => {
			const { search, filters, sort } = input;

			let searchQuery = {};
			if (search) {
				searchQuery = {
					title: (title, { ilike }) => ilike(title, `%${search}%`),
					description: (description, { ilike }) =>
						ilike(description, `%${search}%`),
				};
			}

			let filtersQuery = {};
			if (filters) {
				filtersQuery = {
					categoryId: (categoryId, { eq }) =>
						eq(categoryId, filters.categoryId),
					brandId: (brandId, { eq }) => eq(brandId, filters.brandId),
					modelId: (modelId, { eq }) => eq(modelId, filters.modelId),
					year: (year, { eq }) => eq(year, filters.year),
					condition: (condition, { eq }) => eq(condition, filters.condition),
					priceRange: (priceRange, { gte, lte }) =>
						gte(priceRange, filters.priceRange?.[0]) &&
						lte(priceRange, filters.priceRange?.[1]),
					location: (location, { eq }) => eq(location, filters.location),
					negotiable: (negotiable, { eq }) =>
						eq(negotiable, filters.negotiable),
				};
			}

			const data = await db.transaction((tx) => {
				const parts = tx.query.parts.findMany({
					with: {
						partImages: {
							columns: {
								url: true,
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
									},
								},
							},
						},
						partCompatibility: {
							columns: {
								yearStart: true,
								yearEnd: true,
							},
							with: {
								make: {
									columns: {
										name: true,
									},
								},
								model: {
									columns: {
										name: true,
									},
								},
							},
						},
					},
					orderBy: (orderBy, { asc }) => asc(orderBy.createdAt),
				});
				return parts;
			});
			return data;
		}),

	getSearchResults: publicProcedure
		.input(
			z.object({
				search: z.string().optional(),
				filters: z
					.object({
						category: z.string().optional(),
						brand: z.string().optional(),
						model: z.string().optional(),
						year: z.number().optional(),
						condition: z.string().optional(),
						priceRange: z.tuple([z.number(), z.number()]).optional(),
						negotiable: z.boolean().optional(),
					})
					.optional(),
				sort: z.string().default("relevance"),
				cursor: z
					.object({
						createdAt: z.string().optional(),
						price: z.string().optional(),
						id: z.string().optional(),
					})
					.optional(),
				pageSize: z.number().min(1).max(2000).default(1000),
			}),
		)
		.query(async ({ input }) => {
			const { search, filters, sort, cursor, pageSize } = input;

			// Step 1: Resolve text filters to IDs
			let categoryId: string | undefined;
			let makeId: string | undefined;
			let modelId: string | undefined;

			if (filters?.category) {
				const category = await db.query.categories.findFirst({
					where: (cat, { or, ilike }) =>
						or(
							ilike(cat.name, filters?.category),
							ilike(cat.slug, filters?.category),
						),
					columns: { id: true },
				});
				categoryId = category?.id;
			}

			if (filters?.brand) {
				const make = await db.query.vehicleMakes.findFirst({
					where: (make, { or, ilike }) =>
						or(
							ilike(make.name, filters?.brand),
							ilike(make.slug, filters?.brand),
						),
					columns: { id: true },
				});
				makeId = make?.id;
			}

			if (filters?.model && makeId) {
				const model = await db.query.vehicleModels.findFirst({
					where: (model, { and, or, eq, ilike }) =>
						and(
							eq(model.makeId, makeId),
							or(
								ilike(model.name, filters.model),
								ilike(model.slug, filters.model),
							),
						),
					columns: { id: true },
				});
				modelId = model?.id;
			}

			// Step 2: Build the main query with resolved IDs
			const parts = await db.query.parts.findMany({
				where: (part, { and, or, eq, gte, lte, lt, gt, ilike }) => {
					const conditions = [];

					// Search condition
					if (search) {
						conditions.push(
							or(
								ilike(part.title, `%${search}%`),
								ilike(part.description, `%${search}%`),
								ilike(part.partNumber, `%${search}%`),
							),
						);
					}

					// Filter conditions
					if (categoryId) {
						conditions.push(eq(part.categoryId, categoryId));
					}

					if (filters?.condition) {
						conditions.push(eq(part.condition, filters.condition));
					}

					if (filters?.priceRange) {
						conditions.push(
							and(
								gte(part.price, filters.priceRange[0].toString()),
								lte(part.price, filters.priceRange[1].toString()),
							),
						);
					}

					if (filters?.negotiable !== undefined) {
						conditions.push(eq(part.isNegotiable, filters.negotiable));
					}

					// Active parts only
					conditions.push(eq(part.status, "active"));

					// if (cursor) {
					//   if (sort === "price-high" && cursor.price) {
					//     conditions.push(
					//       or(
					//         lt(part.price, cursor.price),
					//         and(
					//           eq(part.price, cursor.price),
					//           // gt(part.id, cursor.id),
					//         )
					//       )
					//     )
					//   } else if (sort === "price-low" && cursor.price) {
					//     conditions.push(
					//       or(
					//         gt(part.price, cursor.price),
					//         and(
					//           eq(part.price, cursor.price),
					//           // gt(part.id, cursor.id)
					//         )
					//       )
					//     )
					//   } else if (cursor.createdAt) {
					//     conditions.push(
					//       or(
					//         lt(part.createdAt, new Date(cursor.createdAt)),
					//         and(
					//           eq(part.createdAt, new Date(cursor.createdAt)),
					//           // gt(part.id, cursor.id)
					//         )
					//       )
					//     )
					//   }
					// }

					return conditions.length > 0 ? and(...conditions) : undefined;
				},
				with: {
					partImages: {
						where: (img, { eq }) => eq(img.isPrimary, true),
						columns: {
							url: true,
							altText: true,
						},
						limit: 1,
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
								},
							},
						},
					},
					category: {
						columns: {
							name: true,
							slug: true,
						},
					},
					partCompatibility: {
						where: (compat, { and, eq, gte, lte }) => {
							const compatConditions = [];

							if (makeId) compatConditions.push(eq(compat.makeId, makeId));
							if (modelId) compatConditions.push(eq(compat.modelId, modelId));

							if (filters?.year) {
								compatConditions.push(
									and(
										gte(compat.yearEnd, filters.year),
										lte(compat.yearStart, filters.year),
									),
								);
							}

							return compatConditions.length > 0
								? and(...compatConditions)
								: undefined;
						},
						with: {
							make: {
								columns: {
									name: true,
									slug: true,
								},
							},
							model: {
								columns: {
									name: true,
									slug: true,
								},
							},
						},
					},
				},
				orderBy: (part, { asc, desc }) => {
					// Order by the sort field first, then by ID for consistent tie-breaking
					if (sort === "price-high") return [desc(part.price), asc(part.id)];
					if (sort === "price-low") return [asc(part.price), asc(part.id)];
					return [desc(part.createdAt), asc(part.id)]; // relevance
				},
				limit: pageSize + 1,
			});

			// Step 3: Filter out parts that don't match compatibility (if filters applied)
			const filteredParts =
				makeId || modelId || filters?.year
					? parts.filter((part) => part.partCompatibility.length > 0)
					: parts;

			// const hasNextPage = filteredParts.length > pageSize;
			// const dataParts = hasNextPage ? filteredParts.slice(6, pageSize) : filteredParts;

			// const nextCursor = hasNextPage && dataParts.length > 0
			//   ? {
			//     id: dataParts[dataParts.length - 1].id,
			//     createdAt: dataParts[dataParts.length - 1]?.createdAt.toISOString(),
			//     price: dataParts[dataParts.length - 1]?.price,
			//   } : null

			return filteredParts;
		}),

	getPartById: publicProcedure.input(z.string()).query(async ({ input }) => {
		const data = await db.transaction((tx) => {
			const part = tx.query.parts.findFirst({
				where: (part, { eq }) => eq(part.id, input),
				with: {
					partImages: {
						columns: {
							url: true,
						},
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
								},
							},
						},
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
								},
							},
						},
					},
					partCompatibility: {
						columns: {
							yearStart: true,
							yearEnd: true,
						},
						with: {
							make: {
								columns: {
									name: true,
								},
							},
							model: {
								columns: {
									name: true,
								},
							},
						},
					},
				},
			});
			return part;
		});
		return data;
	}),

	getRelatedParts: publicProcedure
		.input(z.object({ partId: z.string(), categoryId: z.string() }))
		.query(async ({ input }) => {
			const data = await db.transaction((tx) => {
				const part = tx.query.parts.findMany({
					where: (part, { ne, and, eq }) =>
						and(
							ne(part.id, input.partId),
							eq(part.categoryId, input.categoryId),
						),
					with: {
						partImages: {
							columns: {
								url: true,
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
									},
								},
							},
						},
						partCompatibility: {
							columns: {
								yearStart: true,
								yearEnd: true,
							},
							with: {
								make: {
									columns: {
										name: true,
									},
								},
								model: {
									columns: {
										name: true,
									},
								},
							},
						},
					},
					limit: 3,
				});
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
							url: true,
						},
						where: (img, { eq }) => eq(img.isPrimary, true),
					},
				},
			});
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
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newPart] = await db
				.insert(parts)
				.values({
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
				})
				.returning();

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
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [newPartShipping] = await db
				.insert(partShipping)
				.values({
					partId: input.partId,
					shippingProfileId: input.shippingProfileId,
					sellerId: ctx.user.id,
				})
				.returning();

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
			}),
		)
		.mutation(async ({ input }) => {
			const [newPartCompatibility] = await db
				.insert(partCompatibility)
				.values({
					partId: input.partId,
					makeId: input.makeId,
					modelId: input.modelId,
					yearStart: input.yearStart,
					yearEnd: input.yearEnd,
					engine: input.engine,
				})
				.returning();

			if (newPartCompatibility) {
				return newPartCompatibility.id;
			}

			return null;
		}),
});
