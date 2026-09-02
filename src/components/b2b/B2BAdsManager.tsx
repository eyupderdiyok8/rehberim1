"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import B2BImageUploader, { type UploadedB2BImage } from "@/components/b2b/B2BImageUploader";

type Store = { id: string; name: string; slug: string };
type Ad = { id: string; ad_type: "notification" | "popup"; title: string; body: string; image_url: string | null; status: string; starts_at: string; ends_at: string; impressions: number; clicks: number; admin_note: string | null };

const tomorrow = () => { const date = new Date(Date.now() + 86_400_000); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0,16); };
const nextWeek = () => { const date = new Date(Date.now() + 8 * 86_400_000); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0,16); };

export default function B2BAdsManager() {
  const [store, setStore] = useState<Store | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [images, setImages] = useState<UploadedB2BImage[]>([]);
  const [form, setForm] = useState({ ad_type: "notification" as "notification" | "popup", title: "", body: "", cta_label: "Ürünü incele", target_url: "", starts_at: tomorrow(), ends_at: nextWeek(), daily_budget: "", total_budget: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data: storeData, error: storeError } = await supabase.from("b2b_wholesalers").select("id, name, slug").eq("owner_id", userData.user.id).maybeSingle();
    if (storeError || !storeData) { setError(storeError?.message || "Toptancı mağazası bulunamadı."); setLoading(false); return; }
    setStore(storeData as Store);
    setForm((current) => ({ ...current, target_url: current.target_url || `/b2b/toptanci/${storeData.slug}` }));
    const { data, error: adsError } = await supabase.from("b2b_ads").select("id, ad_type, title, body, image_url, status, starts_at, ends_at, impressions, clicks, admin_note").eq("wholesaler_id", storeData.id).order("created_at", { ascending: false });
    if (adsError) setError(adsError.message);
    setAds((data ?? []) as Ad[]);
    setLoading(false);
  };

  useEffect(() => {
    // The seller workspace is read after the authenticated session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const createAd = async (event: FormEvent) => {
    event.preventDefault();
    if (!store) return;
    if (!form.target_url.startsWith("/b2b/")) return setError("Hedef bağlantı /b2b/ ile başlamalıdır.");
    if (form.ad_type === "popup" && !images.length) return setError("Popup reklam için bir kampanya görseli yükleyin.");
    setBusy(true); setError(""); setMessage("");
    const { error: insertError } = await supabase.from("b2b_ads").insert({
      wholesaler_id: store.id, ad_type: form.ad_type, title: form.title.trim(), body: form.body.trim(), image_url: images[0]?.url || null,
      cta_label: form.cta_label.trim(), target_url: form.target_url.trim(), status: "pending",
      starts_at: new Date(form.starts_at).toISOString(), ends_at: new Date(form.ends_at).toISOString(),
      daily_budget: form.daily_budget ? Number(form.daily_budget) : null, total_budget: form.total_budget ? Number(form.total_budget) : null,
    });
    setBusy(false);
    if (insertError) return setError(insertError.message);
    setMessage("Kampanya yönetici onayına gönderildi.");
    setForm({ ...form, title: "", body: "", daily_budget: "", total_budget: "" }); setImages([]);
    await load();
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Reklam merkezi hazırlanıyor…</div>;

  const statusLabel: Record<string,string> = { pending: "Onay bekliyor", approved: "Onaylandı", active: "Yayında", paused: "Duraklatıldı", rejected: "Reddedildi", expired: "Süresi doldu", draft: "Taslak" };
  return <main className="mx-auto max-w-7xl px-4 py-9">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600">Satıcı büyüme merkezi</span><h1 className="mt-2 text-3xl font-black text-slate-950">B2B reklamları</h1><p className="mt-2 text-sm font-medium text-slate-500">Sadece giriş yapmış sektör profesyonellerine görünür, ölçülebilir kampanyalar oluşturun.</p></div><div className="flex gap-2"><Link href="/b2b/mesajlar" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700">Mesajlar</Link><Link href="/b2b/toptanci-paneli" className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white">Satıcı merkezi</Link></div></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}{message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
    <div className="mb-7 grid gap-4 md:grid-cols-2"><div className={`rounded-2xl border p-5 ${form.ad_type === "notification" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white"}`}><button onClick={() => setForm({...form,ad_type:"notification"})} className="w-full text-left"><span className="text-[10px] font-black uppercase tracking-wider text-sky-600">Düşük dikkat kesintisi</span><h2 className="mt-2 text-lg font-black">Bildirim reklam</h2><p className="mt-2 text-sm leading-6 text-slate-600">Ekranın köşesinde kompakt kampanya kartı. Ürün lansmanı ve stok fırsatları için.</p></button></div><div className={`rounded-2xl border p-5 ${form.ad_type === "popup" ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}><button onClick={() => setForm({...form,ad_type:"popup"})} className="w-full text-left"><span className="text-[10px] font-black uppercase tracking-wider text-violet-600">Yüksek görünürlük</span><h2 className="mt-2 text-lg font-black">Popup reklam</h2><p className="mt-2 text-sm leading-6 text-slate-600">Oturum başına bir kez açılan görselli vitrin. Büyük kampanya ve yeni seri tanıtımı için.</p></button></div></div>
    <div className="grid gap-7 xl:grid-cols-[.9fr_1.1fr]"><form onSubmit={createAd} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-black">Yeni {form.ad_type === "popup" ? "popup" : "bildirim"} kampanyası</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600 sm:col-span-2">Başlık<input required minLength={3} maxLength={90} value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Reklam metni<textarea required minLength={3} maxLength={240} rows={4} value={form.body} onChange={(e)=>setForm({...form,body:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label>{form.ad_type === "popup" && <div className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold text-slate-600">Kampanya görseli</span><B2BImageUploader max={1} value={images} onChange={setImages} /></div>}<label className="text-xs font-bold text-slate-600">Buton metni<input required value={form.cta_label} onChange={(e)=>setForm({...form,cta_label:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Hedef bağlantı<input required value={form.target_url} onChange={(e)=>setForm({...form,target_url:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Başlangıç<input required type="datetime-local" value={form.starts_at} onChange={(e)=>setForm({...form,starts_at:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Bitiş<input required type="datetime-local" value={form.ends_at} onChange={(e)=>setForm({...form,ends_at:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Günlük bütçe (₺)<input min="0" step="0.01" type="number" value={form.daily_budget} onChange={(e)=>setForm({...form,daily_budget:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Toplam bütçe (₺)<input min="0" step="0.01" type="number" value={form.total_budget} onChange={(e)=>setForm({...form,total_budget:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label></div><button disabled={busy} className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">Onaya gönder →</button></form>
      <section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black">Kampanyalarım</h2><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">{ads.length} kampanya</span></div>{ads.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm font-semibold text-slate-500">Henüz kampanya oluşturmadınız.</div> : <div className="space-y-3">{ads.map((ad)=><article key={ad.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="text-[9px] font-black uppercase tracking-wider text-violet-600">{ad.ad_type === "popup" ? "Popup" : "Bildirim"}</span><h3 className="mt-1 font-black text-slate-950">{ad.title}</h3></div><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-black text-slate-600">{statusLabel[ad.status] || ad.status}</span></div><p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">{ad.body}</p><div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4"><div><strong className="block text-lg font-black">{ad.impressions}</strong><span className="text-[9px] font-bold uppercase text-slate-400">Gösterim</span></div><div><strong className="block text-lg font-black">{ad.clicks}</strong><span className="text-[9px] font-bold uppercase text-slate-400">Tıklama</span></div><div><strong className="block text-lg font-black">{ad.impressions ? `%${((ad.clicks/ad.impressions)*100).toFixed(1)}` : "%0"}</strong><span className="text-[9px] font-bold uppercase text-slate-400">CTR</span></div></div>{ad.admin_note && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-semibold text-amber-800">Yönetici notu: {ad.admin_note}</p>}</article>)}</div>}</section></div>
  </main>;
}
