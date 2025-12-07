"use client";

import { Box, LogOut, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useDebounce } from "@/hooks/use-debounce";

export function Header() {
  const router = useRouter();
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = supabaseBrowserClient();
  const searchRef = useRef<HTMLInputElement>(null)
  const user = useUser()

  const [term, setTerm] = useState(searchParams.get("q") || "") // Initialize with query param if available
  const debouncedTerm = useDebounce(term.trim(), 600)

  useEffect(() => {
    const isOnParts = pathname.startsWith("/parts")

    if (!debouncedTerm) {
      if (isOnParts && window.location.search.includes("q=")) {
        router.replace("/parts")
      }
      return
    }

    const query = `q=${encodeURIComponent(debouncedTerm)}`
    const hasQuery = window.location.search.includes("q=")
    const currentQuery = window.location.search
    // console.log({ query, currentQuery })

    if (!isOnParts || currentQuery !== query) {
      router.replace(`/parts?${query}`)
      return
    }

    if (hasQuery) {
      router.replace(`/parts${currentQuery}`)
      return
    }
  }, [debouncedTerm])


  useEffect(() => {
    const focusQuickSearch = (e: KeyboardEvent) => {
      if (e.key === "/") {
        searchRef.current?.focus()
      }
    }
    const notificationsAllow = () => {
      if (Notification.permission !== "granted") {
        Notification.requestPermission()
        new Notification("Hello", {
          body: "Hello World",
        })
      }
    }

    window.addEventListener("keydown", focusQuickSearch)
    // notificationsAllow()

    return () => {
      window.removeEventListener("keydown", focusQuickSearch)
    }
  }, [])


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={"/"}>
          <div className="flex items-center">
            <h1 className="font-bold font-playfair text-primary text-xl">Partout.com</h1>
          </div>
        </Link>


        {/* Search Bar - Hidden on mobile, shown on desktop */}
        <div className="relative mx-6 hidden w-full max-w-md flex-1 md:flex">
          {/* <form onSubmit={handleSearch} className=""> */}
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
          <Input
            placeholder="Search parts..."
            className="pr-4 pl-10"
            ref={searchRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {/* </form> */}
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

          {user ? (
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

          ) : <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:text-primary" asChild>
            <Link href={"/sign-in"}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={"/media/placeholder-user.jpg"} />
              </Avatar>
            </Link>
          </Button>}

        </div >
      </div >
    </header >
  );
}
