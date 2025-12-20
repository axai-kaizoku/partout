"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);
  return (
    <div className="flex h-full min-h-[90dvh] w-full flex-col items-center justify-center gap-0">
      <div className="text-9xl text-neutral-800/10">Error</div>
      <h1 className="mt-2 mb-5 font-satoshiBold text-3xl text-primary-600">
        Something went wrong on our end !
      </h1>
      <p className="mb-3 text-center font-medium text-lg text-neutral-800">
        An unexpected error occurred while rendering this page. Try refreshing,
        <br />
        or go back to safety.
      </p>

      <Button onClick={reset} size={"sm"} className="mt-4 mb-3">
        Reload
      </Button>
    </div>
  );
}
