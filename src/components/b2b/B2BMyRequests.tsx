"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import B2BTradeTimeline from "@/components/b2b/B2BTradeTimeline";
import { B2B_RFQ_STATUS_LABELS, B2B_STATUS_LABELS, getB2BErrorMessage } from "@/lib/b2b-ui";

type BuyerRequest = {
  id: string;
  product_name: string;
  wholesaler_name: string;
  wholesaler_owner_id: string;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
  review_submitted: boolean;
  quoted_unit_price: number | null;
  quoted_currency: string | null;
  quote_note: string | null;
  quote_valid_until: string | null;
  conversation_id: string | null;
};

type OwnRfq = {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  status: string;
  valid_until: string;
  created_at: string;
  offer_count: number;
};

export default function B2BMyRequests() {
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [rfqs, setRfqs] = useState<OwnRfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data, error: loadError } = await supabase.rpc("list_my_b2b_trade_requests");
    if (loadError) setError(getB2BErrorMessage(loadError, "Satın alma görüşmeleri yüklenemedi."));
    setRequests((data ?? []) as BuyerRequest[]);

    // Own RFQ listings: the table read is RLS-scoped to the buyer, board rpc adds offer counts.
    const { data: ownRfqs } = await supabase.from("b2b_rfps").select("id, title, category, quantity, unit, status, valid_until, created_at").order("created_at", { ascending: false });
    if (ownRfqs) {
      const { data: boardRows } = await supabase.rpc("list_open_b2b_rfps");
      const countMap = new Map(((boardRows ?? []) as { id: string; offer_count: number }[]).map((row) => [row.id, Number(row.offer_count)]));
      setRfqs((ownRfqs as OwnRfq[]).map((row) => ({ ...row, offer_count: countMap.get(row.id) ?? 0 })));
    }
    setLoading(false);
  };

  useEffect(() => {
    // The current user's private requests are loaded after the browser session is ready.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const rateWholesaler = async (request: BuyerRequest, rating: number) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setBusy(request.id);
    const { error: reviewError } = await supabase.from("b2b_reviews").insert({
      trade_request_id: request.id,
      reviewer_id: userData.user.id,
      target_user_id: request.wholesaler_owner_id,
      rating,
    });
    setBusy("");
    if (reviewError) return setError(getB2BErrorMessage(reviewError));
    setMessage("Toptancı değerlendirmeniz kaydedildi.");
    await load();
  };

  const respond = async (request: BuyerRequest, status: "accepted" | "cancelled") => {
    setBusy(request.id);
    const { error: responseError } = await supabase.rpc("respond_to_b2b_quote", { p_request_id: request.id, p_status: status });
    setBusy("");
    if (responseError) return setError(getB2BErrorMessage(responseError));
    setMessage(status === "accepted" ? "Teklif kabul edildi. Görüşmeden teslimat ve ödeme detaylarını netleştirebilirsiniz." : "Görüşme kapatıldı.");
    await load();
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Talepleriniz hazırlanıyor…</div>;

  return <main className="mx-auto max-w-5xl px-4 py-9">
    <div className="mb-7"><span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Ticaret merkezi</span><h1 className="mt-2 text-3xl font-black text-slate-950">Satın alma görüşmelerim</h1><p className="mt-2 text-sm font-medium text-slate-500">Satıcı yanıtını, özel birim fiyatı ve görüşmenin bir sonraki adımını buradan yönetin.</p></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-950">Satın alma ilanların (RFQ)</h2><p className="mt-1 text-xs font-medium text-slate-500">Yayınladığın ilanlara gelen teklifleri incele ve en uygunu seç.</p></div><Link href="/b2b/rfq/olustur" className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800">Yeni ilan aç</Link></div>
      {rfqs.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-xs font-bold text-slate-500">Henüz satın alma ilanın yok. İlan aç, doğrulanmış toptancılar sana teklif versin.</p> : <div className="mt-4 space-y-2.5">{rfqs.map((rfq) => <Link key={rfq.id} href={`/b2b/rfq/${rfq.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-300 hover:bg-slate-50"><div className="min-w-0"><strong className="block truncate text-sm font-black text-slate-900">{rfq.title}</strong><span className="mt-0.5 block text-[10px] font-bold text-slate-500">{rfq.category} · {rfq.quantity} {rfq.unit} · Son teklif: {new Date(rfq.valid_until).toLocaleDateString("tr-TR")}</span></div><div className="flex items-center gap-2"><span className="rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-900 ring-1 ring-slate-200">{rfq.offer_count} teklif</span><span className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black ${rfq.status === "open" ? "bg-emerald-50 text-emerald-700" : rfq.status === "awarded" ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-500"}`}>{B2B_RFQ_STATUS_LABELS[rfq.status] ?? rfq.status}</span></div></Link>)}</div>}
    </section>
    {requests.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-lg font-black text-slate-800">Henüz satın alma görüşmeniz yok</h2><p className="mt-2 text-sm text-slate-500">Ürün sayfasından miktarı ve notunuzu yazarak satıcıyla görüşme başlatın.</p><Link href="/b2b" className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">Ürünlere git</Link></div> : <div className="space-y-4">{requests.map((request)=><article key={request.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{request.wholesaler_name}</span><h2 className="mt-1 text-lg font-black text-slate-950">{request.product_name}</h2><p className="mt-2 text-xs font-semibold text-slate-500">{request.quantity} {request.unit} · {new Date(request.created_at).toLocaleDateString("tr-TR")}</p></div><span className={`w-fit rounded-lg px-3 py-2 text-xs font-black ${request.status === "quoted" ? "bg-slate-100 text-slate-800" : request.status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{B2B_STATUS_LABELS[request.status] ?? request.status}</span></div><B2BTradeTimeline status={request.status} />
      {request.quoted_unit_price !== null && <div className="mt-5 grid gap-3 rounded-2xl bg-[#07111F] p-5 text-white sm:grid-cols-[1fr_auto] sm:items-end"><div><span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Toptancının özel teklifi</span><strong className="mt-2 block text-2xl font-black">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: request.quoted_currency || "TRY" }).format(request.quoted_unit_price)} <small className="text-xs text-slate-400">/ {request.unit}</small></strong>{request.quote_note && <p className="mt-3 text-xs font-medium leading-5 text-slate-300">{request.quote_note}</p>}</div>{request.quote_valid_until && <span className="text-[10px] font-bold text-slate-400">Geçerlilik: {new Date(request.quote_valid_until).toLocaleDateString("tr-TR")}</span>}</div>}
      <div className="mt-5 flex flex-wrap gap-2">{request.conversation_id && <Link href={`/b2b/mesajlar?conversation=${request.conversation_id}`} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800">Mesajları aç</Link>}{request.status === "quoted" && <><button disabled={busy === request.id} onClick={() => respond(request, "accepted")} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-black text-white transition hover:bg-emerald-800">Teklifi kabul et</button><button disabled={busy === request.id} onClick={() => respond(request, "cancelled")} className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-700">Reddet</button></>}{request.status === "completed" && (request.review_submitted ? <p className="self-center text-xs font-bold text-emerald-700">Değerlendirmeniz alındı</p> : <div className="flex items-center gap-2"><span className="text-xs font-black text-slate-600">Toptancıyı puanla:</span>{[1,2,3,4,5].map((rating)=><button key={rating} disabled={busy===request.id} onClick={()=>rateWholesaler(request,rating)} aria-label={`${rating} yıldız ver`} className="text-slate-500 transition hover:text-slate-900 disabled:opacity-50"><svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5"><path d="M10 2.6l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2L2.5 8.1l5.2-.8z" strokeLinejoin="round" /></svg></button>)}</div>)}</div></div></article>)}</div>}
  </main>;
}
