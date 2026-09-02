"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getB2BErrorMessage } from "@/lib/b2b-ui";

export type B2BNotification = {
  id: number;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

export function useB2BNotificationCounts(enabled = true) {
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    const [notificationResult, conversationResult] = await Promise.all([
      supabase.from("b2b_notifications").select("id", { count: "exact", head: true }).is("read_at", null),
      supabase.rpc("list_b2b_conversations"),
    ]);
    if (!notificationResult.error) setNotificationCount(notificationResult.count ?? 0);
    if (!conversationResult.error) {
      const total = ((conversationResult.data ?? []) as { unread_count: number }[]).reduce((sum, row) => sum + Number(row.unread_count || 0), 0);
      setMessageCount(total);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    // Initial private counts are fetched once the browser session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const channel = supabase.channel("b2b-header-notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "b2b_notifications" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "b2b_messages" }, load)
      .subscribe();
    const timer = window.setInterval(load, 30_000);
    return () => { window.clearInterval(timer); supabase.removeChannel(channel); };
  }, [enabled, load]);

  return { notificationCount, messageCount, refreshCounts: load };
}

export default function B2BNotifications() {
  const [items, setItems] = useState<B2BNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.from("b2b_notifications").select("id, kind, title, body, href, read_at, created_at").order("created_at", { ascending: false }).limit(100);
    if (loadError) setError(getB2BErrorMessage(loadError, "Bildirimler yüklenemedi."));
    else setItems((data ?? []) as B2BNotification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial private notifications are fetched once the browser session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const channel = supabase.channel("b2b-notification-center").on("postgres_changes", { event: "*", schema: "public", table: "b2b_notifications" }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const markRead = async (id?: number) => {
    const query = supabase.from("b2b_notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
    const { error: updateError } = id ? await query.eq("id", id) : await query;
    if (updateError) return setError(getB2BErrorMessage(updateError));
    await load();
  };

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-10"><div className="h-28 animate-pulse rounded-2xl bg-white" /><div className="mt-4 h-72 animate-pulse rounded-2xl bg-white" /></div>;

  return <main className="mx-auto max-w-4xl px-4 py-9">
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Hareket merkezi</span><h1 className="mt-2 text-3xl font-black text-slate-950">Bildirimler</h1><p className="mt-2 text-sm font-medium text-slate-500">Mesajlar, teklifler ve hesap işlemleri tek yerde.</p></div>{items.some((item) => !item.read_at) && <button onClick={() => markRead()} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 shadow-sm">Tümünü okundu işaretle</button>}</div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><span className="text-4xl">✓</span><h2 className="mt-4 text-lg font-black text-slate-800">Her şey güncel</h2><p className="mt-2 text-sm text-slate-500">Yeni bir mesaj veya işlem olduğunda burada göreceksiniz.</p></div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{items.map((item) => <article key={item.id} className={`flex gap-4 border-b border-slate-100 p-5 last:border-0 ${item.read_at ? "bg-white" : "bg-sky-50/60"}`}><span className={`mt-1 grid size-10 shrink-0 place-items-center rounded-xl ${item.read_at ? "bg-slate-100 text-slate-500" : "bg-sky-600 text-white"}`}>{item.kind === "message" ? "✉" : item.kind === "verification" ? "✓" : "↗"}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><strong className="text-sm font-black text-slate-950">{item.title}</strong><time className="shrink-0 text-[10px] font-bold text-slate-400">{new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</time></div><p className="mt-1 text-sm font-medium leading-6 text-slate-600">{item.body}</p><div className="mt-3 flex gap-3">{item.href && <Link href={item.href} onClick={() => !item.read_at && markRead(item.id)} className="text-xs font-black text-sky-700">Aç →</Link>}{!item.read_at && <button onClick={() => markRead(item.id)} className="text-xs font-black text-slate-500">Okundu</button>}</div></div></article>)}</div>}
  </main>;
}
