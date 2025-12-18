"use client";

import { DollarSign, Eye, Package, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SellerStats() {
  const stats = [
    {
      title: "Active Listings",
      value: "12",
      change: "+2 this week",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Sales",
      value: "-",
      change: "Coming Soon !",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Views This Week",
      value: "-",
      change: "Coming Soon !",
      icon: Eye,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: "-",
      change: "Coming Soon !",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stat.value}</div>
            <p className="text-muted-foreground text-xs">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
