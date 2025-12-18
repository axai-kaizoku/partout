import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { getUser } from "@/server/supabase";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs/profile-tabs";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function Page() {
  const user = await getUser();
  if (user?.error) {
    unauthorized();
  }
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <ProfileHeader />
          <ProfileTabs />
        </div>
      </main>
    </div>
  );
}
