"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function B2BAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        router.replace(`/b2b/giris?next=${encodeURIComponent(pathname)}`);
        return;
      }
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-[55vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <span className="size-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          Güvenli oturum kontrol ediliyor…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

