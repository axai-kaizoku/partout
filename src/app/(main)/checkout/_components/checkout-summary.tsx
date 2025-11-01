"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Shield, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CheckoutSummary() {
  const { items, getTotalItems, getTotalPrice, getShippingTotal, getSellerGroups } = useCart();
  const sellerGroups = getSellerGroups();

  const subtotal = getTotalPrice();
  const shipping = getShippingTotal();
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + shipping + tax;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Items by Seller */}
        <div className="space-y-4">
          {Object.entries(sellerGroups).map(([sellerId, sellerItems]) => {
            const seller = sellerItems[0].seller;
            return (
              <div key={sellerId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{seller.name}</span>
                  {seller.verified && (
                    <Badge variant="outline" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                {sellerItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="line-clamp-1">{item.title}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({getTotalItems()} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="h-3 w-3" />
            <span>We accept all major credit cards</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>30-day return policy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
