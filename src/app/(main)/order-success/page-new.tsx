"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Mail, Package, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const {
    data: order,
    isLoading,
    error,
  } = api.order.getOrderById.useQuery(orderId!, {
    enabled: !!orderId,
  });

  if (!orderId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No order ID provided. Please check your confirmation email.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message ?? "Order not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-accent" />
            </div>
            <CardTitle className="font-playfair text-2xl font-bold">
              Order Confirmed!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Number */}
            <div className="text-center">
              <p className="mb-2 text-muted-foreground">Your order number is:</p>
              <p className="font-mono text-lg font-bold">{order.orderNumber}</p>
            </div>

            {/* Order Summary */}
            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span>${parseFloat(order.shippingTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>${parseFloat(order.taxTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Total:</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h3 className="font-semibold">Items Ordered ({order.orderItems.length})</h3>
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} • {item.condition}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Messages */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Confirmation email sent</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Sellers will be notified to ship your items</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/profile?tab=orders">View Order Details</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full bg-transparent"
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
