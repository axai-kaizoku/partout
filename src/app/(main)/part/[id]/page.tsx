import type { Metadata } from "next";
import { api } from "@/trpc/server";
import { CompatibilityTable } from "./_components/compatibility-table";
import { ProductGallery } from "./_components/product-gallery";
import { ProductInfo } from "./_components/product-info";
import { RelatedParts } from "./_components/related-parts";
import { SellerInfo } from "./_components/seller-info";

export const metadata: Metadata = {
  title: "Part Details",
  description:
    "Explore detailed information about this part, including specifications, compatibility, and seller details on Partout.",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const part = await api.part.getPartById(id);

  if (!part) {
    return <div>Part not found</div>;
  }

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Gallery */}
          <ProductGallery partImages={part?.partImages} title={part?.title} />

          {/* Product Info */}
          <ProductInfo part={part} />
        </div>

        {/* Seller Info */}
        <div className="mb-8">
          <SellerInfo seller={part?.seller} />
        </div>

        {/* Compatibility Table */}
        <div className="mb-8">
          <CompatibilityTable compatibility={part?.partCompatibility} />
        </div>

        {/* Reviews */}
        <div className="mb-8">
          {/* <ProductReviews reviews={part?.reviews} rating={part?.seller?.rating} /> */}
        </div>

        {/* Related Parts */}
        <RelatedParts currentPartId={part.id} category={part?.categoryId} />
      </div>
    </main>
  );
}
