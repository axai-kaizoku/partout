import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { shipments, trackingEvents, orderItems } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { shippoService } from "@/server/services/shippo";
import { env } from "@/env";

/**
 * Shippo webhook handler
 * Handles tracking updates from Shippo
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  // TODO: Verify webhook signature
  // Shippo provides a webhook secret that should be verified
  // For now, we'll trust the webhook (in production, verify the signature)

  console.log(`[Shippo Webhook] Received event: ${body.event}`);

  try {
    switch (body.event) {
      case "track_updated":
        await handleTrackingUpdate(body.data);
        break;

      case "transaction_created":
        console.log("[Shippo Webhook] Transaction created");
        break;

      case "transaction_updated":
        console.log("[Shippo Webhook] Transaction updated");
        break;

      default:
        console.log(`[Shippo Webhook] Unhandled event type: ${body.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Shippo Webhook] Error processing webhook:", error);
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
 * Handle tracking update event
 */
async function handleTrackingUpdate(trackingData: {
  tracking_number: string;
  carrier: string;
  tracking_status: {
    status: string;
    status_details: string;
    status_date: string;
    location?: {
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
  tracking_history?: Array<{
    status: string;
    status_details: string;
    status_date: string;
    location?: {
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  }>;
  eta?: string;
}) {
  await db.transaction(async (tx) => {
    // 1. Find shipment by tracking number
    const [shipment] = await tx
      .select()
      .from(shipments)
      .where(eq(shipments.trackingNumber, trackingData.tracking_number));

    if (!shipment) {
      console.error(
        `[Shippo Webhook] Shipment not found for tracking number: ${trackingData.tracking_number}`,
      );
      return;
    }

    console.log(
      `[Shippo Webhook] Updating shipment ${shipment.id} status: ${trackingData.tracking_status.status}`,
    );

    // 2. Map Shippo status to internal status
    const shippoStatus = trackingData.tracking_status.status;
    const mappedStatus = mapShippoStatusToInternal(shippoStatus);

    // 3. Update shipment record
    await tx
      .update(shipments)
      .set({
        trackingStatus: shippoStatus,
        status: mappedStatus,
        deliveredAt:
          shippoStatus === "DELIVERED" ? new Date() : shipment.deliveredAt,
        shippedAt:
          shippoStatus === "TRANSIT" && !shipment.shippedAt
            ? new Date()
            : shipment.shippedAt,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, shipment.id));

    // 4. Create tracking event
    const location = trackingData.tracking_status.location
      ? `${trackingData.tracking_status.location.city}, ${trackingData.tracking_status.location.state}`
      : null;

    await tx.insert(trackingEvents).values({
      shipmentId: shipment.id,
      status: shippoStatus,
      statusDetails: trackingData.tracking_status.status_details,
      location,
      occurredAt: new Date(trackingData.tracking_status.status_date),
    });

    // 5. Update order items if delivered
    if (shippoStatus === "DELIVERED") {
      // Get all order items for this shipment
      const shipmentItemsData = await tx.query.shipmentItems.findMany({
        where: (si, { eq }) => eq(si.shipmentId, shipment.id),
      });

      // Update each order item to delivered status
      for (const si of shipmentItemsData) {
        await tx
          .update(orderItems)
          .set({
            status: "delivered",
            updatedAt: new Date(),
          })
          .where(eq(orderItems.id, si.orderItemId));
      }

      console.log(
        `[Shippo Webhook] Marked ${shipmentItemsData.length} order items as delivered`,
      );

      // TODO: Trigger seller payout for delivered items
      // TODO: Send delivery notification to buyer
    }

    // 6. Update order items if there's a delivery failure
    if (shippoStatus === "FAILURE" || shippoStatus === "RETURNED") {
      const shipmentItemsData = await tx.query.shipmentItems.findMany({
        where: (si, { eq }) => eq(si.shipmentId, shipment.id),
      });

      for (const si of shipmentItemsData) {
        await tx
          .update(orderItems)
          .set({
            status: shippoStatus === "RETURNED" ? "returned" : "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(orderItems.id, si.orderItemId));
      }

      // TODO: Notify seller of delivery failure
      // TODO: Initiate refund process if applicable
    }

    console.log(
      `[Shippo Webhook] Shipment ${shipment.id} updated to status: ${mappedStatus}`,
    );
  });
}

/**
 * Map Shippo tracking status to internal shipment status
 */
function mapShippoStatusToInternal(
  shippoStatus: string,
):
  | "pending"
  | "label_created"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled" {
  const mapping: Record<string, ReturnType<typeof mapShippoStatusToInternal>> =
    {
      UNKNOWN: "pending",
      PRE_TRANSIT: "label_created",
      TRANSIT: "in_transit",
      DELIVERED: "delivered",
      RETURNED: "failed",
      FAILURE: "failed",
      CANCELLED: "cancelled",
    };

  return mapping[shippoStatus] ?? "pending";
}

/**
 * Verify Shippo webhook signature
 * This should be implemented in production
 */
function verifyShippoWebhook(body: string, signature: string): boolean {
  // TODO: Implement signature verification
  // Shippo provides a webhook secret that should be used to verify
  // the signature of incoming webhooks

  // For now, return true (accept all webhooks)
  // In production, implement proper verification
  return true;
}
