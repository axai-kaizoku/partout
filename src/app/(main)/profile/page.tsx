"use client";
import { ProfileHeader } from "./_components/profile-header";
import { ProfileTabs } from "./_components/profile-tabs";
// import { AuthGuard } from "@/components/auth-guard"

export default function Page() {
  return (
    // <AuthGuard>
    <div className="min-h-screen bg-background">
      {/* <Header /> */}

      <main className="pb-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ProfileHeader />
          <ProfileTabs />
        </div>
      </main>

      {/* <BottomNav /> */}
    </div>
    // </AuthGuard>
  );
}
