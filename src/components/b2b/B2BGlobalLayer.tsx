"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Ad = {
  id: string;
  ad_type: "notification" | "popup";
  title: string;
  body: string;
  image_url: string | null;
  cta_label: string;
  target_url: string;
};

export default function B2BGlobalLayer() {
  const [notification, setNotification] = useState<Ad | null>(null);
  const [popup, setPopup] = useState<Ad | null>(null);

  useEffect(() => {
    const touch = () => supabase.rpc("touch_b2b_presence");
    touch();
    const presenceTimer = window.setInterval(touch, 60_000);

    const loadAds = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase.from("b2b_ads").select("id, ad_type, title, body, image_url, cta_label, target_url").in("status", ["approved", "active"]).lte("starts_at", now).gte("ends_at", now).limit(8);
      const rows = (data ?? []) as Ad[];
      const notificationAd = rows.find((ad) => ad.ad_type === "notification") ?? null;
      const popupAd = rows.find((ad) => ad.ad_type === "popup") ?? null;
      if (notificationAd) {
        setNotification(notificationAd);
        supabase.rpc("track_b2b_ad", { p_ad_id: notificationAd.id, p_event: "impression" });
      }
      if (popupAd && !window.sessionStorage.getItem(`b2b-ad-${popupAd.id}`)) {
        window.sessionStorage.setItem(`b2b-ad-${popupAd.id}`, "shown");
        setPopup(popupAd);
        supabase.rpc("track_b2b_ad", { p_ad_id: popupAd.id, p_event: "impression" });
      }
    };
    loadAds();
    return () => window.clearInterval(presenceTimer);
  }, []);

  const clickAd = (ad: Ad) => supabase.rpc("track_b2b_ad", { p_ad_id: ad.id, p_event: "click" });

  return <>
    {notification && <aside className="fixed bottom-4 right-4 z-[70] w-[calc(100%-2rem)] max-w-sm overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-2xl shadow-slate-950/20">
      <div className="flex gap-3 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-lg">✦</span><div className="min-w-0 flex-1"><span className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-600">Sponsorlu bildirim</span><strong className="mt-1 block text-sm font-black text-slate-950">{notification.title}</strong><p className="mt-1 text-xs font-medium leading-5 text-slate-500">{notification.body}</p><Link href={notification.target_url} onClick={() => clickAd(notification)} className="mt-3 inline-flex text-xs font-black text-sky-700">{notification.cta_label} →</Link></div><button onClick={() => setNotification(null)} aria-label="Reklamı kapat" className="size-7 shrink-0 rounded-full bg-slate-100 text-sm text-slate-500">×</button></div>
    </aside>}

    {popup && <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" onMouseDown={() => setPopup(null)}>
      <aside onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111f] text-white shadow-2xl">
        {popup.image_url && <div className="h-48 overflow-hidden"><img src={popup.image_url} alt="" className="h-full w-full object-cover" /></div>}
        <div className="relative p-7"><button onClick={() => setPopup(null)} aria-label="Reklamı kapat" className="absolute right-5 top-5 grid size-8 place-items-center rounded-full bg-white/10 text-lg">×</button><span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-300">Sponsorlu fırsat</span><h2 className="mt-3 pr-10 text-2xl font-black tracking-tight">{popup.title}</h2><p className="mt-3 text-sm font-medium leading-6 text-slate-300">{popup.body}</p><Link href={popup.target_url} onClick={() => clickAd(popup)} className="mt-6 inline-flex rounded-xl bg-sky-400 px-5 py-3 text-xs font-black text-slate-950">{popup.cta_label} →</Link></div>
      </aside>
    </div>}
  </>;
}
