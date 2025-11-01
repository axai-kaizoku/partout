"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Share2, MessageCircle, Truck, Shield, Star } from "lucide-react"

interface ProductInfoProps {
  part: {
    id: number
    title: string
    price: number
    originalPrice?: number
    condition: string
    brand: string
    model: string
    year: string
    partNumber: string
    description: string
    negotiable: boolean
    specifications: Record<string, string>
    shipping: {
      cost: number
      estimatedDays: string
      freeShippingThreshold: number
    }
    seller: {
      rating: number
      reviewCount: number
    }
  }
}

export function ProductInfo({ part }: ProductInfoProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const savings = part.originalPrice ? part.originalPrice - part.price : 0
  const freeShipping = part.price >= part.shipping.freeShippingThreshold

  return (
    <div className="space-y-6">
      {/* Title and Price */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground pr-4">{part.title}</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsFavorited(!isFavorited)}>
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant={part.condition === "New" ? "default" : "secondary"}>{part.condition}</Badge>
          {part.negotiable && <Badge variant="outline">Negotiable</Badge>}
        </div>

        <p className="text-muted-foreground mb-4">
          {part.brand} {part.model} • {part.year} • Part #{part.partNumber}
        </p>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl font-bold text-foreground">${part.price}</span>
          {part.originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">${part.originalPrice}</span>
              <Badge className="bg-accent text-accent-foreground">Save ${savings.toFixed(0)}</Badge>
            </>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{part.seller.rating}</span>
          </div>
          <span className="text-muted-foreground">({part.seller.reviewCount} reviews)</span>
        </div>
      </div>

      {/* Shipping Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-accent" />
            <span className="font-medium">Shipping</span>
          </div>
          <div className="space-y-1 text-sm">
            {freeShipping ? (
              <p className="text-accent font-medium">Free shipping on this item!</p>
            ) : (
              <p>
                Shipping: <span className="font-medium">${part.shipping.cost}</span>
                {part.shipping.freeShippingThreshold > part.price && (
                  <span className="text-muted-foreground">
                    {" "}
                    (Free on orders ${part.shipping.freeShippingThreshold}+)
                  </span>
                )}
              </p>
            )}
            <p className="text-muted-foreground">Estimated delivery: {part.shipping.estimatedDays}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full" size="lg">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 bg-transparent">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Seller
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4 text-accent" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="h-4 w-4 text-accent" />
          <span>Fast Shipping</span>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{part.description}</p>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(part.specifications).map(([key, value], index) => (
              <div key={key}>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
                {index < Object.entries(part.specifications).length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
