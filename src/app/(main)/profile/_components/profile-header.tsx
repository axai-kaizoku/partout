"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Shield, Calendar, MapPin, LogOut } from "lucide-react";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import Link from "next/link";
export function ProfileHeader() {
  const user = useUser();
  const router = useRouter();
  const supabase = supabaseBrowserClient();
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20">
            {/* <AvatarImage src={user.avatar || "/media/placeholder.svg"} alt={user.name} /> */}
            <AvatarFallback className="text-lg">{user?.user_metadata.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-playfair text-2xl font-bold text-foreground">{user?.user_metadata?.name}</h1>
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Member since {new Date(user?.created_at)?.toISOString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Los Angeles, CA</span>
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
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
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
