"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { B2B_UNITS, getB2BErrorMessage } from "@/lib/b2b-ui";

const defaultDeadline = () => new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

export default function B2BRfqCreate() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<string>(B2B_UNITS[0]);
  const [targetPrice, setTargetPrice] = useState("");
  const [currency, setCurrency] = useState<"TRY" | "USD" | "EUR">("TRY");
  const [city, setCity] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [validUntil, setValidUntil] = useState(defaultDeadline);
  const [categories, setCategories] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Existing catalog categories keep the RFQ board consistent with products.
    supabase.from("b2b_products").select("category").eq("is_active", true).then(({ data }) => {
      setCategories(Array.from(new Set((data ?? []).map((row: { category: string }) => row.category))));
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const { data, error: createError } = await supabase.rpc("create_b2b_rfq", {
      p_title: title.trim(),
      p_category: category.trim(),
      p_product_details: productDetails.trim() || null,
      p_quantity: Number(quantity),
      p_unit: unit,
      p_target_price: targetPrice ? Number(targetPrice) : null,
      p_currency: currency,
      p_city: city.trim() || null,
      p_delivery_note: deliveryNote.trim() || null,
      p_valid_until: validUntil,
    });
    if (createError) {
      setError(getB2BErrorMessage(createError, "İlan oluşturulamadı."));
      setBusy(false);
      return;
    }
    router.push(`/b2b/rfq/${data}`);
  };

  const field = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100";
  const label = "text-xs font-black text-slate-700";

  return <main className="mx-auto max-w-3xl px-4 py-9">
    <div className="mb-7"><span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">RFQ tahtası</span><h1 className="mt-2 text-3xl font-black text-slate-950">Satın alma ilanı aç</h1><p className="mt-2 text-sm font-medium text-slate-500">İhtiyacını yayınla; doğrulanmış toptancılar son teklif tarihine kadar fiyatını ve koşullarını göndersin.</p></div>

    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>İlan başlığı *<input required minLength={8} maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: 500 GPD ters ozmos membranı alımı" className={field} /></label>
        <label className={label}>Ürün kategorisi *
          <input required minLength={2} maxLength={80} list="rfq-categories" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Filtre, membran, pompa…" className={field} />
          <datalist id="rfq-categories">{categories.map((item) => <option key={item} value={item} />)}</datalist>
        </label>
        <label className={label}>Teslimat şehri<input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" className={field} /></label>
        <label className={`${label} sm:col-span-2`}>Ürün detayları<textarea value={productDetails} onChange={(e) => setProductDetails(e.target.value)} maxLength={2000} rows={4} placeholder="Teknik özellikler, marka/uyumluluk, ambalaj beklentisi…" className={field} /></label>
        <label className={label}>Miktar *<div className="flex gap-2"><input required type="number" min={0.01} step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={`${field} flex-1`} /><select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className="mt-1.5 w-28 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-sky-400">{B2B_UNITS.map((item) => <option key={item}>{item}</option>)}</select></div></label>
        <label className={label}>Hedef birim fiyat <span className="font-medium text-slate-400">(isteğe bağlı)</span><div className="flex gap-2"><input type="number" min={0.01} step="any" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="120,00" className={`${field} flex-1`} /><select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)} className="mt-1.5 w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-sky-400"><option>TRY</option><option>USD</option><option>EUR</option></select></div></label>
        <label className={label}>Son teklif tarihi *<input required type="date" min={new Date().toISOString().slice(0, 10)} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={field} /></label>
        <label className={label}>Teslimat notu<input maxLength={500} value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} placeholder="İş yine teslim, irsaliyeli fatura…" className={field} /></label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
        <Link href="/b2b/rfq" className="text-xs font-black text-slate-500 transition hover:text-slate-800">← Tahtaya dön</Link>
        <div className="flex gap-3">
          <Link href="/b2b/rfq" className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50">Vazgeç</Link>
          <button type="submit" disabled={busy} className="rounded-xl bg-sky-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500 disabled:opacity-50">{busy ? "Yayınlanıyor…" : "İlanı yayınla"}</button>
        </div>
      </div>
    </form>

    <p className="mt-5 rounded-xl border border-sky-100 bg-sky-50/60 p-4 text-xs font-medium leading-5 text-sky-900">İlanın; başlık, kategori, miktar ve son teklif tarihi ile tüm doğrulanmış üyelere görünür. Hedef fiyatını yazarsan ilanın yanında paylaşılır; paylaşmak istemiyorsan bu alanı boş bırak.</p>
  </main>;
}
