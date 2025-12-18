"use client";
import { unauthorized } from "next/navigation";
import { SellerDashboard } from "@/components/seller/seller-dashboard";
import { SellerOnboarding } from "@/components/seller/seller-onboarding";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function SellPage() {
  const {
    data: user,
    isLoading,
    isError,
  } = api.user.getUser.useQuery(undefined, { retry: 1 });

  if ((!user && !isLoading) || isError) {
    return unauthorized();
  }

  if (isLoading) {
    return (
      <main className="pb-20">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {user?.isSeller ? <SellerDashboard /> : <SellerOnboarding />}
      </div>
    </main>
  );
}
