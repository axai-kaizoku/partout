"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


import { PartCard, PartCardSkeleton } from "@/components/parts/part-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Filters, filtersToUrlParams, urlParamsToFilters } from "@/lib/url-params"
import type { Part } from "@/server/db/schema"
import { ArrowUpDown, SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { SearchFilters } from "./search-filters"
import { sortOptions } from "@/lib/constants/dropdown-data"

const defaultFilters: Filters = {
  category: "",
  brand: "",
  model: "",
  year: "",
  condition: "",
  priceRange: [0, 1000],
  location: "",
  negotiable: false,
}


export const SearchPageClient = ({ initialSearchQuery, initialFilters, initialSortBy, data }: { initialSearchQuery: string, initialFilters: Filters, initialSortBy?: string, data?: Part[] }) => {
  const router = useRouter()
  const isUrlUpdateRef = useRef(false)
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const searchQuery = useMemo(() => initialSearchQuery, [initialSearchQuery])

  const [sortBy, setSortBy] = useState(initialSortBy ?? sortOptions[0].value)

  const [filters, setFilters] = useState<Filters>(initialFilters)

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

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== false && !(Array.isArray(value) && value[0] === 0 && value[1] === 1000),
    ).length
  }, [filters])


  return (
    <div className="flex">
      <aside className="hidden w-80 border-border border-r md:block sticky top-0 h-[calc(100vh-57px)] overflow-y-auto">
        <SearchFilters filters={filters} updateFilter={updateFilter} activeFiltersCount={activeFiltersCount} clearFilters={clearFilters} />
      </aside>
      <div className="flex-1">
        <div className="md:px-4 md:pb-4">
          <div className="sticky z-10 top-0">
            <div className="md:px-4 py-3">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="min-w-0">
                  <h2 className="font-bold font-playfair text-foreground text-xl">Search Results</h2>
                  <p className="text-sm text-muted-foreground md:text-left text-center">
                    <span className="font-medium text-foreground">{data?.length} parts</span>
                    {searchQuery && (
                      <span>
                        {" "}
                        for "<span className="text-foreground">{searchQuery}</span>"
                      </span>
                    )}
                  </p>
                </div>

                {/* Desktop sort */}
                <div className="hidden md:block">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 w-40 bg-background">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mobile: Filter + Sort buttons */}
                <div className="flex items-center gap-2 md:hidden">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 bg-background">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                        {/* {activeFiltersCount > 0 && ( */}
                        <Badge
                          variant="secondary"
                          className="ml-1.5 h-5 min-w-5 rounded-full px-1.5 flex items-center justify-center text-xs"
                        >
                          {/* {activeFiltersCount} */}
                          2
                        </Badge>
                        {/* )} */}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="h-[85vh] rounded-t-xl">
                      <DialogHeader className="border-b border-border pb-4">
                        <div className="flex items-center justify-between">
                          <DialogTitle>Filters</DialogTitle>
                          {activeFiltersCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                              Clear all
                            </Button>
                          )}
                        </div>
                      </DialogHeader>
                      {/* {activeFilterBadges.length > 0 && (
                        <div className="py-3 border-b border-border">
                          <div className="flex flex-wrap gap-2">
                            {activeFilterBadges.map((filter) => (
                              <Badge key={filter.key} variant="secondary" className="flex items-center gap-1 pr-1">
                                {filter.label}
                                <button
                                  onClick={() => removeFilter(filter.key)}
                                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                                >
                                  <X className="size-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="overflow-y-auto h-full pb-20">
                        <SearchFilters
                          filters={filters}
                          updateFilter={updateFilter}
                          clearFilters={clearFilters}
                          activeFiltersCount={activeFiltersCount}
                        />
                      </div> */}
                      <SearchFilters filters={filters} updateFilter={updateFilter} clearFilters={clearFilters} activeFiltersCount={activeFiltersCount} className="p-0" />
                    </DialogContent>
                  </Dialog>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[130px] h-9 bg-background">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>



          {/* Results Grid/List */}
          {data?.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mb-4 text-muted-foreground">No parts found matching your criteria</p>
              <Button variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={"grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"}>
              {data?.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


import { Skeleton } from "@/components/ui/skeleton";
export function SearchPageSkeleton() {
  return (
    <div className="flex">
      {/* LEFT SIDEBAR (Filters) */}
      <aside className="hidden w-80 border-border border-r md:block sticky top-0 h-[calc(100vh-57px)] overflow-y-auto p-4 space-y-4">
        {/* SearchFilters skeleton (rough structure) */}
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-40" />
        <div className="space-y-3 pt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <div className="md:px-4 md:pb-4">
          <div className="sticky z-10 top-0">
            <div className="md:px-4 py-3">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

                {/* Title + Subtitle */}
                <div className="min-w-0 space-y-2 w-full md:w-auto text-center md:text-left">
                  <Skeleton className="h-6 w-40 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
                </div>

                {/* Desktop Sort Trigger */}
                <div className="hidden md:block">
                  <Skeleton className="h-9 w-40 rounded-md" />
                </div>

                {/* Mobile Filter + Sort */}
                <div className="flex items-center gap-2 md:hidden">
                  {/* Filter Dialog Trigger */}
                  <Skeleton className="h-9 w-24 rounded-md" />

                  {/* Sort Select Trigger */}
                  <Skeleton className="h-9 w-[130px] rounded-md" />
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS GRID */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <PartCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
