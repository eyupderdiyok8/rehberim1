"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ad = { id: string; wholesaler_id: string; ad_type: "notification" | "popup"; title: string; body: string; image_url: string | null; cta_label: string; target_url: string; status: string; starts_at: string; ends_at: string; daily_budget: number | null; total_budget: number | null; impressions: number; clicks: number; admin_note: string | null; created_at: string };
type Store = { id: string; name: string };

export default function AdminB2BAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const [adsResult, storesResult] = await Promise.all([
      supabase.from("b2b_ads").select("id, wholesaler_id, ad_type, title, body, image_url, cta_label, target_url, status, starts_at, ends_at, daily_budget, total_budget, impressions, clicks, admin_note, created_at").order("created_at", { ascending: false }),
      supabase.from("b2b_wholesalers").select("id, name"),
    ]);
    if (adsResult.error || storesResult.error) setError(adsResult.error?.message || storesResult.error?.message || "Veriler yüklenemedi.");
    setAds((adsResult.data ?? []) as Ad[]); setStores((storesResult.data ?? []) as Store[]);
  };

  useEffect(() => {
    // Admin session is verified by the parent panel layout.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const storeNames = useMemo(() => new Map(stores.map((store) => [store.id, store.name])), [stores]);
  const filtered = ads.filter((ad) => filter === "all" || ad.status === filter);
  const update = async (ad: Ad, status: string) => {
    setBusy(ad.id); setError("");
    const note = status === "rejected" ? window.prompt("Ret gerekçesi (toptancı görecek):", ad.admin_note || "") : ad.admin_note;
    if (status === "rejected" && note === null) { setBusy(""); return; }
    const { error: updateError } = await supabase.from("b2b_ads").update({ status, admin_note: note || null, updated_at: new Date().toISOString() }).eq("id", ad.id);
    setBusy(""); if (updateError) return setError(updateError.message); await load();
  };

  return <div className="space-y-6"><header><span className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">B2B gelir yönetimi</span><h1 className="mt-2 text-3xl font-black text-slate-950">Reklam onayları</h1><p className="mt-2 text-sm font-medium text-slate-500">Bildirim ve popup kampanyalarını yayına almadan önce inceleyin.</p></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    <section className="grid gap-4 sm:grid-cols-3">{[[ads.length,"Toplam"],[ads.filter((ad)=>ad.status==="pending").length,"Onay bekliyor"],[ads.filter((ad)=>["active","approved"].includes(ad.status)).length,"Yayında / hazır"]].map(([value,label])=><div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5"><strong className="text-3xl font-black text-slate-950">{value}</strong><span className="ml-2 text-xs font-bold text-slate-500">{label}</span></div>)}</section>
    <div className="flex gap-2 overflow-x-auto">{["all","pending","approved","active","paused","rejected"].map((item)=><button key={item} onClick={()=>setFilter(item)} className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-black ${filter===item?"bg-slate-950 text-white":"border border-slate-200 bg-white text-slate-600"}`}>{item === "all" ? "Tümü" : item}</button>)}</div>
    <section className="space-y-4">{filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm font-semibold text-slate-500">Bu durumda kampanya yok.</div> : filtered.map((ad)=><article key={ad.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="grid md:grid-cols-[180px_1fr]"><div className="grid min-h-36 place-items-center bg-slate-950 text-white">{ad.image_url ? <img src={ad.image_url} alt="" className="h-full w-full object-cover" /> : <div className="text-center"><span className="text-3xl">✦</span><span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-sky-300">Bildirim reklam</span></div>}</div><div className="p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><span className="text-[9px] font-black uppercase tracking-wider text-violet-600">{storeNames.get(ad.wholesaler_id) || "Toptancı"} · {ad.ad_type}</span><h2 className="mt-1 text-lg font-black text-slate-950">{ad.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{ad.body}</p></div><span className="h-fit rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{ad.status}</span></div><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4"><span className="mr-auto text-[10px] font-bold text-slate-400">{new Date(ad.starts_at).toLocaleDateString("tr-TR")} – {new Date(ad.ends_at).toLocaleDateString("tr-TR")} · {ad.impressions} gösterim · {ad.clicks} tıklama</span><button disabled={busy===ad.id} onClick={()=>update(ad,"approved")} className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-black text-sky-700">Onayla</button><button disabled={busy===ad.id} onClick={()=>update(ad,"active")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Yayına al</button><button disabled={busy===ad.id} onClick={()=>update(ad,"paused")} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">Duraklat</button><button disabled={busy===ad.id} onClick={()=>update(ad,"rejected")} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">Reddet</button></div></div></div></article>)}</section>
  </div>;
}
