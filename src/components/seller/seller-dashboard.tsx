"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SellerStats } from "./seller-stats";
import { ActiveListings } from "./active-listings";
import { SalesHistory } from "./sales-history";
import { Plus, Store } from "lucide-react";
import { useRouter } from "next/navigation";

export function SellerDashboard() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your listings and track your sales</p>
        </div>
        <Button onClick={() => router.push("/sell/new")} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          List New Part
        </Button>
      </div>

      {/* Stats Overview */}
      <SellerStats />

      {/* Main Content */}
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings">Active Listings</TabsTrigger>
          <TabsTrigger value="sales">Sales History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <ActiveListings />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesHistory />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Analytics Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed analytics and insights about your listings performance will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
