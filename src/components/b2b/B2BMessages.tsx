"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getB2BErrorMessage } from "@/lib/b2b-ui";

type Conversation = {
  id: string;
  trade_request_id: string | null;
  counterpart_name: string;
  counterpart_type: "buyer" | "wholesaler";
  product_name: string | null;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
};

type Message = { id: number; conversation_id: string; sender_id: string; body: string; seen_at: string | null; created_at: string };

export default function B2BMessages() {
  const searchParams = useSearchParams();
  const requestedConversation = searchParams.get("conversation");
  const [userId, setUserId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState(requestedConversation || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileConversationOpen, setMobileConversationOpen] = useState(Boolean(requestedConversation));
  const [error, setError] = useState("");
  const messageAreaRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const { data, error: loadError } = await supabase.rpc("list_b2b_conversations");
    if (loadError) setError(getB2BErrorMessage(loadError, "Görüşmeler yüklenemedi."));
    const rows = (data ?? []) as Conversation[];
    setConversations(rows);
    setSelectedId((current) => {
      if (current && rows.some((conversation) => conversation.id === current)) return current;
      if (requestedConversation && rows.some((conversation) => conversation.id === requestedConversation)) return requestedConversation;
      return rows[0]?.id || "";
    });
    setLoading(false);
  }, [requestedConversation]);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    const { data, error: loadError } = await supabase.from("b2b_messages").select("id, conversation_id, sender_id, body, seen_at, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(300);
    if (loadError) setError(getB2BErrorMessage(loadError, "Mesajlar yüklenemedi."));
    else setMessages((data ?? []) as Message[]);
    await supabase.rpc("mark_b2b_conversation_read", { p_conversation_id: conversationId });
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, unread_count: 0 } : conversation));
    await supabase.from("b2b_notifications").update({ read_at: new Date().toISOString() }).eq("kind", "message").eq("entity_id", conversationId).is("read_at", null);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ""));
    // Initial remote data is loaded after the client session is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    // Keep the selected remote conversation synchronized with the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages(selectedId);
    const channel = supabase.channel(`b2b-conversation-${selectedId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "b2b_messages", filter: `conversation_id=eq.${selectedId}` }, () => {
        loadMessages(selectedId);
        loadConversations();
      }).subscribe();
    const timer = window.setInterval(() => { loadMessages(selectedId); loadConversations(); }, 20_000);
    return () => { window.clearInterval(timer); supabase.removeChannel(channel); };
  }, [loadConversations, loadMessages, selectedId]);

  useEffect(() => {
    const area = messageAreaRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [messages, selectedId]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !selectedId || !userId) return;
    setBusy(true);
    setDraft("");
    const { error: sendError } = await supabase.from("b2b_messages").insert({ conversation_id: selectedId, sender_id: userId, body });
    setBusy(false);
    if (sendError) { setDraft(body); return setError(getB2BErrorMessage(sendError, "Mesaj gönderilemedi.")); }
    await Promise.all([loadMessages(selectedId), loadConversations()]);
  };

  const deleteConversation = async () => {
    if (!selectedId) return;
    setDeleteBusy(true);
    setError("");
    const { error: deleteError } = await supabase.rpc("delete_b2b_conversation", { p_conversation_id: selectedId });
    setDeleteBusy(false);
    if (deleteError) return setError(getB2BErrorMessage(deleteError, "Görüşme kaldırılamadı."));
    setMessages([]);
    setSelectedId("");
    setDeleteOpen(false);
    setMobileConversationOpen(false);
    await loadConversations();
  };

  const selected = conversations.find((conversation) => conversation.id === selectedId);
  const filteredConversations = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr-TR");
    if (!term) return conversations;
    return conversations.filter((conversation) => `${conversation.counterpart_name} ${conversation.product_name ?? ""} ${conversation.last_message ?? ""}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [conversations, search]);
  if (loading) return <div className="mx-auto max-w-7xl px-4 py-9"><div className="mb-6 h-20 animate-pulse rounded-2xl bg-white" /><div className="h-[660px] animate-pulse rounded-3xl bg-white" /></div>;

  return <main className="mx-auto max-w-7xl px-4 py-7">
    <div className="mb-6"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Ticaret iletişimi</span><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Mesajlar</h1><p className="mt-2 text-sm font-medium text-slate-500">Fiyat, stok, sevkiyat ve sipariş detaylarını kayıtlı görüşmede netleştirin.</p></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    <div className="grid min-h-[660px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[350px_1fr]">
      <aside className={`${mobileConversationOpen ? "hidden lg:block" : "block"} border-b border-slate-200 bg-slate-50/70 lg:border-b-0 lg:border-r`}><div className="border-b border-slate-200 p-4"><div><strong className="text-sm font-black text-slate-950">Görüşmeler</strong><span className="ml-2 rounded-full bg-slate-200 px-2 py-1 text-[9px] font-black text-slate-600">{conversations.length}</span></div><label className="relative mt-3 block"><span className="sr-only">Görüşmelerde ara</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Firma, ürün veya mesaj ara…" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-9 text-sm outline-none focus:border-sky-400" /><span className="absolute right-3 top-3 text-slate-400">⌕</span></label></div><div className="max-h-[600px] overflow-y-auto p-2">{conversations.length === 0 ? <p className="p-8 text-center text-xs font-semibold leading-5 text-slate-500">Henüz görüşmeniz yok. Bir toptancı mağazasından mesaj gönderebilirsiniz.</p> : filteredConversations.length === 0 ? <p className="p-8 text-center text-xs font-semibold text-slate-500">Aramanızla eşleşen görüşme bulunamadı.</p> : filteredConversations.map((conversation) => <button key={conversation.id} onClick={() => { setSelectedId(conversation.id); setMobileConversationOpen(true); }} className={`mb-1 w-full rounded-xl p-3 text-left transition ${selectedId === conversation.id ? "bg-slate-950 text-white shadow-lg" : "hover:bg-white"}`}><div className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{conversation.counterpart_name}</strong>{Number(conversation.unread_count) > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-sky-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950">{conversation.unread_count}</span>}</div>{conversation.product_name && <span className={`mt-1 block truncate text-[9px] font-black uppercase tracking-wide ${selectedId === conversation.id ? "text-sky-300" : "text-sky-600"}`}>{conversation.product_name}</span>}<p className={`mt-2 truncate text-xs ${selectedId === conversation.id ? "text-slate-300" : "text-slate-500"}`}>{conversation.last_message || "Görüşme hazır"}</p></button>)}</div></aside>
      <section className={`${mobileConversationOpen ? "flex" : "hidden lg:flex"} min-h-[620px] flex-col`}>{selected ? <><header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setMobileConversationOpen(false)} aria-label="Görüşmelere dön" className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-lg font-black text-slate-700 lg:hidden">←</button><div className="min-w-0"><strong className="block truncate text-sm font-black text-slate-950">{selected.counterpart_name}</strong><span className="text-[10px] font-bold text-emerald-600">● Platform içi güvenli görüşme</span></div></div><div className="flex items-center gap-2">{selected.product_name && <span className="hidden rounded-lg bg-sky-50 px-3 py-2 text-[10px] font-black text-sky-700 sm:block">{selected.product_name}</span>}<button type="button" disabled={deleteBusy} onClick={() => setDeleteOpen(true)} className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-black text-red-700 transition hover:bg-red-100 disabled:opacity-50">Sil</button></div></header><div ref={messageAreaRef} className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,#f0f9ff,transparent_35%)] p-4 sm:p-6">{messages.length === 0 ? <div className="grid h-full place-items-center text-center"><div><span className="text-3xl">✦</span><p className="mt-3 text-sm font-bold text-slate-600">Görüşmeyi ilk mesajla başlatın.</p></div></div> : messages.map((message) => { const own = message.sender_id === userId; return <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm font-medium leading-6 shadow-sm sm:max-w-[82%] ${own ? "rounded-br-md bg-slate-950 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-700"}`}><p className="whitespace-pre-wrap">{message.body}</p><span className="mt-1.5 block text-right text-[9px] font-bold text-slate-400">{new Date(message.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}{own && message.seen_at ? " · Görüldü" : ""}</span></div></div>; })}</div><form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3 sm:gap-3 sm:p-4"><textarea required maxLength={3000} rows={2} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Mesajınızı yazın…" className="min-h-14 min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /><button disabled={busy || !draft.trim()} className="rounded-xl bg-sky-600 px-4 text-xs font-black text-white disabled:opacity-40 sm:px-5">Gönder →</button></form></> : <div className="grid flex-1 place-items-center p-8 text-center"><div><button onClick={() => setMobileConversationOpen(false)} className="mb-5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-black lg:hidden">← Görüşmelere dön</button><span className="block text-4xl">↗</span><h2 className="mt-4 text-lg font-black text-slate-800">Bir görüşme seçin</h2><p className="mt-2 text-sm text-slate-500">Mesajlarınız burada açılacak.</p></div></div>}</section>
    </div>
    {deleteOpen && <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={() => !deleteBusy && setDeleteOpen(false)}><div role="dialog" aria-modal="true" aria-labelledby="delete-conversation-title" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-xl text-red-600">×</span><h2 id="delete-conversation-title" className="mt-4 text-xl font-black text-slate-950">Görüşme listenizden kaldırılsın mı?</h2><p className="mt-2 text-sm font-medium leading-6 text-slate-600">Bu işlem yalnızca sizin listenizi etkiler. Karşı tarafın mesajları silinmez; yeni mesaj gelirse görüşme yeniden görünür.</p><div className="mt-6 flex justify-end gap-2"><button disabled={deleteBusy} onClick={() => setDeleteOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-black text-slate-700">Vazgeç</button><button disabled={deleteBusy} onClick={deleteConversation} className="rounded-xl bg-red-600 px-4 py-3 text-xs font-black text-white disabled:opacity-50">{deleteBusy ? "Kaldırılıyor…" : "Görüşmeyi kaldır"}</button></div></div></div>}
  </main>;
}
