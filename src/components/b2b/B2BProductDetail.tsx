"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { B2BMember, B2BProduct } from "@/types/b2b";

type PricePoint = { price: number; currency: string; vat_included: boolean; recorded_at: string };

function PriceHistory({ points, currency }: { points: PricePoint[]; currency: string }) {
  const ordered = [...points].reverse().slice(-16);
  const values = ordered.map((point) => Number(point.price));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const polyline = ordered.map((point, index) => {
    const x = ordered.length === 1 ? 300 : 20 + (index / (ordered.length - 1)) * 560;
    const y = 102 - ((Number(point.price) - min) / range) * 78;
    return `${x},${y}`;
  }).join(" ");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">Fiyat şeffaflığı</span><h2 className="mt-1 text-lg font-black text-slate-950">Fiyat geçmişi</h2></div><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">Son {ordered.length} değişiklik</span></div>
      {ordered.length < 2 ? <p className="mt-8 text-sm font-medium text-slate-500">Grafik için henüz yeterli fiyat değişimi yok.</p> : (
        <>
          <svg viewBox="0 0 600 120" className="mt-5 h-36 w-full" role="img" aria-label="Ürün fiyat geçmişi grafiği">
            <line x1="20" y1="102" x2="580" y2="102" stroke="#E2E8F0" />
            <line x1="20" y1="63" x2="580" y2="63" stroke="#E2E8F0" />
            <line x1="20" y1="24" x2="580" y2="24" stroke="#E2E8F0" />
            <polyline points={polyline} fill="none" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex justify-between text-xs font-bold text-slate-500"><span>En düşük: {new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(min)}</span><span>En yüksek: {new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(max)}</span></div>
        </>
      )}
    </section>
  );
}

export default function B2BProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<B2BProduct | null>(null);
  const [member, setMember] = useState<B2BMember | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: memberData } = await supabase.from("b2b_members").select("user_id, account_type, verification_status, business_name, review_note").eq("user_id", userData.user.id).maybeSingle();
      if (memberData) setMember(memberData as B2BMember);
      const { data } = await supabase.from("b2b_products").select("id, wholesaler_id, name, slug, brand, category, description, image_urls, specifications, minimum_order_quantity, unit, vat_included, stock_status, lead_time_days, wholesaler:b2b_wholesalers!inner(id, name, slug, description, logo_url, cover_url, city, shipping_terms, rating, review_count)").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (!data) { setLoading(false); return; }
      const item = { ...data, wholesaler: Array.isArray(data.wholesaler) ? data.wholesaler[0] : data.wholesaler } as B2BProduct;
      setQuantity(Number(item.minimum_order_quantity));
      if (memberData?.verification_status === "verified") {
        const [priceResult, historyResult] = await Promise.all([
          supabase.from("b2b_product_prices").select("price, currency").eq("product_id", item.id).maybeSingle(),
          supabase.from("b2b_price_history").select("price, currency, vat_included, recorded_at").eq("product_id", item.id).order("recorded_at", { ascending: false }).limit(16),
        ]);
        if (priceResult.data) Object.assign(item, priceResult.data);
        setHistory((historyResult.data ?? []) as PricePoint[]);
      }
      setProduct(item);
      setLoading(false);
    };
    load();
  }, [slug]);

  const verified = member?.verification_status === "verified";
  const images = product?.image_urls ?? [];
  const specs = useMemo(() => Object.entries(product?.specifications ?? {}), [product]);

  const requestQuote = async () => {
    if (!product || !verified) return;
    setMessage("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from("b2b_trade_requests").insert({ product_id: product.id, buyer_id: userData.user.id, wholesaler_id: product.wholesaler_id, quantity });
    setMessage(error ? "Talep gönderilemedi: " + error.message : "Teklif talebiniz toptancıya iletildi.");
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Ürün hazırlanıyor…</div>;
  if (!product) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-black">Ürün bulunamadı</h1><Link href="/b2b" className="mt-4 inline-block text-sm font-bold text-sky-700">Ürünlere dön</Link></div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/b2b" className="mb-5 inline-flex text-xs font-black text-sky-700">← Ürünlere dön</Link>
      <div className="grid gap-7 lg:grid-cols-[1.08fr_.92fr]">
        <section className="grid gap-3 sm:grid-cols-[72px_1fr]">
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">{images.map((image, index) => <button key={image} type="button" onClick={() => setSelectedImage(index)} className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${selectedImage === index ? "border-sky-500" : "border-slate-200"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>
          <div className="order-1 flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-sky-50 sm:order-2">{images[selectedImage] ? <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-contain p-6" /> : <span className="text-8xl text-sky-200">◈</span>}</div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">{product.category}{product.brand ? ` · ${product.brand}` : ""}</span>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950">{product.name}</h1>
          <Link href={`/b2b/toptanci/${product.wholesaler?.slug}`} className="mt-3 inline-flex text-sm font-bold text-sky-700 hover:underline">{product.wholesaler?.name} · ★ {Number(product.wholesaler?.rating ?? 0).toFixed(1)}</Link>
          {product.description && <p className="mt-5 text-sm font-medium leading-7 text-slate-600">{product.description}</p>}
          <div className="mt-6 rounded-xl bg-slate-50 p-5"><span className="text-xs font-bold text-slate-500">Esnafa özel toptan fiyat</span><strong className="mt-2 block text-2xl font-black text-slate-950">{verified && product.price !== undefined ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: product.currency || "TRY" }).format(product.price) : "🔒 Fiyat erişimi kapalı"}</strong>{!verified && <Link href="/b2b/dogrulama" className="mt-3 inline-block text-xs font-black text-sky-700">İşletmenizi doğrulayın →</Link>}</div>
          <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-slate-200"><div className="bg-white p-4"><span className="block text-[10px] font-bold uppercase text-slate-400">Minimum</span><strong className="mt-1 block text-sm">{product.minimum_order_quantity} {product.unit}</strong></div><div className="bg-white p-4"><span className="block text-[10px] font-bold uppercase text-slate-400">Vergi</span><strong className="mt-1 block text-sm">{product.vat_included ? "KDV dahil" : "KDV hariç"}</strong></div><div className="bg-white p-4"><span className="block text-[10px] font-bold uppercase text-slate-400">Hazırlık</span><strong className="mt-1 block text-sm">{product.lead_time_days} gün</strong></div></div>
          {verified && <div className="mt-6 flex gap-3"><input type="number" min={product.minimum_order_quantity} step="1" value={quantity} onChange={(e) => setQuantity(Math.max(Number(product.minimum_order_quantity), Number(e.target.value)))} aria-label={`Sipariş miktarı (${product.unit})`} className="w-28 rounded-xl border border-slate-200 px-3 text-base font-bold" /><button type="button" onClick={requestQuote} className="min-h-12 flex-1 rounded-xl bg-sky-600 px-5 text-sm font-black text-white hover:bg-sky-700">Teklif iste</button></div>}
          {message && <p className="mt-3 rounded-lg bg-sky-50 p-3 text-xs font-bold text-sky-800">{message}</p>}
        </section>
        {verified && product.price !== undefined && <PriceHistory points={history} currency={product.currency || "TRY"} />}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">Ürün bilgileri</span><h2 className="mt-1 text-lg font-black">Teknik özellikler</h2>{specs.length ? <dl className="mt-5 divide-y divide-slate-100">{specs.map(([key, value]) => <div key={key} className="flex justify-between gap-5 py-3 text-sm"><dt className="font-semibold text-slate-500">{key}</dt><dd className="text-right font-bold text-slate-900">{String(value)}</dd></div>)}</dl> : <p className="mt-5 text-sm text-slate-500">Teknik özellikler henüz eklenmemiş.</p>}</section>
      </div>
    </main>
  );
}
