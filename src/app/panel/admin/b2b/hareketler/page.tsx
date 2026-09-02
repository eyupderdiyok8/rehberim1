"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuditLog = { id: number; actor_id: string | null; actor_email: string | null; actor_name: string | null; action: string; entity_type: string; entity_id: string | null; wholesaler_id: string | null; summary: string; old_data: Record<string,unknown> | null; new_data: Record<string,unknown> | null; created_at: string };
type Store = { id: string; name: string };

const actionLabels: Record<string,string> = { store_created:"Mağaza oluşturdu",store_updated:"Profil güncelledi",store_deleted:"Mağaza silindi",product_created:"Ürün ekledi",product_updated:"Ürün güncelledi",product_deleted:"Ürün silindi",price_created:"Fiyat belirledi",price_changed:"Fiyat değiştirdi",trade_started:"Görüşme başladı",trade_updated:"Ticaret güncellendi",ad_created:"Reklam oluşturdu",ad_updated:"Reklam güncelledi",message_sent:"Mesaj gönderdi" };

export default function AdminB2BAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");
  const [store, setStore] = useState("all");
  const [error, setError] = useState("");

  const load = async () => {
    const [logsResult, storesResult] = await Promise.all([
      supabase.from("b2b_audit_logs").select("id, actor_id, actor_email, actor_name, action, entity_type, entity_id, wholesaler_id, summary, old_data, new_data, created_at").order("created_at", {ascending:false}).limit(1000),
      supabase.from("b2b_wholesalers").select("id, name").order("name"),
    ]);
    if(logsResult.error||storesResult.error)setError(logsResult.error?.message||storesResult.error?.message||"Hareketler yüklenemedi.");
    setLogs((logsResult.data??[]) as AuditLog[]); setStores((storesResult.data??[]) as Store[]);
  };

  useEffect(()=>{
    // Audit history is loaded after the parent layout verifies the admin session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  },[]);

  const storeNames = useMemo(()=>new Map(stores.map((item)=>[item.id,item.name])),[stores]);
  const actions = useMemo(()=>Array.from(new Set(logs.map((log)=>log.action))),[logs]);
  const filtered = useMemo(()=>{const normalized=query.trim().toLocaleLowerCase("tr-TR");return logs.filter((log)=>(action==="all"||log.action===action)&&(store==="all"||log.wholesaler_id===store)&&(!normalized||[log.actor_name,log.actor_email,log.summary,storeNames.get(log.wholesaler_id||"")].filter(Boolean).some((value)=>String(value).toLocaleLowerCase("tr-TR").includes(normalized))));},[action,logs,query,store,storeNames]);

  return <div className="space-y-6"><header><span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Değiştirilemez işlem izi</span><h1 className="mt-2 text-3xl font-black text-slate-950">Toptancı hareketleri</h1><p className="mt-2 text-sm font-medium text-slate-500">Ürün, fiyat, profil, teklif, reklam ve mesaj hareketlerini kimin ne zaman yaptığını görün.</p></header>
    {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    <section className="grid gap-4 sm:grid-cols-3">{[[logs.length,"Son 1.000 hareket"],[logs.filter((log)=>log.action==="price_changed").length,"Fiyat değişikliği"],[new Set(logs.map((log)=>log.actor_id).filter(Boolean)).size,"Aktif kullanıcı"]].map(([value,label])=><div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5"><strong className="text-3xl font-black text-slate-950">{value}</strong><span className="ml-2 text-xs font-bold text-slate-500">{label}</span></div>)}</section>
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_220px_220px]"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Kullanıcı, mağaza veya işlem ara…" className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500"/><select value={action} onChange={(e)=>setAction(e.target.value)} className="rounded-xl border border-slate-200 px-4 text-sm font-bold"><option value="all">Tüm hareketler</option>{actions.map((item)=><option key={item} value={item}>{actionLabels[item]||item}</option>)}</select><select value={store} onChange={(e)=>setStore(e.target.value)} className="rounded-xl border border-slate-200 px-4 text-sm font-bold"><option value="all">Tüm toptancılar</option>{stores.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{filtered.length===0?<div className="py-20 text-center text-sm font-semibold text-slate-500">Hareket kaydı bulunamadı.</div>:<div className="divide-y divide-slate-100">{filtered.map((log)=><article key={log.id} className="p-5"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div className="flex gap-4"><span className={`mt-1 size-2.5 shrink-0 rounded-full ${log.action.includes("price")?"bg-amber-500":log.action.includes("product")?"bg-sky-500":log.action.includes("ad")?"bg-violet-500":log.action.includes("message")?"bg-emerald-500":"bg-slate-400"}`}/><div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm font-black text-slate-950">{log.actor_name||log.actor_email||"Sistem"}</strong><span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-black uppercase text-slate-600">{actionLabels[log.action]||log.action}</span></div><p className="mt-1 text-sm font-medium text-slate-700">{log.summary}</p><p className="mt-2 text-[10px] font-semibold text-slate-400">{storeNames.get(log.wholesaler_id||"")||"Platform"} · {new Date(log.created_at).toLocaleString("tr-TR")}</p></div></div><details className="group lg:max-w-md"><summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600">Değişiklik detayları</summary><div className="mt-2 grid gap-2 text-[10px] xl:grid-cols-2">{log.old_data&&<div className="overflow-auto rounded-lg bg-red-50 p-3"><strong className="text-red-700">ÖNCE</strong><pre className="mt-2 whitespace-pre-wrap break-all text-slate-600">{JSON.stringify(log.old_data,null,2)}</pre></div>} {log.new_data&&<div className="overflow-auto rounded-lg bg-emerald-50 p-3"><strong className="text-emerald-700">SONRA</strong><pre className="mt-2 whitespace-pre-wrap break-all text-slate-600">{JSON.stringify(log.new_data,null,2)}</pre></div>}</div></details></div></article>)}</div>}</section>
  </div>;
}
