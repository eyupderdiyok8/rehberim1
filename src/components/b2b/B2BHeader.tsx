"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/b2b", label: "Pazar" },
  { href: "/b2b/toptancilar", label: "Tedarikçiler" },
  { href: "/b2b/cevrimici", label: "Çevrimiçi" },
  { href: "/b2b/mesajlar", label: "Mesajlar" },
  { href: "/b2b/taleplerim", label: "Taleplerim" },
];

export default function B2BHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [verification, setVerification] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (!data.user) return;
      const { data: member } = await supabase.from("b2b_members").select("account_type, verification_status, business_name").eq("user_id", data.user.id).maybeSingle();
      setAccountType(member?.account_type ?? null);
      setVerification(member?.verification_status ?? null);
      setBusinessName(member?.business_name ?? null);
    });
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/b2b/giris");
    router.refresh();
  };

  return <>
    <div className="hidden bg-[#07111F] text-white sm:block"><div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[10px] font-bold tracking-wide text-slate-300"><span>Türkiye&apos;nin profesyonel su arıtma tedarik ağı</span><div className="flex items-center gap-5"><span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" /> Güvenli ticaret sistemi aktif</span><span>Fiyatlar yalnızca doğrulanmış esnafa açık</span></div></div></div>
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-5 px-4">
        <Link href="/b2b" className="flex shrink-0 items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#07111F] text-sm font-black text-sky-400 shadow-lg shadow-slate-950/15">SA</span><span className="leading-none"><strong className="block text-sm font-black tracking-tight text-slate-950">Su Arıtma Pro</strong><small className="mt-1 block text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Trade network</small></span></Link>
        {email && <nav className="hidden items-center gap-1 rounded-xl bg-slate-100/80 p-1 xl:flex">{navItems.map((item) => { const active = item.href === "/b2b" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2 text-xs font-black transition ${active ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>{item.label}</Link>; })}{(accountType === "wholesaler" || accountType === "admin") && <Link href="/b2b/toptanci-paneli" className={`rounded-lg px-3 py-2 text-xs font-black ${pathname.startsWith("/b2b/toptanci-paneli") ? "bg-violet-600 text-white shadow-sm" : "text-violet-700 hover:bg-violet-50"}`}>Satıcı merkezi</Link>}</nav>}
        <div className="ml-auto flex items-center gap-2.5">{email ? <><Link href="/b2b/dogrulama" className={`hidden rounded-xl border px-3 py-2 text-[10px] font-black sm:flex sm:items-center sm:gap-2 ${verification === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}><span className={`size-1.5 rounded-full ${verification === "verified" ? "bg-emerald-500" : "bg-amber-500"}`} />{verification === "verified" ? "Doğrulanmış hesap" : "Doğrulama gerekli"}</Link><div className="hidden text-right md:block"><strong className="block max-w-36 truncate text-[11px] text-slate-800">{businessName || email}</strong><span className="block text-[9px] font-bold text-slate-400">{accountType === "wholesaler" ? "Toptancı hesabı" : "Alıcı hesabı"}</span></div><button onClick={logout} aria-label="Çıkış yap" className="grid size-9 place-items-center rounded-xl border border-slate-200 text-sm font-black text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">↗</button></> : <Link href="/b2b/giris" className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Giriş yap</Link>}</div>
      </div>
      {email && <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 xl:hidden">{navItems.map((item) => <Link key={item.href} href={item.href} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black ${pathname === item.href ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{item.label}</Link>)}{(accountType === "wholesaler" || accountType === "admin") && <Link href="/b2b/toptanci-paneli" className="shrink-0 rounded-lg bg-violet-50 px-3 py-2 text-xs font-black text-violet-700">Satıcı merkezi</Link>}</nav>}
    </header>
  </>;
}
