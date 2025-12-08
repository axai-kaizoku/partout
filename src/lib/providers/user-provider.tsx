"use client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { UserContext } from "../contexts/user-context";
import { supabaseBrowserClient } from "../supabase/client";

export const UserProvider = ({
  children,
  user: initialUser,
}: {
  user: User | null;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = supabaseBrowserClient();

  useEffect(() => {
    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
