"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex h-full min-h-[90dvh] w-full flex-col items-center justify-center gap-0">
      <div className="text-9xl text-neutral-800/10">404</div>
      <h1 className="mt-2 mb-5 font-satoshiBold text-3xl text-primary-600">
        Page Not Found !
      </h1>
      <p className="mb-3 text-center font-medium text-lg text-neutral-800">
        The page you are looking for does not exist or has been moved.
        <br />
        Go back to safety.
      </p>

      <Button onClick={() => router.back()} size={"sm"} className="mt-4 mb-3">
        Go Back
      </Button>
    </div>
  );
}
