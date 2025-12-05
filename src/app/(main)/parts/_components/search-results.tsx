"use client"

import { PartCard } from "@/components/parts/part-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/trpc/react"
import { useState } from "react"

interface SearchResultsProps {
  filters: {
    category: string
    brand: string
    model: string
    year: string
    condition: string
    priceRange: number[]
    location: string
    negotiable: boolean
  }
}

export function SearchResults({ filters }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState("relevance")
  // const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Mock filtered results based on filters
  // const mockResults = [
  //   {
  //     id: 1,
  //     title: "BMW E46 Brake Pads - Front Set",
  //     price: 89.99,
  //     originalPrice: 120.0,
  //     condition: "New",
  //     brand: "BMW",
  //     model: "E46 3 Series",
  //     year: "1999-2006",
  //     // image: "/placeholder.svg?height=200&width=300&text=BMW+Brake+Pads",
  //     seller: {
  //       name: "AutoParts Pro",
  //       rating: 4.8,
  //       verified: true,
  //       location: "Los Angeles, CA",
  //     },
  //     negotiable: true,
  //     category: "Brake System",
  //   },
  //   {
  //     id: 2,
  //     title: "Honda Civic Engine Air Filter",
  //     price: 24.99,
  //     condition: "New",
  //     brand: "Honda",
  //     model: "Civic",
  //     year: "2016-2021",
  //     // image: "/placeholder.svg?height=200&width=300&text=Honda+Air+Filter",
  //     seller: {
  //       name: "Civic Specialist",
  //       rating: 4.9,
  //       verified: true,
  //       location: "Miami, FL",
  //     },
  //     negotiable: false,
  //     category: "Engine Parts",
  //   },
  //   // Add more mock results...
  // ].filter((item) => {
  //   // Apply filters
  //   if (filters.category && item.category !== filters.category) return false
  //   if (filters.brand && item.brand !== filters.brand) return false
  //   if (filters.condition && item.condition !== filters.condition) return false
  //   if (filters.negotiable && !item.negotiable) return false
  //   if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) return false
  //   return true
  // })

  // const sortedResults = [...mockResults].sort((a, b) => {
  //   switch (sortBy) {
  //     case "price-low":
  //       return a.price - b.price
  //     case "price-high":
  //       return b.price - a.price
  //     case "newest":
  //       return b.id - a.id
  //     case "rating":
  //       return b.seller.rating - a.seller.rating
  //     default:
  //       return 0
  //   }
  // })

  const { data: sortedResults } = api.part.getHomePageParts.useQuery()

  return (
    <div className="p-4">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-xl font-bold text-foreground">Search Results</h2>
          <p className="text-sm text-muted-foreground">{sortedResults?.length} parts found</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {/* <div className="flex border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div> */}

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Grid/List */}
      {sortedResults?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No parts found matching your criteria</p>
          <Button variant="outline">Clear Filters</Button>
        </div>
      ) : (
        <div className={"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"}>
          {sortedResults?.map((part) => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  )
}
