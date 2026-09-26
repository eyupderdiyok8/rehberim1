"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { B2BRfq, B2BRfqOffer } from "@/types/b2b";
import { B2B_RFQ_OFFER_STATUS_LABELS, B2B_RFQ_STATUS_LABELS, getB2BErrorMessage } from "@/lib/b2b-ui";

type RfqDetail = {
  rfq: B2BRfq & { awarded_offer_id: string | null };
  buyer_business_name: string;
  is_mine: boolean;
  offers: B2BRfqOffer[];
  wholesalers: Record<string, NonNullable<B2BRfqOffer["wholesaler"]>>;
};

function formatPrice(price: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
}

const offerTones: Record<string, string> = {
  submitted: "bg-sky-50 text-sky-700",
  accepted: "bg-emerald-50 text-emerald-700",
  declined: "bg-slate-100 text-slate-500",
  withdrawn: "bg-slate-100 text-slate-400 line-through",
};

export default function B2BRfqDetail({ rfqId }: { rfqId: string }) {
  const [detail, setDetail] = useState<RfqDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canBid, setCanBid] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerCurrency, setOfferCurrency] = useState<"TRY" | "USD" | "EUR">("TRY");
  const [offerLeadTime, setOfferLeadTime] = useState("3");
  const [offerNote, setOfferNote] = useState("");

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.rpc("get_b2b_rfq_detail", { p_rfq_id: rfqId });
    if (loadError) setError(getB2BErrorMessage(loadError, "İlan yüklenemedi."));
    if (!data) setNotFound(true);
    else setDetail(data as RfqDetail);
    setLoading(false);
  }, [rfqId]);

  useEffect(() => {
    // Detail access depends on the signed-in role, so it loads in the browser session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refreshBidEligibility = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    setCurrentUserId(userData.user.id);
    const { data: store } = await supabase.from("b2b_wholesalers").select("id").eq("owner_id", userData.user.id).eq("is_active", true).maybeSingle();
    setCanBid(Boolean(store));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshBidEligibility();
  }, [refreshBidEligibility]);

  const submitOffer = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !detail) return;
    setBusy("offer");
    setError("");
    const { error: offerError } = await supabase.rpc("submit_b2b_rfq_offer", {
      p_rfq_id: detail.rfq.id,
      p_unit_price: Number(offerPrice),
      p_currency: offerCurrency,
      p_lead_time_days: Number(offerLeadTime),
      p_note: offerNote.trim() || null,
    });
    setBusy("");
    if (offerError) { setError(getB2BErrorMessage(offerError, "Teklif gönderilemedi.")); return; }
    setMessage("Teklifin esnafa iletildi. Seçilirsen bildiriminle haberdar olursun.");
    setShowOfferForm(false);
    setOfferPrice(""); setOfferNote("");
    await load();
  };

  const withdrawOffer = async (offerId: string) => {
    setBusy(offerId);
    const { error: withdrawError } = await supabase.rpc("withdraw_b2b_rfq_offer", { p_offer_id: offerId });
    setBusy("");
    if (withdrawError) { setError(getB2BErrorMessage(withdrawError)); return; }
    setMessage("Teklifin geri çekildi.");
    await load();
  };

  const acceptOffer = async (offerId: string) => {
    setBusy(offerId);
    const { error: acceptError } = await supabase.rpc("accept_b2b_rfq_offer", { p_offer_id: offerId });
    setBusy("");
    if (acceptError) { setError(getB2BErrorMessage(acceptError)); return; }
    setMessage("Teklif kabul edildi. Toptancı bilgilendirildi; sipariş detaylarını mesajlardan yürütebilirsin.");
    await load();
  };

  const cancelRfq = async () => {
    setBusy("cancel");
    const { error: cancelError } = await supabase.rpc("cancel_b2b_rfq", { p_rfq_id: rfqId });
    setBusy("");
    if (cancelError) { setError(getB2BErrorMessage(cancelError)); return; }
    setMessage("İlanın kapatıldı.");
    await load();
  };

  if (loading) return <div className="py-24 text-center text-sm font-bold text-slate-500">İlan hazırlanıyor…</div>;
  if (notFound || !detail) return <main className="mx-auto max-w-3xl px-4 py-20 text-center">
    <h1 className="text-2xl font-black text-slate-950">Bu ilan görüntülenemiyor</h1>
    <p className="mt-2 text-sm font-medium text-slate-500">İlan kaldırılmış, süresi dolmuş ya da erişim yetkin yok olabilir.</p>
    <Link href="/b2b/rfq" className="mt-6 inline-block rounded-lg bg-sky-600 px-5 py-3 text-sm font-black text-white">RFQ tahtasına dön</Link>
  </main>;

  const { rfq, offers, wholesalers, is_mine } = detail;
  const isOpen = rfq.status === "open";
  const myOffer = is_mine || !currentUserId ? null : offers.find((offer) => wholesalers[offer.id]?.owner_id === currentUserId) ?? null;
  const visibleOffers = offers.filter((offer) => offer.status !== "withdrawn" || is_mine);
  const statusTone = rfq.status === "open" ? "bg-emerald-50 text-emerald-700" : rfq.status === "awarded" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600";

  return <main className="mx-auto max-w-5xl px-4 py-9">
    <Link href="/b2b/rfq" className="text-xs font-black text-slate-500 transition hover:text-slate-800">← RFQ tahtası</Link>
    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {message && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}

    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-[#07111F] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2.5"><span className="rounded-lg bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-300">{rfq.category}</span><span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${statusTone}`}>{B2B_RFQ_STATUS_LABELS[rfq.status] ?? rfq.status}</span>{isOpen && <span className="ml-auto text-[10px] font-bold text-slate-400">Son teklif: {new Date(rfq.valid_until).toLocaleDateString("tr-TR")}</span>}</div>
        <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl">{rfq.title}</h1>
        <p className="mt-2 text-xs font-bold text-slate-400">◈ {detail.buyer_business_name}{rfq.city ? ` · ${rfq.city}` : ""} · {new Date(rfq.created_at).toLocaleDateString("tr-TR")} tarihinde yayımlandı</p>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
        <div className="rounded-xl bg-slate-50 p-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Alınacak miktar</span><strong className="mt-1.5 block text-xl font-black text-slate-950">{rfq.quantity} {rfq.unit}</strong></div>
        <div className="rounded-xl bg-slate-50 p-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Hedef birim fiyat</span><strong className="mt-1.5 block text-xl font-black text-emerald-700">{rfq.target_price !== null ? formatPrice(Number(rfq.target_price), rfq.currency) : "Belirtilmedi"}</strong></div>
        <div className="rounded-xl bg-slate-50 p-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Gelen teklifler</span><strong className="mt-1.5 block text-xl font-black text-sky-700">{visibleOffers.length}</strong></div>
      </div>
      {(rfq.product_details || rfq.delivery_note) && <div className="space-y-3 px-6 pb-6 sm:px-8 sm:pb-8">
        {rfq.product_details && <div className="rounded-xl border border-slate-100 p-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Ürün detayları</span><p className="mt-1.5 whitespace-pre-line text-sm font-medium leading-6 text-slate-700">{rfq.product_details}</p></div>}
        {rfq.delivery_note && <div className="rounded-xl border border-slate-100 p-4"><span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">Teslimat notu</span><p className="mt-1.5 text-sm font-medium leading-6 text-slate-700">{rfq.delivery_note}</p></div>}
      </div>}
    </section>

    {is_mine && <section className="mt-8">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-950">Gelen teklifler</h2><p className="mt-1 text-xs font-medium text-slate-500">Teklifi kabul ettiğinde ilan sonuçlanır ve diğer teklifler reddedilir.</p></div>{isOpen && <button disabled={busy === "cancel"} onClick={cancelRfq} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:opacity-50">İlanı kapat</button>}</div>
      {visibleOffers.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center text-sm font-bold text-slate-500">Henüz teklif yok. Doğrulanmış toptancılar ilanı tahtada görüyor.</div> :
        <div className="space-y-3">{visibleOffers.map((offer) => {
          const store = wholesalers[offer.id];
          const best = Number(offer.unit_price) === Math.min(...visibleOffers.map((item) => Number(item.unit_price)));
          return <article key={offer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 text-xs font-black text-slate-500">{store?.logo_url ? <img src={store.logo_url} alt="" className="size-full object-cover" /> : (store?.name ?? "T").slice(0, 2).toLocaleUpperCase("tr-TR")}</span>
                <div>{store ? <Link href={`/b2b/toptanci/${store.slug}`} className="text-sm font-black text-slate-950 hover:text-sky-700">{store.name}</Link> : <span className="text-sm font-black text-slate-950">Toptancı</span>}{store?.city && <span className="block text-[10px] font-bold text-slate-400">{store.city}{store.rating ? ` · ★ ${store.rating}` : ""}</span>}</div>
                {best && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">En iyi fiyat</span>}
              </div>
              <div className="text-right sm:pr-1">
                <strong className="text-xl font-black text-slate-950">{formatPrice(Number(offer.unit_price), offer.currency)} <span className="text-[10px] font-bold text-slate-400">/ {rfq.unit}</span></strong>
                <span className="mt-1 block text-[10px] font-bold text-slate-500">{offer.lead_time_days} günde tedarik · ~{formatPrice(Number(offer.unit_price) * Number(rfq.quantity), offer.currency)} toplam</span>
              </div>
            </div>
            {offer.note && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-5 text-slate-600">{offer.note}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${offerTones[offer.status] ?? "bg-slate-100 text-slate-500"}`}>{offer.status === "accepted" ? "✓ Kabul ettiğin teklif" : offer.status === "declined" ? "Reddedildi" : B2B_RFQ_STATUS_LABELS[rfq.status] ?? offer.status}</span>
              {isOpen && offer.status === "submitted" && <button disabled={busy === offer.id} onClick={() => acceptOffer(offer.id)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:opacity-50">Teklifi kabul et</button>}
            </div>
          </article>;
        })}</div>}
    </section>}

    {!is_mine && <section className="mt-8">
      {myOffer && myOffer.status !== "withdrawn" ? <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-6">
        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-600">Senin teklifin</span>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4"><strong className="text-2xl font-black text-slate-950">{formatPrice(Number(myOffer.unit_price), myOffer.currency)} <span className="text-xs font-bold text-slate-400">/ {rfq.unit}</span></strong><span className={`rounded-lg px-3 py-1.5 text-xs font-black ${offerTones[myOffer.status]}`}>{B2B_RFQ_OFFER_STATUS_LABELS[myOffer.status] ?? myOffer.status}</span></div>
        <p className="mt-2 text-xs font-bold text-slate-500">{myOffer.lead_time_days} günde tedarik{myOffer.note ? ` · ${myOffer.note}` : ""}</p>
        {myOffer.status === "submitted" && <button disabled={busy === myOffer.id} onClick={() => withdrawOffer(myOffer.id)} className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">Teklifi geri çek</button>}
      </div> : isOpen && canBid ? <>
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-950">Bu ilana teklif ver</h2><p className="mt-1 text-xs font-medium text-slate-500">Birim fiyatın ve koşulların yalnızca ilanı açan esnafa görünür.</p></div>{showOfferForm && <button onClick={() => setShowOfferForm(false)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-600">Formu kapat</button>}</div>
        {showOfferForm ? <form onSubmit={submitOffer} className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <label className="text-xs font-black text-slate-700">Birim fiyat * <span className="font-medium text-slate-400">({rfq.unit} başına)</span><div className="flex gap-2"><input required type="number" min={0.01} step="any" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-400" /><select value={offerCurrency} onChange={(e) => setOfferCurrency(e.target.value as typeof offerCurrency)} className="mt-1.5 w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-sky-400"><option>TRY</option><option>USD</option><option>EUR</option></select></div></label>
          <label className="text-xs font-black text-slate-700">Tedarik süresi (gün) *<input required type="number" min={0} max={365} value={offerLeadTime} onChange={(e) => setOfferLeadTime(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-400" /></label>
          <label className="text-xs font-black text-slate-700 sm:col-span-2">Koşulların<textarea maxLength={1000} rows={3} value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="Kdv, ödeme vadeli, karışık set, irsaliyeli teslim…" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-sky-400" /></label>
          <div className="sm:col-span-2"><button type="submit" disabled={busy === "offer"} className="rounded-xl bg-sky-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500 disabled:opacity-50">{busy === "offer" ? "Gönderiliyor…" : "Teklifi gönder"}</button></div>
        </form> : <button onClick={() => setShowOfferForm(true)} className="mt-4 rounded-xl bg-sky-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500">Teklif ver</button>}
      </> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
        <h2 className="text-base font-black text-slate-800">{isOpen ? "Teklif vermek için aktif toptancı hesabı gerekir" : "Bu ilan artık tekliflere açık değil"}</h2>
        {!isOpen && rfq.status === "awarded" && <p className="mt-2 text-sm text-slate-500">Esnaf teklifini seçti.</p>}
      </div>}
    </section>}
  </main>;
}
