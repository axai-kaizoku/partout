import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Partout",
    template: "%s | Partout",
  },
  description:
    "Partout is a next-generation e-commerce platform that empowers businesses to create stunning online stores with ease. Experience seamless shopping and management with Partout.",
  keywords: [
    "e-commerce",
    "online store",
    "shopping platform",
    "next-generation e-commerce",
    "Partout",
    "digital marketplace",
    "store management",
    "seamless shopping",
    "business solutions",
    "retail technology",
  ],
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    type: "website",
    url: "https://part-out.vercel.app",
  },
  robots: {
    follow: true,
  },
  metadataBase: new URL("https://part-out.vercel.app"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-16x16.png",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="antialiased">
        <TRPCReactProvider>
          {children}
          <Toaster position="top-right" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
