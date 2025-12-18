"use client";

import { Calendar, Edit, LogOut, MapPin, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { formatDate } from "@/lib/date";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { api } from "@/trpc/react";

export function ProfileHeader() {
  // const user = useUser();
  const { data: user } = api.user.getUser.useQuery();
  const router = useRouter();
  const supabase = supabaseBrowserClient();
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <Avatar className="h-20 w-20">
            {/* <AvatarImage src={user.avatar || "/media/placeholder.svg"} alt={user.name} /> */}
            <AvatarFallback className="text-lg">
              {user?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="font-bold font-playfair text-2xl text-foreground capitalize">
                  {user?.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            <div className="flex flex-col items-start gap-4 text-muted-foreground text-sm sm:flex-row sm:items-center">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Member since {formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {user?.addresses?.[0]?.city},{user?.addresses?.[0]?.state}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                  router.refresh();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              {/* <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button> */}
              <Button variant="outline" size="sm" asChild>
                <Link href={"/sell"}>Switch to Selling</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
