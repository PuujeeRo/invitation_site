import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

// Server client bound to the current request's session cookies. Respects RLS as
// the signed-in organizer -- use this (not the admin client) for every dashboard
// read/write so a bug can never leak another organizer's events.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render (not an action/route handler);
          // middleware refreshes the session cookie for us in that case instead.
        }
      },
    },
  });
}
