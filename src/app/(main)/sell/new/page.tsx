"use client";

import { UserForm } from "@/components/seller/new-demo";
import { NewListingForm } from "@/components/seller/new-listing-form";
import { FormTanstackSelect, LisitingFormDemo } from "@/components/seller/new-listing-form-demo";
import { NewNewListingForm } from "@/components/seller/new-new-listing-form";

export default function NewListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="mb-6 font-bold font-playfair text-2xl text-foreground md:text-3xl">List a New Part</h1>
          <NewListingForm />
          <br />
          <br />
          <br />
          <NewNewListingForm />
          {/* <LisitingFormDemo /> */}
          {/* <FormTanstackSelect /> */}
          <UserForm />
        </div>
      </main>
    </div>
  );
}
