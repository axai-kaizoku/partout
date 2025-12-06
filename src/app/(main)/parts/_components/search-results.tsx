"use client"

import { PartCard } from "@/components/parts/part-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Part } from "@/server/db/schema"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface SearchResultsProps {
  filters?: {
    category: string
    brand: string
    model: string
    year: string
    condition: string
    priceRange: number[]
    location: string
    negotiable: boolean
  };
  data: Part[]
}

export function SearchResults({ data }: SearchResultsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "relevance")

  return (
    <div className="p-4">
      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold font-playfair text-foreground text-xl">Search Results</h2>
          <p className="text-muted-foreground text-sm">{data?.length} parts found</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <Select value={sortBy} defaultValue="relevance" onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              {/* <SelectItem value="rating">Highest Rated</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid/List */}
      {data?.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">No parts found matching your criteria</p>
          <Button variant="outline">Clear Filters</Button>
        </div>
      ) : (
        <div className={"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"}>
          {data?.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  )
}
