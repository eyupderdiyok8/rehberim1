"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OnlineMember = {
  member_id: string;
  account_type: "buyer" | "wholesaler" | "admin";
  business_name: string;
  city: string | null;
  store_id: string | null;
  store_slug: string | null;
  store_name: string | null;
  store_rating: number | null;
  last_seen_at: string;
};

function OnlineList({ items, type, busy, onStartChat }: { items: OnlineMember[]; type: "wholesaler" | "buyer"; busy: string; onStartChat: (member: OnlineMember) => void }) {
  return <div className="space-y-3">{items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm font-semibold text-slate-500">Şu anda çevrimiçi {type === "buyer" ? "esnaf" : "toptancı"} görünmüyor.</div> : items.map((member) => <article key={member.member_id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
    <div className="flex items-center gap-4"><div className={`relative grid size-12 shrink-0 place-items-center rounded-2xl text-sm font-black ${type === "wholesaler" ? "bg-sky-950 text-sky-300" : "bg-violet-50 text-violet-700"}`}>{(member.store_name || member.business_name).slice(0,2).toLocaleUpperCase("tr-TR")}<i className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-950">{member.store_name || member.business_name}</h3><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase text-emerald-700">● Çevrimiçi</span></div><p className="mt-1 text-xs font-semibold text-slate-500">{member.city || "Türkiye"}{type === "wholesaler" && ` · ★ ${Number(member.store_rating || 0).toFixed(1)}`}</p></div></div>
    <div className="flex gap-2">{member.store_slug && <Link href={`/b2b/toptanci/${member.store_slug}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700">Mağaza</Link>}{member.store_id && <button disabled={busy === member.member_id} onClick={() => onStartChat(member)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">Mesaj gönder</button>}</div>
  </article>)}</div>;
}

export default function B2BNetwork() {
  const router = useRouter();
  const [members, setMembers] = useState<OnlineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const { data, error: loadError } = await supabase.rpc("list_online_b2b_members");
    if (loadError) setError(loadError.message);
    else setMembers((data ?? []) as OnlineMember[]);
    setLoading(false);
  };

  useEffect(() => {
    // Presence data is loaded from the authenticated network session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const timer = window.setInterval(load, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const wholesalers = useMemo(() => members.filter((member) => member.account_type === "wholesaler" || member.store_id), [members]);
  const buyers = useMemo(() => members.filter((member) => member.account_type === "buyer" && !member.store_id), [members]);

  const startChat = async (member: OnlineMember) => {
    if (!member.store_id) return;
    setBusy(member.member_id);
    const { data, error: chatError } = await supabase.rpc("open_b2b_conversation", { p_wholesaler_id: member.store_id, p_trade_request_id: null });
    setBusy("");
    if (chatError) return setError(chatError.message);
    router.push(`/b2b/mesajlar?conversation=${data}`);
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Ticaret ağı hazırlanıyor…</div>;

  return <main className="mx-auto max-w-7xl px-4 py-9">
    <section className="mb-8 overflow-hidden rounded-[2rem] bg-[#07111f] p-7 text-white sm:p-10"><div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end"><div><span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">● Canlı ticaret ağı</span><h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Kimler şu anda iş başında?</h1><p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-300">Çevrimiçi tedarikçiyi bulun, mağazasını inceleyin ve platformdan ayrılmadan görüşmeyi başlatın.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[.06] px-6 py-4"><strong className="text-3xl font-black text-sky-300">{wholesalers.length}</strong><span className="ml-2 text-xs font-bold text-slate-400">toptancı</span></div><div className="rounded-2xl border border-white/10 bg-white/[.06] px-6 py-4"><strong className="text-3xl font-black text-violet-300">{buyers.length}</strong><span className="ml-2 text-xs font-bold text-slate-400">esnaf</span></div></div></div></section>
    {error && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    <div className="grid gap-8 lg:grid-cols-2"><section><div className="mb-4"><span className="text-[10px] font-black uppercase tracking-wider text-sky-600">Satıcılar</span><h2 className="mt-1 text-xl font-black">Online Toptancı</h2></div><OnlineList items={wholesalers} type="wholesaler" busy={busy} onStartChat={startChat} /></section><section><div className="mb-4"><span className="text-[10px] font-black uppercase tracking-wider text-violet-600">Alıcılar</span><h2 className="mt-1 text-xl font-black">Online Esnaf</h2></div><OnlineList items={buyers} type="buyer" busy={busy} onStartChat={startChat} /></section></div>
  </main>;
}
