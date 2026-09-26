"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type AuditLog = { id: number; actor_id: string | null; actor_email: string | null; actor_name: string | null; action: string; entity_type: string; entity_id: string | null; wholesaler_id: string | null; summary: string; old_data: Record<string, unknown> | null; new_data: Record<string, unknown> | null; created_at: string };
type Store = { id: string; name: string };
type Category = "all" | "store" | "catalog" | "rfq" | "trade" | "messaging" | "ads" | "account" | "reputation";

const PAGE_SIZE = 200;
const currencySign: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€" };

const actionLabels: Record<string, string> = {
  store_created: "Mağaza açtı", store_updated: "Mağaza profili güncelledi", store_deleted: "Mağaza sildi",
  product_created: "Ürün ekledi", product_updated: "Ürün güncelledi", product_deleted: "Ürün sildi",
  price_created: "Fiyat belirledi", price_changed: "Fiyat değiştirdi",
  rfq_created: "Satın alma ilanı açtı", rfq_updated: "Satın alma ilanını güncelledi", rfq_awarded: "Teklifi kabul etti", rfq_cancelled: "İlanı iptal etti", rfq_expired: "İlan süresi doldu",
  offer_submitted: "Teklif verdi", offer_accepted: "Teklif kabul gördü", offer_withdrawn: "Teklifini geri çekti", offer_declined: "Teklif reddetti", offer_updated: "Teklifi güncelledi",
  trade_started: "Görüşme başlattı", trade_updated: "Görüşme güncelledi",
  conversation_started: "Yeni görüşme açtı", message_sent: "Mesaj gönderdi",
  ad_created: "Reklam oluşturdu", ad_updated: "Reklam güncelledi",
  account_created: "Hesap açtı", account_type_changed: "Hesap türünü değiştirdi", verification_requested: "Doğrulama başlattı", verification_approved: "Hesabı doğruladı", verification_rejected: "Doğrulamayı reddetti", verification_reset: "Doğrulamayı sıfırladı", account_suspended: "Hesabı askıya aldı",
  review_created: "Değerlendirme yazdı",
};

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "store", label: "Mağaza" },
  { id: "catalog", label: "Ürün & fiyat" },
  { id: "rfq", label: "RFQ & teklif" },
  { id: "trade", label: "Ticaret" },
  { id: "messaging", label: "Mesajlaşma" },
  { id: "ads", label: "Reklam" },
  { id: "account", label: "Hesap & doğrulama" },
  { id: "reputation", label: "İtibar" },
];

const categoryOf = (action: string): Category => {
  if (action.startsWith("product_") || action.startsWith("price_")) return "catalog";
  if (action.startsWith("rfq_") || action.startsWith("offer_")) return "rfq";
  if (action.startsWith("trade_")) return "trade";
  if (action.startsWith("message_") || action.startsWith("conversation_")) return "messaging";
  if (action.startsWith("ad_")) return "ads";
  if (action.startsWith("account_") || action.startsWith("verification_")) return "account";
  if (action.startsWith("review_")) return "reputation";
  if (action.startsWith("store_")) return "store";
  return "all";
};

const dotColor = (action: string) => {
  const category = categoryOf(action);
  if (category === "catalog") return "bg-amber-500";
  if (category === "messaging") return "bg-emerald-500";
  if (category === "rfq") return "bg-slate-800";
  if (category === "ads") return "bg-slate-500";
  if (category === "account") return "bg-slate-400";
  return "bg-slate-300";
};

const money = (value: unknown, currency: unknown) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySign[String(currency)] || "₺"}`;
};

export default function AdminB2BAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [action, setAction] = useState("all");
  const [store, setStore] = useState("all");
  const [period, setPeriod] = useState("all");
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  const load = useCallback(async (from: number) => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("b2b_audit_logs")
      .select("id, actor_id, actor_email, actor_name, action, entity_type, entity_id, wholesaler_id, summary, old_data, new_data, created_at")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    setLoading(false);
    if (loadError) return setError(loadError.message);
    setError("");
    const rows = (data ?? []) as AuditLog[];
    // Relative filters read their cutoff from this clock instead of an impure call in render.
    setNow(Date.now());
    setLogs((previous) => (from === 0 ? rows : [...previous, ...rows]));
    // Live rows are prepended, so paging must follow its own cursor rather than the list length.
    setOffset(from + rows.length);
    setExhausted(rows.length < PAGE_SIZE);
  }, []);

  useEffect(() => {
    // Audit history is loaded after the parent layout verifies the admin session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(0);
    supabase.from("b2b_wholesalers").select("id, name").order("name").then(({ data }) => setStores((data ?? []) as Store[]));
  }, [load]);

  useEffect(() => {
    // The clock only needs to advance the relative time windows while the page stays open.
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!live) return;
    // New movements arrive while the page is open, so nothing needs a refresh.
    const channel = supabase.channel("b2b-admin-audit-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "b2b_audit_logs" }, (payload) => {
        setLogs((previous) => [payload.new as AuditLog, ...previous]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [live]);

  const storeNames = useMemo(() => new Map(stores.map((item) => [item.id, item.name])), [stores]);
  const actions = useMemo(() => Array.from(new Set(logs.map((log) => log.action))).sort(), [logs]);
  const todayStart = useMemo(() => {
    if (now === null) return null;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.getTime();
  }, [now]);
  const periodStart = useMemo(() => {
    if (period === "all" || now === null) return 0;
    if (period === "today") return todayStart ?? 0;
    return now - (period === "7d" ? 7 : 30) * 86_400_000;
  }, [now, period, todayStart]);

  const visible = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("tr-TR");
    return logs.filter((log) => {
      if (category !== "all" && categoryOf(log.action) !== category) return false;
      if (action !== "all" && log.action !== action) return false;
      if (store !== "all" && log.wholesaler_id !== store) return false;
      if (new Date(log.created_at).getTime() < periodStart) return false;
      if (!normalized) return true;
      return [log.actor_name, log.actor_email, log.summary, storeNames.get(log.wholesaler_id || "")]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("tr-TR").includes(normalized));
    });
  }, [action, category, logs, periodStart, query, store, storeNames]);

  const counts = useMemo(() => {
    const map = new Map<Category, number>();
    logs.forEach((log) => {
      map.set("all", (map.get("all") ?? 0) + 1);
      const key = categoryOf(log.action);
      // categoryOf uses "all" as its unknown-action fallback; that must not be
      // counted a second time under the total.
      if (key !== "all") map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [logs]);

  const todayCount = useMemo(() => (todayStart === null ? 0 : logs.filter((log) => new Date(log.created_at).getTime() >= todayStart).length), [logs, todayStart]);

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Değiştirilemez işlem izi</span>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Platform hareketleri</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">Mağaza açılışı, ürün ve fiyat değişiklikleri, RFQ ve teklifler, mesajlaşma, reklam ve hesap doğrulama hareketlerini kimin ne zaman yaptığını görün.</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setLive((value) => !value)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-black transition ${live ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
          <i className={`size-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-slate-400"}`} />
          {live ? "Canlı akış açık" : "Canlı akış kapalı"}
        </button>
        <button onClick={() => load(0)} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 transition hover:border-slate-400 disabled:opacity-50">Yenile</button>
      </div>
    </header>

    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[[todayCount, "Bugünkü hareket"], [counts.get("catalog") ?? 0, "Ürün & fiyat"], [counts.get("rfq") ?? 0, "RFQ & teklif"], [new Set(logs.map((log) => log.actor_id).filter(Boolean)).size, "Hareket eden hesap"]].map(([value, label]) => (
        <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5">
          <strong className="text-3xl font-black text-slate-950">{value}</strong>
          <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</span>
        </div>
      ))}
    </section>

    <section className="flex flex-wrap gap-2">
      {categories.map((item) => (
        <button key={item.id} onClick={() => setCategory(item.id)} className={`rounded-xl border px-3 py-2 text-xs font-black transition ${category === item.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
          {item.label}
          <span className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] ${category === item.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>{counts.get(item.id) ?? 0}</span>
        </button>
      ))}
    </section>

    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_200px_200px_170px]">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kullanıcı, mağaza veya işlem ara…" className="min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white" />
      <select value={action} onChange={(e) => setAction(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-slate-400">
        <option value="all">Tüm işlemler</option>
        {actions.map((item) => <option key={item} value={item}>{actionLabels[item] || item}</option>)}
      </select>
      <select value={store} onChange={(e) => setStore(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-slate-400">
        <option value="all">Tüm toptancılar</option>
        {stores.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select value={period} onChange={(e) => setPeriod(e.target.value)} className="min-h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold outline-none transition focus:border-slate-400">
        <option value="all">Tüm zamanlar</option>
        <option value="today">Bugün</option>
        <option value="7d">Son 7 gün</option>
        <option value="30d">Son 30 gün</option>
      </select>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {visible.length === 0 ? <div className="py-20 text-center text-sm font-semibold text-slate-500">Hareket kaydı bulunamadı.</div> : <div className="divide-y divide-slate-100">
        {visible.map((log) => {
          const before = money(log.old_data?.price, log.old_data?.currency);
          const after = money(log.new_data?.price, log.new_data?.currency);
          const drop = before && after && Number(log.new_data?.price) < Number(log.old_data?.price);
          return <article key={log.id} className="flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-start">
            <div className="flex gap-4">
              <span className={`mt-2 size-2.5 shrink-0 rounded-full ${dotColor(log.action)}`} />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-black text-slate-950">{log.actor_name || log.actor_email || "Sistem"}</strong>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-600">{actionLabels[log.action] || log.action}</span>
                  {before && after && <span className={`rounded-md px-2 py-1 text-[10px] font-black ${drop ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{before} <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="inline size-3 align-[-1px]"><path d="M4 12h12" /><path d="m11 7 5 5-5 5" /></svg> {after}</span>}
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-700">{log.summary}</p>
                <p className="mt-2 text-[10px] font-semibold text-slate-400">{storeNames.get(log.wholesaler_id || "") || "Platform"} · {new Date(log.created_at).toLocaleString("tr-TR")}{log.actor_email ? ` · ${log.actor_email}` : ""}</p>
              </div>
            </div>
            {(log.old_data || log.new_data) && <details className="group lg:max-w-md lg:shrink-0"><summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 transition hover:border-slate-400">Değişiklik detayları</summary>
              <div className="mt-2 grid gap-2 text-[10px] xl:grid-cols-2">
                {log.old_data && <div className="overflow-auto rounded-lg bg-red-50 p-3"><strong className="text-red-700">ÖNCE</strong><pre className="mt-2 whitespace-pre-wrap break-all text-slate-600">{JSON.stringify(log.old_data, null, 2)}</pre></div>}
                {log.new_data && <div className="overflow-auto rounded-lg bg-emerald-50 p-3"><strong className="text-emerald-700">SONRA</strong><pre className="mt-2 whitespace-pre-wrap break-all text-slate-600">{JSON.stringify(log.new_data, null, 2)}</pre></div>}
              </div>
            </details>}
          </article>;
        })}
      </div>}
      {visible.length < logs.length && <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-center text-[11px] font-bold text-slate-500">Filtre {logs.length.toLocaleString("tr-TR")} kayıttan {visible.length.toLocaleString("tr-TR")} tanesini gösteriyor.</div>}
      {!exhausted && <div className="border-t border-slate-100 p-4 text-center">
        <button onClick={() => load(offset)} disabled={loading} className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-50">{loading ? "Yükleniyor…" : "Daha fazla yükle"}</button>
        <p className="mt-2 text-[11px] font-bold text-slate-500">{logs.length.toLocaleString("tr-TR")} kayıt yüklendi</p>
      </div>}
    </section>
  </div>;
}
