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
    null
  )
}
