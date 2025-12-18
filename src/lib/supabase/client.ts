import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);
