"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export default function Page() {
  const mutation = api.partInfo.createMockMakes.useMutation({
    mutationKey: ["create-mock-makes"],
  });

  const makes = api.partInfo.getMakes.useQuery();
  return (
    <div>
      <h1>Seed Data</h1>
      <pre>{JSON.stringify(makes.data, null, 4)}</pre>
      {/* <Button onClick={() => mutation.mutate()}>Seed Categories</Button> */}
      <Button onClick={() => mutation.mutate()}>Seed Make</Button>
    </div>
  );
}
