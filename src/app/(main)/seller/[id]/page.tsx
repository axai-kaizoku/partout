import { Shield, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  const seller = await api.seller.getSellerById(id);

  if (!seller) {
    return {
      title: "Seller Not Found",
    };
  }

  return {
    title: `${seller.name ?? "Seller"}'s Store`,
    description: `Browse all listings from ${seller.name ?? "this seller"} on Partout.`,
  };
}

export default async function SellerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const seller = await api.seller.getSellerById(id);

  if (!seller) {
    notFound();
  }

  const parts = seller.part ?? [];

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Seller Info Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Seller Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <Avatar className="h-20 w-20">
                {seller.imageUrl && (
                  <AvatarImage src={seller.imageUrl} alt={seller.name ?? ""} />
                )}
                <AvatarFallback className="text-lg">
                  {seller.name?.slice(0, 2).toUpperCase() ?? "SE"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h1 className="font-semibold text-2xl capitalize">
                      {seller.name ?? "Seller"}
                    </h1>
                    <Badge variant="outline" className="text-xs">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified Seller
                    </Badge>
                  </div>

                  {seller.email && (
                    <p className="text-muted-foreground text-sm">
                      {seller.email}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Total Sales</p>
                    <p className="font-medium">
                      {/* {seller.totalSales?.toLocaleString() ?? 0} */}-
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Purchases</p>
                    <p className="font-medium">
                      {/* {seller.totalPurchases?.toLocaleString() ?? 0} */}-
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active Listings</p>
                    <p className="font-medium">{parts.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {seller.createdAt
                        ? formatDate(seller.createdAt, {
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-xl">
              All Listings ({parts.length})
            </h2>
          </div>

          {parts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  This seller doesn't have any active listings yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {parts.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/part/${listing.id}`}
                  className="block"
                >
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={
                            listing?.partImages?.[0]?.url ||
                            "/media/placeholder.png"
                          }
                          alt={listing.title ?? "Part image"}
                          width={80}
                          height={80}
                          className="h-20 w-20 shrink-0 rounded-md object-cover"
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
                                <Badge
                                  className={
                                    listing?.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : listing?.status === "sold"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {listing?.status
                                    ? listing.status.charAt(0).toUpperCase() +
                                      listing.status.slice(1)
                                    : "Active"}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                              <span>
                                Posted{" "}
                                {listing?.createdAt
                                  ? formatDate(listing.createdAt)
                                  : "N/A"}
                              </span>
                            </div>
                            <span className="font-bold text-foreground text-lg">
                              ${listing?.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
