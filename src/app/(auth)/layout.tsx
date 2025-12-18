import { type PropsWithChildren, Suspense } from "react";
import { Header } from "@/components/layout/header";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="mx-auto max-w-7xl grow bg-background p-3 md:p-5">
        {children}
      </main>
    </div>
  );
}
