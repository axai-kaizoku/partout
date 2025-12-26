"use client";

import { Edit, Eye, MoreHorizontal, Package, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, LoadingButton } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/date";
import type { Part } from "@/server/db/schema";
import { api } from "@/trpc/react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../ui/responsive-dialog";
import { Skeleton } from "../ui/skeleton";

export function ActiveListings({
  isPending,
  listings,
}: {
  isPending: boolean;
  listings: Part[];
}) {
  const router = useRouter();
  const [deletingListingId, setDeletingListingId] = useState<string | null>(
    null,
  );
  const utils = api.useUtils();

  const { mutateAsync: deleteListing, isPending: deletingListingPending } =
    api.part.deletePart.useMutation({
      onSuccess: () => {
        utils.part.invalidate();
        setDeletingListingId(null);
        toast.success("Listing deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete listing");
      },
    });

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
      <ResponsiveDialog
        open={deletingListingId !== null}
        onOpenChange={() => setDeletingListingId(null)}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Listing</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Delete your listing.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <div>
            <p>Are you sure you want to delete this listing?</p>
            <p>{deletingListingId}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingListingId(null)}
              disabled={deletingListingPending}
              type="button"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
          <LoadingButton
            loading={deletingListingPending}
            onClick={() => deleteListing(deletingListingId!)}
            disabled={deletingListingPending}
            className="w-full"
          >
            Delete
          </LoadingButton>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
      {listings?.map((listing) => (
        <Card key={listing.id}>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Image
                src={listing?.partImages?.[0]?.url || "/media/placeholder.png"}
                width={80}
                height={80}
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
                      <DropdownMenuItem
                        onSelect={() => router.push(`/part/${listing.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Listing
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem>
												<Edit className="h-4 w-4 mr-2" />
												Edit Listing
											</DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={() => setDeletingListingId(listing.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        <span className="text-destructive">Delete Listing</span>
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
