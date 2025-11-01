"use client";

import { useState } from "react";
import { SearchFilters } from "./_components/search-filters";
import { SearchResults } from "./_components/search-results";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

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
      {/* Search Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-playfair text-xl font-bold text-foreground">Search Parts</h1>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block w-80 border-r border-border">
          <SearchFilters filters={filters} setFilters={setFilters} />
        </div>

        {/* Mobile Filters Overlay */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-background md:hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-playfair text-lg font-bold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                Done
              </Button>
            </div>
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1">
          <SearchResults filters={filters} />
        </div>
      </div>
    </main>
  );
}
