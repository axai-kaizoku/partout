"use client";

import { OrderHistory } from "../profile/_components/profile-tabs/order-history";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-6">Order History</h1>
          <OrderHistory />
        </div>
      </main>
    </div>
  );
}
