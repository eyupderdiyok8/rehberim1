"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Stats {
  totalFirms: number;
  premiumFirms: number;
  pendingReviews: number;
  activeBanners: number;
  totalViews: number;
  totalClicks: number;
}

interface TopFirm {
  firm_id: string;
  firm_name: string;
  total_views: number;
  total_clicks: number;
}

interface DailyAggregate {
  date: string;
  views: number;
  clicks: number;
}

// Pure-CSS mini sparkline bar chart (no dependencies)
function SparkBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: color,
            opacity: i === data.length - 1 ? 1 : 0.45 + (i / data.length) * 0.55,
          }}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalFirms: 0,
    premiumFirms: 0,
    pendingReviews: 0,
    activeBanners: 0,
    totalViews: 0,
    totalClicks: 0,
  });
  const [recentFirms, setRecentFirms] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [topFirms, setTopFirms] = useState<TopFirm[]>([]);
  const [daily, setDaily] = useState<DailyAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // --- Platform KPIs ---
        const [
          { count: totalFirms },
          { count: premiumFirms },
          { count: pendingReviews },
          { count: activeBanners },
        ] = await Promise.all([
          supabase.from("firms").select("*", { count: "exact", head: true }),
          supabase.from("firms").select("*", { count: "exact", head: true }).eq("is_premium", true),
          supabase.from("reviews").select("*", { count: "exact", head: true }).eq("is_approved", false),
          supabase.from("banners").select("*", { count: "exact", head: true }).eq("is_active", true),
        ]);

        // --- 30-day platform-wide totals ---
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: statsData } = await supabase
          .from("firm_stats")
          .select("date, page_views, contact_clicks")
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("date", { ascending: true });

        let totalViews = 0;
        let totalClicks = 0;
        const dailyMap: Record<string, { views: number; clicks: number }> = {};

        (statsData || []).forEach((row) => {
          totalViews += row.page_views || 0;
          totalClicks += row.contact_clicks || 0;
          if (!dailyMap[row.date]) dailyMap[row.date] = { views: 0, clicks: 0 };
          dailyMap[row.date].views += row.page_views || 0;
          dailyMap[row.date].clicks += row.contact_clicks || 0;
        });

        // Build last 7 days array
        const last7: DailyAggregate[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          last7.push({ date: key, views: dailyMap[key]?.views || 0, clicks: dailyMap[key]?.clicks || 0 });
        }
        setDaily(last7);

        setStats({
          totalFirms: totalFirms || 0,
          premiumFirms: premiumFirms || 0,
          pendingReviews: pendingReviews || 0,
          activeBanners: activeBanners || 0,
          totalViews,
          totalClicks,
        });

        // --- Top 5 firms by views (30 days) ---
        const { data: topData } = await supabase
          .from("firm_stats")
          .select("firm_id, page_views, contact_clicks, firms(name)")
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

        const firmMap: Record<string, { name: string; views: number; clicks: number }> = {};
        (topData || []).forEach((row: any) => {
          if (!firmMap[row.firm_id]) {
            firmMap[row.firm_id] = { name: row.firms?.name || "—", views: 0, clicks: 0 };
          }
          firmMap[row.firm_id].views += row.page_views || 0;
          firmMap[row.firm_id].clicks += row.contact_clicks || 0;
        });

        const top5 = Object.entries(firmMap)
          .map(([id, v]) => ({ firm_id: id, firm_name: v.name, total_views: v.views, total_clicks: v.clicks }))
          .sort((a, b) => b.total_views - a.total_views)
          .slice(0, 5);
        setTopFirms(top5);

        // --- Recent firms & reviews ---
        const [{ data: recentFirmsData }, { data: recentReviewsData }] = await Promise.all([
          supabase
            .from("firms")
            .select("id, name, created_at, is_premium, is_active")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("reviews")
            .select("id, author_name, rating, body, is_approved, created_at, firm:firms(name)")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setRecentFirms(recentFirmsData || []);
        setRecentReviews(recentReviewsData || []);
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Toplam Firma",
      value: stats.totalFirms,
      color: "text-[#0EA5E9]",
      bg: "bg-[#0EA5E9]/8",
      border: "border-[#0EA5E9]/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: "Premium Üye",
      value: stats.premiumFirms,
      color: "text-amber-500",
      bg: "bg-amber-500/8",
      border: "border-amber-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: "Onay Bekleyen",
      value: stats.pendingReviews,
      color: "text-rose-500",
      bg: "bg-rose-500/8",
      border: "border-rose-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: "Aktif Reklam",
      value: stats.activeBanners,
      color: "text-emerald-500",
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/20",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const viewsData = daily.map((d) => d.views);
  const clicksData = daily.map((d) => d.clicks);
  const maxViews = Math.max(...viewsData, 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Kontrol Paneli</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Sistem Genel Durumu & Analitikler</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <div key={i} className={`bg-white border rounded-xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow ${card.border}`}>
            <div>
              <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">{card.title}</p>
              <p className={`text-3xl font-black tracking-tight ${card.color}`}>{card.value.toLocaleString("tr-TR")}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Views Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight">Haftalık Trafik</h2>
              <p className="text-[10px] text-[#0F172A]/40 font-semibold uppercase tracking-wider mt-0.5">Son 7 Gün · Tüm Firmalar</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0EA5E9]" />
                <span className="text-[10px] font-bold text-[#0F172A]/50">Görüntülenme</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-[10px] font-bold text-[#0F172A]/50">Tıklanma</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex items-end gap-2 h-28">
            {daily.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "88px" }}>
                  {/* Views bar */}
                  <div
                    className="w-full rounded-t-sm bg-[#0EA5E9]/80 transition-all duration-500"
                    style={{ height: `${Math.max(4, (d.views / maxViews) * 88)}px` }}
                    title={`${d.views} görüntülenme`}
                  />
                </div>
                <span className="text-[9px] text-[#0F172A]/35 font-semibold">
                  {new Date(d.date).toLocaleDateString("tr-TR", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-5 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">30 Gün · Toplam Görüntülenme</p>
              <p className="text-2xl font-black text-[#0EA5E9] tracking-tight mt-0.5">
                {stats.totalViews.toLocaleString("tr-TR")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">30 Gün · Toplam İletişim Tıkı</p>
              <p className="text-2xl font-black text-emerald-500 tracking-tight mt-0.5">
                {stats.totalClicks.toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </div>

        {/* Top Firms */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight uppercase">En Popüler Firmalar</h2>
            <p className="text-[10px] text-[#0F172A]/40 font-semibold tracking-wider mt-0.5">Son 30 Gün · Görüntülenmeye Göre</p>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {topFirms.length > 0 ? (
              topFirms.map((f, i) => {
                const pct = topFirms[0].total_views > 0 ? (f.total_views / topFirms[0].total_views) * 100 : 0;
                return (
                  <div key={f.firm_id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-black w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                          i === 0 ? "bg-amber-100 text-amber-600" : "bg-[#F1F5F9] text-[#0F172A]/40"
                        }`}>{i + 1}</span>
                        <p className="text-xs font-bold text-[#0F172A] truncate">{f.firm_name}</p>
                      </div>
                      <span className="text-xs font-black text-[#0EA5E9] shrink-0 ml-2">{f.total_views.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0EA5E9] rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#0F172A]/40 font-medium">
                Henüz istatistik verisi yok.
                <br />
                <span className="text-[10px] mt-1 block">Firma sayfalarını ziyaret ettikçe burada görünecek.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Firms */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight uppercase">Son Kayıt Olan Firmalar</h2>
            <a href="/panel/admin/firms" className="text-xs font-bold text-[#0EA5E9] hover:underline">Tümünü Gör →</a>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {recentFirms.length > 0 ? (
              recentFirms.map((firm) => (
                <div key={firm.id} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#0F172A] leading-snug">{firm.name}</p>
                    <p className="text-[10px] text-[#0F172A]/40 mt-0.5">
                      {new Date(firm.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {firm.is_premium && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">PREMIUM</span>
                    )}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                      firm.is_active ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-red-600 bg-red-50 border-red-200"
                    }`}>
                      {firm.is_active ? "AKTİF" : "PASİF"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#0F172A]/40 font-medium">Kayıtlı firma bulunamadı.</div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight uppercase">Son Değerlendirmeler</h2>
            <a href="/panel/admin/reviews" className="text-xs font-bold text-[#0EA5E9] hover:underline">Tümünü Gör →</a>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review.id} className="p-4 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#0F172A]">{review.author_name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className={`text-xs ${idx < review.rating ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#0F172A]/70 italic truncate">
                    &quot;{review.body || "Yorum yazılmadı."}&quot;
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-[#0F172A]/40 pt-1">
                    <span>Firma: <strong className="font-semibold">{(review.firm as any)?.name || "Bilinmiyor"}</strong></span>
                    {review.is_approved ? (
                      <span className="text-emerald-600 font-bold">ONAYLI</span>
                    ) : (
                      <span className="text-rose-600 font-bold">ONAY BEKLİYOR</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#0F172A]/40 font-medium">Değerlendirme bulunamadı.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
