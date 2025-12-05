"use client";

import { Home, Search, ShoppingCart, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  // const { user } = useAuth()

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/parts" },
    { icon: Plus, label: "Sell", path: "/sell" },
    // { icon: ShoppingCart, label: "Cart", path: "/cart" },
    // { icon: User, label: "Profile", path: user ? "/profile" : "/auth/login" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 ${isActive ? "" : "text-muted-foreground"}`}
              onClick={() => router.push(item.path)}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
