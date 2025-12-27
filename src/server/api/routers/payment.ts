import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { db } from "@/server/db";
import {
  payments,
  refunds,
  orderItems,
  orders,
  parts,
} from "@/server/db/schema";
import { stripeService } from "@/server/services/stripe";

export const paymentRouter = createTRPCRouter({
  /**
   * Get payment status for an order
   * Frontend can poll this to check if payment succeeded
   */
  getPaymentStatus: privateProcedure
    .input(z.string()) // orderId
    .query(async ({ ctx, input }) => {
      const payment = await db.query.payments.findFirst({
        where: (p, { eq }) => eq(p.orderId, input),
        with: {
          order: {
            columns: {
              buyerId: true,
            },
          },
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      // Verify buyer owns this payment
      if (payment.order.buyerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this payment",
        });
      }

      return {
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        succeededAt: payment.succeededAt,
        failedAt: payment.failedAt,
        failureMessage: payment.failureMessage,
      };
    }),

  /**
   * Request a refund for an order item
   * Can request full or partial refund
   */
  requestRefund: privateProcedure
    .input(
      z.object({
        orderItemId: z.string(),
        reason: z.enum([
          "duplicate",
          "fraudulent",
          "requested_by_customer",
        ]),
        description: z.string().optional(),
        amount: z.number().optional(), // Optional for partial refund
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // 1. Get order item with order and payment info
        const orderItem = await tx.query.orderItems.findFirst({
          where: (item, { eq }) => eq(item.id, input.orderItemId),
          with: {
            order: {
              with: {
                payments: true,
              },
            },
          },
        });

        if (!orderItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order item not found",
          });
        }

        // 2. Verify buyer owns this order
        if (orderItem.order.buyerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to request refund for this item",
          });
        }

        // 3. Verify payment succeeded
        const payment = orderItem.order.payments.find(
          (p) => p.status === "succeeded",
        );

        if (!payment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No successful payment found for this order",
          });
        }

        if (!payment.stripeChargeId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment has no charge ID",
          });
        }

        // 4. Check if already refunded
        const existingRefund = await tx.query.refunds.findFirst({
          where: (r, { and, eq }) =>
            and(
              eq(r.orderItemId, input.orderItemId),
              eq(r.status, "succeeded"),
            ),
        });

        if (existingRefund) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This item has already been refunded",
          });
        }

        // 5. Check refund policy window (e.g., 30 days)
        const orderDate = new Date(orderItem.order.createdAt);
        const daysSinceOrder =
          (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceOrder > 30) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Refund window has expired (30 days)",
          });
        }

        // 6. Calculate refund amount
        const itemTotal =
          parseFloat(orderItem.subtotal) +
          parseFloat(orderItem.shippingCost);
        const refundAmount = input.amount ?? itemTotal;

        if (refundAmount > itemTotal) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Refund amount exceeds item total",
          });
        }

        // 7. Create refund in Stripe
        let stripeRefund;
        try {
          stripeRefund = await stripeService.createRefund({
            chargeId: payment.stripeChargeId,
            amount: refundAmount,
            reason: input.reason,
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to process refund: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }

        // 8. Create refund record
        const [refundRecord] = await tx
          .insert(refunds)
          .values({
            paymentId: payment.id,
            orderId: orderItem.orderId,
            orderItemId: input.orderItemId,
            stripeRefundId: stripeRefund.id,
            amount: refundAmount.toFixed(2),
            reason: input.reason,
            description: input.description,
            status: "pending", // Will be updated by webhook
          })
          .returning();

        // 9. Update order item status
        await tx
          .update(orderItems)
          .set({
            status: "refunded",
            updatedAt: new Date(),
          })
          .where(eq(orderItems.id, input.orderItemId));

        // 10. If item wasn't shipped yet, restore inventory
        if (
          orderItem.status === "pending" ||
          orderItem.status === "processing"
        ) {
          await tx
            .update(parts)
            .set({
              quantity: sql`${parts.quantity} + ${orderItem.quantity}`,
              status: sql`CASE WHEN ${parts.quantity} + ${orderItem.quantity} > 0 THEN 'active' ELSE ${parts.status} END`,
            })
            .where(eq(parts.id, orderItem.partId));
        }

        return {
          refundId: refundRecord!.id,
          stripeRefundId: stripeRefund.id,
          amount: refundAmount,
          status: "pending",
        };
      });
    }),

  /**
   * Get refund status
   */
  getRefundStatus: privateProcedure
    .input(z.string()) // refundId
    .query(async ({ ctx, input }) => {
      const refund = await db.query.refunds.findFirst({
        where: (r, { eq }) => eq(r.id, input),
        with: {
          order: {
            columns: {
              buyerId: true,
            },
          },
        },
      });

      if (!refund) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Refund not found",
        });
      }

      // Verify buyer owns this refund
      if (refund.order.buyerId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this refund",
        });
      }

      return {
        status: refund.status,
        amount: refund.amount,
        reason: refund.reason,
        processedAt: refund.processedAt,
      };
    }),

  /**
   * Cancel payment intent (before payment succeeds)
   * Useful if user abandons checkout
   */
  cancelPaymentIntent: privateProcedure
    .input(z.string()) // orderId
    .mutation(async ({ ctx, input }) => {
      return await db.transaction(async (tx) => {
        // Get order and payment
        const order = await tx.query.orders.findFirst({
          where: (o, { eq }) => eq(o.id, input),
          with: {
            payments: true,
          },
        });

        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        // Verify buyer owns this order
        if (order.buyerId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to cancel this payment",
          });
        }

        const payment = order.payments.find((p) => p.status === "pending");

        if (!payment) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No pending payment found for this order",
          });
        }

        // Cancel in Stripe
        try {
          await stripeService.cancelPaymentIntent(
            payment.stripePaymentIntentId,
          );
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to cancel payment: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }

        // Update payment status
        await tx
          .update(payments)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        // Update order status
        await tx
          .update(orders)
          .set({
            status: "cancelled",
            paymentStatus: "cancelled",
            cancelledAt: new Date(),
          })
          .where(eq(orders.id, input));

        return { success: true };
      });
    }),

  /**
   * Get buyer's payment history
   */
  getMyPayments: privateProcedure.query(async ({ ctx }) => {
    const userOrders = await db.query.orders.findMany({
      where: (order, { eq }) => eq(order.buyerId, ctx.user.id),
      columns: {
        id: true,
      },
    });

    const orderIds = userOrders.map((o) => o.id);

    if (orderIds.length === 0) {
      return [];
    }

    const allPayments = await db.query.payments.findMany({
      where: (payment, { inArray }) => inArray(payment.orderId, orderIds),
      with: {
        order: {
          columns: {
            orderNumber: true,
            total: true,
          },
        },
      },
      orderBy: (payment, { desc }) => [desc(payment.createdAt)],
    });

    return allPayments;
  }),
});
