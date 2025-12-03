import { ShippingProfilesForm } from "@/components/seller/shipping-profiles-form/shipping-profiles-form";

export default function Page() {
  return (
    <main className="pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">Add your new shipping profile</h1>
        <ShippingProfilesForm />
      </div>
    </main>
  );
}
