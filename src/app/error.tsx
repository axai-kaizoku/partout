"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Error() {
  const router = useRouter();
  return (
    <div className="h-full min-h-[90dvh] w-full flex  flex-col gap-0 justify-center items-center">
      <div className="text-9xl text-neutral-800/10">Error</div>
      <h1 className="text-3xl font-satoshiBold text-primary-600 mt-2  mb-5">Something went wrong on our end !</h1>
      <p className="text-neutral-800 text-center font-medium text-lg mb-3">
        An unexpected error occurred while rendering this page. Try refreshing,
        <br />
        or go back to safety.
      </p>

      <Button onClick={() => router.refresh()} size={"sm"} className="mt-4 mb-3">
        Reload
      </Button>
    </div>
  );
}
