"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { B2BWholesaler } from "@/types/b2b";

export default function B2BWholesalers() {
  const [stores, setStores] = useState<B2BWholesaler[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("b2b_wholesalers")
      .select("id, name, slug, description, logo_url, cover_url, city, shipping_terms, rating, review_count")
      .eq("is_active", true)
      .order("rating", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        setStores((data ?? []) as B2BWholesaler[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase("tr-TR");
    return stores.filter((store) => !value || [store.name, store.city, store.description].filter(Boolean).some((item) => String(item).toLocaleLowerCase("tr-TR").includes(value)));
  }, [query, stores]);

  const cityCount = new Set(stores.map((store) => store.city).filter(Boolean)).size;
  const averageRating = stores.length ? stores.reduce((total, store) => total + Number(store.rating || 0), 0) / stores.length : 0;

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Toptancılar hazırlanıyor…</div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-9">
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-2xl shadow-slate-950/10">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.06)_1px,transparent_1px)] bg-[size:36px_36px]" />
        <div className="relative grid gap-6 p-7 sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Tedarikçi ağı / Türkiye</span>
            <h1 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-5xl">Doğrulanmış ticaret ortaklarını keşfedin.</h1>
            <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-slate-300">Koşulları, ürün portföyünü ve gerçek ticaret sonrası oluşan itibarı tek profilde karşılaştırın.</p>
            <div className="relative mt-7 max-w-xl">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Toptancı, şehir veya uzmanlık ara…" className="min-h-14 w-full rounded-2xl border border-white/10 bg-white/[.08] pl-11 pr-4 text-base font-semibold text-white outline-none backdrop-blur placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-white/[.12]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {[[stores.length, "Aktif mağaza"], [cityCount, "Şehir"], [averageRating.toFixed(1), "Ağ puanı"]].map(([value, label], index) => (
              <div key={label} className="flex flex-col rounded-2xl border border-white/10 bg-white/[.05] p-4 lg:flex-row lg:items-center lg:justify-between">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 lg:mt-0">0{index + 1} / {label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Tedarikçi dizini</p><h2 className="mt-1 text-xl font-black text-slate-950">{filtered.length} mağaza listeleniyor</h2></div><span className="hidden text-xs font-bold text-slate-400 sm:block">İtibar puanına göre sıralı</span></div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm font-semibold text-slate-500">Henüz aktif toptancı mağazası bulunmuyor.</div> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((store) => (
            <Link key={store.id} href={`/b2b/toptanci/${store.slug}`} className="group overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-900/5">
              <div className="relative h-32 overflow-hidden bg-[linear-gradient(135deg,#07111f,#075985)]">{store.cover_url && <img src={store.cover_url} alt="" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105" />}<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:24px_24px]" /><span className="absolute right-4 top-4 rounded-full border border-white/15 bg-slate-950/40 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur">B2B verified</span></div>
              <div className="relative p-5 pt-10">
                <div className="absolute -top-8 left-5 flex size-16 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-sky-50 text-xl font-black text-sky-700 shadow-sm">{store.logo_url ? <img src={store.logo_url} alt={`${store.name} logosu`} className="h-full w-full object-cover" /> : store.name.slice(0, 2).toLocaleUpperCase("tr-TR")}</div>
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950 group-hover:text-sky-700">{store.name}</h2><p className="text-xs font-semibold text-slate-500">{store.city || "Türkiye geneli"}</p></div><span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">✓ Doğrulandı</span></div>
                {store.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{store.description}</p>}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs"><strong className="text-amber-600">★ {Number(store.rating).toFixed(1)} <span className="text-slate-400">({store.review_count})</span></strong><span className="font-black text-slate-950 transition group-hover:text-sky-700">Profili incele <span className="inline-block transition group-hover:translate-x-1">→</span></span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
