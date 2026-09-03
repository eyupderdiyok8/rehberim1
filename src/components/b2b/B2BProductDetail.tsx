"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { B2BMember, B2BProduct } from "@/types/b2b";
import B2BFavoriteButton from "@/components/b2b/B2BFavoriteButton";

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
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
  const router = useRouter();
  const [product, setProduct] = useState<B2BProduct | null>(null);
  const [member, setMember] = useState<B2BMember | null>(null);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState("1");
  const [purchaseNote, setPurchaseNote] = useState("");
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
      setQuantity(String(item.minimum_order_quantity));
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
    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity < Number(product.minimum_order_quantity)) {
      setQuantity(String(product.minimum_order_quantity));
      return setMessage(`Minimum sipariş miktarı ${product.minimum_order_quantity} ${product.unit}.`);
    }
    const { data: requestId, error } = await supabase.rpc("create_b2b_trade_request", { p_product_id: product.id, p_quantity: numericQuantity, p_message: purchaseNote.trim() });
    if (error) return setMessage("Görüşme başlatılamadı: " + error.message);
    const { data: conversationId, error: conversationError } = await supabase.rpc("open_b2b_conversation", { p_wholesaler_id: product.wholesaler_id, p_trade_request_id: requestId });
    if (conversationError) return setMessage("Görüşme açıldı fakat mesaj ekranı yüklenemedi: " + conversationError.message);
    router.push(`/b2b/mesajlar?conversation=${conversationId}`);
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Ürün hazırlanıyor…</div>;
  if (!product) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-black">Ürün bulunamadı</h1><Link href="/b2b" className="mt-4 inline-block text-sm font-bold text-sky-700">Ürünlere dön</Link></div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-5 flex items-center gap-2 overflow-hidden text-[10px] font-black uppercase tracking-[0.14em] text-slate-400"><Link href="/b2b" className="shrink-0 hover:text-sky-700">B2B pazar</Link><span>/</span><span className="shrink-0 text-sky-700">{product.category}</span><span>/</span><span className="truncate text-slate-600">{product.name}</span></nav>
      <div className="grid gap-7 lg:grid-cols-[1.08fr_.92fr]">
        <section className="grid gap-3 sm:grid-cols-[72px_1fr]">
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">{images.map((image, index) => <button key={image} type="button" onClick={() => setSelectedImage(index)} className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ${selectedImage === index ? "border-sky-500" : "border-slate-200"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div>
          <div className="order-1 relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white to-sky-50 shadow-sm sm:order-2">{images[selectedImage] ? <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-contain p-6" /> : <span className="text-8xl text-sky-200">◈</span>}<span className="absolute left-4 top-4 rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 shadow-sm backdrop-blur">● {product.stock_status === "in_stock" ? "Stokta" : product.stock_status === "low_stock" ? "Kritik stok" : product.stock_status === "preorder" ? "Ön sipariş" : "Tükendi"}</span></div>
        </section>
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-sky-600">{product.category}{product.brand ? ` · ${product.brand}` : ""}</span>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2"><Link href={`/b2b/toptanci/${product.wholesaler?.slug}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-sky-50 hover:text-sky-700"><span className="grid size-5 place-items-center rounded-full bg-slate-950 text-[8px] text-white">✓</span>{product.wholesaler?.name} · ★ {Number(product.wholesaler?.rating ?? 0).toFixed(1)}</Link><B2BFavoriteButton productId={product.id} showLabel /></div>
          {product.description && <p className="mt-5 text-sm font-medium leading-7 text-slate-600">{product.description}</p>}
          <div className="relative mt-6 overflow-hidden rounded-2xl bg-[#07111f] p-5 text-white"><div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-sky-500/20 blur-2xl" /><div className="relative flex items-end justify-between gap-4"><div><span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-300">Esnafa özel toptan fiyat</span><strong className="mt-2 block text-2xl font-black sm:text-3xl">{verified && product.price !== undefined ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: product.currency || "TRY" }).format(product.price) : "Fiyat erişimi kapalı"}</strong></div><span className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase ${verified ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-300/15 text-amber-200"}`}>{verified ? "Yetkili erişim" : "🔒 Kilitli"}</span></div>{!verified && <Link href="/b2b/dogrulama" className="relative mt-4 inline-block text-xs font-black text-sky-300">İşletmenizi doğrulayın →</Link>}</div>
          <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-slate-200"><div className="bg-white p-4"><span className="block text-[10px] font-bold uppercase text-slate-400">Minimum</span><strong className="mt-1 block text-sm">{product.minimum_order_quantity} {product.unit}</strong></div><div className="bg-white p-4"><span className="block text-[10px] font-bold uppercase text-slate-400">Vergi</span><strong className="mt-1 block text-sm">{product.vat_included ? "KDV dahil" : "KDV hariç"}</strong></div><div className="bg-white p-4"><span className="block text-[10px] font-bold uppercase text-slate-400">Hazırlık</span><strong className="mt-1 block text-sm">{product.lead_time_days} gün</strong></div></div>
          {verified && <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Satıcıya ilk mesajınız<textarea required rows={3} value={purchaseNote} onChange={(event) => setPurchaseNote(event.target.value)} placeholder="Örn. 50 adet için teslim tarihi ve ödeme koşullarını paylaşabilir misiniz?" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label><div className="mt-3 flex gap-3"><div className="relative w-32"><input type="number" inputMode="decimal" min={product.minimum_order_quantity} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} onBlur={() => { if (quantity === "" || Number(quantity) < Number(product.minimum_order_quantity)) setQuantity(String(product.minimum_order_quantity)); }} aria-label={`Sipariş miktarı (${product.unit})`} className="h-full w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-base font-black outline-none focus:border-sky-500" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">{product.unit}</span></div><button type="button" disabled={purchaseNote.trim().length < 3 || quantity === ""} onClick={requestQuote} className="min-h-14 flex-1 rounded-xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40">Satın alma görüşmesi başlat →</button></div><p className="mt-2 text-[10px] font-semibold text-slate-400">Minimum {product.minimum_order_quantity} {product.unit}. Görüşme açılır; toptancı fiyat ve koşulları sistem içinde gönderir.</p></div>}
          {message && <p className="mt-3 rounded-lg bg-sky-50 p-3 text-xs font-bold text-sky-800">{message}</p>}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-[10px] font-black uppercase tracking-wide text-slate-400"><span>✓ Doğrulanmış satıcı</span><span>✓ Kayıtlı fiyat geçmişi</span><span>✓ Güvenli talep akışı</span></div>
        </section>
        {verified && product.price !== undefined && <PriceHistory points={history} currency={product.currency || "TRY"} />}
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">Ürün bilgileri</span><h2 className="mt-1 text-lg font-black">Teknik özellikler</h2>{specs.length ? <dl className="mt-5 divide-y divide-slate-100">{specs.map(([key, value]) => <div key={key} className="flex justify-between gap-5 py-3 text-sm"><dt className="font-semibold text-slate-500">{key}</dt><dd className="text-right font-bold text-slate-900">{String(value)}</dd></div>)}</dl> : <p className="mt-5 text-sm text-slate-500">Teknik özellikler henüz eklenmemiş.</p>}</section>
      </div>
    </main>
  );
}
