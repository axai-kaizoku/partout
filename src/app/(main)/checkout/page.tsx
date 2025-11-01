"use client";

import { CheckoutForm } from "./_components/checkout-form";
import { CheckoutSummary } from "./_components/checkout-summary";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { getTotalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (getTotalItems() === 0) {
      router.push("/cart");
    }
  }, [getTotalItems, router]);

  return (
    <div className="pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
