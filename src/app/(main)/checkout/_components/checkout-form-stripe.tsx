"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/hooks/use-cart";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { ShippingRateSelector } from "./shipping-rate-selector";

// Load Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

/**
 * Checkout form with Stripe Elements integration
 */
function CheckoutFormInner({
  shippingAddressId,
}: {
  shippingAddressId: string;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const {
    items,
    clearCart,
    shippingRates,
    getSelectedShippingRate,
    calculateShipping,
    isCalculatingShipping,
  } = useCart();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");

  const createOrder = api.order.createOrder.useMutation();

  // Calculate shipping on mount
  useEffect(() => {
    if (items.length > 0 && shippingAddressId) {
      calculateShipping(shippingAddressId);
    }
  }, [shippingAddressId, items.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Validate shipping rates are selected
      if (shippingRates.length === 0) {
        throw new Error("Please wait for shipping rates to load");
      }

      // 2. Create order and get payment intent
      const orderData = await createOrder.mutateAsync({
        items: items.map((item) => {
          const selectedRate = getSelectedShippingRate(item.seller.id);
          if (!selectedRate) {
            throw new Error(
              `No shipping rate selected for seller ${item.seller.name}`,
            );
          }

          return {
            partId: item.id,
            quantity: item.quantity,
            selectedRateId: selectedRate.rateId,
            shippingCost: selectedRate.amount,
          };
        }),
        shippingAddressId,
      });

      setClientSecret(orderData.clientSecret!);

      // 3. Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success?orderId=${orderData.orderId}`,
        },
      });

      if (stripeError) {
        setError(
          stripeError.message ?? "Payment failed. Please try again.",
        );
      } else {
        // Payment succeeded, webhook will handle backend updates
        clearCart();
        router.push(`/order-success?orderId=${orderData.orderId}`);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process order. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCalculatingShipping) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">
            Calculating shipping rates...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Method</CardTitle>
        </CardHeader>
        <CardContent>
          <ShippingRateSelector />
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing || shippingRates.length === 0}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          "Place Order"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Your payment information is secure and encrypted
      </p>
    </form>
  );
}

/**
 * Wrapper component with Stripe Elements provider
 */
export function StripeCheckoutForm({
  shippingAddressId,
}: {
  shippingAddressId: string;
}) {
  const [clientSecret, setClientSecret] = useState("");
  const createOrder = api.order.createOrder.useMutation();

  // You could optionally create payment intent earlier here
  // For now, we create it during form submission

  return (
    <Elements
      stripe={stripePromise}
      options={{
        // Stripe Elements options
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0F172A",
          },
        },
      }}
    >
      <CheckoutFormInner shippingAddressId={shippingAddressId} />
    </Elements>
  );
}
