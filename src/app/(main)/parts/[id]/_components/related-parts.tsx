import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"

interface RelatedPartsProps {
  currentPartId: number
  category: string
}

export function RelatedParts({ currentPartId, category }: RelatedPartsProps) {
  // Mock related parts data
  const relatedParts = [
    {
      id: 2,
      title: "BMW E46 Brake Rotors - Front Pair",
      price: 159.99,
      condition: "New",
      brand: "BMW",
      image: "/placeholder.svg?height=200&width=200&text=Brake+Rotors",
      seller: { name: "AutoParts Pro", rating: 4.8, verified: true },
    },
    {
      id: 3,
      title: "BMW E46 Brake Fluid DOT 4",
      price: 24.99,
      condition: "New",
      brand: "BMW",
      image: "/placeholder.svg?height=200&width=200&text=Brake+Fluid",
      seller: { name: "Fluid Masters", rating: 4.7, verified: true },
    },
    {
      id: 4,
      title: "BMW E46 Brake Lines Kit",
      price: 89.99,
      condition: "New",
      brand: "BMW",
      image: "/placeholder.svg?height=200&width=200&text=Brake+Lines",
      seller: { name: "Performance Parts", rating: 4.9, verified: false },
    },
  ].filter((part) => part.id !== currentPartId)

  return (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">Related Parts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedParts.map((part) => (
          <Card key={part.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
            <div className="relative">
              <img
                src={part.image || "/placeholder.svg"}
                alt={part.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <Badge variant={part.condition === "New" ? "default" : "secondary"} className="text-xs">
                  {part.condition}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {part.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{part.brand}</p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">${part.price}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{part.seller.name}</span>
                    {part.seller.verified && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-muted-foreground">{part.seller.rating}</span>
                  </div>
                </div>

                <Button className="w-full" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
