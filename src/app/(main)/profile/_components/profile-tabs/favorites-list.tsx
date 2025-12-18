"use client";

import { Heart, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function FavoritesList() {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: "BMW E46 Brake Pads - Front Set",
      price: 89.99,
      originalPrice: 120.0,
      condition: "New",
      brand: "BMW",
      model: "E46 3 Series",
      year: "1999-2006",
      image: "/placeholder.svg?height=200&width=200&text=BMW+Brake+Pads",
      seller: {
        name: "AutoParts Pro",
        verified: true,
      },
      negotiable: true,
      dateAdded: "2024-01-10",
    },
    {
      id: 5,
      title: "Mercedes C-Class Door Handle Set",
      price: 79.99,
      condition: "Used - Good",
      brand: "Mercedes-Benz",
      model: "C-Class",
      year: "2008-2014",
      image: "/mercedes-door-handle.jpg",
      seller: {
        name: "Euro Parts Direct",
        verified: true,
      },
      negotiable: true,
      dateAdded: "2024-01-08",
    },
    {
      id: 6,
      title: "Jeep Wrangler Soft Top",
      price: 449.99,
      condition: "New",
      brand: "Jeep",
      model: "Wrangler",
      year: "2018-2023",
      image: "/jeep-wrangler-soft-top.jpg",
      seller: {
        name: "Off-Road Experts",
        verified: true,
      },
      negotiable: false,
      dateAdded: "2024-01-05",
    },
  ]);

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  if (favorites.length === 0) {
    return (
      <div className="py-12 text-center">
        <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 font-bold font-playfair text-foreground text-xl">
          No favorites yet
        </h3>
        <p className="mb-4 text-muted-foreground">
          Save parts you like to easily find them later
        </p>
        <Button>Browse Parts</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {favorites.map((part) => (
        <Card
          key={part.id}
          className="group relative cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
            onClick={() => removeFavorite(part.id)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="relative">
            <img
              src={part.image || "/placeholder.svg"}
              alt={part.title}
              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge
                variant={part.condition === "New" ? "default" : "secondary"}
                className="text-xs"
              >
                {part.condition}
              </Badge>
              {part.negotiable && (
                <Badge variant="outline" className="bg-background/90 text-xs">
                  Negotiable
                </Badge>
              )}
            </div>
            {part.originalPrice && (
              <div className="absolute top-3 right-12">
                <Badge className="bg-accent text-accent-foreground text-xs">
                  Save ${(part.originalPrice - part.price).toFixed(0)}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="line-clamp-2 font-medium text-foreground transition-colors group-hover:text-accent">
                  {part.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {part.brand} {part.model} • {part.year}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-lg">
                    ${part.price}
                  </span>
                  {part.originalPrice && (
                    <span className="text-muted-foreground text-sm line-through">
                      ${part.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">
                    {part.seller.name}
                  </span>
                  {part.seller.verified && (
                    <Badge variant="outline" className="px-1 py-0 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-muted-foreground text-xs">
                Added {new Date(part.dateAdded).toLocaleDateString()}
              </div>

              <Button className="w-full" size="sm">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
