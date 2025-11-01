import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/hooks/use-cart";
import { UserProvider } from "@/lib/providers/user-provider";
import { getUser } from "@/server/supabase";
import type { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  const data = await getUser();

  return (
    <UserProvider user={data?.data?.user ?? null}>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="max-w-7xl mx-auto p-5 grow bg-background">{children}</main>
          <BottomNav />
        </div>
      </CartProvider>
    </UserProvider>
  );
}
