"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface SearchFiltersProps {
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
  setFilters: (filters: any) => void
}

export function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const categories = [
    "Engine Parts",
    "Brake System",
    "Electrical",
    "Body Parts",
    "Suspension",
    "Exhaust",
    "Interior",
    "Exterior",
    "Tools",
    "Accessories",
  ]

  const brands = [
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Toyota",
    "Honda",
    "Ford",
    "Chevrolet",
    "Nissan",
    "Hyundai",
    "Volkswagen",
    "Jeep",
    "Subaru",
  ]

  const conditions = ["New", "Used - Excellent", "Used - Good", "Used - Fair", "Refurbished"]

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      model: "",
      year: "",
      condition: "",
      priceRange: [0, 1000],
      location: "",
      negotiable: false,
    })
  }

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== false && !(Array.isArray(value) && value[0] === 0 && value[1] === 1000),
  ).length

  return (
    <div className="p-4 space-y-6 max-h-screen overflow-y-auto">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters ({activeFiltersCount})</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("category", "")} />
                </Badge>
              )}
              {filters.brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.brand}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("brand", "")} />
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.condition}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("condition", "")} />
                </Badge>
              )}
              {filters.negotiable && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Negotiable
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("negotiable", false)} />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Brand & Model */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <Label htmlFor="brand" className="text-xs text-muted-foreground">
              Brand
            </Label>
            <Select value={filters.brand} onValueChange={(value) => updateFilter("brand", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="model" className="text-xs text-muted-foreground">
              Model
            </Label>
            <Input
              id="model"
              placeholder="Enter model"
              value={filters.model}
              onChange={(e) => updateFilter("model", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="year" className="text-xs text-muted-foreground">
              Year
            </Label>
            <Input
              id="year"
              placeholder="e.g. 2015-2020"
              value={filters.year}
              onChange={(e) => updateFilter("year", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Condition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Condition</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={filters.condition} onValueChange={(value) => updateFilter("condition", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map((condition) => (
                <SelectItem key={condition} value={condition}>
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Location</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Input
            placeholder="City, State or ZIP"
            value={filters.location}
            onChange={(e) => updateFilter("location", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Options</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="negotiable"
              checked={filters.negotiable}
              onCheckedChange={(checked) => updateFilter("negotiable", checked)}
            />
            <Label htmlFor="negotiable" className="text-sm">
              Negotiable price only
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
