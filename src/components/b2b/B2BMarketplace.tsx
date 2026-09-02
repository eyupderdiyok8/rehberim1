"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { B2BMember, B2BProduct, B2BWholesaler } from "@/types/b2b";

type ProductQueryRow = Omit<B2BProduct, "wholesaler"> & { wholesaler: B2BWholesaler | B2BWholesaler[] };
type ProductPriceRow = { product_id: string; price: number; currency: "TRY" | "USD" | "EUR" };

const stockLabels: Record<B2BProduct["stock_status"], string> = {
  in_stock: "Stokta",
  low_stock: "Son ürünler",
  preorder: "Ön sipariş",
  out_of_stock: "Tükendi",
};

function formatPrice(price: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(price);
}

export default function B2BMarketplace() {
  const [products, setProducts] = useState<B2BProduct[]>([]);
  const [member, setMember] = useState<B2BMember | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tümü");
  const [sort, setSort] = useState<"newest" | "rating" | "moq">("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const [memberResult, productsResult] = await Promise.all([
        supabase.from("b2b_members").select("user_id, account_type, verification_status, business_name, review_note").eq("user_id", userData.user.id).maybeSingle(),
        supabase.from("b2b_products").select("id, wholesaler_id, name, slug, brand, category, description, image_urls, specifications, minimum_order_quantity, unit, vat_included, stock_status, lead_time_days, wholesaler:b2b_wholesalers!inner(id, name, slug, description, logo_url, cover_url, city, shipping_terms, rating, review_count)").eq("is_active", true).order("created_at", { ascending: false }),
      ]);

      if (memberResult.data) setMember(memberResult.data as B2BMember);
      if (productsResult.error) {
        setError(productsResult.error.message.includes("b2b_products") ? "B2B veritabanı kurulumu henüz uygulanmamış." : productsResult.error.message);
        setLoading(false);
        return;
      }

      const baseProducts = ((productsResult.data ?? []) as ProductQueryRow[]).map((item) => ({
        ...item,
        wholesaler: Array.isArray(item.wholesaler) ? item.wholesaler[0] : item.wholesaler,
      })) as B2BProduct[];

      if (memberResult.data?.verification_status === "verified" && baseProducts.length > 0) {
        const { data: prices } = await supabase
          .from("b2b_product_prices")
          .select("product_id, price, currency")
          .in("product_id", baseProducts.map((product) => product.id));
        const priceMap = new Map(((prices ?? []) as ProductPriceRow[]).map((price) => [price.product_id, price]));
        baseProducts.forEach((product) => Object.assign(product, priceMap.get(product.id) ?? {}));
      }

      setProducts(baseProducts);
      setLoading(false);
    };
    load();
  }, []);

  const categories = useMemo(() => ["Tümü", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    const matches = products.filter((product) => {
      const categoryMatches = category === "Tümü" || product.category === category;
      const textMatches = !normalized || [product.name, product.brand, product.category, product.wholesaler?.name]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalized));
      return categoryMatches && textMatches;
    });
    return [...matches].sort((a, b) => {
      if (sort === "rating") return Number(b.wholesaler?.rating ?? 0) - Number(a.wholesaler?.rating ?? 0);
      if (sort === "moq") return Number(a.minimum_order_quantity) - Number(b.minimum_order_quantity);
      return 0;
    });
  }, [category, products, query, sort]);

  const verified = member?.verification_status === "verified";
  const storeCount = new Set(products.map((product) => product.wholesaler_id)).size;
  const categoryCards = categories.filter((item) => item !== "Tümü").slice(0, 6).map((name, index) => ({
    name,
    count: products.filter((product) => product.category === name).length,
    code: String(index + 1).padStart(2, "0"),
  }));

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Ürünler hazırlanıyor…</div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#07111F] text-white shadow-2xl shadow-slate-950/15">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(56,189,248,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="pointer-events-none absolute -right-20 -top-32 size-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.08fr_.92fr] lg:p-12">
          <div className="flex flex-col justify-center"><div className="flex items-center gap-3"><span className="flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-300"><i className="size-1.5 rounded-full bg-sky-300 shadow-[0_0_12px_#7dd3fc]" /> Canlı B2B pazarı</span><span className="text-[10px] font-bold text-slate-500">03.09.2026 · TR</span></div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl">Tedarik zincirini<br/><span className="bg-gradient-to-r from-sky-300 to-cyan-100 bg-clip-text text-transparent">tek ekrandan yönetin.</span></h1>
            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-300">Ürün bulun, minimum siparişi karşılaştırın, fiyat hareketini görün ve doğrulanmış tedarikçiden teklif alın.</p>
            <div className="mt-8 flex flex-wrap gap-3"><a href="#katalog" className="rounded-xl bg-sky-400 px-5 py-3 text-xs font-black text-slate-950 shadow-lg shadow-sky-500/20">Kataloğu keşfet ↓</a><Link href="/b2b/toptancilar" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-black text-white backdrop-blur hover:bg-white/10">Tedarikçi ağı</Link></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-xl sm:p-5"><div className="flex items-center justify-between border-b border-white/10 pb-4"><div><span className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-300">Pazar görünümü</span><h2 className="mt-1 text-sm font-black">Bugünün kataloğu</h2></div><div className={`rounded-lg px-3 py-2 text-[9px] font-black ${verified ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>{verified ? "FİYATLAR AÇIK" : "FİYATLAR KİLİTLİ"}</div></div>
            <div className="divide-y divide-white/10">{products.slice(0,3).map((product, index) => <Link key={product.id} href={`/b2b/urun/${product.slug}`} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 py-4"><div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/10">{product.image_urls?.[0] ? <img src={product.image_urls[0]} alt="" className="h-full w-full object-cover" /> : <span className="text-sky-300">0{index + 1}</span>}</div><div className="min-w-0"><strong className="block truncate text-xs text-white">{product.name}</strong><span className="mt-1 block truncate text-[9px] font-bold text-slate-400">{product.wholesaler?.name} · Min. {product.minimum_order_quantity} {product.unit}</span></div><span className="text-[10px] font-black text-emerald-300">{stockLabels[product.stock_status]}</span></Link>)}</div>
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">{[[products.length,"Ürün"],[storeCount,"Tedarikçi"],[categories.length - 1,"Kategori"]].map(([value,label]) => <div key={String(label)} className="rounded-xl bg-white/[0.05] p-3"><strong className="block text-xl font-black text-white">{value}</strong><span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</span></div>)}</div>
          </div>
        </div>
      </section>

      {!verified && (
        <Link href="/b2b/dogrulama" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-sky-200 bg-sky-50 p-4 hover:border-sky-400">
          <div><strong className="text-sm text-sky-950">Toptan fiyatları ve fiyat geçmişini açın</strong><p className="mt-1 text-xs font-medium text-sky-800">İşletme belgenizi güvenli şekilde gönderin.</p></div><span className="shrink-0 text-sm font-black text-sky-700">Doğrula →</span>
        </Link>
      )}

      {categoryCards.length > 0 && <section className="mb-8"><div className="mb-4 flex items-end justify-between"><div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Hızlı erişim</span><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Kategori koridorları</h2></div><span className="hidden text-xs font-bold text-slate-400 sm:block">Aradığınız parçaya daha hızlı ulaşın</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categoryCards.map((item, index) => <button key={item.name} onClick={() => setCategory(item.name)} className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${category === item.name ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}><span className={`absolute right-4 top-3 text-4xl font-black tracking-tighter ${index % 3 === 0 ? "text-sky-100" : index % 3 === 1 ? "text-violet-100" : "text-emerald-100"}`}>{item.code}</span><span className="relative text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Ürün grubu</span><strong className="relative mt-5 block text-base font-black text-slate-900 group-hover:text-sky-700">{item.name}</strong><span className="relative mt-1 block text-xs font-bold text-slate-400">{item.count} ürün →</span></button>)}</div></section>}

      <div id="katalog" className="mb-7 scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid md:grid-cols-[1fr_auto] md:gap-3">
        <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün, marka veya toptancı ara…" className="min-h-12 w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 text-base font-medium outline-none ring-sky-500 focus:ring-2" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-12 shrink-0 rounded-xl px-4 text-xs font-bold ${category === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item}</button>)}
        </div>
      </div>

      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><span className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">Profesyonel katalog</span><h2 className="mt-1 text-xl font-black text-slate-950">{filtered.length} ürün bulundu</h2></div>
        <label className="flex items-center gap-3 text-xs font-bold text-slate-500">Sırala<select value={sort} onChange={(event) => setSort(event.target.value as "newest" | "rating" | "moq")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-800 outline-none focus:border-sky-500"><option value="newest">En yeni</option><option value="rating">Tedarikçi puanı</option><option value="moq">En düşük minimum sipariş</option></select></label>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">{error} Önce <code>supabase/b2b_marketplace.sql</code> dosyasını Supabase SQL Editor’da çalıştırın.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-lg font-black text-slate-800">Henüz uygun ürün yok</h2><p className="mt-2 text-sm text-slate-500">Toptancılar ürün ekledikçe katalog burada oluşacak.</p></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-900/8">
              <Link href={`/b2b/urun/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-sky-50 to-slate-100">
                {product.image_urls?.[0] ? <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl text-sky-200">◈</div>}
                <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700 shadow-sm backdrop-blur">● {stockLabels[product.stock_status]}</span><span className="absolute bottom-3 right-3 rounded-lg bg-slate-950/80 px-2 py-1 text-[9px] font-black text-white backdrop-blur">{product.category}</span>
              </Link>
              <div className="p-4">
                <Link href={`/b2b/toptanci/${product.wholesaler?.slug}`} className="text-[11px] font-bold text-sky-600 hover:underline">{product.wholesaler?.name} · ★ {Number(product.wholesaler?.rating ?? 0).toFixed(1)}</Link>
                <Link href={`/b2b/urun/${product.slug}`}><h2 className="mt-2 line-clamp-2 text-base font-black leading-snug text-slate-950 group-hover:text-sky-700">{product.name}</h2></Link>
                <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">Min. {product.minimum_order_quantity} {product.unit}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{product.vat_included ? "KDV dahil" : "KDV hariç"}</span></div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><div><span className="block text-[9px] font-black uppercase tracking-wide text-slate-400">Esnafa özel</span><strong className="mt-1 block text-sm font-black text-slate-950">{verified && product.price !== undefined ? formatPrice(product.price, product.currency) : "🔒 Fiyat kilitli"}</strong></div><span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm text-white transition group-hover:bg-sky-600">→</span></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
