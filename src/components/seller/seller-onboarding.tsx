'use client';

import { useState } from "react";
import { ArrowRight, CheckCircle2, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressForm } from "@/components/seller/address-form/address-form";
import { ShippingProfilesForm } from "@/components/seller/shipping-profiles-form/shipping-profiles-form";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type OnboardingStep = 'welcome' | 'address' | 'shipping' | 'complete';

export function SellerOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const utils = api.useUtils();

  const addresses = api.address.getAllAddresses.useQuery();
  const shippingProfiles = api.shipping.getAllShippingProfiles.useQuery();
  const { mutateAsync: updateSellerStatus } = api.user.updateSellerStatus.useMutation();

  const hasAddress = (addresses.data?.length ?? 0) > 0;
  const hasShipping = (shippingProfiles.data?.length ?? 0) > 0;

  const handleAddressSuccess = () => {
    toast.success("Address added successfully!");
    addresses.refetch();

    // If they already have shipping, complete onboarding
    if (hasShipping) {
      completeOnboarding();
    } else {
      setCurrentStep('shipping');
    }
  };

  const handleShippingSuccess = async () => {
    toast.success("Shipping profile added successfully!");
    shippingProfiles.refetch();

    // Complete onboarding
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await updateSellerStatus({ isSeller: true });
      await utils.user.getUser.invalidate();
      setCurrentStep('complete');
      toast.success("Welcome to selling on Partout!");

      // Reload the page after a short delay to show completion message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      toast.error("Failed to complete setup. Please try again.");
    }
  };

  const handleGetStarted = () => {
    if (!hasAddress) {
      setCurrentStep('address');
    } else if (!hasShipping) {
      setCurrentStep('shipping');
    } else {
      completeOnboarding();
    }
  };

  if (currentStep === 'complete') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">You're All Set!</CardTitle>
            <CardDescription>
              Your seller account is now active. Start listing your parts!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (currentStep === 'address') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-bold text-2xl">Add Your Address</h2>
          <p className="text-muted-foreground">
            Let buyers know where you're located. This will be your default address.
          </p>
        </div>
        <AddressForm onSuccess={handleAddressSuccess} />
      </div>
    );
  }

  if (currentStep === 'shipping') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-bold text-2xl">Set Up Shipping</h2>
          <p className="text-muted-foreground">
            Configure your shipping options for buyers. This will be your default shipping profile.
          </p>
        </div>
        <ShippingProfilesForm onSuccess={handleShippingSuccess} />
      </div>
    );
  }

  // Welcome step
  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Become a Seller</CardTitle>
          <CardDescription className="text-base">
            Start selling auto parts on Partout. Complete these steps to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={hasAddress ? "border-green-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <MapPin className="h-8 w-8 text-primary" />
                  {hasAddress && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <CardTitle className="text-xl">Add Address</CardTitle>
                <CardDescription>
                  {hasAddress
                    ? "You have an address on file"
                    : "Add your business or personal address"}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className={hasShipping ? "border-green-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Package className="h-8 w-8 text-primary" />
                  {hasShipping && (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <CardTitle className="text-xl">Shipping Profile</CardTitle>
                <CardDescription>
                  {hasShipping
                    ? "You have a shipping profile set up"
                    : "Set up your shipping options"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="gap-2"
            >
              {hasAddress && hasShipping ? (
                <>Complete Setup</>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold">What happens next?</p>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Add your address for shipping and location display</li>
              <li>• Configure your shipping rates and delivery options</li>
              <li>• Start creating listings for your auto parts</li>
              <li>• Connect with buyers across the platform</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
