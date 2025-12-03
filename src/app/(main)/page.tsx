import { Car, CreditCard, Disc, PenLine as Engine, MapPin, Settings, Shield, ShoppingCart, Star, Truck, Wrench, Zap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";

export default async function Home() {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="px-4 py-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 font-bold font-playfair text-3xl text-foreground md:text-4xl">Find Quality Auto Parts</h1>
          <p className="mb-6 text-lg text-muted-foreground">Browse thousands of parts from trusted sellers</p>
          <TrustBadges />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="px-4 py-6">
        <FeaturedCategories />
      </section>

      {/* Parts Grid */}
      <section className="px-4">
        {await PartsGrid()}
      </section>
    </div>
  );
}

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      text: "Verified Sellers",
    },
    {
      icon: Star,
      text: "Quality Guaranteed",
    },
    {
      icon: Truck,
      text: "Fast Shipping",
    },
    {
      icon: CreditCard,
      text: "Secure Payment",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {badges.map((badge) => (
        <div key={badge.text} className="flex items-center gap-2 text-muted-foreground text-sm">
          <badge.icon className="h-4 w-4 text-accent" />
          <span>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}

export function FeaturedCategories() {
  const categories = [
    { name: "Engine Parts", icon: Engine, count: "2.5k+" },
    { name: "Brake System", icon: Disc, count: "1.8k+" },
    { name: "Electrical", icon: Zap, count: "3.2k+" },
    { name: "Body Parts", icon: Car, count: "4.1k+" },
    { name: "Tools", icon: Wrench, count: "890+" },
    { name: "Accessories", icon: Settings, count: "1.5k+" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-6 font-bold font-playfair text-2xl text-foreground">Shop by Category</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Card key={category.name} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <category.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.count} parts</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export async function PartsGrid() {

  const mockParts = [
    {
      id: 1,
      title: "BMW E46 Brake Pads - Front Set",
      price: 89.99,
      originalPrice: 120.0,
      condition: "New",
      brand: "BMW",
      model: "E46 3 Series",
      year: "1999-2006",
      image: "/media/placeholder.svg?key=fcp26",
      seller: {
        name: "AutoParts Pro",
        rating: 4.8,
        verified: true,
        location: "Los Angeles, CA",
      },
      negotiable: true,
      compatibility: ["BMW E46 320i", "BMW E46 325i", "BMW E46 330i"],
    },
    {
      id: 2,
      title: "Honda Civic Engine Air Filter",
      price: 24.99,
      condition: "New",
      brand: "Honda",
      model: "Civic",
      year: "2016-2021",
      image: "/media/honda-air-filter.jpg",
      seller: {
        name: "Civic Specialist",
        rating: 4.9,
        verified: true,
        location: "Miami, FL",
      },
      negotiable: false,
      compatibility: ["Honda Civic Si", "Honda Civic Type R", "Honda Civic Sport"],
    },
    {
      id: 3,
      title: "Ford F-150 LED Headlight Assembly",
      price: 299.99,
      condition: "Used - Excellent",
      brand: "Ford",
      model: "F-150",
      year: "2015-2020",
      image: "/media/ford-f150-led-headlight.jpg",
      seller: {
        name: "Truck Parts USA",
        rating: 4.7,
        verified: false,
        location: "Dallas, TX",
      },
      negotiable: true,
      compatibility: ["Ford F-150 XLT", "Ford F-150 Lariat", "Ford F-150 King Ranch"],
    },
    {
      id: 4,
      title: "Toyota Camry Alternator",
      price: 159.99,
      originalPrice: 200.0,
      condition: "Refurbished",
      brand: "Toyota",
      model: "Camry",
      year: "2012-2017",
      image: "/media/toyota-alternator.jpg",
      seller: {
        name: "Reliable Auto",
        rating: 4.6,
        verified: true,
        location: "Phoenix, AZ",
      },
      negotiable: false,
      compatibility: ["Toyota Camry LE", "Toyota Camry SE", "Toyota Camry XLE"],
    },
    {
      id: 5,
      title: "Mercedes C-Class Door Handle Set",
      price: 79.99,
      condition: "Used - Good",
      brand: "Mercedes-Benz",
      model: "C-Class",
      year: "2008-2014",
      image: "/media/mercedes-door-handle.jpg",
      seller: {
        name: "Euro Parts Direct",
        rating: 4.5,
        verified: true,
        location: "Seattle, WA",
      },
      negotiable: true,
      compatibility: ["Mercedes C300", "Mercedes C350", "Mercedes C63 AMG"],
    },
    {
      id: 6,
      title: "Jeep Wrangler Soft Top",
      price: 449.99,
      condition: "New",
      brand: "Jeep",
      model: "Wrangler",
      year: "2018-2023",
      image: "/media/jeep-wrangler-soft-top.jpg",
      seller: {
        name: "Off-Road Experts",
        rating: 4.9,
        verified: true,
        location: "Denver, CO",
      },
      negotiable: false,
      compatibility: ["Jeep Wrangler Sport", "Jeep Wrangler Sahara", "Jeep Wrangler Rubicon"],
    },
  ];

  const parts = await api.part.getHomePageParts()
  return (
    <Suspense>

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-2xl font-bold text-foreground">Featured Parts</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts?.map((part) => (
            <Link href={`/part/${part.id}`}
              key={part.id}
            >
              <Card
                className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
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
                      <h3 className="line-clamp-2 font-medium text-foreground transition-colors group-hover:text-accent">
                        {part.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {part?.brand} {part?.model} • {part?.year}
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
                        <span className="text-muted-foreground">{part?.seller?.name}</span>
                        {part?.seller?.verified && (
                          <Badge variant="outline" className="px-1 py-0 text-xs">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-muted-foreground">{part?.seller?.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>{part?.seller?.location}</span>
                    </div>

                    <Button className="w-full" size="sm">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Shop Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Suspense>

  );
}
