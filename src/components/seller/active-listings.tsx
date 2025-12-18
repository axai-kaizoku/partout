"use client";

import { Edit, Eye, MoreHorizontal, Package, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";
import { Skeleton } from "../ui/skeleton";

export function ActiveListings() {
  // const [listings, setListings] = useState([
  //   {
  //     id: 1,
  //     title: "BMW E46 Brake Pads - Front Set",
  //     price: 89.99,
  //     condition: "New",
  //     views: 234,
  //     watchers: 12,
  //     image: "/placeholder.svg?height=80&width=80&text=BMW+Brake+Pads",
  //     status: "active",
  //     datePosted: "2024-01-15",
  //   },
  //   {
  //     id: 2,
  //     title: "Honda Civic Engine Air Filter",
  //     price: 24.99,
  //     condition: "New",
  //     views: 156,
  //     watchers: 8,
  //     image: "/honda-air-filter.jpg",
  //     status: "active",
  //     datePosted: "2024-01-12",
  //   },
  //   {
  //     id: 3,
  //     title: "Ford F-150 LED Headlight Assembly",
  //     price: 299.99,
  //     condition: "Used - Excellent",
  //     views: 89,
  //     watchers: 15,
  //     image: "/ford-f150-led-headlight.jpg",
  //     status: "pending",
  //     datePosted: "2024-01-10",
  //   },
  //   {
  //     id: 4,
  //     title: "Toyota Camry Alternator",
  //     price: 159.99,
  //     condition: "Refurbished",
  //     views: 67,
  //     watchers: 5,
  //     image: "/toyota-alternator.jpg",
  //     status: "sold",
  //     datePosted: "2024-01-08",
  //   },
  // ])

  const { data: listings, isPending } = api.part.getPartsByUserId.useQuery(
    undefined,
    { staleTime: 30 * 1000 },
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // const deleteListing = (id: number) => {
  //   setListings((prev) => prev.filter((listing) => listing.id !== id))
  // }
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    );
  }

  if (listings?.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 font-bold font-playfair text-foreground text-xl">
          No listings yet
        </h3>
        <p className="mb-4 text-muted-foreground">
          Create your first listing to start selling
        </p>
        <Button asChild>
          <Link href="/sell/new">List Your First Part</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {listings?.map((listing) => (
        <Card key={listing.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <img
                src={listing?.partImages?.[0]?.url || "/media/placeholder.png"}
                alt={listing.title}
                className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="line-clamp-2 font-medium text-foreground">
                      {listing?.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {listing?.condition}
                      </Badge>
                      <Badge className={getStatusColor(listing?.status)}>
                        {listing?.status.charAt(0).toUpperCase() +
                          listing?.status.slice(1)}
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
                      {/* <DropdownMenuItem>
												<Eye className="h-4 w-4 mr-2" />
												View Listing
											</DropdownMenuItem> */}
                      {/* <DropdownMenuItem>
												<Edit className="h-4 w-4 mr-2" />
												Edit Listing
											</DropdownMenuItem> */}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Delete Listing
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    {/* <span>{listing?.views} views</span> */}
                    {/* <span>{listing?.watchers} watchers</span> */}
                    <span>Posted {formatDate(listing?.createdAt)}</span>
                  </div>
                  <span className="font-bold text-foreground text-lg">
                    ${listing?.price}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
