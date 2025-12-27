"use client";

import { Minus, Plus, Store, Trash2 } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";

export function CartItems() {
  const { getSellerGroups, updateQuantity, removeItem } = useCart();
  const sellerGroups = getSellerGroups();

  return (
    <div className="space-y-6">
      {Object.entries(sellerGroups).map(([sellerId, items]) => {
        const seller = items?.[0]?.seller;
        const sellerTotal = items?.reduce(
          (total, item) => total + item?.price * item.quantity,
          0,
        );

        return (
          <Card key={sellerId}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="h-5 w-5" />
                {seller?.name}
                {seller?.verified && (
                  <Badge variant="outline" className="text-xs">
                    ✓ Verified
                  </Badge>
                )}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {seller?.location}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id}>
                  <div className="flex gap-4">
                    <Image
                      src={item?.image || "/media/placeholder.png"}
                      alt={item?.title}
                      width={80}
                      height={80}
                      className="h-20 w-20 shrink-0 rounded-md object-cover"
                    />

                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="line-clamp-2 font-medium text-foreground">
                          {item?.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {item?.brand} {item?.model} • {item?.year}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {item.condition}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item?.id, item?.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">
                            {item?.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item?.id, item?.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">
                            ${(item?.price * item?.quantity).toFixed(2)}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            ${item.price} each
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-muted-foreground text-xs">
                        Shipping: ${item?.shipping?.cost} •{" "}
                        {item?.shipping?.estimatedDays}
                      </div>
                    </div>
                  </div>

                  {index < items?.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between pt-2">
                <span className="font-medium">Seller Subtotal:</span>
                <span className="font-bold">${sellerTotal?.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
