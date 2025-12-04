"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, RotateCcw } from "lucide-react";

export function OrderHistory() {
  const mockOrders = [
    {
      id: "ORD-ABC123",
      date: "2024-01-15",
      status: "delivered",
      total: 134.97,
      items: [
        {
          id: 1,
          title: "BMW E46 Brake Pads - Front Set",
          price: 89.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80&text=BMW+Brake+Pads",
          seller: "AutoParts Pro",
        },
        {
          id: 2,
          title: "Honda Civic Engine Air Filter",
          price: 24.99,
          quantity: 2,
          image: "/honda-air-filter.jpg",
          seller: "Civic Specialist",
        },
      ],
      tracking: "1Z999AA1234567890",
    },
    {
      id: "ORD-DEF456",
      date: "2024-01-10",
      status: "shipped",
      total: 299.99,
      items: [
        {
          id: 3,
          title: "Ford F-150 LED Headlight Assembly",
          price: 299.99,
          quantity: 1,
          image: "/ford-f150-led-headlight.jpg",
          seller: "Truck Parts USA",
        },
      ],
      tracking: "1Z999AA1234567891",
    },
    {
      id: "ORD-GHI789",
      date: "2024-01-05",
      status: "processing",
      total: 159.99,
      items: [
        {
          id: 4,
          title: "Toyota Camry Alternator",
          price: 159.99,
          quantity: 1,
          image: "/toyota-alternator.jpg",
          seller: "Reliable Auto",
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (mockOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-playfair text-xl font-bold text-foreground mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
        <Button>Browse Parts</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mockOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order {order.id}</CardTitle>
              <Badge className={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Placed on {new Date(order.date).toLocaleDateString()}</span>
              <span className="font-medium text-foreground">${order.total.toFixed(2)}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={item.id}>
                <div className="flex gap-4">
                  <img
                    src={"/media/placeholder.png"}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground line-clamp-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">Sold by {item.seller}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {index < order.items.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {order.status === "delivered" && (
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return Items
                  </Button>
                )}
                {order.tracking && (
                  <Button variant="outline" size="sm">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Package
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
