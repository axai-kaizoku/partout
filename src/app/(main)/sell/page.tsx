'use client';
import { SellerDashboard } from "@/components/seller/seller-dashboard";
import { SellerOnboarding } from "@/components/seller/seller-onboarding";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function SellPage() {
  const { data: user, isLoading } = api.user.getUser.useQuery();

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
        {user?.isSeller ? (
          <SellerDashboard />
        ) : (
          <SellerOnboarding />
        )}
      </div>
    </main>
  );
}
