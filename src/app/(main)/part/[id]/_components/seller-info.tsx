import { MapPin, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date";

interface SellerInfoProps {
  seller: {
    id: number;
    name: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    location: string;
    memberSince: string;
    responseTime: string;
    totalSales: number;
    avatar: string;
  };
}

export function SellerInfo({ seller }: SellerInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Seller Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-4 md:flex-row">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              {seller?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-semibold text-lg capitalize">
                  {seller?.name}
                </h3>
                {/* {seller?.isVeri && ( */}
                <Badge variant="outline" className="text-xs">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
                {/* )} */}
              </div>

              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                {/* <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{seller?.rating}</span>
                  <span>({seller?.reviewCount} reviews)</span>
                </div> */}
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {seller?.addresses[0]?.city}, {seller?.addresses[0]?.state}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div>
                {/* <p className="text-muted-foreground">Response time</p> */}
                {/* <p className="font-medium">{seller.responseTime}</p> */}
              </div>
              <div>
                {/* <p className="text-muted-foreground">Total sales</p> */}
                {/* <p className="font-medium">{seller.totalSales.toLocaleString()}</p> */}
              </div>
            </div>

            {/* <div className="flex gap-2">
							<Button variant="outline" size="sm">
								<MessageCircle className="h-4 w-4 mr-2" />
								Contact Seller
							</Button>
							<Button variant="outline" size="sm">
								<ShoppingBag className="h-4 w-4 mr-2" />
								View Store
							</Button>
						</div> */}
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Member since</p>
            <p className="font-medium">{formatDate(seller?.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
