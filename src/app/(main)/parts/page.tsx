// "use client";

import { urlParamsToFilters } from "@/lib/url-params";
import { api } from "@/trpc/server";
import { SearchPageClient } from "./_components/search-client";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const urlSearchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return
    urlSearchParams.set(key, String(value))
  })

  const { filters, sortBy } = urlParamsToFilters(urlSearchParams)
  const searchQuery = urlSearchParams.get("q") ?? ""

  // console.log({ filters, sortBy })

  const data = await api.part.getSearchResults({})

  return (
    <div className="min-h-screen pb-20">
      <SearchPageClient initialFilters={filters} initialSortBy={sortBy} initialSearchQuery={searchQuery} data={data} />
    </div>
  );
}
