"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Session of the signed-in B2B user, kept in sync across client-side navigation.
 *
 * Widgets rendered by the B2B layout (header, ad layer, onboarding guide) survive
 * route changes, so reading the session once at mount freezes them in a stale
 * auth state: after `signInWithPassword` + `router.push` the menu still looks
 * logged out until a full page reload. This hook resolves the stored session up
 * front and then follows every sign-in/sign-out transition.
 */
export function useB2BSession(): Session | null {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let active = true;
    let appliedUserId: string | null = null;

    // Repeated events for the same account (hourly token refreshes, the initial
    // event racing the explicit lookup below) must not re-run downstream reads.
    const apply = (value: Session | null) => {
      const userId = value?.user?.id ?? null;
      if (!active || appliedUserId === userId) return;
      appliedUserId = userId;
      setSession(value);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, value) => apply(value));
    supabase.auth.getSession().then(({ data }) => apply(data.session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return session;
}
