"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { B2BRfq } from "@/types/b2b";
import { B2B_RFQ_STATUS_LABELS, getB2BErrorMessage } from "@/lib/b2b-ui";

type RfqRow = B2BRfq & { my_offer: boolean };

function formatPrice(price: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
}

function deadlineInfo(validUntil: string) {
  const days = Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Süre doldu", tone: "bg-slate-100 text-slate-500" };
  if (days <= 3) return { label: `${days} gün kaldı`, tone: "bg-red-50 text-red-700 ring-1 ring-red-200" };
  return { label: `${days} gün kaldı`, tone: "bg-emerald-50 text-emerald-700" };
}

export default function B2BRfqBoard() {
  const [rfqs, setRfqs] = useState<RfqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [sort, setSort] = useState<"newest" | "deadline" | "offers">("newest");
  const [verified, setVerified] = useState(false);
  const [wholesaler, setWholesaler] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }

    const [memberResult, storeResult] = await Promise.all([
      supabase.from("b2b_members").select("verification_status, account_type").eq("user_id", userData.user.id).maybeSingle(),
      supabase.from("b2b_wholesalers").select("id").eq("owner_id", userData.user.id).eq("is_active", true).maybeSingle(),
    ]);
    setVerified(memberResult.data?.verification_status === "verified");
    setWholesaler(Boolean(storeResult.data) || memberResult.data?.account_type === "admin");

    // Expired listings are flagged lazily whenever the board is opened.
    await supabase.rpc("mark_expired_b2b_rfps");
    const { data, error: loadError } = await supabase.rpc("list_open_b2b_rfps");
    if (loadError) setError(getB2BErrorMessage(loadError, "Satın alma ilanları yüklenemedi."));
    setRfqs(((data ?? []) as RfqRow[]).filter((row) => row.status === "open" || row.status === "awarded"));
    setLoading(false);
  }, []);

  useEffect(() => {
    // Board data belongs to the signed-in browser session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const categories = useMemo(() => ["Tümü", ...Array.from(new Set(rfqs.map((rfq) => rfq.category)))], [rfqs]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    const matches = rfqs.filter((rfq) => {
      const categoryMatches = category === "Tümü" || rfq.category === category;
      const textMatches = !normalized || [rfq.title, rfq.category, rfq.buyer_business_name, rfq.city]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalized));
      return categoryMatches && textMatches;
    });
    return [...matches].sort((a, b) => {
      if (sort === "deadline") return new Date(a.valid_until).getTime() - new Date(b.valid_until).getTime();
      if (sort === "offers") return b.offer_count - a.offer_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [category, query, rfqs, sort]);

  const openCount = rfqs.filter((rfq) => rfq.status === "open").length;
  const offerTotal = rfqs.reduce((sum, rfq) => sum + Number(rfq.offer_count ?? 0), 0);

  return <main className="mx-auto max-w-7xl px-4 py-8">
    <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#07111F] text-white shadow-2xl shadow-slate-950/15">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(56,189,248,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -left-24 -bottom-32 size-96 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:p-12">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300"><i className="size-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_#7dd3fc]" /> RFQ tahtası</span>
          <h1 className="mt-5 text-3xl font-black leading-[1.06] tracking-[-0.03em] sm:text-5xl">Aradığını ürünü<br className="hidden sm:block" /> <span className="bg-gradient-to-r from-sky-300 to-cyan-100 bg-clip-text text-transparent">toptancılar sana bulsun.</span></h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-7 text-slate-300">Satın alma ilanını yayınla; doğrulanmış tedarikçiler son teklif tarihine kadar birim fiyatını, tedarik süresini ve koşullarını yazsın. En uygun teklifi tek tıkla seç.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {verified && <Link href="/b2b/rfq/olustur" className="rounded-xl bg-sky-400 px-5 py-3 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-300">+ Satın alma ilanı aç</Link>}
            {!verified && <Link href="/b2b/dogrulama" className="rounded-xl bg-sky-400 px-5 py-3 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-300">İlan açmak için doğrulan →</Link>}
            <a href="#ilanlar" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-black text-white backdrop-blur transition hover:bg-white/10">Açık ilanları gör ↓</a>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><span className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-300">Tahtanın nabzı</span><h2 className="mt-1 text-sm font-black">Bugünün talep akışı</h2></div>{wholesaler && <Link href="/b2b/toptanci-paneli?bolum=rfq" className="rounded-lg bg-violet-500/20 px-3 py-2 text-[9px] font-black text-violet-200 transition hover:bg-violet-500/30">TEKLİF VER →</Link>}</div>
          <div className="grid grid-cols-3 gap-2 pt-4">{[[openCount, "Açık ilan"], [offerTotal, "Toplam teklif"], [categories.length - 1, "Kategori"]].map(([value, label]) => <div key={String(label)} className="rounded-xl bg-white/[0.05] p-3"><strong className="block text-xl font-black text-white">{value}</strong><span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</span></div>)}</div>
        </div>
      </div>
    </section>

    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

    <div id="ilanlar" className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="İlan, kategori, şehir veya esnaf adı ara…" className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-sky-400 focus:bg-white" /></div>
      <div className="flex flex-wrap items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-sky-400">{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-sky-400"><option value="newest">En yeni</option><option value="deadline">Süresi azalan</option><option value="offers">Teklif sayısı</option></select>
      </div>
    </div>

    {loading ? <div className="py-24 text-center text-sm font-bold text-slate-500">Satın alma ilanları hazırlanıyor…</div> : filtered.length === 0 ?
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <h2 className="text-lg font-black text-slate-800">Şu an bu filtrelerle uyuşan açık ilan yok</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Filtreleri temizleyebilir ya da kendi satın alma ilanını açarak tedarikçileri sana getirebilirsin.</p>
        {verified && <Link href="/b2b/rfq/olustur" className="mt-5 inline-block rounded-lg bg-sky-600 px-5 py-3 text-sm font-black text-white">İlan aç</Link>}
      </div> :
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((rfq) => {
        const deadline = deadlineInfo(rfq.valid_until);
        return <Link key={rfq.id} href={`/b2b/rfq/${rfq.id}`} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-900/5">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{rfq.category}</span>
            {rfq.status === "awarded" ? <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-[10px] font-black text-violet-700">{B2B_RFQ_STATUS_LABELS.awarded}</span> : <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${deadline.tone}`}>{deadline.label}</span>}
          </div>
          <h2 className="mt-3 line-clamp-2 text-base font-black leading-snug text-slate-950 transition group-hover:text-sky-700">{rfq.title}</h2>
          {rfq.product_details && <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-5 text-slate-500">{rfq.product_details}</p>}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2 rounded-xl bg-slate-50 px-3.5 py-3">
            <strong className="text-lg font-black text-slate-950">{rfq.quantity} <span className="text-xs font-bold text-slate-500">{rfq.unit}</span></strong>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">alınacak</span>
            {rfq.target_price !== null && <span className="ml-auto text-xs font-black text-emerald-700">Hedef: {formatPrice(Number(rfq.target_price), rfq.currency)}</span>}
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-500">
            <span className="min-w-0 truncate">◈ {rfq.buyer_business_name}{rfq.city ? ` · ${rfq.city}` : ""}</span>
            <span className={`shrink-0 rounded-lg px-2.5 py-1 font-black ${rfq.offer_count > 0 ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-500"}`}>{rfq.offer_count} teklif</span>
          </div>
          {rfq.my_offer && <span className="mt-2.5 rounded-lg bg-violet-50 px-3 py-1.5 text-center text-[10px] font-black text-violet-700">Bu ilana teklif verdin</span>}
        </Link>;
      })}</div>}
  </main>;
}
