"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Eye, Trash2, Package } from "lucide-react"
import { useState } from "react"

export function ActiveListings() {
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "BMW E46 Brake Pads - Front Set",
      price: 89.99,
      condition: "New",
      views: 234,
      watchers: 12,
      image: "/placeholder.svg?height=80&width=80&text=BMW+Brake+Pads",
      status: "active",
      datePosted: "2024-01-15",
    },
    {
      id: 2,
      title: "Honda Civic Engine Air Filter",
      price: 24.99,
      condition: "New",
      views: 156,
      watchers: 8,
      image: "/honda-air-filter.jpg",
      status: "active",
      datePosted: "2024-01-12",
    },
    {
      id: 3,
      title: "Ford F-150 LED Headlight Assembly",
      price: 299.99,
      condition: "Used - Excellent",
      views: 89,
      watchers: 15,
      image: "/ford-f150-led-headlight.jpg",
      status: "pending",
      datePosted: "2024-01-10",
    },
    {
      id: 4,
      title: "Toyota Camry Alternator",
      price: 159.99,
      condition: "Refurbished",
      views: 67,
      watchers: 5,
      image: "/toyota-alternator.jpg",
      status: "sold",
      datePosted: "2024-01-08",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const deleteListing = (id: number) => {
    setListings((prev) => prev.filter((listing) => listing.id !== id))
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-playfair text-xl font-bold text-foreground mb-2">No listings yet</h3>
        <p className="text-muted-foreground mb-4">Create your first listing to start selling</p>
        <Button>List Your First Part</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {listings.map((listing) => (
        <Card key={listing.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <img
                src={listing.image || "/placeholder.svg"}
                alt={listing.title}
                className="w-20 h-20 object-cover rounded-md flex-shrink-0"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-2">{listing.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {listing.condition}
                      </Badge>
                      <Badge className={getStatusColor(listing.status)}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Listing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Listing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteListing(listing.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{listing.views} views</span>
                    <span>{listing.watchers} watchers</span>
                    <span>Posted {new Date(listing.datePosted).toLocaleDateString()}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">${listing.price}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
