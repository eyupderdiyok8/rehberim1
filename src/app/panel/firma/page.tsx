"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Firm {
  id: string;
  name: string;
  slug: string;
  city_id?: string;
  district_id?: string;
  is_premium: boolean;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
}

interface StatDay {
  date: string;
  page_views: number;
  contact_clicks: number;
}

export default function FirmDashboard() {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [statDays, setStatDays] = useState<StatDay[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [todayClicks, setTodayClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirmData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: firmData, error: firmErr } = await supabase
          .from("firms")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (firmErr) throw firmErr;
        if (!firmData) return;

        setFirm(firmData);

        // Fetch last 30 days of stats for this firm
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: statsData } = await supabase
          .from("firm_stats")
          .select("date, page_views, contact_clicks")
          .eq("firm_id", firmData.id)
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("date", { ascending: true });

        const rows = statsData || [];
        const today = new Date().toISOString().split("T")[0];

        let tv = 0, tc = 0, tday_v = 0, tday_c = 0;
        rows.forEach((r) => {
          tv += r.page_views || 0;
          tc += r.contact_clicks || 0;
          if (r.date === today) {
            tday_v = r.page_views || 0;
            tday_c = r.contact_clicks || 0;
          }
        });
        setTotalViews(tv);
        setTotalClicks(tc);
        setTodayViews(tday_v);
        setTodayClicks(tday_c);

        // Build last 14 days
        const last14: StatDay[] = [];
        const statsMap: Record<string, StatDay> = {};
        rows.forEach((r) => { statsMap[r.date] = r; });
        for (let i = 13; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          last14.push({ date: key, page_views: statsMap[key]?.page_views || 0, contact_clicks: statsMap[key]?.contact_clicks || 0 });
        }
        setStatDays(last14);

        // Fetch recent 3 reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*")
          .eq("firm_id", firmData.id)
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(3);

        setRecentReviews(reviewsData || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFirmData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#0F172A]/50">Firma verileri yüklenemedi.</p>
      </div>
    );
  }

  const maxViews = Math.max(...statDays.map((d) => d.page_views), 1);
  const maxClicks = Math.max(...statDays.map((d) => d.contact_clicks), 1);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Approval Warning */}
      {!firm.is_active && (
        <div className="relative overflow-hidden bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-md shadow-amber-100">
          <span className="mt-0.5 flex h-4 w-4 shrink-0">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-amber-800 tracking-tight">⏳ Firmanız Moderatör Onayı Bekliyor</p>
            <p className="mt-1 text-xs text-amber-700 leading-relaxed">
              Profiliniz henüz ana sayfada görünmüyor. Yöneticilerimiz en kısa sürede inceleyecektir.
            </p>
          </div>
        </div>
      )}

      {/* Missing Profile Warning */}
      {(!firm.city_id || !firm.district_id) && (
        <div className="relative overflow-hidden bg-sky-50 border-2 border-sky-300 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-md shadow-sky-100 mt-4">
          <span className="mt-0.5 flex h-4 w-4 shrink-0">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-sky-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-sky-800 tracking-tight">📌 Profiliniz Eksik</p>
            <p className="mt-1 text-xs text-sky-700 leading-relaxed">
              Rehberde listelenebilmeniz ve sistemin tam özelliklerini kullanabilmeniz için profilinizi tamamlamanız gerekmektedir.
            </p>
          </div>
          <div className="shrink-0">
            <a href="/panel/onboarding" className="inline-flex items-center justify-center px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-500/20">
              Profili Tamamla
            </a>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Genel Bakış</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
          {firm.name} · Performans Özeti
        </p>
      </div>

      {/* Top KPI Cards — Rating visible to all, analytics gated */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Rating — always visible */}
        <div className="bg-white border border-amber-400/20 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Ortalama Puan</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[#0F172A] tracking-tight">{Number(firm.rating).toFixed(1)}</span>
            <span className="text-amber-400 text-xl">★</span>
          </div>
        </div>
        {/* Total Reviews — always visible */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Toplam Yorum</p>
          <p className="text-3xl font-black text-[#0F172A] tracking-tight">{firm.review_count}</p>
        </div>
        {/* Today Views — premium only */}
        <div className="relative bg-white border border-[#0EA5E9]/20 rounded-xl p-5 shadow-sm overflow-hidden">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Bugün · Görüntülenme</p>
          {firm.is_premium ? (
            <p className="text-3xl font-black text-[#0EA5E9] tracking-tight">{todayViews.toLocaleString("tr-TR")}</p>
          ) : (
            <>
              <p className="text-3xl font-black text-[#0EA5E9] tracking-tight blur-sm select-none">24</p>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <span className="text-lg">🔒</span>
              </div>
            </>
          )}
        </div>
        {/* CTR — premium only */}
        <div className="relative bg-white border border-violet-500/20 rounded-xl p-5 shadow-sm overflow-hidden">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">İletişim Oranı (30g)</p>
          {firm.is_premium ? (
            <p className="text-3xl font-black text-violet-500 tracking-tight">%{ctr}</p>
          ) : (
            <>
              <p className="text-3xl font-black text-violet-500 tracking-tight blur-sm select-none">%4.2</p>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <span className="text-lg">🔒</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row — Premium Gated */}
      <div className="relative">
        {!firm.is_premium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm border border-amber-200 shadow-lg">
            <div className="text-center px-6 py-8 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight mb-2">İstatistikler Premium'a Özel</h3>
              <p className="text-xs text-[#0F172A]/60 leading-relaxed mb-5">
                Profilinizin kaç kez görüntülendiğini, kaç müşterinin size ulaştığını ve dönüşüm oranınızı görmek için Premium üyeliğe geçin.
              </p>
              <a
                href="/panel/firma/premium"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-amber-500/20"
              >
                ⭐ Premium'a Geç
              </a>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pointer-events-none" style={firm.is_premium ? { pointerEvents: 'auto' } : { filter: 'blur(3px)', userSelect: 'none' }}>
        {/* Views Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A]">Profil Görüntülenmeleri</h2>
              <p className="text-[10px] text-[#0F172A]/40 font-semibold uppercase tracking-wider mt-0.5">Son 14 Gün</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#0EA5E9]">{totalViews.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-[#0F172A]/40 font-semibold">30 günde toplam</p>
            </div>
          </div>
          <div className="flex items-end gap-[4px]" style={{ height: "80px" }}>
            {statDays.map((d, i) => {
              const h = Math.max(3, (d.page_views / maxViews) * 80);
              const isToday = d.date === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm group relative cursor-default transition-opacity duration-200 hover:opacity-100"
                  style={{ height: `${h}px`, background: isToday ? "#0EA5E9" : "#BAE6FD", opacity: isToday ? 1 : 0.7 }}
                  title={`${d.date}: ${d.page_views} görüntülenme`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex whitespace-nowrap bg-[#0F172A] text-white text-[9px] font-bold px-2 py-1 rounded pointer-events-none z-10">
                    {d.page_views}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-[#0F172A]/30 font-semibold">
              {new Date(statDays[0]?.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </span>
            <span className="text-[9px] text-[#0EA5E9] font-bold">Bugün</span>
          </div>
        </div>

        {/* Clicks Chart */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A]">İletişim Tıklamaları</h2>
              <p className="text-[10px] text-[#0F172A]/40 font-semibold uppercase tracking-wider mt-0.5">Son 14 Gün · WhatsApp + Telefon</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-emerald-500">{totalClicks.toLocaleString("tr-TR")}</p>
              <p className="text-[10px] text-[#0F172A]/40 font-semibold">30 günde toplam</p>
            </div>
          </div>
          <div className="flex items-end gap-[4px]" style={{ height: "80px" }}>
            {statDays.map((d, i) => {
              const h = Math.max(3, (d.contact_clicks / maxClicks) * 80);
              const isToday = d.date === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm group relative cursor-default transition-opacity duration-200 hover:opacity-100"
                  style={{ height: `${h}px`, background: isToday ? "#10B981" : "#A7F3D0", opacity: isToday ? 1 : 0.7 }}
                  title={`${d.date}: ${d.contact_clicks} tıklanma`}
                >
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex whitespace-nowrap bg-[#0F172A] text-white text-[9px] font-bold px-2 py-1 rounded pointer-events-none z-10">
                    {d.contact_clicks}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-[#0F172A]/30 font-semibold">
              {new Date(statDays[0]?.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            </span>
            <span className="text-[9px] text-emerald-500 font-bold">Bugün</span>
          </div>
        </div>
        </div>
      </div>

      {/* Premium / Upsell */}
      {!firm.is_premium ? (
        <div className="bg-gradient-to-r from-sky-400/5 via-sky-500/10 to-amber-500/10 border border-sky-200/50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              ⭐ Premium Fırsat
            </span>
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Profilinizi Premium Modeline Yükseltin!</h2>
            <p className="text-xs text-[#0F172A]/65 leading-relaxed max-w-xl">
              Öncelikli listeleme sayesinde kategorilerde en üstte yer alın. Rakip reklamları gizleyin, yorumlara yanıt verin ve WhatsApp/Telefon butonları ile etkileşimi artırın.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <a
              href="/panel/firma/premium"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/10"
            >
              Bilgi Al &amp; Başvur
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-[#0EA5E9]/5 border border-[#0EA5E9]/15 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#0F172A]">Premium Paket Aktif ✓</h3>
            <p className="text-xs text-[#0F172A]/65 leading-relaxed mt-0.5">
              Tüm Premium özellikler hesabınızda aktiftir: Öncelikli Sıralama, Reklamsız Profil, Yorum Yanıtlama ve Vurgulanmış İletişim Butonları.
            </p>
          </div>
        </div>
      )}

      {/* Profil Hızlı Erişim */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Toplam Yorum</p>
            <p className="text-3xl font-black text-[#0F172A] tracking-tight">{firm.review_count}</p>
          </div>
          <a href="/panel/firma/reviews" className="text-xs font-bold text-[#0EA5E9] hover:underline whitespace-nowrap">Yorumlar →</a>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Profil Durumu</p>
            <p className={`text-sm font-black tracking-tight ${firm.is_active ? "text-emerald-500" : "text-amber-500"}`}>
              {firm.is_active ? "✓ Yayında" : "⏳ Onay Bekleniyor"}
            </p>
          </div>
          <a href="/panel/firma/profile" className="text-xs font-bold text-[#0EA5E9] hover:underline whitespace-nowrap">Düzenle →</a>
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Üyelik</p>
            <p className={`text-sm font-black tracking-tight ${firm.is_premium ? "text-amber-500" : "text-[#0F172A]/50"}`}>
              {firm.is_premium ? "⭐ Premium" : "Standart"}
            </p>
          </div>
          <a href={`/firma/${firm.slug}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-[#0EA5E9] hover:underline whitespace-nowrap">
            Profili Gör →
          </a>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight uppercase">Son Müşteri Yorumları</h2>
          <a href="/panel/firma/reviews" className="text-xs font-bold text-[#0EA5E9] hover:underline">Tümünü Gör →</a>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {recentReviews.length > 0 ? (
            recentReviews.map((review) => (
              <div key={review.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[#0F172A]">{review.author_name}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className={`text-xs ${idx < review.rating ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}`}>★</span>
                    ))}
                  </div>
                </div>
                {review.body && (
                  <p className="text-xs text-[#0F172A]/70 leading-relaxed font-medium italic">&quot;{review.body}&quot;</p>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[10px] text-[#0F172A]/35">
                    {new Date(review.created_at).toLocaleDateString("tr-TR")}
                  </span>
                  {review.reply_body ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">Cevaplandı</span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">Cevap Bekliyor</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#0F172A]/40 font-medium">
              Henüz onaylanmış müşteri yorumunuz bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
