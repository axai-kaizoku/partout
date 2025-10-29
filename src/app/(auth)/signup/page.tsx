import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-2xl font-bold">Join Partout.com</CardTitle>
            <CardDescription>Create your account to start buying and selling auto parts</CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/auth/login" className="text-accent hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
