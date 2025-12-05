"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "./_components/search-filters";
import { SearchResults } from "./_components/search-results";

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    priceRange: [0, 1000],
    location: "",
    negotiable: false,
  });

  return (
    <main className="pb-20">
      <div className="sticky top-16 z-40 border-border border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold font-playfair text-foreground text-xl">Search Parts</h1>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex">
        <div className="hidden w-80 border-border border-r md:block">
          <SearchFilters filters={filters} setFilters={setFilters} />
        </div>

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
        )}

        <div className="flex-1">
          <SearchResults filters={filters} />
        </div>
      </div>
    </main>
  );
}
