"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, Eye, TrendingUp } from "lucide-react"

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
      value: "$2,847",
      change: "+$340 this month",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Views This Week",
      value: "1,234",
      change: "+15% from last week",
      icon: Eye,
      color: "text-purple-600",
    },
    {
      title: "Conversion Rate",
      value: "3.2%",
      change: "+0.5% from last month",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
