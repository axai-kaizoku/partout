import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/hooks/use-auth";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto p-5 grow bg-background ">{children}</main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
