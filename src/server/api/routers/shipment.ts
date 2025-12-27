import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, inArray } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import {
  shipments,
  shipmentItems,
  orderItems,
  trackingEvents,
} from "@/server/db/schema";
import { shippoService } from "@/server/services/shippo";

export const shipmentRouter = createTRPCRouter({
  /**
   * Create shipping label for order items
   * Called by seller when ready to ship
   */
  createShippingLabel: privateProcedure
    .input(
      z.object({
        orderItemIds: z.array(z.string()).min(1),
        rateId: z.string(), // Pre-selected Shippo rate ID
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // 1. Verify seller owns these order items
        const items = await tx.query.orderItems.findMany({
          where: (item, { inArray }) => inArray(item.id, input.orderItemIds),
          with: {
            order: true,
            part: {
              columns: {
                weight: true,
                dimensions: true,
              },
            },
          },
        });

        if (items.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order items not found",
          });
        }

        // Verify all items belong to this seller
        const invalidItems = items.filter((i) => i.sellerId !== ctx.user.id);
        if (invalidItems.length > 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to ship these items",
          });
        }

        // Verify all items are from the same order
        const orderIds = new Set(items.map((i) => i.orderId));
        if (orderIds.size > 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All items must be from the same order",
          });
        }

        // Verify order has been paid
        const order = items[0]!.order;
        if (order.paymentStatus !== "succeeded") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Cannot create shipping label - payment not confirmed",
          });
        }

        // 2. Calculate total weight and dimensions
        let totalWeight = 0;
        let maxLength = 0;
        let maxWidth = 0;
        let maxHeight = 0;

        for (const item of items) {
          const weight = item.part.weight
            ? parseFloat(item.part.weight)
            : 0;
          totalWeight += weight * item.quantity;

          const dims = item.part.dimensions as {
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

        // 3. Get seller's default address
        const sellerAddress = await tx.query.addresses.findFirst({
          where: (addr, { and, eq }) =>
            and(eq(addr.userId, ctx.user.id), eq(addr.isDefault, true)),
        });

        if (!sellerAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "No default address configured. Please add a default shipping address.",
          });
        }

        // 4. Purchase label via Shippo
        let labelData;
        try {
          labelData = await shippoService.purchaseLabel(input.rateId);
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to purchase shipping label: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }

        // 5. Calculate total shipping cost
        const totalShippingCost = items.reduce(
          (sum, item) => sum + parseFloat(item.shippingCost),
          0,
        );

        // 6. Create shipment record
        const [shipment] = await tx
          .insert(shipments)
          .values({
            orderId: order.id,
            sellerId: ctx.user.id,
            shippoRateId: input.rateId,
            shippoTransactionId: labelData.transactionId,
            carrier: labelData.carrier,
            service: labelData.service,
            trackingNumber: labelData.trackingNumber,
            trackingUrl: labelData.trackingUrl,
            labelUrl: labelData.labelUrl,
            shippingCost: totalShippingCost.toFixed(2),
            status: "label_created",
            fromAddress: sellerAddress,
            toAddress: order.shippingAddress,
            weight: totalWeight.toFixed(2),
            dimensions: {
              length: maxLength,
              width: maxWidth,
              height: maxHeight,
              unit: "in",
            },
          })
          .returning();

        // 7. Link order items to shipment
        for (const item of items) {
          await tx.insert(shipmentItems).values({
            shipmentId: shipment!.id,
            orderItemId: item.id,
            quantity: item.quantity,
          });
        }

        // 8. Update order items status
        await tx
          .update(orderItems)
          .set({ status: "shipped", updatedAt: new Date() })
          .where(inArray(orderItems.id, input.orderItemIds));

        // 9. Register tracking webhook with Shippo
        try {
          await shippoService.registerTrackingWebhook(
            labelData.carrier,
            labelData.trackingNumber,
          );
        } catch (error) {
          // Non-critical error - log but don't fail
          console.error("Failed to register tracking webhook:", error);
        }

        // 10. Check if all order items are now shipped
        const allOrderItems = await tx.query.orderItems.findMany({
          where: (item, { eq }) => eq(item.orderId, order.id),
        });

        const allShipped = allOrderItems.every((i) => i.status === "shipped");
        if (allShipped) {
          // Update order status
          await tx
            .update(orderItems)
            .set({ status: "shipped" })
            .where(eq(orderItems.orderId, order.id));
        }

        return {
          shipmentId: shipment!.id,
          labelUrl: labelData.labelUrl,
          trackingNumber: labelData.trackingNumber,
          trackingUrl: labelData.trackingUrl,
        };
      });
    }),

  /**
   * Get tracking information for a shipment
   */
  getTracking: privateProcedure
    .input(z.string()) // shipmentId
    .query(async ({ ctx, input }) => {
      const shipment = await db.query.shipments.findFirst({
        where: (s, { eq }) => eq(s.id, input),
        with: {
          order: {
            columns: {
              id: true,
              orderNumber: true,
              buyerId: true,
            },
          },
          seller: {
            columns: {
              id: true,
              name: true,
            },
          },
          trackingEvents: {
            orderBy: (events, { desc }) => [desc(events.occurredAt)],
          },
          shipmentItems: {
            with: {
              orderItem: {
                columns: {
                  title: true,
                  quantity: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      if (!shipment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipment not found",
        });
      }

      // Verify user has access to this shipment (buyer or seller)
      const isBuyer = shipment.order.buyerId === ctx.user.id;
      const isSeller = shipment.sellerId === ctx.user.id;

      if (!isBuyer && !isSeller) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this shipment",
        });
      }

      return shipment;
    }),

  /**
   * Get all shipments for seller
   */
  getSellerShipments: privateProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              "pending",
              "label_created",
              "in_transit",
              "delivered",
              "failed",
            ])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const shipments = await db.query.shipments.findMany({
        where: (shipment, { eq, and }) =>
          input?.status
            ? and(
                eq(shipment.sellerId, ctx.user.id),
                eq(shipment.status, input.status),
              )
            : eq(shipment.sellerId, ctx.user.id),
        with: {
          order: {
            columns: {
              orderNumber: true,
            },
          },
          shipmentItems: {
            with: {
              orderItem: {
                columns: {
                  title: true,
                  quantity: true,
                },
              },
            },
          },
        },
        orderBy: (shipment, { desc }) => [desc(shipment.createdAt)],
      });

      return shipments;
    }),

  /**
   * Refresh tracking information from Shippo
   * Useful if webhook delivery failed
   */
  refreshTracking: privateProcedure
    .input(z.string()) // shipmentId
    .mutation(async ({ ctx, input }) => {
      const shipment = await db.query.shipments.findFirst({
        where: (s, { eq }) => eq(s.id, input),
        with: {
          order: {
            columns: {
              buyerId: true,
            },
          },
        },
      });

      if (!shipment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shipment not found",
        });
      }

      // Verify user has access (buyer or seller)
      const isBuyer = shipment.order.buyerId === ctx.user.id;
      const isSeller = shipment.sellerId === ctx.user.id;

      if (!isBuyer && !isSeller) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this shipment",
        });
      }

      if (!shipment.trackingNumber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Shipment has no tracking number",
        });
      }

      // Fetch latest tracking info from Shippo
      try {
        const trackingInfo = await shippoService.getTracking(
          shipment.carrier,
          shipment.trackingNumber,
        );

        // Update shipment status
        const mappedStatus =
          shippoService.mapTrackingStatus(trackingInfo.status);

        await db
          .update(shipments)
          .set({
            trackingStatus: trackingInfo.status,
            status:
              mappedStatus === "delivered"
                ? "delivered"
                : mappedStatus === "transit"
                  ? "in_transit"
                  : shipment.status,
            deliveredAt:
              mappedStatus === "delivered" ? new Date() : shipment.deliveredAt,
            updatedAt: new Date(),
          })
          .where(eq(shipments.id, input));

        // Add tracking events if any new ones
        for (const event of trackingInfo.trackingHistory) {
          // Check if event already exists
          const existing = await db.query.trackingEvents.findFirst({
            where: (te, { and, eq }) =>
              and(
                eq(te.shipmentId, input),
                eq(te.status, event.status),
                eq(te.occurredAt, new Date(event.occurredAt)),
              ),
          });

          if (!existing) {
            await db.insert(trackingEvents).values({
              shipmentId: input,
              status: event.status,
              statusDetails: event.statusDetails,
              location: `${event.location.city}, ${event.location.state}`,
              occurredAt: new Date(event.occurredAt),
            });
          }
        }

        return { success: true, status: trackingInfo.status };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to refresh tracking: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),
});
