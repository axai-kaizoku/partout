"use client";
import type { UserResponse } from "@supabase/supabase-js";
import { UserContext } from "../contexts/user-context";

export const UserProvider = ({
  children,
  user,
}: {
  user: UserResponse["data"]["user"] | null;
  children: React.ReactNode;
}) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
