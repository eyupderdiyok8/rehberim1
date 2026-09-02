"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type WholesalerRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  shipping_terms: string | null;
  logo_url: string | null;
  cover_url: string | null;
  is_active: boolean;
  rating: number;
  review_count: number;
  created_at: string;
};

type MemberRow = {
  user_id: string;
  account_type: string;
  verification_status: string;
  business_name: string | null;
  city: string | null;
};

type ProductRow = { id: string; wholesaler_id: string; is_active: boolean };
type Filter = "all" | "active" | "passive";

const emptyCreate = { ownerId: "", name: "", slug: "" };

export default function AdminB2BWholesalersPage() {
  const [stores, setStores] = useState<WholesalerRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selected, setSelected] = useState<WholesalerRow | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    const [storesResult, membersResult, productsResult] = await Promise.all([
      supabase.from("b2b_wholesalers").select("id, owner_id, name, slug, description, city, phone, whatsapp, website, shipping_terms, logo_url, cover_url, is_active, rating, review_count, created_at").order("created_at", { ascending: false }),
      supabase.from("b2b_members").select("user_id, account_type, verification_status, business_name, city").order("created_at", { ascending: false }),
      supabase.from("b2b_products").select("id, wholesaler_id, is_active"),
    ]);
    const firstError = storesResult.error ?? membersResult.error ?? productsResult.error;
    if (firstError) setError(firstError.message);
    setStores((storesResult.data ?? []) as WholesalerRow[]);
    setMembers((membersResult.data ?? []) as MemberRow[]);
    setProducts((productsResult.data ?? []) as ProductRow[]);
    setLoading(false);
  };

  useEffect(() => {
    // Admin data is loaded after the existing panel session is verified by its layout.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const memberById = useMemo(() => new Map(members.map((member) => [member.user_id, member])), [members]);
  const productStats = useMemo(() => {
    const map = new Map<string, { total: number; active: number }>();
    products.forEach((product) => {
      const current = map.get(product.wholesaler_id) ?? { total: 0, active: 0 };
      current.total += 1;
      if (product.is_active) current.active += 1;
      map.set(product.wholesaler_id, current);
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return stores.filter((store) => {
      const statusMatches = filter === "all" || (filter === "active" ? store.is_active : !store.is_active);
      const textMatches = !normalized || [store.name, store.city, store.slug, memberById.get(store.owner_id)?.business_name]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalized));
      return statusMatches && textMatches;
    });
  }, [filter, memberById, query, stores]);

  const notify = (text: string) => { setMessage(text); setError(""); window.setTimeout(() => setMessage(""), 3500); };

  const toggleStore = async (store: WholesalerRow) => {
    setBusy(`toggle-${store.id}`);
    const { error: updateError } = await supabase.from("b2b_wholesalers").update({ is_active: !store.is_active, updated_at: new Date().toISOString() }).eq("id", store.id);
    setBusy("");
    if (updateError) return setError(updateError.message);
    notify(store.is_active ? "Toptancı mağazası pasife alındı." : "Toptancı mağazası yayına açıldı.");
    await load();
  };

  const updateAccount = async (store: WholesalerRow, status: "verified" | "suspended") => {
    setBusy(`account-${store.id}`);
    const { error: updateError } = await supabase.rpc("review_b2b_verification", { p_user_id: store.owner_id, p_status: status, p_note: status === "suspended" ? "Toptancı hesabı yönetici tarafından askıya alındı." : null });
    setBusy("");
    if (updateError) return setError(updateError.message);
    notify(status === "suspended" ? "Toptancı hesabı askıya alındı." : "Toptancı hesabı yeniden etkinleştirildi.");
    await load();
  };

  const saveStore = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setBusy(`save-${selected.id}`);
    const { error: saveError } = await supabase.from("b2b_wholesalers").update({
      name: selected.name.trim(), slug: selected.slug.trim(), city: selected.city?.trim() || null,
      phone: selected.phone?.trim() || null, whatsapp: selected.whatsapp?.trim() || null,
      website: selected.website?.trim() || null, description: selected.description?.trim() || null,
      shipping_terms: selected.shipping_terms?.trim() || null, updated_at: new Date().toISOString(),
    }).eq("id", selected.id);
    setBusy("");
    if (saveError) return setError(saveError.message);
    notify("Toptancı profili güncellendi.");
    setSelected(null);
    await load();
  };

  const createStore = async (event: FormEvent) => {
    event.preventDefault();
    setBusy("create");
    const { error: createError } = await supabase.rpc("create_b2b_wholesaler_account", { p_owner_id: createForm.ownerId, p_name: createForm.name.trim(), p_slug: createForm.slug.trim() });
    setBusy("");
    if (createError) return setError(createError.message);
    notify("Yeni toptancı mağazası oluşturuldu.");
    setCreateForm(emptyCreate);
    setShowCreate(false);
    await load();
  };

  const activeCount = stores.filter((store) => store.is_active).length;
  const suspendedCount = stores.filter((store) => memberById.get(store.owner_id)?.verification_status === "suspended").length;
  const unassignedMembers = members.filter((member) => !stores.some((store) => store.owner_id === member.user_id) && member.account_type !== "admin");

  if (loading) return <div className="py-20 text-center text-sm font-bold text-slate-500">Toptancılar yükleniyor…</div>;

  return <div className="space-y-7">
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><span className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">B2B operasyon</span><h1 className="mt-2 text-3xl font-black text-slate-950">Toptancı yönetimi</h1><p className="mt-2 text-sm font-medium text-slate-500">Mağazaları, hesap erişimini ve katalog durumunu tek merkezden yönetin.</p></div><button onClick={() => setShowCreate((value) => !value)} className="w-fit rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/10">{showCreate ? "Formu kapat" : "+ Yeni toptancı"}</button></header>

    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      ["Toplam toptancı", stores.length, "bg-violet-50 text-violet-700"],
      ["Aktif mağaza", activeCount, "bg-emerald-50 text-emerald-700"],
      ["Askıya alınan", suspendedCount, "bg-red-50 text-red-700"],
      ["Toplam ürün", products.length, "bg-sky-50 text-sky-700"],
    ].map(([label, value, color]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${color}`}>{label}</span><strong className="mt-4 block text-3xl font-black text-slate-950">{value}</strong></div>)}</section>

    {showCreate && <form onSubmit={createStore} className="rounded-2xl border border-violet-200 bg-violet-50 p-6"><h2 className="text-lg font-black text-violet-950">Yeni toptancı mağazası</h2><p className="mt-1 text-xs font-medium text-violet-800">Önce kayıtlı kullanıcıyı seçin; hesap otomatik olarak toptancı rolüne geçirilir.</p><div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]"><select required value={createForm.ownerId} onChange={(event) => { const ownerId = event.target.value; const member = memberById.get(ownerId); setCreateForm({ ...createForm, ownerId, name: createForm.name || member?.business_name || "" }); }} className="rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm"><option value="">Kayıtlı kullanıcı seçin</option>{unassignedMembers.map((member) => <option key={member.user_id} value={member.user_id}>{member.business_name || member.user_id} · {member.city || "Şehir yok"}</option>)}</select><input required value={createForm.name} onChange={(event) => setCreateForm({...createForm,name:event.target.value})} placeholder="Mağaza adı" className="rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm" /><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={createForm.slug} onChange={(event) => setCreateForm({...createForm,slug:event.target.value.toLowerCase()})} placeholder="magaza-adresi" className="rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm" /><button disabled={busy === "create"} className="rounded-xl bg-violet-700 px-5 py-3 text-xs font-black text-white disabled:opacity-50">Mağazayı oluştur</button></div></form>}

    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 lg:grid-cols-[1fr_auto]"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mağaza, şehir veya işletme ara…" className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-500" /><div className="flex gap-2">{(["all","active","passive"] as Filter[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-xs font-black ${filter === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{item === "all" ? "Tümü" : item === "active" ? "Aktif" : "Pasif"}</button>)}</div></div></section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{filtered.length === 0 ? <div className="py-20 text-center text-sm font-semibold text-slate-500">Bu filtreye uygun toptancı yok.</div> : <div className="divide-y divide-slate-100">{filtered.map((store) => {
      const member = memberById.get(store.owner_id);
      const stats = productStats.get(store.id) ?? { total: 0, active: 0 };
      const suspended = member?.verification_status === "suspended";
      return <article key={store.id} className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center"><div className="flex min-w-0 items-center gap-4"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-violet-700 text-lg font-black text-white">{store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : store.name.slice(0,2).toLocaleUpperCase("tr-TR")}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-black text-slate-950">{store.name}</h2><span className={`rounded-md px-2 py-1 text-[9px] font-black uppercase ${store.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{store.is_active ? "Mağaza aktif" : "Mağaza pasif"}</span>{suspended && <span className="rounded-md bg-red-50 px-2 py-1 text-[9px] font-black uppercase text-red-700">Hesap askıda</span>}</div><p className="mt-1 text-xs font-semibold text-slate-500">{store.city || "Şehir belirtilmedi"} · @{store.slug} · {stats.active}/{stats.total} aktif ürün</p><p className="mt-2 truncate text-[10px] font-mono text-slate-400">{store.owner_id}</p></div></div><div className="flex flex-wrap gap-2"><Link href={`/b2b/toptanci/${store.slug}`} target="_blank" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">Mağazayı gör ↗</Link><button onClick={() => setSelected({...store})} className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100">Düzenle</button><button disabled={busy === `toggle-${store.id}`} onClick={() => toggleStore(store)} className={`rounded-lg px-3 py-2 text-xs font-black ${store.is_active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{store.is_active ? "Pasife al" : "Yayına aç"}</button><button disabled={busy === `account-${store.id}`} onClick={() => updateAccount(store, suspended ? "verified" : "suspended")} className={`rounded-lg px-3 py-2 text-xs font-black ${suspended ? "bg-sky-50 text-sky-700" : "bg-red-50 text-red-700"}`}>{suspended ? "Hesabı aç" : "Hesabı askıya al"}</button></div></div></article>;
    })}</div>}</section>

    {selected && <div className="fixed inset-0 z-[100] flex items-end justify-end bg-slate-950/50 backdrop-blur-sm sm:p-4" onMouseDown={() => setSelected(null)}><form onSubmit={saveStore} onMouseDown={(event) => event.stopPropagation()} className="h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:h-full sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between"><div><span className="text-xs font-black uppercase tracking-wider text-violet-600">Mağaza düzenle</span><h2 className="mt-2 text-2xl font-black text-slate-950">{selected.name}</h2></div><button type="button" onClick={() => setSelected(null)} className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xl">×</button></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-slate-600 sm:col-span-2">Mağaza adı<input required value={selected.name} onChange={(event) => setSelected({...selected,name:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Bağlantı adresi<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={selected.slug} onChange={(event) => setSelected({...selected,slug:event.target.value.toLowerCase()})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Şehir<input value={selected.city ?? ""} onChange={(event) => setSelected({...selected,city:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">Telefon<input value={selected.phone ?? ""} onChange={(event) => setSelected({...selected,phone:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600">WhatsApp<input value={selected.whatsapp ?? ""} onChange={(event) => setSelected({...selected,whatsapp:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Web sitesi<input value={selected.website ?? ""} onChange={(event) => setSelected({...selected,website:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Mağaza açıklaması<textarea rows={5} value={selected.description ?? ""} onChange={(event) => setSelected({...selected,description:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label><label className="text-xs font-bold text-slate-600 sm:col-span-2">Sevkiyat koşulları<textarea rows={4} value={selected.shipping_terms ?? ""} onChange={(event) => setSelected({...selected,shipping_terms:event.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" /></label></div><button disabled={busy === `save-${selected.id}`} className="mt-7 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white disabled:opacity-50">Değişiklikleri kaydet</button></form></div>}
  </div>;
}
