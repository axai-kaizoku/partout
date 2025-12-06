// "use client";

import { urlParamsToFilters } from "@/lib/url-params";
import { api } from "@/trpc/server";
import { SearchFilters } from "./_components/search-filters";
import { SearchResults } from "./_components/search-results";

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
    <main className="pb-20">
      <div className="sticky top-16 z-40 border-border border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold font-playfair text-foreground text-xl">Search Parts</h1>
          {/* <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button> */}
        </div>
      </div>

      <div className="flex">
        <div className="hidden w-80 border-border border-r md:block">
          <SearchFilters initialFilters={filters} initialSortBy={sortBy} initialSearchQuery={searchQuery} />
        </div>
        {/* 
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="flex items-center justify-between border-border border-b p-4">
              <h2 className="font-bold font-playfair text-lg">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                Done
              </Button>
            </div>
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>
        )} */}

        <div className="flex-1">
          <SearchResults data={data} />
        </div>
      </div>
    </main>
  );
}
