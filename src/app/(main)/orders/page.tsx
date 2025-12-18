"use client";

import { OrderHistory } from "../profile/_components/profile-tabs/order-history";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">
            Order History
          </h1>
          <OrderHistory />
        </div>
      </main>
    </div>
  );
}
