"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"

export function SalesHistory() {
  const sales = [
    {
      id: 1,
      title: "Mercedes C-Class Door Handle Set",
      price: 79.99,
      buyer: "John D.",
      dateSold: "2024-01-14",
      status: "completed",
      image: "/mercedes-door-handle.jpg",
    },
    {
      id: 2,
      title: "Jeep Wrangler Soft Top",
      price: 449.99,
      buyer: "Sarah M.",
      dateSold: "2024-01-12",
      status: "shipped",
      image: "/jeep-wrangler-soft-top.jpg",
    },
    {
      id: 3,
      title: "BMW E46 Brake Rotors - Front Pair",
      price: 159.99,
      buyer: "Mike R.",
      dateSold: "2024-01-10",
      status: "completed",
      image: "/placeholder.svg?height=80&width=80&text=BMW+Rotors",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.price, 0)

  return (
    <div className="space-y-6">
      {/* Sales Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sales Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Items Sold</p>
              <p className="text-2xl font-bold">{sales.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Sale</p>
              <p className="text-2xl font-bold">${(totalSales / sales.length).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales List */}
      <div className="space-y-4">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img
                  src={sale.image || "/placeholder.svg"}
                  alt={sale.title}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground line-clamp-2">{sale.title}</h3>
                      <p className="text-sm text-muted-foreground">Sold to {sale.buyer}</p>
                    </div>
                    <Badge className={getStatusColor(sale.status)}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Sold on {new Date(sale.dateSold).toLocaleDateString()}
                    </span>
                    <span className="text-lg font-bold text-foreground">${sale.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
