export interface Filters {
  category: string
  brand: string
  model: string
  year: string
  condition: string
  priceRange: number[]
  location: string
  negotiable: boolean | undefined
  [key: string]: any
}

export const filtersToUrlParams = (
  filters: Filters,
  sortBy: string
): URLSearchParams => {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return

    if (key === "priceRange" && Array.isArray(value)) {
      if (value[0] !== 0 || value[1] !== 1000) {
        params.set("minPrice", value[0].toString())
        params.set("maxPrice", value[1].toString())
      }
    } else if (key === "negotiable") {
      if (value === true) {
        params.set("negotiable", "true")
      }
    } else {
      // Handle standard string fields
      params.set(key, String(value))
    }
  })

  if (sortBy && sortBy !== "relevance") {
    params.set("sort", sortBy)
  }

  return params
}

export const urlParamsToFilters = (
  params: URLSearchParams
): { filters: Filters; sortBy: string } => {
  const filters: Filters = {
    category: "",
    brand: "",
    model: "",
    year: "",
    condition: "",
    priceRange: [0, 1000],
    location: "",
    negotiable: undefined,
  }

  // Map simple string fields
  const stringFields = ["category", "brand", "model", "year", "condition", "location"]
  stringFields.forEach((field) => {
    const value = params.get(field)
    if (value) {
      filters[field] = value
    }
  })

  // Handle negotiable
  if (params.get("negotiable") === "true") {
    filters.negotiable = true
  }

  // Handle price range
  const minPrice = params.get("minPrice")
  const maxPrice = params.get("maxPrice")
  if (minPrice && maxPrice) {
    filters.priceRange = [Number(minPrice), Number(maxPrice)]
  }

  const sortBy = params.get("sort") || "relevance"

  return { filters, sortBy }
}
