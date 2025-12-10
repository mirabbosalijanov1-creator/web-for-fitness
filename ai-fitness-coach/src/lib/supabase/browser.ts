"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase browser client scoped to the current tab.
 * Prevents re-initialization during fast refresh.
 */
export const getSupabaseBrowserClient = (): SupabaseClient => {
  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }

    browserClient = createBrowserClient(url, anonKey, {
      cookieOptions: {
        name: "ai-fitness-auth",
        maxAge: 60 * 60 * 24 * 7,
      },
    });
  }

  return browserClient;
};
