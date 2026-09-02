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

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Toptancılar hazırlanıyor…</div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-9">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-950/5"><div className="absolute inset-y-0 right-0 hidden w-3/5 bg-[url('/b2b/catalog-showcase.webp')] bg-cover bg-center md:block" /><div className="absolute inset-0 bg-gradient-to-r from-white via-white to-white/10" /><div className="relative max-w-2xl p-7 sm:p-10"><span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Özel mağazalar</span><h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Doğrulanmış toptancılar</h1><p className="mt-3 max-w-lg text-sm font-medium leading-6 text-slate-600">Mağaza koşullarını, ürünlerini ve yalnızca gerçek ticaret sonrası verilen değerlendirmeleri inceleyin.</p><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Toptancı veya şehir ara…" className="mt-6 min-h-12 w-full rounded-xl border border-slate-200 bg-white/95 px-4 text-base shadow-sm outline-none focus:border-sky-500 sm:max-w-md" /></div></section>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm font-semibold text-slate-500">Henüz aktif toptancı mağazası bulunmuyor.</div> : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((store) => (
            <Link key={store.id} href={`/b2b/toptanci/${store.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
              <div className="relative h-32 bg-gradient-to-br from-slate-900 to-sky-800">{store.cover_url && <img src={store.cover_url} alt="" className="h-full w-full object-cover opacity-80" />}</div>
              <div className="relative p-5 pt-10">
                <div className="absolute -top-8 left-5 flex size-16 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-sky-50 text-xl font-black text-sky-700 shadow-sm">{store.logo_url ? <img src={store.logo_url} alt={`${store.name} logosu`} className="h-full w-full object-cover" /> : store.name.slice(0, 2).toLocaleUpperCase("tr-TR")}</div>
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950 group-hover:text-sky-700">{store.name}</h2><p className="text-xs font-semibold text-slate-500">{store.city || "Türkiye geneli"}</p></div><span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">✓ Doğrulandı</span></div>
                {store.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{store.description}</p>}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs"><strong className="text-amber-600">★ {Number(store.rating).toFixed(1)} <span className="text-slate-400">({store.review_count})</span></strong><span className="font-black text-sky-700">Mağazaya gir →</span></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
