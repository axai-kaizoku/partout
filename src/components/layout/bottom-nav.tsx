"use client";

import { Home, Plus, Search, ShoppingCart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  // const { user } = useAuth()
  const user = useUser();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/parts" },
    { icon: Plus, label: "Sell", path: "/sell" },
    user
      ? { icon: User, label: "Profile", path: "/profile" }
      : { icon: User, label: "Login", path: "/sign-in" },
    // { icon: ShoppingCart, label: "Cart", path: "/cart" },
    // { icon: User, label: "Profile", path: user ? "/profile" : "/auth/login" },
  ];

  return (
    <nav className="fixed right-0 bottom-0 left-0 border-border border-t bg-background md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 ${
                isActive ? "" : "text-muted-foreground"
              }`}
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
