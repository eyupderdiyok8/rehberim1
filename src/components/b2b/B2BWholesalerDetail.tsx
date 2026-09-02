"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { B2BMember, B2BProduct, B2BWholesaler } from "@/types/b2b";

type ProductPriceRow = { product_id: string; price: number; currency: "TRY" | "USD" | "EUR" };

export default function B2BWholesalerDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const [store, setStore] = useState<B2BWholesaler | null>(null);
  const [products, setProducts] = useState<B2BProduct[]>([]);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatBusy, setChatBusy] = useState(false);
  const [error, setError] = useState("");

  const startChat = async () => {
    if (!store) return;
    setChatBusy(true);
    const { data, error: chatError } = await supabase.rpc("open_b2b_conversation", { p_wholesaler_id: store.id, p_trade_request_id: null });
    setChatBusy(false);
    if (chatError) return setError(chatError.message);
    router.push(`/b2b/mesajlar?conversation=${data}`);
  };

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: member } = await supabase.from("b2b_members").select("verification_status").eq("user_id", userData.user.id).maybeSingle();
      const isVerified = (member as Pick<B2BMember, "verification_status"> | null)?.verification_status === "verified";
      setVerified(isVerified);
      const { data: storeData } = await supabase.from("b2b_wholesalers").select("id, name, slug, description, logo_url, cover_url, city, shipping_terms, rating, review_count").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (!storeData) { setLoading(false); return; }
      setStore(storeData as B2BWholesaler);
      const { data: productData } = await supabase.from("b2b_products").select("id, wholesaler_id, name, slug, brand, category, description, image_urls, specifications, minimum_order_quantity, unit, vat_included, stock_status, lead_time_days").eq("wholesaler_id", storeData.id).eq("is_active", true).order("created_at", { ascending: false });
      const items = (productData ?? []) as B2BProduct[];
      if (isVerified && items.length) {
        const { data: prices } = await supabase.from("b2b_product_prices").select("product_id, price, currency").in("product_id", items.map((item) => item.id));
        const map = new Map(((prices ?? []) as ProductPriceRow[]).map((price) => [price.product_id, price]));
        items.forEach((item) => Object.assign(item, map.get(item.id) ?? {}));
      }
      setProducts(items);
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Mağaza yükleniyor…</div>;
  if (!store) return <div className="mx-auto max-w-3xl px-4 py-24 text-center"><h1 className="text-2xl font-black">Mağaza bulunamadı</h1><Link href="/b2b/toptancilar" className="mt-4 inline-block text-sm font-bold text-sky-700">Toptancılara dön</Link></div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-48 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-800">{store.cover_url && <img src={store.cover_url} alt="" className="h-full w-full object-cover opacity-80" />}</div>
        <div className="relative p-6 pt-14 sm:p-8 sm:pt-16">
          <div className="absolute -top-12 left-6 flex size-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-sky-50 text-3xl font-black text-sky-700 shadow-lg sm:left-8">{store.logo_url ? <img src={store.logo_url} alt={`${store.name} logosu`} className="h-full w-full object-cover" /> : store.name.slice(0, 2).toLocaleUpperCase("tr-TR")}</div>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-black text-slate-950">{store.name}</h1><span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">✓ Doğrulanmış toptancı</span></div><p className="mt-2 text-sm font-semibold text-slate-500">{store.city || "Türkiye geneli"} · <span className="text-amber-600">★ {Number(store.rating).toFixed(1)} ({store.review_count} değerlendirme)</span></p>{store.description && <p className="mt-4 max-w-3xl text-sm font-medium leading-6 text-slate-600">{store.description}</p>}<button disabled={!verified || chatBusy} onClick={startChat} className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40">{verified ? "Toptancıya mesaj gönder →" : "Mesaj için işletmenizi doğrulayın"}</button></div>{store.shipping_terms && <div className="rounded-xl bg-slate-50 p-4 text-xs font-semibold text-slate-600 md:max-w-xs"><span className="block font-black text-slate-900">Teslimat koşulları</span><span className="mt-1 block">{store.shipping_terms}</span></div>}</div>
        </div>
      </section>
      <div className="mb-5 mt-9 flex items-end justify-between"><div><span className="text-xs font-black uppercase tracking-wider text-sky-600">Mağaza kataloğu</span><h2 className="mt-1 text-2xl font-black text-slate-950">Ürünler</h2></div><span className="text-sm font-bold text-slate-500">{products.length} ürün</span></div>
      {products.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm font-semibold text-slate-500">Bu mağazada henüz ürün bulunmuyor.</div> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <Link key={product.id} href={`/b2b/urun/${product.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg"><div className="aspect-[4/3] bg-slate-100">{product.image_urls?.[0] ? <img src={product.image_urls[0]} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-5xl text-slate-300">◈</div>}</div><div className="p-4"><span className="text-[10px] font-bold uppercase text-sky-600">{product.category}</span><h3 className="mt-2 line-clamp-2 text-base font-black text-slate-950">{product.name}</h3><p className="mt-3 text-xs font-semibold text-slate-500">Min. {product.minimum_order_quantity} {product.unit} · {product.vat_included ? "KDV dahil" : "KDV hariç"}</p><strong className="mt-4 block border-t border-slate-100 pt-4 text-sm text-slate-950">{verified && product.price !== undefined ? new Intl.NumberFormat("tr-TR", { style: "currency", currency: product.currency || "TRY" }).format(product.price) : "🔒 Fiyat gizli"}</strong></div></Link>)}</div>}
    </main>
  );
}
