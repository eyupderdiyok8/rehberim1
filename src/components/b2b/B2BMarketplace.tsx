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
    return products.filter((product) => {
      const categoryMatches = category === "Tümü" || product.category === category;
      const textMatches = !normalized || [product.name, product.brand, product.category, product.wholesaler?.name]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalized));
      return categoryMatches && textMatches;
    });
  }, [category, products, query]);

  const verified = member?.verification_status === "verified";
  const storeCount = new Set(products.map((product) => product.wholesaler_id)).size;

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Ürünler hazırlanıyor…</div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="relative mb-7 min-h-[330px] overflow-hidden rounded-3xl bg-slate-950 text-white shadow-2xl shadow-slate-900/15">
        <div className="absolute inset-0 bg-[url('/b2b/marketplace-hero.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/20" />
        <div className="relative flex min-h-[330px] max-w-3xl flex-col justify-center px-6 py-10 sm:px-10">
          <span className="w-fit rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">Profesyonellere özel pazar</span>
          <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">Toptan alımın yeni ve güvenli yolu.</h1>
          <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-300">Doğrulanmış tedarikçiler, net sipariş koşulları ve geçmişi görülebilen esnaf fiyatları tek katalogda.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className={`rounded-xl border px-4 py-3 text-xs font-black backdrop-blur ${verified ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200" : "border-amber-300/20 bg-amber-400/15 text-amber-100"}`}>{verified ? "✓ Fiyat erişiminiz açık" : "🔒 Doğrulama sonrası fiyat erişimi"}</div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black backdrop-blur">{products.length} ürün · {storeCount} toptancı</div>
          </div>
        </div>
      </section>

      {!verified && (
        <Link href="/b2b/dogrulama" className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-sky-200 bg-sky-50 p-4 hover:border-sky-400">
          <div><strong className="text-sm text-sky-950">Toptan fiyatları ve fiyat geçmişini açın</strong><p className="mt-1 text-xs font-medium text-sky-800">İşletme belgenizi güvenli şekilde gönderin.</p></div><span className="shrink-0 text-sm font-black text-sky-700">Doğrula →</span>
        </Link>
      )}

      <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid md:grid-cols-[1fr_auto] md:gap-3">
        <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ürün, marka veya toptancı ara…" className="min-h-12 w-full rounded-xl border-0 bg-slate-50 pl-11 pr-4 text-base font-medium outline-none ring-sky-500 focus:ring-2" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-12 shrink-0 rounded-xl px-4 text-xs font-bold ${category === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item}</button>)}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">{error} Önce <code>supabase/b2b_marketplace.sql</code> dosyasını Supabase SQL Editor’da çalıştırın.</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-lg font-black text-slate-800">Henüz uygun ürün yok</h2><p className="mt-2 text-sm text-slate-500">Toptancılar ürün ekledikçe katalog burada oluşacak.</p></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/5">
              <Link href={`/b2b/urun/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-sky-50 to-slate-100">
                {product.image_urls?.[0] ? <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl text-sky-200">◈</div>}
                <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-black text-emerald-700 shadow-sm">{stockLabels[product.stock_status]}</span>
              </Link>
              <div className="p-4">
                <Link href={`/b2b/toptanci/${product.wholesaler?.slug}`} className="text-[11px] font-bold text-sky-600 hover:underline">{product.wholesaler?.name} · ★ {Number(product.wholesaler?.rating ?? 0).toFixed(1)}</Link>
                <Link href={`/b2b/urun/${product.slug}`}><h2 className="mt-2 line-clamp-2 text-base font-black leading-snug text-slate-950 group-hover:text-sky-700">{product.name}</h2></Link>
                <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">Min. {product.minimum_order_quantity} {product.unit}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{product.vat_included ? "KDV dahil" : "KDV hariç"}</span></div>
                <div className="mt-4 border-t border-slate-100 pt-4"><strong className="text-sm font-black text-slate-950">{verified && product.price !== undefined ? formatPrice(product.price, product.currency) : "🔒 Fiyatı görmek için doğrulan"}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
