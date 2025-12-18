"use client";

import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { CartItems } from "./_components/cart-items";
import { CartSummary } from "./_components/cart-summary";

export default function CartPage() {
  const router = useRouter();
  const { getTotalItems } = useCart();

  if (getTotalItems() === 0) {
    return (
      <main className="flex items-center justify-center px-4 py-20">
        <div className="space-y-6 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <div>
            <h1 className="mb-2 font-bold font-playfair text-2xl text-foreground">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground">
              Start shopping to add items to your cart
            </p>
          </div>
          <Button onClick={() => router.push("/")} size="lg">
            Continue Shopping
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItems />
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </main>
  );
}
