"use client";

import { Box, LogOut, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function Header() {
  const router = useRouter();
  const supabase = supabaseBrowserClient();
  const [searchQuery, setSearchQuery] = useState("");
  const _user = useUser()
  const user = _user ? _user : { user_metadata: { name: "Guest", email: "" } }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/parts?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={"/"}>
          <div className="flex items-center">
            <h1 className="font-bold font-playfair text-primary text-xl">Partout.com</h1>
          </div>
        </Link>


        {/* Search Bar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search parts..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/parts")}>
            <Search className="h-5 w-5" />
          </Button>

          {/* <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href={"/cart"}>
              <ShoppingCart className="h-5 w-5" />
              <span className="-top-1 -right-1 absolute flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs">
                2
              </span>
            </Link>
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:text-primary">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.user_metadata?.name?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium capitalize">{user?.user_metadata?.name}</p>
                  <p className="truncate w-[200px] text-sm text-muted-foreground">{user?.user_metadata?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/orders")}>
                <Box className="mr-2 h-4 w-4" />
                Orders</DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => router.push("/favorites")}>Favorites</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header >
  );
}
