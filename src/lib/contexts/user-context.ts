"use client";
import { createContext } from "react";
import { type UserResponse } from "@supabase/supabase-js";

export const UserContext = createContext<UserResponse["data"]["user"] | null>(null);
