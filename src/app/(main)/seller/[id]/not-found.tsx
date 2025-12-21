import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SellerNotFound() {
  return (
    <div className="flex min-h-[90dvh] w-full flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mb-2 font-semibold text-2xl">Seller Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The seller you're looking for doesn't exist or may have been
            removed.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/parts">Browse Parts</Link>
            </Button>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
