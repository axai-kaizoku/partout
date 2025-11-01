"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, ShoppingCart, Grid3X3, List } from "lucide-react"

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Mock filtered results based on filters
  const mockResults = [
    {
      id: 1,
      title: "BMW E46 Brake Pads - Front Set",
      price: 89.99,
      originalPrice: 120.0,
      condition: "New",
      brand: "BMW",
      model: "E46 3 Series",
      year: "1999-2006",
      image: "/placeholder.svg?height=200&width=300&text=BMW+Brake+Pads",
      seller: {
        name: "AutoParts Pro",
        rating: 4.8,
        verified: true,
        location: "Los Angeles, CA",
      },
      negotiable: true,
      category: "Brake System",
    },
    {
      id: 2,
      title: "Honda Civic Engine Air Filter",
      price: 24.99,
      condition: "New",
      brand: "Honda",
      model: "Civic",
      year: "2016-2021",
      image: "/placeholder.svg?height=200&width=300&text=Honda+Air+Filter",
      seller: {
        name: "Civic Specialist",
        rating: 4.9,
        verified: true,
        location: "Miami, FL",
      },
      negotiable: false,
      category: "Engine Parts",
    },
    // Add more mock results...
  ].filter((item) => {
    // Apply filters
    if (filters.category && item.category !== filters.category) return false
    if (filters.brand && item.brand !== filters.brand) return false
    if (filters.condition && item.condition !== filters.condition) return false
    if (filters.negotiable && !item.negotiable) return false
    if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) return false
    return true
  })

  const sortedResults = [...mockResults].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "newest":
        return b.id - a.id
      case "rating":
        return b.seller.rating - a.seller.rating
      default:
        return 0
    }
  })

  return (
    <div className="p-4">
      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-xl font-bold text-foreground">Search Results</h2>
          <p className="text-sm text-muted-foreground">{sortedResults.length} parts found</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-md">
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
          </div>

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
      {sortedResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No parts found matching your criteria</p>
          <Button variant="outline">Clear Filters</Button>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {sortedResults.map((part) => (
            <Card
              key={part.id}
              className={`overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer ${
                viewMode === "list" ? "flex" : ""
              }`}
            >
              <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                <img
                  src={part.image || "/placeholder.svg"}
                  alt={part.title}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    viewMode === "list" ? "w-full h-full" : "w-full h-48"
                  }`}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={part.condition === "New" ? "default" : "secondary"} className="text-xs">
                    {part.condition}
                  </Badge>
                  {part.negotiable && (
                    <Badge variant="outline" className="text-xs bg-background/90">
                      Negotiable
                    </Badge>
                  )}
                </div>
                {part.originalPrice && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      Save ${(part.originalPrice - part.price).toFixed(0)}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {part.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {part.brand} {part.model} • {part.year}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">${part.price}</span>
                      {part.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${part.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">{part.seller.name}</span>
                      {part.seller.verified && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground">{part.seller.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{part.seller.location}</span>
                  </div>

                  <Button className="w-full" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
