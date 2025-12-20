"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { conditions as _conditions } from "@/lib/constants/dropdown-data";
import type { Filters } from "@/lib/url-params";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function SearchFilters({
  className,
  filters,
  updateFilter,
  activeFiltersCount,
  clearFilters,
}: {
  className?: string;
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
  activeFiltersCount: number;
  clearFilters: () => void;
}) {
  return (
    <div className={cn("space-y-6 overflow-y-auto p-4", className)}>
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-7 px-2 text-muted-foreground text-xs hover:text-foreground"
        >
          Clear all
        </Button>
      )}
      <ActiveFilters
        filters={filters}
        updateFilter={updateFilter}
        count={activeFiltersCount}
      />
      <div className="space-y-4">
        <CategoryFilter filters={filters} updateFilter={updateFilter} />

        <VehicleFilter filters={filters} updateFilter={updateFilter} />

        <ConditionFilter filters={filters} updateFilter={updateFilter} />

        <PriceRangeFilter filters={filters} updateFilter={updateFilter} />

        {/* <LocationFilter
          filters={filters}
          updateFilter={updateFilter}
        /> */}

        <OptionsFilter filters={filters} updateFilter={updateFilter} />
      </div>
    </div>
  );
}

function ActiveFilters({
  filters,
  updateFilter,
  count,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
  count: number;
}) {
  const getActiveFilterBadges = () => {
    const badges: { key: string; label: string }[] = [];
    if (filters.category)
      badges.push({ key: "category", label: filters.category });
    if (filters.brand) badges.push({ key: "brand", label: filters.brand });
    if (filters.model) badges.push({ key: "model", label: filters.model });
    if (filters.year) badges.push({ key: "year", label: filters.year });
    if (filters.condition)
      badges.push({ key: "condition", label: filters.condition });
    if (filters.location)
      badges.push({ key: "location", label: filters.location });
    if (filters.negotiable)
      badges.push({ key: "negotiable", label: "Negotiable" });
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 1000) {
      badges.push({
        key: "priceRange",
        label: `$${filters.priceRange[0]} - $${filters.priceRange[1]}`,
      });
    }
    return badges;
  };

  const removeFilter = (key: string) => {
    if (key === "priceRange") {
      updateFilter("priceRange", [0, 1000]);
    } else if (key === "negotiable") {
      updateFilter("negotiable", false);
    } else {
      updateFilter(key, "");
    }
  };

  const activeFilterBadges = getActiveFilterBadges();

  if (count === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilterBadges.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 bg-background pr-1"
        >
          {filter.label}
          <button
            onClick={() => removeFilter(filter.key)}
            className="ml-1 rounded-full p-0.5 hover:bg-muted"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

function CategoryFilter({
  filters,
  updateFilter,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
}) {
  const categories =
    api.partInfo.getCategories
      .useQuery()
      .data?.map((category) => category.name) ?? [];

  console.log({ categories });

  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Category</Label>
      <Select
        value={filters.category}
        onValueChange={(value) => updateFilter("category", value)}
      >
        <SelectTrigger className="w-full">
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
    </div>
  );
}

function VehicleFilter({
  filters,
  updateFilter,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
}) {
  const brands =
    api.partInfo.getMakes.useQuery().data?.map((brand) => brand.name) ?? [];

  const [model, setModel] = useState(filters.model);
  const [year, setYear] = useState(filters.year);

  // Sync local state with parent state (in case filters are cleared)
  useEffect(() => {
    setModel(filters.model);
  }, [filters.model]);

  useEffect(() => {
    setYear(filters.year);
  }, [filters.year]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (model !== filters.model) {
        updateFilter("model", model);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [model, updateFilter, filters.model]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (year !== filters.year) {
        updateFilter("year", year);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [year, updateFilter, filters.year]);

  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Vehicle</Label>
      <div className="space-y-3">
        <div>
          <Label className="text-muted-foreground text-xs">Brand</Label>
          <Select
            value={filters.brand}
            onValueChange={(value) => updateFilter("brand", value)}
          >
            <SelectTrigger className="mt-1 w-full">
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
          <Label className="text-muted-foreground text-xs">Model</Label>
          <Input
            placeholder="Enter model"
            value={filters.model}
            onChange={(e) => updateFilter("model", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Year</Label>
          <Input
            placeholder="e.g. 2015"
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={filters.year}
            onChange={(e) => {
              // const numYear = Number(e.target.value)
              // if (numYear >= 1900 && numYear <= new Date().getFullYear()) {
              updateFilter("year", e.target.value);
              // }
            }}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function ConditionFilter({
  filters,
  updateFilter,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
}) {
  const conditions = useMemo(() => _conditions, []);

  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Condition</Label>
      <Select
        value={filters.condition}
        onValueChange={(value) => updateFilter("condition", value)}
      >
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
    </div>
  );
}

function PriceRangeFilter({
  filters,
  updateFilter,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
}) {
  const [range, setRange] = useState(filters.priceRange);

  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Price Range</Label>
      <div className="px-1">
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
    </div>
  );
}

function _LocationFilter({
  filters,
  updateFilter,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
}) {
  const [value, setValue] = useState(filters.location);

  useEffect(() => {
    setValue(filters.location);
  }, [filters.location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== filters.location) {
        updateFilter("location", value);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, updateFilter, filters.location]);

  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Location</Label>
      <Input
        placeholder="City, State or ZIP"
        value={filters.location}
        onChange={(e) => updateFilter("location", e.target.value)}
      />
    </div>
  );
}

function OptionsFilter({
  filters,
  updateFilter,
}: {
  filters: Filters;
  updateFilter: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="font-medium text-sm">Options</Label>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="negotiable"
          checked={filters.negotiable}
          onCheckedChange={(checked) => updateFilter("negotiable", checked)}
        />
        <Label htmlFor="negotiable" className="font-normal text-sm">
          Negotiable price only
        </Label>
      </div>
    </div>
  );
}
