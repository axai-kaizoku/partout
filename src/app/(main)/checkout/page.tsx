"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "./_components/checkout-form";
import { CheckoutSummary } from "./_components/checkout-summary";

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
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
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
