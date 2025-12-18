import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex grow items-center justify-center px-4 py-20 text-center">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-semibold text-2xl">401 - Unauthorized</h1>
          <p className="text-muted-foreground">Please sign in to continue.</p>
        </div>
        <div>
          <Button asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
