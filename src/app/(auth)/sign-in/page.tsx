import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
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

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-background">
			<main className="flex items-center justify-center px-4 py-12">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<CardTitle className="font-bold font-playfair text-2xl">
							Welcome Back
						</CardTitle>
						<CardDescription>
							Sign in to your Partout.com account to continue shopping
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Suspense>
							<LoginForm />
						</Suspense>
						<div className="mt-6 text-center text-sm">
							<span className="text-muted-foreground">
								Don't have an account?{" "}
							</span>
							<Link href="/sign-up" className="font-medium hover:underline">
								Sign up
							</Link>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
