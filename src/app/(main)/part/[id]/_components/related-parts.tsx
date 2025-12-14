"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { api } from "@/trpc/react";
import { PartCard } from "@/components/parts/part-card";

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
			<h2 className="font-playfair text-2xl font-bold text-foreground mb-6">
				Related Parts
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{relatedParts?.map((part) => (
					<PartCard part={part} key={part.id} />
				))}
			</div>
		</div>
	);
}
