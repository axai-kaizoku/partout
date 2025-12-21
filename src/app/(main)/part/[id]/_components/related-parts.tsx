"use client";
import { PartCard } from "@/components/parts/part-card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

interface RelatedPartsProps {
  currentPartId: string;
  category?: string;
}

export function RelatedParts({ currentPartId, category }: RelatedPartsProps) {
  const { data: relatedParts, isPending } = api.part.getRelatedParts.useQuery({
    partId: currentPartId,
    categoryId: category ?? "",
  });
  return (
    <div>
      <h2 className="mb-6 font-bold font-playfair text-2xl text-foreground">
        Related Parts
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedParts?.map((part) => (
          <PartCard part={part} key={part.id} />
        ))}
        {isPending && (
          <div className="col-span-full">
            <Skeleton className="h-48 w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
