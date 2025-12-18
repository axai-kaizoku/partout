import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Partout.com account to continue shopping",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-bold font-playfair text-2xl">
              Join Partout.com
            </CardTitle>
            <CardDescription>
              Create your account to start buying and selling auto parts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <SignupForm />
            </Suspense>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link href="/sign-in" className="font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
