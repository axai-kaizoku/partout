import { Header } from "@/components/layout/header";
import { Suspense, type PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense>
        <Header />
      </Suspense>
      <main className="max-w-7xl mx-auto md:p-5 p-3 grow bg-background ">{children}</main>
    </div>
  );
}
