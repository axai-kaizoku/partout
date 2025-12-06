"use client"

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
import { X } from "lucide-react"
import { type Filters, filtersToUrlParams, urlParamsToFilters } from "@/lib/url-params"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"

export function SearchFilters({ initialSearchQuery, initialFilters, initialSortBy }: { initialSearchQuery: string, initialFilters: Filters, initialSortBy?: string }) {
  const router = useRouter()
  const isUrlUpdateRef = useRef(false)
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const searchQuery = useMemo(() => initialSearchQuery, [initialSearchQuery])

  const [sortBy, setSortBy] = useState(initialSortBy ?? "relevance")


  const [filters, setFilters] = useState<Filters>(initialFilters)
  // const params = filtersToUrlParams(filters, "relevance")
  // console.log({ params: params.toString() })

  useEffect(() => {
    const params = filtersToUrlParams(filters, sortBy)
    if (searchQuery) params.set("q", searchQuery)
    const newUrl = `?${params.toString()}`

    // Only push if URL is different
    if (window.location.search !== newUrl) {
      isUrlUpdateRef.current = true
      startTransition(() => {
        router.replace(newUrl)
      })
    }
  }, [filters, searchQuery, sortBy])


  useEffect(() => {
    if (isUrlUpdateRef.current) {
      isUrlUpdateRef.current = false
      return // Skip if the change was triggered by our own update
    }

    const { filters: updatedFilters, sortBy: updatedSortBy } = urlParamsToFilters(searchParams)

    if (JSON.stringify(updatedFilters) !== JSON.stringify(filters)) {
      setFilters(updatedFilters)
    }
    if (updatedSortBy !== sortBy) {
      setSortBy(updatedSortBy)
    }
  }, [searchParams])

  // useEffect(() => {
  //   const currentSort = searchParams.get("sort") || "relevance"
  //   const params = filtersToUrlParams(filters, currentSort)
  //   router.push(`/parts?${params.toString()}`)
  // }, [filters, router, searchParams])

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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
    <div className="max-h-screen space-y-6 overflow-y-auto p-4">
      <ActiveFilters
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        count={activeFiltersCount}
      />

      <CategoryFilter
        filters={filters}
        updateFilter={updateFilter}
      />

      <VehicleFilter
        filters={filters}
        updateFilter={updateFilter}
      />

      <ConditionFilter
        filters={filters}
        updateFilter={updateFilter}
      />

      <PriceRangeFilter
        filters={filters}
        updateFilter={updateFilter}
      />

      <LocationFilter
        filters={filters}
        updateFilter={updateFilter}
      />

      <OptionsFilter
        filters={filters}
        updateFilter={updateFilter}
      />
    </div>
  )
}

function ActiveFilters({
  filters,
  updateFilter,
  clearFilters,
  count,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
  clearFilters: () => void
  count: number
}) {
  if (count === 0) return null

  return (
    <Card className="gap-3">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Active Filters ({count})</CardTitle>
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
  )
}

function CategoryFilter({
  filters,
  updateFilter,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
}) {

  const categories = api.partInfo.getCategories.useQuery().data?.map((category) => category.name) ?? []
  return (
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
  )
}

function VehicleFilter({
  filters,
  updateFilter,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
}) {
  const brands = api.partInfo.getMakes.useQuery().data?.map((brand) => brand.name) ?? []

  const [model, setModel] = useState(filters.model)
  const [year, setYear] = useState(filters.year)

  // Sync local state with parent state (in case filters are cleared)
  useEffect(() => {
    setModel(filters.model)
  }, [filters.model])

  useEffect(() => {
    setYear(filters.year)
  }, [filters.year])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (model !== filters.model) {
        updateFilter("model", model)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [model, updateFilter, filters.model])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (year !== filters.year) {
        updateFilter("year", year)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [year, updateFilter, filters.year])

  return (
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
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="year" className="text-muted-foreground text-xs">
            Year
          </Label>
          <Input
            id="year"
            placeholder="e.g. 2015-2020"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ConditionFilter({
  filters,
  updateFilter,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
}) {
  const conditions = useMemo(() => _conditions, [])

  return (
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
  )
}

function PriceRangeFilter({
  filters,
  updateFilter,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
}) {

  const [range, setRange] = useState(filters.priceRange)

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm">Price Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="px-2">
          <Slider
            value={range}
            onValueChange={(value) => setRange(value)}
            onValueCommit={(value) => updateFilter("priceRange", value)}
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
  )
}

function LocationFilter({
  filters,
  updateFilter,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
}) {
  const [value, setValue] = useState(filters.location)

  useEffect(() => {
    setValue(filters.location)
  }, [filters.location])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== filters.location) {
        updateFilter("location", value)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [value, updateFilter, filters.location])

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="text-sm">Location</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Input
          placeholder="City, State or ZIP"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </CardContent>
    </Card>
  )
}

function OptionsFilter({
  filters,
  updateFilter,
}: {
  filters: Filters
  updateFilter: (key: string, value: any) => void
}) {
  return (
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
  )
}
