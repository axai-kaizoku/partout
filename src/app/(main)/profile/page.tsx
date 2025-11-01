// "use client";
import { getUser } from "@/server/supabase";
import { unauthorized } from "next/navigation";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs/profile-tabs";
// import { AuthGuard } from "@/components/auth-guard"

export default async function Page() {
  const user = await getUser();
  if (user?.error) {
    unauthorized();
  }
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ProfileHeader />
          <ProfileTabs />
        </div>
      </main>
    </div>
  );
}
