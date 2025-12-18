import { CheckCircle, Mail, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderSuccessPage() {
  const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background">
      <main className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-accent" />
            </div>
            <CardTitle className="font-bold font-playfair text-2xl">
              Order Confirmed!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-2 text-muted-foreground">
                Your order number is:
              </p>
              <p className="font-bold font-mono text-lg">{orderNumber}</p>
            </div>

            <div className="space-y-3 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Confirmation email sent</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Sellers will be notified to ship your items</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/orders">View Order Details</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full bg-transparent"
              >
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
