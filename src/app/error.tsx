"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error() {
  return (
    <div className="h-full min-h-[90dvh] w-full flex  flex-col gap-0 justify-center items-center">
      <img
        src={"/media/offer-expired/sand-clock.png"}
        alt="Sand Clock"
        width={300}
        height={300}
        className="object-contain"
      />
      <h1 className="text-3xl font-satoshiBold text-primary-600 mt-2  mb-5">Something went wrong on our end !</h1>
      <p className="text-neutral-800 text-center font-medium text-lg mb-3">
        An unexpected error occurred while rendering this page. Try refreshing,
        <br />
        or go back to safety.
      </p>

      <Button asChild size={"sm"} className="mt-4 mb-3">
        <Link prefetch={false} href={"/"}>
          Reload
        </Link>
      </Button>
    </div>
  );
}
