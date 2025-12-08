'use client'
import { AddressForm } from "@/components/seller/address-form/address-form";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter()
  return (
    <main className="pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">Add your new address</h1>
        <AddressForm onSuccess={() => router.back()} />
      </div>
    </main>
  );
}
