"use client";
import { ShoppingCart, Star } from "lucide-react";
import { PartCard } from "@/components/parts/part-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";

interface RelatedPartsProps {
  currentPartId: string;
  category?: string;
}

export function RelatedParts({ currentPartId, category }: RelatedPartsProps) {
  // Mock related parts data
  // const relatedParts = [
  //   {
  //     id: 2,
  //     title: "BMW E46 Brake Rotors - Front Pair",
  //     price: 159.99,
  //     condition: "New",
  //     brand: "BMW",
  //     image: "/placeholder.svg?height=200&width=200&text=Brake+Rotors",
  //     seller: { name: "AutoParts Pro", rating: 4.8, verified: true },
  //   },
  //   {
  //     id: 3,
  //     title: "BMW E46 Brake Fluid DOT 4",
  //     price: 24.99,
  //     condition: "New",
  //     brand: "BMW",
  //     image: "/placeholder.svg?height=200&width=200&text=Brake+Fluid",
  //     seller: { name: "Fluid Masters", rating: 4.7, verified: true },
  //   },
  //   {
  //     id: 4,
  //     title: "BMW E46 Brake Lines Kit",
  //     price: 89.99,
  //     condition: "New",
  //     brand: "BMW",
  //     image: "/placeholder.svg?height=200&width=200&text=Brake+Lines",
  //     seller: { name: "Performance Parts", rating: 4.9, verified: false },
  //   },
  // ].filter((part) => part.id !== currentPartId)
  const { data: relatedParts } = api.part.getRelatedParts.useQuery({
    partId: currentPartId,
    categoryId: category ?? "",
  });
  return (
    <div>
      <h2 className="mb-6 font-bold font-playfair text-2xl text-foreground">
        Related Parts
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedParts?.map((part) => (
          <PartCard part={part} key={part.id} />
        ))}
      </div>
    </div>
  );
}
