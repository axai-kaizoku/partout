"use client";

import { CheckCircle, Clock, Package, Truck, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";

export function OrderHistory() {
  const { data: orders, isLoading, error } = api.order.getMyOrders.useQuery();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "shipped":
      case "partially_shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "paid":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "partially_shipped":
        return "bg-blue-100 text-blue-800";
      case "paid":
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split("_").map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 font-playfair text-xl font-bold text-foreground">
          No Orders Yet
        </h3>
        <p className="mb-4 text-muted-foreground">
          Start shopping to see your orders here
        </p>
        <Button asChild>
          <Link href="/parts">Browse Parts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{getStatusLabel(order.status)}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="font-medium text-foreground">
                ${parseFloat(order.total).toFixed(2)}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {order.orderItems.map((item, index) => (
              <div key={item.id}>
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="line-clamp-2 font-medium text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {item.condition}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                {index < order.orderItems.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>${parseFloat(order.shippingTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span>${parseFloat(order.taxTotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total:</span>
                <span>${parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {order.status === "shipped" || order.status === "delivered" ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/track/${order.id}`}>
                    <Truck className="mr-2 h-4 w-4" />
                    Track Package
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/order/${order.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
