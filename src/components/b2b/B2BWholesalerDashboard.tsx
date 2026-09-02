"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { B2BMember, B2BProduct } from "@/types/b2b";
import B2BImageUploader, { type UploadedB2BImage } from "@/components/b2b/B2BImageUploader";

type Store = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  shipping_terms: string | null;
  is_active: boolean;
};

type ManagedProduct = B2BProduct & { is_active: boolean; price?: number; currency?: string };
type ProductPriceRow = { product_id: string; price: number; currency: "TRY" | "USD" | "EUR" };
type TradeRequest = { id: string; product_name: string; buyer_user_id: string; buyer_business_name: string; quantity: number; unit: string; status: string; created_at: string; review_submitted: boolean; quoted_unit_price: number | null; quoted_currency: string | null; quote_note: string | null; quote_valid_until: string | null; conversation_id: string | null };
type QuoteDraft = { price: string; currency: string; note: string; validUntil: string };

const blankProfile = { name: "", description: "", logo_url: "", cover_url: "", city: "", phone: "", whatsapp: "", website: "", shipping_terms: "" };
const blankProduct = { name: "", brand: "", category: "", description: "", minimum_order_quantity: "1", unit: "adet", vat_included: true, stock_status: "in_stock", lead_time_days: "1", price: "", currency: "TRY" };

function makeSlug(value: string) {
  const normalized = value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${normalized || "urun"}-${crypto.randomUUID().slice(0, 6)}`;
}

export default function B2BWholesalerDashboard() {
  const [member, setMember] = useState<B2BMember | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [profile, setProfile] = useState(blankProfile);
  const [profileLogo, setProfileLogo] = useState<UploadedB2BImage[]>([]);
  const [profileCover, setProfileCover] = useState<UploadedB2BImage[]>([]);
  const [product, setProduct] = useState(blankProduct);
  const [productImages, setProductImages] = useState<UploadedB2BImage[]>([]);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, QuoteDraft>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: memberData, error: memberError } = await supabase.from("b2b_members").select("user_id, account_type, verification_status, business_name, review_note").eq("user_id", userData.user.id).maybeSingle();
    if (memberError) {
      setError("B2B veritabanı henüz kurulmamış olabilir: " + memberError.message);
      setLoading(false);
      return;
    }
    setMember(memberData as B2BMember | null);
    if (!memberData || !["wholesaler", "admin"].includes(memberData.account_type)) {
      setLoading(false);
      return;
    }

    const { data: storeData, error: storeError } = await supabase.from("b2b_wholesalers").select("id, name, slug, description, logo_url, cover_url, city, phone, whatsapp, website, shipping_terms, is_active").eq("owner_id", userData.user.id).maybeSingle();
    if (storeError) setError(storeError.message);
    if (!storeData) {
      setLoading(false);
      return;
    }

    const typedStore = storeData as Store;
    setStore(typedStore);
    setProfile({
      name: typedStore.name,
      description: typedStore.description ?? "",
      logo_url: typedStore.logo_url ?? "",
      cover_url: typedStore.cover_url ?? "",
      city: typedStore.city ?? "",
      phone: typedStore.phone ?? "",
      whatsapp: typedStore.whatsapp ?? "",
      website: typedStore.website ?? "",
      shipping_terms: typedStore.shipping_terms ?? "",
    });
    setProfileLogo(typedStore.logo_url ? [{ path: "", url: typedStore.logo_url }] : []);
    setProfileCover(typedStore.cover_url ? [{ path: "", url: typedStore.cover_url }] : []);

    const { data: productData, error: productError } = await supabase.from("b2b_products").select("id, wholesaler_id, name, slug, brand, category, description, image_urls, specifications, minimum_order_quantity, unit, vat_included, stock_status, lead_time_days, is_active").eq("wholesaler_id", typedStore.id).order("created_at", { ascending: false });
    if (productError) setError(productError.message);
    const rows = (productData ?? []) as ManagedProduct[];
    if (rows.length) {
      const { data: prices } = await supabase.from("b2b_product_prices").select("product_id, price, currency").in("product_id", rows.map((item) => item.id));
      const priceMap = new Map(((prices ?? []) as ProductPriceRow[]).map((item) => [item.product_id, item]));
      rows.forEach((item) => Object.assign(item, priceMap.get(item.id) ?? {}));
    }
    setProducts(rows);
    setPriceDrafts(Object.fromEntries(rows.map((item) => [item.id, item.price?.toString() ?? ""])));
    const { data: requestData } = await supabase.rpc("list_own_b2b_trade_requests");
    const requestRows = (requestData ?? []) as TradeRequest[];
    setRequests(requestRows);
    setQuoteDrafts((current) => Object.fromEntries(requestRows.map((request) => [request.id, current[request.id] ?? {
      price: request.quoted_unit_price?.toString() ?? "", currency: request.quoted_currency ?? "TRY",
      note: request.quote_note ?? "", validUntil: request.quote_valid_until?.slice(0,10) ?? new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0,10),
    }])));
    setLoading(false);
  };

  useEffect(() => {
    // Initial data comes from the authenticated B2B database session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const notify = (text: string) => { setMessage(text); setError(""); window.setTimeout(() => setMessage(""), 3500); };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("profile");
    const { error: updateError } = await supabase.rpc("update_own_b2b_wholesaler_profile", {
      p_name: profile.name, p_description: profile.description, p_logo_url: profile.logo_url,
      p_cover_url: profile.cover_url, p_city: profile.city, p_phone: profile.phone,
      p_whatsapp: profile.whatsapp, p_website: profile.website, p_shipping_terms: profile.shipping_terms,
    });
    setBusy("");
    if (updateError) return setError(updateError.message);
    notify("Mağaza profili güncellendi.");
    await load();
  };

  const addProduct = async (event: FormEvent) => {
    event.preventDefault();
    if (!store) return;
    if (!productImages.length) return setError("Ürünü yayınlamak için en az bir görsel yükleyin.");
    setBusy("product");
    setError("");
    const { data: inserted, error: insertError } = await supabase.from("b2b_products").insert({
      wholesaler_id: store.id, name: product.name.trim(), slug: makeSlug(product.name), brand: product.brand.trim() || null,
      category: product.category.trim(), description: product.description.trim() || null, image_urls: productImages.map((image) => image.url),
      minimum_order_quantity: Number(product.minimum_order_quantity), unit: product.unit,
      vat_included: product.vat_included, stock_status: product.stock_status,
      lead_time_days: Number(product.lead_time_days), is_active: true,
    }).select("id").single();
    if (insertError || !inserted) { setBusy(""); return setError(insertError?.message ?? "Ürün eklenemedi."); }

    const { data: userData } = await supabase.auth.getUser();
    const { error: priceError } = await supabase.from("b2b_product_prices").insert({ product_id: inserted.id, price: Number(product.price), currency: product.currency, updated_by: userData.user?.id });
    setBusy("");
    if (priceError) return setError("Ürün eklendi fakat fiyat kaydedilemedi: " + priceError.message);
    setProduct(blankProduct);
    setProductImages([]);
    notify("Ürün ve ilk fiyat kaydı eklendi.");
    await load();
  };

  const savePrice = async (item: ManagedProduct) => {
    setBusy(`price-${item.id}`);
    const { data: userData } = await supabase.auth.getUser();
    const { error: priceError } = await supabase.from("b2b_product_prices").upsert({ product_id: item.id, price: Number(priceDrafts[item.id]), currency: item.currency ?? "TRY", updated_by: userData.user?.id });
    setBusy("");
    if (priceError) return setError(priceError.message);
    notify(`${item.name} fiyatı güncellendi; geçmişe işlendi.`);
    await load();
  };

  const toggleProduct = async (item: ManagedProduct) => {
    setBusy(`toggle-${item.id}`);
    const { error: toggleError } = await supabase.from("b2b_products").update({ is_active: !item.is_active }).eq("id", item.id);
    setBusy("");
    if (toggleError) return setError(toggleError.message);
    await load();
  };

  const updateRequest = async (requestId: string, status: string) => {
    setBusy(`request-${requestId}`);
    const { error: requestError } = await supabase.rpc("update_own_b2b_trade_request", { p_request_id: requestId, p_status: status });
    setBusy("");
    if (requestError) return setError(requestError.message);
    notify("Teklif talebi güncellendi.");
    await load();
  };

  const submitQuote = async (request: TradeRequest) => {
    const draft = quoteDrafts[request.id];
    if (!draft?.price) return setError("Birim fiyat girin.");
    setBusy(`quote-${request.id}`);
    const { error: quoteError } = await supabase.rpc("submit_b2b_quote", {
      p_request_id: request.id, p_unit_price: Number(draft.price), p_currency: draft.currency,
      p_note: draft.note, p_valid_until: draft.validUntil ? new Date(`${draft.validUntil}T23:59:59`).toISOString() : null,
    });
    setBusy("");
    if (quoteError) return setError(quoteError.message);
    notify("Özel teklif esnafa gönderildi ve görüşmeye işlendi.");
    await load();
  };

  const rateBuyer = async (request: TradeRequest, rating: number) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setBusy(`review-${request.id}`);
    const { error: reviewError } = await supabase.from("b2b_reviews").insert({ trade_request_id: request.id, reviewer_id: userData.user.id, target_user_id: request.buyer_user_id, rating });
    setBusy("");
    if (reviewError) return setError(reviewError.message);
    notify("Esnaf değerlendirmeniz kaydedildi.");
    await load();
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Toptancı paneli hazırlanıyor…</div>;
  if (!member || !["wholesaler", "admin"].includes(member.account_type)) return <main className="mx-auto max-w-3xl px-4 py-16"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-8"><h1 className="text-xl font-black text-amber-950">Bu alan toptancı hesaplarına özeldir</h1><p className="mt-2 text-sm font-medium text-amber-800">Toptancı mağazası açmak için yönetici onayı ve hesabınıza mağaza ataması gerekir.</p></div></main>;
  if (!store) return <main className="mx-auto max-w-3xl px-4 py-16"><div className="rounded-2xl border border-sky-200 bg-white p-8"><h1 className="text-xl font-black">Hesabınız hazır, mağaza ataması bekleniyor</h1><p className="mt-2 text-sm text-slate-600">Yönetici mağazanızı oluşturduğunda ürün ve fiyat yönetimi burada açılacak.</p></div></main>;

  return <main className="mx-auto max-w-7xl px-4 py-8">
    <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl bg-slate-950 p-7 text-white sm:flex-row sm:items-end"><div><span className="text-xs font-black uppercase tracking-[0.2em] text-sky-400">Toptancı çalışma alanı</span><h1 className="mt-2 text-3xl font-black">{store.name}</h1><p className="mt-2 text-sm text-slate-300">Mağaza, ürün, ticaret görüşmeleri ve kampanyaları tek yerden yönetin.</p></div><div className="flex flex-wrap gap-2"><Link href="/b2b/mesajlar" className="rounded-lg bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/15">Mesajlar</Link><Link href="/b2b/reklamlar" className="rounded-lg bg-violet-400 px-3 py-2 text-xs font-black text-slate-950">Reklam merkezi</Link><span className={`w-fit rounded-lg px-3 py-2 text-xs font-black ${store.is_active ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-200"}`}>{store.is_active ? "● Mağaza aktif" : "● Yönetici onayı bekliyor"}</span></div></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}

    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-lg font-black">Mağaza profili</h2><p className="mt-1 text-xs font-medium text-slate-500">Yalnızca giriş yapmış kullanıcılar görür.</p></div><div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-600 sm:col-span-2">Mağaza adı<input required value={profile.name} onChange={(e) => setProfile({...profile, name:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-bold text-slate-600">Şehir<input value={profile.city} onChange={(e) => setProfile({...profile, city:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Telefon<input value={profile.phone} onChange={(e) => setProfile({...profile, phone:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-bold text-slate-600">WhatsApp<input value={profile.whatsapp} onChange={(e) => setProfile({...profile, whatsapp:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Web sitesi<input value={profile.website} onChange={(e) => setProfile({...profile, website:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <div className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Mağaza logosu</span><B2BImageUploader max={1} value={profileLogo} onChange={(images) => { setProfileLogo(images); setProfile({...profile, logo_url:images[0]?.url ?? ""}); }} /></div><div className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Mağaza kapak görseli</span><B2BImageUploader max={1} value={profileCover} onChange={(images) => { setProfileCover(images); setProfile({...profile, cover_url:images[0]?.url ?? ""}); }} /></div>
        <label className="text-xs font-bold text-slate-600 sm:col-span-2">Hakkımızda<textarea rows={4} value={profile.description} onChange={(e) => setProfile({...profile, description:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Sevkiyat koşulları<textarea rows={3} value={profile.shipping_terms} onChange={(e) => setProfile({...profile, shipping_terms:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
      </div><button disabled={busy === "profile"} className="mt-5 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy === "profile" ? "Kaydediliyor…" : "Profili kaydet"}</button></form>

      <form onSubmit={addProduct} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h2 className="text-lg font-black">Yeni ürün ekle</h2><p className="mt-1 text-xs font-medium text-slate-500">Fiyat yalnızca doğrulanmış esnafa ve size görünür.</p></div><div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-bold text-slate-600 sm:col-span-2">Ürün adı<input required value={product.name} onChange={(e) => setProduct({...product, name:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Marka<input value={product.brand} onChange={(e) => setProduct({...product, brand:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Kategori<input required value={product.category} onChange={(e) => setProduct({...product, category:e.target.value})} placeholder="Filtre, membran…" className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="text-xs font-bold text-slate-600">Toptan fiyat<input required min="0" step="0.01" type="number" value={product.price} onChange={(e) => setProduct({...product, price:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Para birimi<select value={product.currency} onChange={(e) => setProduct({...product, currency:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option>TRY</option><option>USD</option><option>EUR</option></select></label>
        <label className="text-xs font-bold text-slate-600">Minimum sipariş<input required min="0.01" step="0.01" type="number" value={product.minimum_order_quantity} onChange={(e) => setProduct({...product, minimum_order_quantity:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label><label className="text-xs font-bold text-slate-600">Birim<select value={product.unit} onChange={(e) => setProduct({...product, unit:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm">{["adet","koli","paket","palet","metre","kilogram"].map((v)=><option key={v}>{v}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-600">Stok durumu<select value={product.stock_status} onChange={(e) => setProduct({...product, stock_status:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="in_stock">Stokta</option><option value="low_stock">Az kaldı</option><option value="preorder">Ön sipariş</option><option value="out_of_stock">Tükendi</option></select></label><label className="text-xs font-bold text-slate-600">Hazırlık günü<input required min="0" type="number" value={product.lead_time_days} onChange={(e) => setProduct({...product, lead_time_days:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 sm:col-span-2"><input type="checkbox" checked={product.vat_included} onChange={(e) => setProduct({...product, vat_included:e.target.checked})} className="size-4" /> Fiyata KDV dahil</label><div className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Ürün görselleri</span><B2BImageUploader value={productImages} onChange={setProductImages} /></div><label className="text-xs font-bold text-slate-600 sm:col-span-2">Ürün açıklaması<textarea rows={4} value={product.description} onChange={(e) => setProduct({...product, description:e.target.value})} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" /></label>
      </div><button disabled={busy === "product"} className="mt-5 rounded-lg bg-sky-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">{busy === "product" ? "Ekleniyor…" : "Ürünü yayına al"}</button></form>
    </div>

    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-black">Ürünler ve fiyatlar</h2><p className="mt-1 text-xs font-medium text-slate-500">Her fiyat değişikliği otomatik olarak geçmişe kaydedilir.</p></div><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{products.length} ürün</span></div>
      {products.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center text-sm font-semibold text-slate-500">Henüz ürün eklenmedi.</div> : <div className="divide-y divide-slate-100">{products.map((item)=><article key={item.id} className="grid gap-4 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"><div className="flex items-center gap-3">{item.image_urls?.[0] ? <img src={item.image_urls[0]} alt="" className="size-14 rounded-lg object-cover" /> : <div className="flex size-14 items-center justify-center rounded-lg bg-sky-50 text-sky-300">◈</div>}<div><h3 className="font-black text-slate-900">{item.name}</h3><p className="mt-1 text-xs font-semibold text-slate-500">Min. {item.minimum_order_quantity} {item.unit} · {item.vat_included ? "KDV dahil" : "KDV hariç"}</p></div></div><div className="flex items-center gap-2"><input min="0" step="0.01" type="number" value={priceDrafts[item.id] ?? ""} onChange={(e)=>setPriceDrafts({...priceDrafts,[item.id]:e.target.value})} className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold" /><span className="text-xs font-black text-slate-500">{item.currency ?? "TRY"}</span><button onClick={()=>savePrice(item)} disabled={busy===`price-${item.id}`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">Güncelle</button></div><button onClick={()=>toggleProduct(item)} disabled={busy===`toggle-${item.id}`} className={`rounded-lg px-3 py-2 text-xs font-black ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.is_active ? "Yayında" : "Pasif"}</button></article>)}</div>}
    </section>

    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-black">Satın alma görüşmeleri</h2><p className="mt-1 text-xs font-medium text-slate-500">Esnafın mesajını yanıtlayın, özel fiyatı gönderin ve siparişi sonuçlandırın.</p></div><span className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-black text-sky-700">{requests.length} görüşme</span></div>
      {requests.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-14 text-center text-sm font-semibold text-slate-500">Henüz satın alma görüşmesi yok.</div> : <div className="space-y-4">{requests.map((request) => { const draft = quoteDrafts[request.id] ?? {price:"",currency:"TRY",note:"",validUntil:""}; return <article key={request.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="text-[9px] font-black uppercase tracking-wider text-sky-600">{request.buyer_business_name}</span><h3 className="mt-1 font-black text-slate-900">{request.product_name}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{request.quantity} {request.unit} · {new Date(request.created_at).toLocaleDateString("tr-TR")}</p></div><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{request.status}</span></div>
        {(request.status === "requested" || request.status === "quoted") && <div className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[130px_100px_140px_1fr_auto] lg:items-end"><label className="text-[10px] font-black uppercase text-slate-500">Birim fiyat<input min="0.01" step="0.01" type="number" value={draft.price} onChange={(e)=>setQuoteDrafts({...quoteDrafts,[request.id]:{...draft,price:e.target.value}})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black" /></label><label className="text-[10px] font-black uppercase text-slate-500">Para<select value={draft.currency} onChange={(e)=>setQuoteDrafts({...quoteDrafts,[request.id]:{...draft,currency:e.target.value}})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option>TRY</option><option>USD</option><option>EUR</option></select></label><label className="text-[10px] font-black uppercase text-slate-500">Geçerlilik<input type="date" value={draft.validUntil} onChange={(e)=>setQuoteDrafts({...quoteDrafts,[request.id]:{...draft,validUntil:e.target.value}})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label><label className="text-[10px] font-black uppercase text-slate-500">Koşul notu<input value={draft.note} onChange={(e)=>setQuoteDrafts({...quoteDrafts,[request.id]:{...draft,note:e.target.value}})} placeholder="Ödeme, sevkiyat…" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm normal-case" /></label><button disabled={busy===`quote-${request.id}`} onClick={()=>submitQuote(request)} className="rounded-xl bg-sky-600 px-4 py-3 text-xs font-black text-white">Teklifi gönder</button></div>}
        <div className="mt-4 flex flex-wrap gap-2">{request.conversation_id && <Link href={`/b2b/mesajlar?conversation=${request.conversation_id}`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">Mesajları aç</Link>}{request.status === "accepted" && <button disabled={busy===`request-${request.id}`} onClick={()=>updateRequest(request.id,"completed")} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Sipariş tamamlandı</button>}{["requested","quoted","accepted"].includes(request.status) && <button disabled={busy===`request-${request.id}`} onClick={()=>updateRequest(request.id,"cancelled")} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700">Görüşmeyi kapat</button>}{request.status === "completed" && !request.review_submitted && <div className="flex items-center gap-1"><span className="mr-1 text-[10px] font-black uppercase text-slate-400">Esnafı puanla</span>{[1,2,3,4,5].map((rating)=><button key={rating} disabled={busy===`review-${request.id}`} onClick={()=>rateBuyer(request,rating)} aria-label={`${rating} yıldız ver`} className="text-lg text-amber-400 hover:scale-125">★</button>)}</div>}</div>
      </article>; })}</div>}
    </section>
  </main>;
}
