import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, sql } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import {
  orders,
  orderItems,
  payments,
  parts,
  addresses,
} from "@/server/db/schema";
import { stripeService } from "@/server/services/stripe";
import { shippoService } from "@/server/services/shippo";

/**
 * Helper function to generate unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Helper function to group items by seller
 */
interface CartItem {
  partId: string;
  quantity: number;
  selectedRateId?: string;
}

interface Part {
  id: string;
  sellerId: string;
  price: string;
  weight: string | null;
  dimensions: unknown;
  seller: {
    id: string;
    name: string | null;
    addresses: Array<{
      id: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>;
  };
}

function groupItemsBySeller(parts: Part[], items: CartItem[]) {
  const groups: Record<
    string,
    {
      sellerId: string;
      items: Array<{ part: Part; quantity: number }>;
      sellerAddress: Part["seller"]["addresses"][0] | null;
    }
  > = {};

  for (const item of items) {
    const part = parts.find((p) => p.id === item.partId);
    if (!part) continue;

    if (!groups[part.sellerId]) {
      groups[part.sellerId] = {
        sellerId: part.sellerId,
        items: [],
        sellerAddress: part.seller.addresses[0] ?? null,
      };
    }

    groups[part.sellerId].items.push({
      part,
      quantity: item.quantity,
    });
  }

  return groups;
}

export const orderRouter = createTRPCRouter({
  /**
   * Calculate shipping rates for cart items
   * Groups items by seller and gets real-time rates from Shippo
   */
  calculateShipping: privateProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            partId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
        shippingAddressId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch parts with weight/dimensions and seller info
      const partsData = await db.query.parts.findMany({
        where: (part, { inArray }) =>
          inArray(
            part.id,
            input.items.map((i) => i.partId),
          ),
        with: {
          seller: {
            with: {
              addresses: {
                where: (addr, { eq }) => eq(addr.isDefault, true),
              },
            },
          },
        },
      });

      // 2. Fetch buyer's shipping address
      const shippingAddress = await db.query.addresses.findFirst({
        where: (addr, { and, eq }) =>
          and(eq(addr.id, input.shippingAddressId), eq(addr.userId, ctx.user.id)),
      });

      if (!shippingAddress) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipping address not found",
        });
      }

      // 3. Group items by seller
      const sellerGroups = groupItemsBySeller(partsData, input.items);

      // 4. Get rates for each seller group
      const ratesPromises = Object.entries(sellerGroups).map(
        async ([sellerId, group]) => {
          if (!group.sellerAddress) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Seller ${sellerId} has no default address configured`,
            });
          }

          // Calculate combined weight
          let totalWeight = 0;
          for (const { part, quantity } of group.items) {
            const weight = part.weight ? parseFloat(part.weight) : 0;
            totalWeight += weight * quantity;
          }

          if (totalWeight === 0) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot calculate shipping: parts have no weight specified",
            });
          }

          // Calculate dimensions (use largest dimensions for simplicity)
          // In production, you might want to implement bin packing algorithm
          let maxLength = 0;
          let maxWidth = 0;
          let maxHeight = 0;

          for (const { part } of group.items) {
            const dims = part.dimensions as {
              length: number;
              width: number;
              height: number;
            } | null;
            if (dims) {
              maxLength = Math.max(maxLength, dims.length);
              maxWidth = Math.max(maxWidth, dims.width);
              maxHeight = Math.max(maxHeight, dims.height);
            }
          }

          // Default dimensions if not specified
          if (maxLength === 0 || maxWidth === 0 || maxHeight === 0) {
            maxLength = 12;
            maxWidth = 12;
            maxHeight = 12;
          }

          try {
            const { rates } = await shippoService.getRates({
              fromAddress: {
                name: group.sellerAddress.line1,
                street1: group.sellerAddress.line1,
                street2: group.sellerAddress.line2 ?? undefined,
                city: group.sellerAddress.city,
                state: group.sellerAddress.state,
                zip: group.sellerAddress.postalCode,
                country: group.sellerAddress.country,
              },
              toAddress: {
                name: shippingAddress.fullName ?? "Customer",
                street1: shippingAddress.line1,
                street2: shippingAddress.line2 ?? undefined,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zip: shippingAddress.postalCode,
                country: shippingAddress.country,
              },
              parcels: [
                {
                  length: maxLength,
                  width: maxWidth,
                  height: maxHeight,
                  distance_unit: "in",
                  weight: totalWeight,
                  mass_unit: "lb",
                },
              ],
            });

            // Return top 3 cheapest options
            return {
              sellerId,
              sellerName: partsData.find((p) => p.sellerId === sellerId)?.seller
                .name,
              rates: rates.slice(0, 3).map((rate) => ({
                rateId: rate.object_id,
                carrier: rate.carrier,
                service: rate.service,
                amount: parseFloat(rate.amount),
                currency: rate.currency,
                estimatedDays: rate.estimated_days,
              })),
            };
          } catch (error) {
            console.error("Shippo error for seller", sellerId, error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to calculate shipping rates: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
          }
        },
      );

      const allRates = await Promise.all(ratesPromises);
      return allRates;
    }),

  /**
   * Create an order with payment intent
   * This is called when the user proceeds to checkout
   */
  createOrder: privateProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            partId: z.string(),
            quantity: z.number().min(1),
            selectedRateId: z.string(), // Shippo rate ID
            shippingCost: z.number(),
          }),
        ),
        shippingAddressId: z.string(),
        billingAddressId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // 1. Fetch parts and validate inventory
        const partsData = await tx.query.parts.findMany({
          where: (part, { inArray }) =>
            inArray(
              part.id,
              input.items.map((i) => i.partId),
            ),
          with: {
            seller: true,
            partImages: {
              where: (img, { eq }) => eq(img.isPrimary, true),
              limit: 1,
            },
          },
        });

        // Validate inventory
        for (const item of input.items) {
          const part = partsData.find((p) => p.id === item.partId);
          if (!part) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Part ${item.partId} not found`,
            });
          }
          if (part.quantity < item.quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Insufficient inventory for ${part.title}. Only ${part.quantity} available.`,
            });
          }
          if (part.status !== "active") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Part ${part.title} is no longer available`,
            });
          }
        }

        // 2. Fetch addresses
        const shippingAddress = await tx.query.addresses.findFirst({
          where: (addr, { and, eq }) =>
            and(
              eq(addr.id, input.shippingAddressId),
              eq(addr.userId, ctx.user.id),
            ),
        });

        const billingAddress = input.billingAddressId
          ? await tx.query.addresses.findFirst({
              where: (addr, { and, eq }) =>
                and(
                  eq(addr.id, input.billingAddressId),
                  eq(addr.userId, ctx.user.id),
                ),
            })
          : null;

        if (!shippingAddress) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Shipping address not found",
          });
        }

        // 3. Calculate totals
        let subtotal = 0;
        let shippingTotal = 0;

        for (const item of input.items) {
          const part = partsData.find((p) => p.id === item.partId)!;
          subtotal += parseFloat(part.price) * item.quantity;
          shippingTotal += item.shippingCost;
        }

        const taxRate = 0.08; // 8% tax (should be dynamic based on location)
        const taxTotal = subtotal * taxRate;
        const total = subtotal + shippingTotal + taxTotal;

        // 4. Create order
        const [order] = await tx
          .insert(orders)
          .values({
            orderNumber: generateOrderNumber(),
            buyerId: ctx.user.id,
            subtotal: subtotal.toFixed(2),
            shippingTotal: shippingTotal.toFixed(2),
            taxTotal: taxTotal.toFixed(2),
            total: total.toFixed(2),
            status: "pending",
            paymentStatus: "pending",
            shippingAddress: shippingAddress,
            billingAddress: billingAddress ?? shippingAddress,
          })
          .returning();

        // 5. Create order items
        for (const item of input.items) {
          const part = partsData.find((p) => p.id === item.partId)!;
          const itemSubtotal = parseFloat(part.price) * item.quantity;

          await tx.insert(orderItems).values({
            orderId: order!.id,
            partId: part.id,
            sellerId: part.sellerId,
            title: part.title,
            partNumber: part.partNumber,
            condition: part.condition,
            unitPrice: part.price,
            quantity: item.quantity,
            subtotal: itemSubtotal.toFixed(2),
            shippingCost: item.shippingCost.toFixed(2),
            status: "pending",
            imageUrl: part.partImages[0]?.url ?? null,
          });
        }

        // 6. Create Stripe payment intent
        const paymentIntent = await stripeService.createPaymentIntent({
          amount: total,
          currency: "USD",
          orderId: order!.id,
          metadata: {
            orderNumber: order!.orderNumber,
            buyerId: ctx.user.id,
          },
        });

        // 7. Create payment record
        await tx.insert(payments).values({
          orderId: order!.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: total.toFixed(2),
          currency: "USD",
          status: "pending",
        });

        // 8. Update order with payment intent ID
        await tx
          .update(orders)
          .set({ paymentIntentId: paymentIntent.id })
          .where(eq(orders.id, order!.id));

        return {
          orderId: order!.id,
          orderNumber: order!.orderNumber,
          clientSecret: paymentIntent.client_secret,
          total,
        };
      });
    }),

  /**
   * Get order by ID (for order details page)
   */
  getOrderById: privateProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await db.query.orders.findFirst({
        where: (order, { eq }) => eq(order.id, input),
        with: {
          orderItems: {
            with: {
              part: true,
              seller: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          shipments: {
            with: {
              trackingEvents: {
                orderBy: (events, { desc }) => [desc(events.occurredAt)],
              },
            },
          },
          payments: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      // Verify buyer owns this order
      if (order.buyerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this order",
        });
      }

      return order;
    }),

  /**
   * Get buyer's order history
   */
  getMyOrders: privateProcedure.query(async ({ ctx }) => {
    return db.query.orders.findMany({
      where: (order, { eq }) => eq(order.buyerId, ctx.user.id),
      with: {
        orderItems: {
          with: {
            part: {
              columns: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: (order, { desc }) => [desc(order.createdAt)],
    });
  }),

  /**
   * Get seller's orders to fulfill
   */
  getSellerOrders: privateProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              "pending",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const items = await db.query.orderItems.findMany({
        where: (item, { eq, and }) =>
          input?.status
            ? and(eq(item.sellerId, ctx.user.id), eq(item.status, input.status))
            : eq(item.sellerId, ctx.user.id),
        with: {
          order: {
            columns: {
              id: true,
              orderNumber: true,
              status: true,
              paymentStatus: true,
              shippingAddress: true,
              createdAt: true,
              paidAt: true,
            },
          },
          part: {
            columns: {
              id: true,
              title: true,
              weight: true,
              dimensions: true,
            },
          },
        },
        orderBy: (item, { desc }) => [desc(item.createdAt)],
      });

      return items;
    }),
});
