"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getB2BErrorMessage } from "@/lib/b2b-ui";

type FavoriteRow = {
  product_id: string;
  product_name: string;
  product_slug: string;
  brand: string | null;
  category: string;
  image_urls: string[];
  stock_status: string;
  minimum_order_quantity: number;
  unit: string;
  vat_included: boolean;
  wholesaler_name: string;
  wholesaler_slug: string;
  current_price: number | null;
  currency: string | null;
  target_price: number | null;
  notify_on_any_drop: boolean;
  favorited_at: string;
};

function formatPrice(price: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(price);
}

function FavoriteCard({ item, verified, onRemoved, onSaved }: {
  item: FavoriteRow;
  verified: boolean;
  onRemoved: () => void;
  onSaved: () => void;
}) {
  const [target, setTarget] = useState(item.target_price?.toString() ?? "");
  const [anyDrop, setAnyDrop] = useState(item.notify_on_any_drop);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.from("b2b_product_favorites").update({
      target_price: target ? Number(target) : null,
      notify_on_any_drop: anyDrop,
      updated_at: new Date().toISOString(),
    }).eq("product_id", item.product_id);
    setBusy(false);
    if (error) return setMessage(getB2BErrorMessage(error));
    setMessage("Fiyat alarmı kaydedildi.");
    onSaved();
  };

  const remove = async () => {
    setBusy(true);
    const { error } = await supabase.from("b2b_product_favorites").delete().eq("product_id", item.product_id);
    setBusy(false);
    if (error) return setMessage(getB2BErrorMessage(error));
    onRemoved();
  };

  const targetReached = item.current_price !== null && item.target_price !== null && Number(item.current_price) <= Number(item.target_price);

  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="grid gap-5 p-5 sm:grid-cols-[150px_1fr]">
      <Link href={`/b2b/urun/${item.product_slug}`} className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 to-slate-100 sm:aspect-auto sm:min-h-40">{item.image_urls?.[0] ? <img src={item.image_urls[0]} alt={item.product_name} className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-5xl text-sky-200">◈</span>}{targetReached && <span className="absolute left-3 top-3 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[9px] font-black text-white shadow">HEDEF FİYATTA</span>}</Link>
      <div className="min-w-0"><div className="flex items-start justify-between gap-3"><div><Link href={`/b2b/toptanci/${item.wholesaler_slug}`} className="text-[10px] font-black uppercase tracking-wider text-sky-600">{item.wholesaler_name}</Link><Link href={`/b2b/urun/${item.product_slug}`}><h2 className="mt-1 text-lg font-black text-slate-950 hover:text-sky-700">{item.product_name}</h2></Link><p className="mt-2 text-xs font-semibold text-slate-500">{item.category} · Min. {item.minimum_order_quantity} {item.unit} · {item.vat_included ? "KDV dahil" : "KDV hariç"}</p></div><button type="button" disabled={busy} onClick={remove} aria-label="Favorilerden çıkar" className="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-xl text-rose-600">♥</button></div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4"><div><span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Güncel fiyat</span><strong className="mt-1 block text-xl font-black text-slate-950">{verified && item.current_price !== null ? formatPrice(Number(item.current_price), item.currency || "TRY") : "🔒 Doğrulama gerekli"}</strong></div><Link href={`/b2b/urun/${item.product_slug}`} className="rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white">Ürünü incele →</Link></div>
      </div>
    </div>
    <div className="border-t border-slate-200 bg-slate-50/80 p-5">
      {verified ? <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end"><label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Hedef fiyat <span className="font-medium normal-case tracking-normal text-slate-400">(isteğe bağlı)</span><div className="relative mt-1.5"><input type="number" min="0.01" step="0.01" value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Örn. 850" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-14 text-sm font-black outline-none focus:border-sky-500" /><span className="absolute right-3 top-3 text-xs font-black text-slate-400">{item.currency || "TRY"}</span></div></label><label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700"><input type="checkbox" checked={anyDrop} onChange={(event) => setAnyDrop(event.target.checked)} className="size-4 accent-sky-600" /> Her fiyat düşüşünde bildir</label><button disabled={busy} onClick={save} className="min-h-12 rounded-xl bg-sky-600 px-5 text-xs font-black text-white disabled:opacity-50">{busy ? "Kaydediliyor…" : "Alarmı kaydet"}</button></div> : <Link href="/b2b/dogrulama" className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-black text-amber-800"><span>Fiyat alarmı için işletme hesabınızı doğrulayın.</span><span>Doğrula →</span></Link>}
      {message && <p className={`mt-3 text-xs font-bold ${message.includes("kaydedildi") ? "text-emerald-700" : "text-red-600"}`}>{message}</p>}
    </div>
  </article>;
}

export default function B2BFavorites() {
  const [items, setItems] = useState<FavoriteRow[]>([]);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const [favoritesResult, memberResult] = await Promise.all([
      supabase.rpc("list_my_b2b_favorites"),
      supabase.from("b2b_members").select("verification_status").eq("user_id", userData.user.id).maybeSingle(),
    ]);
    if (favoritesResult.error) setError(getB2BErrorMessage(favoritesResult.error, "Favoriler henüz kullanıma hazır değil. 007 numaralı SQL dosyasını çalıştırın."));
    else setItems((favoritesResult.data ?? []) as FavoriteRow[]);
    setVerified(memberResult.data?.verification_status === "verified");
    setLoading(false);
  };

  useEffect(() => {
    // Private favorites are loaded after the browser session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-9"><div className="h-24 animate-pulse rounded-2xl bg-white" /><div className="mt-5 h-80 animate-pulse rounded-2xl bg-white" /></div>;

  return <main className="mx-auto max-w-5xl px-4 py-9">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-xs font-black uppercase tracking-[0.18em] text-rose-600">Kişisel takip listeniz</span><h1 className="mt-2 text-3xl font-black text-slate-950">Favorilerim ve fiyat alarmları</h1><p className="mt-2 text-sm font-medium text-slate-500">İlgilendiğiniz ürünleri saklayın; fiyat düştüğünde veya hedefinize ulaştığında haber alın.</p></div><span className="w-fit rounded-xl bg-white px-4 py-3 text-xs font-black text-slate-600 shadow-sm">{items.length} ürün takipte</span></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">{error}</div>}
    {items.length === 0 && !error ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><span className="text-4xl text-rose-400">♡</span><h2 className="mt-4 text-lg font-black text-slate-800">Takip listeniz henüz boş</h2><p className="mt-2 text-sm text-slate-500">Katalogda beğendiğiniz ürünlerin kalp düğmesine dokunun.</p><Link href="/b2b" className="mt-5 inline-flex rounded-xl bg-sky-600 px-5 py-3 text-sm font-black text-white">Ürünleri keşfet</Link></div> : <div className="space-y-5">{items.map((item) => <FavoriteCard key={item.product_id} item={item} verified={verified} onRemoved={() => setItems((current) => current.filter((row) => row.product_id !== item.product_id))} onSaved={load} />)}</div>}
  </main>;
}
