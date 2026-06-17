"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface FirmStat {
  firm_id: string;
  firm_name: string;
  firm_slug: string;
  is_premium: boolean;
  is_active: boolean;
  is_verified: boolean;
  views: number;
  clicks: number;
  ctr: number;
  review_count: number;
  rating: number;
}

type SortKey = "views" | "clicks" | "ctr" | "name";

const RANGE_OPTIONS = [
  { label: "7 Gün", days: 7 },
  { label: "30 Gün", days: 30 },
  { label: "90 Gün", days: 90 },
];

export default function AdminStats() {
  const [rows, setRows] = useState<FirmStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [days, setDays] = useState(30);

  // Totals
  const [totalViews, setTotalViews] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const since = new Date();
        since.setDate(since.getDate() - days);
        const sinceStr = since.toISOString().split("T")[0];

        const { data: statsData } = await supabase
          .from("firm_stats")
          .select("firm_id, page_views, contact_clicks")
          .gte("date", sinceStr);

        // Aggregate per firm
        const firmMap: Record<string, { views: number; clicks: number }> = {};
        (statsData || []).forEach((row: any) => {
          if (!firmMap[row.firm_id]) firmMap[row.firm_id] = { views: 0, clicks: 0 };
          firmMap[row.firm_id].views += row.page_views || 0;
          firmMap[row.firm_id].clicks += row.contact_clicks || 0;
        });

        // Fetch all firms
        const { data: firmsData } = await supabase
          .from("firms")
          .select("id, name, slug, is_premium, is_active, is_verified, review_count, rating")
          .order("name");

        let tv = 0,
          tc = 0;
        const merged: FirmStat[] = (firmsData || []).map((f: any) => {
          const s = firmMap[f.id] || { views: 0, clicks: 0 };
          tv += s.views;
          tc += s.clicks;
          return {
            firm_id: f.id,
            firm_name: f.name,
            firm_slug: f.slug,
            is_premium: f.is_premium,
            is_active: f.is_active,
            is_verified: f.is_verified,
            views: s.views,
            clicks: s.clicks,
            ctr: s.views > 0 ? (s.clicks / s.views) * 100 : 0,
            review_count: f.review_count,
            rating: f.rating,
          };
        });

        setTotalViews(tv);
        setTotalClicks(tc);
        setRows(merged);
      } catch (err) {
        console.error("İstatistik yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [days]);

  // Filter + sort
  const filtered = rows.filter((r) =>
    r.firm_name.toLowerCase().includes(search.toLowerCase()) ||
    r.firm_slug.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let av: number, bv: number;
    if (sortKey === "name") {
      return sortAsc ? a.firm_name.localeCompare(b.firm_name) : b.firm_name.localeCompare(a.firm_name);
    } else if (sortKey === "ctr") {
      av = a.ctr; bv = b.ctr;
    } else if (sortKey === "clicks") {
      av = a.clicks; bv = b.clicks;
    } else {
      av = a.views; bv = b.views;
    }
    return sortAsc ? av - bv : bv - av;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className={`ml-1 text-[9px] ${sortKey === k ? "text-[#0EA5E9]" : "text-[#0F172A]/20"}`}>
      {sortKey === k ? (sortAsc ? "▲" : "▼") : "↕"}
    </span>
  );

  const globalCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
  const firmsWithClicks = rows.filter((r) => r.clicks > 0).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">İstatistikler</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
          Tüm Firmalar · Görüntülenme & İletişim Verileri
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Toplam Firma</p>
          <p className="text-2xl font-black text-[#0F172A] tracking-tight">{rows.length}</p>
        </div>
        <div className="bg-white border border-sky-500/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Toplam Görüntülenme</p>
          <p className="text-2xl font-black text-[#0EA5E9] tracking-tight">{totalViews.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white border border-emerald-500/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Toplam İletişim Tıkı</p>
          <p className="text-2xl font-black text-emerald-500 tracking-tight">{totalClicks.toLocaleString("tr-TR")}</p>
        </div>
        <div className="bg-white border border-violet-500/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Ortalama CTR</p>
          <p className="text-2xl font-black text-violet-500 tracking-tight">%{globalCtr}</p>
        </div>
        <div className="bg-white border border-amber-500/15 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Tıkı Alan Firma</p>
          <p className="text-2xl font-black text-amber-500 tracking-tight">{firmsWithClicks}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Firma adı veya slug ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Range Selector */}
        <div className="flex gap-1 bg-white border border-[#E2E8F0] rounded-lg p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setDays(opt.days)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                days === opt.days
                  ? "bg-[#0EA5E9] text-white"
                  : "text-[#0F172A]/60 hover:text-[#0F172A] hover:bg-[#F1F5F9]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th
                    className="px-5 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider cursor-pointer hover:text-[#0F172A]/70 select-none"
                    onClick={() => handleSort("name")}
                  >
                    Firma <SortIcon k="name" />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Durum</th>
                  <th
                    className="px-4 py-3 text-right text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider cursor-pointer hover:text-[#0F172A]/70 select-none"
                    onClick={() => handleSort("views")}
                  >
                    Görüntülenme <SortIcon k="views" />
                  </th>
                  <th
                    className="px-4 py-3 text-right text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider cursor-pointer hover:text-[#0F172A]/70 select-none"
                    onClick={() => handleSort("clicks")}
                  >
                    İletişim Tıkı <SortIcon k="clicks" />
                  </th>
                  <th
                    className="px-4 py-3 text-right text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider cursor-pointer hover:text-[#0F172A]/70 select-none"
                    onClick={() => handleSort("ctr")}
                  >
                    CTR <SortIcon k="ctr" />
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Puan</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Yorum</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {sorted.length > 0 ? (
                  sorted.map((f, i) => {
                    const maxViews = Math.max(...sorted.map((r) => r.views), 1);
                    const barPct = (f.views / maxViews) * 100;
                    return (
                      <tr key={f.firm_id} className="hover:bg-slate-50/50 group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black w-5 text-center text-[#0F172A]/30 shrink-0">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#0F172A] truncate">{f.firm_name}</p>
                              <p className="text-[10px] text-[#0F172A]/40 truncate">/{f.firm_slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {f.is_premium && (
                              <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-150">PRM</span>
                            )}
                            {f.is_verified && (
                              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">ONAY</span>
                            )}
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                              f.is_active
                                ? "text-emerald-600 bg-emerald-50 border-emerald-150"
                                : "text-red-500 bg-red-50 border-red-150"
                            }`}>
                              {f.is_active ? "AKT" : "PAS"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-sm font-black text-[#0EA5E9]">{f.views.toLocaleString("tr-TR")}</span>
                            {f.views > 0 && (
                              <div className="w-16 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0EA5E9] rounded-full transition-all duration-500"
                                  style={{ width: `${barPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-black ${f.clicks > 0 ? "text-emerald-500" : "text-[#0F172A]/20"}`}>
                            {f.clicks.toLocaleString("tr-TR")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {f.views > 0 ? (
                            <span className={`text-xs font-bold ${
                              f.ctr >= 5 ? "text-emerald-500" : f.ctr >= 2 ? "text-amber-500" : "text-[#0F172A]/50"
                            }`}>
                              %{f.ctr.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#0F172A]/20">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-[#0F172A]/60">{Number(f.rating).toFixed(1)}</span>
                          <span className="text-amber-400 text-[10px] ml-0.5">★</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-[#0F172A]/60">{f.review_count}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={`/firma/${f.firm_slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-[#0EA5E9] hover:underline"
                          >
                            Gör ↗
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-xs text-[#0F172A]/40 font-medium">
                      Sonuç bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#0F172A]/35 text-center">
        {sorted.length} firma gösteriliyor · Son {days} gün · Veriler anlık olarak güncellenir
      </p>
    </div>
  );
}
