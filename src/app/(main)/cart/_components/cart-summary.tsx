"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Truck, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";

export function CartSummary() {
  const router = useRouter();
  const { getTotalItems, getTotalPrice, getShippingTotal } = useCart();

  const subtotal = getTotalPrice();
  const shipping = getShippingTotal();
  const total = subtotal + shipping;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Items ({getTotalItems()})</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
          Proceed to Checkout
        </Button>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>Secure checkout with SSL encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-3 w-3" />
            <span>Free returns within 30 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
