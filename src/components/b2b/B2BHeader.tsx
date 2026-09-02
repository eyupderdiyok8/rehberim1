"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function B2BHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (!data.user) return;
      const { data: member } = await supabase.from("b2b_members").select("account_type").eq("user_id", data.user.id).maybeSingle();
      setAccountType(member?.account_type ?? null);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/b2b/giris");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4">
        <Link href="/b2b" className="shrink-0 text-lg font-black tracking-tight text-slate-950">
          Su Arıtma <span className="text-sky-600">Pro</span>
        </Link>
        {email && (
          <nav className="hidden items-center gap-5 md:flex">
            <Link href="/b2b" className="text-sm font-bold text-slate-600 hover:text-sky-600">Ürünler</Link>
            <Link href="/b2b/toptancilar" className="text-sm font-bold text-slate-600 hover:text-sky-600">Toptancılar</Link>
            <Link href="/b2b/taleplerim" className="text-sm font-bold text-slate-600 hover:text-sky-600">Taleplerim</Link>
            <Link href="/b2b/dogrulama" className="text-sm font-bold text-slate-600 hover:text-sky-600">Esnaf doğrulama</Link>
            {(accountType === "wholesaler" || accountType === "admin") && <Link href="/b2b/toptanci-paneli" className="text-sm font-bold text-slate-600 hover:text-sky-600">Toptancı paneli</Link>}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-3">
          {email ? (
            <>
              <span className="hidden max-w-52 truncate text-xs font-semibold text-slate-500 sm:block">{email}</span>
              <button onClick={logout} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                Çıkış
              </button>
            </>
          ) : (
            <Link href="/b2b/giris" className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700">Giriş yap</Link>
          )}
        </div>
      </div>
    </header>
  );
}
