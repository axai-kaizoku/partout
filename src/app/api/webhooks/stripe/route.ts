import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/server/db";
import { orders, payments, parts, orderItems } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { stripeService } from "@/server/services/stripe";

/**
 * Stripe webhook handler
 * Handles payment events from Stripe
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripeService.verifyWebhookSignature(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      case "refund.created":
      case "refund.updated": {
        const refund = event.data.object as Stripe.Refund;
        await handleRefund(refund);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing webhook:", error);
    return NextResponse.json(
      {
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  await db.transaction(async (tx) => {
    // 1. Update payment record
    const [payment] = await tx
      .update(payments)
      .set({
        status: "succeeded",
        stripeChargeId:
          typeof paymentIntent.latest_charge === "string"
            ? paymentIntent.latest_charge
            : null,
        paymentMethod: paymentIntent.payment_method_types[0],
        succeededAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
      .returning();

    if (!payment) {
      console.error(
        `[Stripe Webhook] Payment not found for Payment Intent: ${paymentIntent.id}`,
      );
      return;
    }

    console.log(
      `[Stripe Webhook] Payment ${payment.id} succeeded for order ${payment.orderId}`,
    );

    // 2. Update order status
    await tx
      .update(orders)
      .set({
        status: "paid",
        paymentStatus: "succeeded",
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, payment.orderId));

    // 3. Get order items to deduct inventory
    const items = await tx.query.orderItems.findMany({
      where: (item, { eq }) => eq(item.orderId, payment.orderId),
    });

    // 4. Deduct inventory atomically
    for (const item of items) {
      const [updatedPart] = await tx
        .update(parts)
        .set({
          quantity: sql`GREATEST(0, ${parts.quantity} - ${item.quantity})`,
          status: sql`CASE
            WHEN ${parts.quantity} - ${item.quantity} <= 0 THEN 'sold'
            ELSE ${parts.status}
          END`,
        })
        .where(eq(parts.id, item.partId))
        .returning();

      console.log(
        `[Stripe Webhook] Deducted ${item.quantity} from part ${item.partId}. New quantity: ${updatedPart?.quantity}`,
      );
    }

    // 5. Update order items status
    await tx
      .update(orderItems)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(orderItems.orderId, payment.orderId));

    console.log(`[Stripe Webhook] Order ${payment.orderId} marked as paid`);

    // TODO: Send order confirmation email to buyer
    // TODO: Send new order notification to sellers
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  await db.transaction(async (tx) => {
    const failureCode =
      paymentIntent.last_payment_error?.code ?? "unknown_error";
    const failureMessage =
      paymentIntent.last_payment_error?.message ?? "Payment failed";

    // Update payment record
    const [payment] = await tx
      .update(payments)
      .set({
        status: "failed",
        failureCode,
        failureMessage,
        failedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
      .returning();

    if (!payment) {
      console.error(
        `[Stripe Webhook] Payment not found for Payment Intent: ${paymentIntent.id}`,
      );
      return;
    }

    console.log(
      `[Stripe Webhook] Payment ${payment.id} failed: ${failureMessage}`,
    );

    // Update order status
    await tx
      .update(orders)
      .set({
        status: "payment_failed",
        paymentStatus: "failed",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, payment.orderId));

    // TODO: Send payment failure notification to buyer
  });
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  await db.transaction(async (tx) => {
    const [payment] = await tx
      .update(payments)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, paymentIntent.id))
      .returning();

    if (!payment) {
      console.error(
        `[Stripe Webhook] Payment not found for Payment Intent: ${paymentIntent.id}`,
      );
      return;
    }

    console.log(`[Stripe Webhook] Payment ${payment.id} canceled`);

    await tx
      .update(orders)
      .set({
        status: "cancelled",
        paymentStatus: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, payment.orderId));
  });
}

/**
 * Handle refund creation/update
 */
async function handleRefund(refund: Stripe.Refund) {
  await db.transaction(async (tx) => {
    // Find the refund record by Stripe refund ID
    const refundRecord = await tx.query.refunds.findFirst({
      where: (r, { eq }) => eq(r.stripeRefundId, refund.id),
      with: {
        payment: true,
        orderItem: true,
      },
    });

    if (!refundRecord) {
      console.error(
        `[Stripe Webhook] Refund record not found for Stripe refund: ${refund.id}`,
      );
      return;
    }

    const refundStatus =
      refund.status === "succeeded"
        ? "succeeded"
        : refund.status === "failed"
          ? "failed"
          : "pending";

    // Update refund status
    await tx
      .update(payments)
      .set({
        status: refundStatus,
        processedAt: refund.status === "succeeded" ? new Date() : null,
      })
      .where(eq(payments.id, refundRecord.id));

    // If refund succeeded, restore inventory if item wasn't shipped
    if (refund.status === "succeeded" && refundRecord.orderItem) {
      const orderItem = refundRecord.orderItem;

      if (
        orderItem.status === "pending" ||
        orderItem.status === "processing"
      ) {
        await tx
          .update(parts)
          .set({
            quantity: sql`${parts.quantity} + ${orderItem.quantity}`,
            status: sql`CASE
              WHEN ${parts.quantity} + ${orderItem.quantity} > 0 THEN 'active'
              ELSE ${parts.status}
            END`,
          })
          .where(eq(parts.id, orderItem.partId));

        console.log(
          `[Stripe Webhook] Restored ${orderItem.quantity} to part ${orderItem.partId}`,
        );
      }
    }

    console.log(`[Stripe Webhook] Refund ${refund.id} status: ${refundStatus}`);
  });
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  // Find payment by charge ID
  const payment = await db.query.payments.findFirst({
    where: (p, { eq }) => eq(p.stripeChargeId, charge.id),
  });

  if (!payment) {
    console.error(
      `[Stripe Webhook] Payment not found for charge: ${charge.id}`,
    );
    return;
  }

  // Check if fully or partially refunded
  const isFullyRefunded = charge.refunded;
  const refundedAmount = charge.amount_refunded;

  await db
    .update(payments)
    .set({
      status: isFullyRefunded ? "refunded" : "partially_refunded",
      updatedAt: new Date(),
    })
    .where(eq(payments.id, payment.id));

  // Update order payment status
  await db
    .update(orders)
    .set({
      paymentStatus: isFullyRefunded ? "refunded" : "partially_refunded",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, payment.orderId));

  console.log(
    `[Stripe Webhook] Charge ${charge.id} refunded: ${stripeService.centsToDollars(refundedAmount)}`,
  );
}
