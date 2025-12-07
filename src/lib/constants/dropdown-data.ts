export const conditions = ["New", "Used", "Refurbished"] as const;
export const currencies = ["USD", "CAD", "EUR", "GBP"] as const;
export const carriers = ["UPS", "FedEx", "USPS", "DHL"] as const;
export const materials = ["Ceramic", "Metal", "Plastic", "Rubber", "Carbon Fiber", "Aluminum", "Steel"] as const;
export const warranties = ["No Warranty", "30 Days", "90 Days", "6 Months", "1 Year", "2 Years", "3 Years", "Lifetime"] as const;
export const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
] as const;