'use client'

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Part } from "@/server/db/schema";
import { MapPin, ShoppingCart } from "lucide-react";
import Link from "next/link";


export function PartCard({ part }: { part: Part }) {
  return (
    <Link href={`/part/${part.id}`}
    >
      <Card
        className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer min-w-0"
      >
        <div className="relative">
          <img
            src={part?.partImages?.[0]?.url || "/media/placeholder.png"}
            alt={part.title}
            height={192}
            width={256}
            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={part.condition === "New" ? "default" : "secondary"} className="text-xs">
              {part.condition}
            </Badge>
            {part.isNegotiable && (
              <Badge variant="outline" className="text-xs bg-background/90">
                Negotiable
              </Badge>
            )}
          </div>
          {part.originalPrice && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-accent text-accent-foreground text-xs">
                Save ${(part.originalPrice - part.price).toFixed(0)}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="line-clamp-2 font-medium text-foreground transition-colors">
                {part.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {part?.brand} {part?.partCompatibility?.[0]?.model?.name} • {part?.partCompatibility?.[0]?.yearStart} {part?.partCompatibility?.[0]?.yearEnd && `- ${part?.partCompatibility?.[0]?.yearEnd}`}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground text-lg">${part.price}</span>
                {part.originalPrice && (
                  <span className="text-muted-foreground text-sm line-through">${part.originalPrice}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                {/* <pre>{JSON.stringify(part?.seller, null, 2)}</pre> */}
                <span className="text-muted-foreground capitalize">{part?.seller?.name}</span>
                {part?.seller?.verified && (
                  <Badge variant="outline" className="px-1 py-0 text-xs">
                    ✓
                  </Badge>
                )}
              </div>
              {/* <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-muted-foreground">{part?.seller?.rating}</span>
              </div> */}
            </div>

            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="h-3 w-3" />
              <span>{part?.seller?.addresses?.[0]?.city}, {part?.seller?.addresses?.[0]?.state}</span>
            </div>

            <Button className="w-full" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Shop Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}