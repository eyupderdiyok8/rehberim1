"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

const statusLabels: Record<string, string> = {
  requested: "Satıcı yanıtı bekleniyor",
  quoted: "Yanıtınızı bekliyor",
  accepted: "Sipariş görüşmesi sürüyor",
  completed: "Ticaret tamamlandı",
  cancelled: "İptal edildi",
  disputed: "İnceleniyor",
};

export default function B2BMyRequests() {
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data, error: loadError } = await supabase.rpc("list_my_b2b_trade_requests");
    if (loadError) setError(loadError.message);
    setRequests((data ?? []) as BuyerRequest[]);
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
    if (reviewError) return setError(reviewError.message);
    setMessage("Toptancı değerlendirmeniz kaydedildi.");
    await load();
  };

  const respond = async (request: BuyerRequest, status: "accepted" | "cancelled") => {
    setBusy(request.id);
    const { error: responseError } = await supabase.rpc("respond_to_b2b_quote", { p_request_id: request.id, p_status: status });
    setBusy("");
    if (responseError) return setError(responseError.message);
    setMessage(status === "accepted" ? "Teklif kabul edildi. Görüşmeden teslimat ve ödeme detaylarını netleştirebilirsiniz." : "Görüşme kapatıldı.");
    await load();
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">Talepleriniz hazırlanıyor…</div>;

  return <main className="mx-auto max-w-5xl px-4 py-9">
    <div className="mb-7"><span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Ticaret merkezi</span><h1 className="mt-2 text-3xl font-black text-slate-950">Satın alma görüşmelerim</h1><p className="mt-2 text-sm font-medium text-slate-500">Satıcı yanıtını, özel birim fiyatı ve görüşmenin bir sonraki adımını buradan yönetin.</p></div>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {message && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
    {requests.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="text-lg font-black text-slate-800">Henüz satın alma görüşmeniz yok</h2><p className="mt-2 text-sm text-slate-500">Ürün sayfasından miktarı ve notunuzu yazarak satıcıyla görüşme başlatın.</p><Link href="/b2b" className="mt-5 inline-block rounded-lg bg-sky-600 px-5 py-3 text-sm font-black text-white">Ürünlere git</Link></div> : <div className="space-y-4">{requests.map((request)=><article key={request.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="text-[10px] font-black uppercase tracking-wider text-sky-600">{request.wholesaler_name}</span><h2 className="mt-1 text-lg font-black text-slate-950">{request.product_name}</h2><p className="mt-2 text-xs font-semibold text-slate-500">{request.quantity} {request.unit} · {new Date(request.created_at).toLocaleDateString("tr-TR")}</p></div><span className={`w-fit rounded-lg px-3 py-2 text-xs font-black ${request.status === "quoted" ? "bg-sky-50 text-sky-700" : request.status === "accepted" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{statusLabels[request.status] ?? request.status}</span></div>
      {request.quoted_unit_price !== null && <div className="mt-5 grid gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:grid-cols-[1fr_auto] sm:items-end"><div><span className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-300">Toptancının özel teklifi</span><strong className="mt-2 block text-2xl font-black">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: request.quoted_currency || "TRY" }).format(request.quoted_unit_price)} <small className="text-xs text-slate-400">/ {request.unit}</small></strong>{request.quote_note && <p className="mt-3 text-xs font-medium leading-5 text-slate-300">{request.quote_note}</p>}</div>{request.quote_valid_until && <span className="text-[10px] font-bold text-slate-400">Geçerlilik: {new Date(request.quote_valid_until).toLocaleDateString("tr-TR")}</span>}</div>}
      <div className="mt-5 flex flex-wrap gap-2">{request.conversation_id && <Link href={`/b2b/mesajlar?conversation=${request.conversation_id}`} className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white">Mesajları aç</Link>}{request.status === "quoted" && <><button disabled={busy === request.id} onClick={() => respond(request, "accepted")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white">Teklifi kabul et</button><button disabled={busy === request.id} onClick={() => respond(request, "cancelled")} className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-700">Reddet</button></>}{request.status === "completed" && (request.review_submitted ? <p className="self-center text-xs font-bold text-emerald-700">✓ Değerlendirmeniz alındı</p> : <div className="flex items-center gap-2"><span className="text-xs font-black text-slate-600">Toptancıyı puanla:</span>{[1,2,3,4,5].map((rating)=><button key={rating} disabled={busy===request.id} onClick={()=>rateWholesaler(request,rating)} aria-label={`${rating} yıldız ver`} className="text-2xl text-amber-400 transition hover:scale-125 disabled:opacity-50">★</button>)}</div>)}</div></div></article>)}</div>}
  </main>;
}
