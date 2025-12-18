// "use client";

import type { Metadata } from "next";
import { Suspense } from "react";
import { urlParamsToFilters } from "@/lib/url-params";
import { api } from "@/trpc/server";
import {
  SearchPageClient,
  SearchPageSkeleton,
} from "./_components/search-client";

export const metadata: Metadata = {
  title: "Search Parts",
  description: "Search for car parts on Partout",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    urlSearchParams.set(key, String(value));
  });

  const { filters, sortBy } = urlParamsToFilters(urlSearchParams);
  const searchQuery = urlSearchParams.get("q") ?? "";

  // console.log({ filters, sortBy })

  const data = await api.part.getSearchResults({
    filters: {
      brand: filters.brand,
      category: filters.category,
      model: filters.model,
      year: Number(filters.year),
      condition: filters.condition,
      priceRange: filters.priceRange as [number, number],
      negotiable: filters.negotiable,
    },
    sort: sortBy,
    search: searchQuery,
  });

  return (
    <div className="min-h-screen pb-20">
      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageClient
          initialFilters={filters}
          initialSortBy={sortBy}
          initialSearchQuery={searchQuery}
          data={data}
        />
      </Suspense>
    </div>
  );
}
