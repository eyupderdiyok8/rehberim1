"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function getAdminRole(email?: string): Promise<"admin" | "firm" | null> {
  // If email is provided directly (e.g. after signIn), use it without reading cookies
  if (email) {
    return email === process.env.ADMIN_EMAIL ? "admin" : "firm";
  }
  // Otherwise read from session cookies (e.g. for layout auth checks)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return user.email === process.env.ADMIN_EMAIL ? "admin" : "firm";
}
