"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { api } from "@/trpc/react";

interface ProductInfoProps {
  part: any;
}

export function ProductInfo({ part }: ProductInfoProps) {
  const router = useRouter();
  const user = useUser();

  const createConversationMutation =
    api.chat.getOrCreateConversation.useMutation({
      onSuccess: () => {
        router.push("/messages");
        toast.success("Redirecting to messages...");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to start conversation");
      },
    });

  const handleContactSeller = () => {
    if (!user) {
      toast.error("Please sign in to contact the seller");
      router.push(
        `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
      return;
    }

    if (user.id === part.sellerId) {
      toast.error("You cannot contact yourself");
      return;
    }

    createConversationMutation.mutate({
      partId: part.id,
      sellerId: part.sellerId,
    });
  };

  const savings = part.originalPrice ? part.originalPrice - part.price : 0;
  const freeShipping = part.price >= part?.shipping?.freeShippingThreshold;

  return (
    <div className="space-y-6">
      {/* Title and Price */}
      <div>
        <div className="mb-2 flex items-start justify-between">
          <h1 className="pr-4 font-bold font-playfair text-2xl text-foreground md:text-3xl">
            {part.title}
          </h1>
          {/* <Button variant="ghost" size="icon" onClick={() => setIsFavorited(!isFavorited)}>
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button> */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.share({
                title: part.title,
                text: part.description,
                url: window.location.href,
              });
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Badge variant={part.condition === "New" ? "default" : "secondary"}>
            {part.condition}
          </Badge>
          {part.negotiable && <Badge variant="outline">Negotiable</Badge>}
        </div>

        <p className="mb-4 text-muted-foreground">
          {part.brand} {part.partCompatibility[0]?.make?.name}{" "}
          {part.partCompatibility[0]?.model?.name} •{" "}
          {part.partCompatibility[0]?.yearStart} -{" "}
          {part.partCompatibility[0]?.yearEnd} • Part #{part.partNumber}
        </p>

        <div className="mb-4 flex items-center gap-3">
          <span className="font-bold text-3xl text-foreground">
            ${part.price}
          </span>
          {part.originalPrice && (
            <>
              <span className="text-lg text-muted-foreground line-through">
                ${part.originalPrice}
              </span>
              <Badge className="bg-accent text-accent-foreground">
                Save ${savings.toFixed(0)}
              </Badge>
            </>
          )}
        </div>

        {/* Rating */}
        {/* <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{part?.seller?.rating}</span>
          </div>
          <span className="text-muted-foreground">({part?.seller?.reviewCount} reviews)</span>
        </div> */}
      </div>

      {/* Shipping Info */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="font-medium">Shipping</span>
          </div>
          {/* <pre>{JSON.stringify(part?.partShipping[0]?.shippingProfile)}</pre> */}
          <div className="space-y-1 text-sm">
            {freeShipping ? (
              <p className="font-medium text-accent">
                Free shipping on this item!
              </p>
            ) : (
              <p>
                Shipping:{" "}
                <span className="font-medium">
                  ${part?.partShipping[0]?.shippingProfile?.baseCost}
                </span>
                {part?.partShipping[0]?.shippingProfile?.freeShippingThreshold >
                  part?.price && (
                  <span className="text-muted-foreground">
                    {" "}
                    (Free on orders $
                    {
                      part?.partShipping[0]?.shippingProfile
                        ?.freeShippingThreshold
                    }
                    +)
                  </span>
                )}
              </p>
            )}
            <p className="text-muted-foreground">
              Estimated delivery:{" "}
              {part?.partShipping[0]?.shippingProfile?.estimatedDaysMin} -{" "}
              {part?.partShipping[0]?.shippingProfile?.estimatedDaysMax} days
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* <Button className="w-full" size="lg">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button> */}
        <div className="flex gap-2">
          <Button
            className="w-full"
            onClick={handleContactSeller}
            disabled={createConversationMutation.isPending}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {createConversationMutation.isPending
              ? "Starting chat..."
              : "Contact Seller"}
          </Button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex items-center gap-4 text-muted-foreground text-sm">
        <div className="flex items-center gap-1">
          <Shield className="h-4 w-4" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1">
          <Truck className="h-4 w-4" />
          <span>Fast Shipping</span>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {part.description}
          </p>
        </CardContent>
      </Card>

      {/* Specifications */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(part?.specifications)?.map(([key, value], index) => (
              <div key={key}>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium">{value}</span>
                </div>
                {index < Object.entries(part?.specifications)?.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
