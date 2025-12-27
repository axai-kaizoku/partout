"use client";

import { useCart } from "@/hooks/use-cart";
import { Check, Package, Truck } from "lucide-react";

export function ShippingRateSelector() {
  const { shippingRates, selectShippingRate, getSelectedShippingRate } =
    useCart();

  if (shippingRates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Shipping Options</h3>

      {shippingRates.map((sellerRates) => (
        <div key={sellerRates.sellerId} className="space-y-3">
          {/* Seller header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>
              Items from {sellerRates.sellerName ?? "Seller"} - Select shipping
              method:
            </span>
          </div>

          {/* Shipping options */}
          <div className="space-y-2">
            {sellerRates.rates.map((rate) => {
              const isSelected = rate.rateId === sellerRates.selectedRateId;

              return (
                <button
                  key={rate.rateId}
                  type="button"
                  onClick={() => selectShippingRate(sellerRates.sellerId, rate.rateId)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Carrier info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {rate.carrier} - {rate.service}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Estimated delivery:{" "}
                          {rate.estimatedDays === 1
                            ? "1 business day"
                            : `${rate.estimatedDays} business days`}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ${rate.amount.toFixed(2)}
                      </p>
                      {rate.estimatedDays <= 2 && (
                        <span className="text-xs text-primary">Fast</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Shipping:</span>
          <span className="text-lg font-semibold">
            $
            {shippingRates
              .reduce((total, sellerRates) => {
                const selected = getSelectedShippingRate(sellerRates.sellerId);
                return total + (selected?.amount ?? 0);
              }, 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
