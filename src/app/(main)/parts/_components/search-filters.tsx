"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { conditions as _conditions } from "@/lib/constants/dropdown-data"
import { api } from "@/trpc/react"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter } from "next/navigation"

export function SearchFilters() {
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
  const router = useRouter()

  useEffect(() => {
    console.log({ filters })
    // router.push(`/parts?${new URLSearchParams(filters).toString()}`)
  }, [filters])

  const categories = api.partInfo.getCategories.useQuery().data?.map((category) => category.name) ?? []

  const brands = api.partInfo.getMakes.useQuery().data?.map((brand) => brand.name) ?? []

  const conditions = _conditions

  // const updateFilter = useDebouncedCallback((key: string, value: any) => {
  //   setFilters({ ...filters, [key]: value })
  // }, 300)

  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  // const updateInputValue = useDebounce((key: string, value: string) => {
  //   updateFilter(key, value)
  // }, 300)

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
    <div className="max-h-screen space-y-6 overflow-y-auto p-4">
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card className="gap-3">
          <CardHeader>
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
                  <button onClick={() => updateFilter("category", "")}>
                    <X className="size-3 cursor-pointer" />
                  </button>
                </Badge>
              )}
              {filters.brand && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.brand}
                  <button onClick={() => updateFilter("brand", "")}>
                    <X className="size-3 cursor-pointer" />
                  </button>
                </Badge>
              )}
              {filters.condition && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.condition}
                  <button onClick={() => updateFilter("condition", "")}>
                    <X className="size-3 cursor-pointer" />
                  </button>
                </Badge>
              )}
              {filters.negotiable && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Negotiable
                  <button onClick={() => updateFilter("negotiable", false)}>
                    <X className="size-3 cursor-pointer" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-sm">Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Brand & Model */}
      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-sm">Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <Label htmlFor="brand" className="text-muted-foreground text-xs">
              Brand
            </Label>
            <Select value={filters.brand} onValueChange={(value) => updateFilter("brand", value)}>
              <SelectTrigger className="w-full">
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
            <Label htmlFor="model" className="text-muted-foreground text-xs">
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
            <Label htmlFor="year" className="text-muted-foreground text-xs">
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
      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-sm">Condition</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={filters.condition} onValueChange={(value) => updateFilter("condition", value)}>
            <SelectTrigger className="w-full">
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

      <Card className="gap-3">
        <CardHeader>
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              // onValueCommit={(value) => updateFilter("priceRange", value)}
              onValueChange={(value) => updateFilter("priceRange", value)}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-muted-foreground text-sm">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}+</span>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="gap-3">
        <CardHeader>
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

      <Card className="gap-3">
        <CardHeader>
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
