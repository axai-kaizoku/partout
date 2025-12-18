import type { PropsWithChildren } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/hooks/use-cart";
import { UserProvider } from "@/lib/providers/user-provider";
import { getUser } from "@/server/supabase";

export default async function Layout({ children }: PropsWithChildren) {
  const data = await getUser();

  return (
    <UserProvider user={data?.data?.user ?? null}>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="mx-auto w-full max-w-7xl grow bg-background p-3 md:p-5">
            {children}
          </main>
          <BottomNav />
        </div>
      </CartProvider>
    </UserProvider>
  );
}
