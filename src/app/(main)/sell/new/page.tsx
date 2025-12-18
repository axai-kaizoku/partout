import { NewListingForm } from "@/components/seller/new-listing-form/new-lisiting-form";

export default function NewListingPage() {
  return (
    <main className="pb-20">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">
          List a New Part
        </h1>
        <NewListingForm />
      </div>
    </main>
  );
}
