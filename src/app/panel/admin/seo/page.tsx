"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface PageUrl {
  id: string;
  slug: string;
  page_type: string;
  meta_title: string | null;
  has_content: boolean;
}

export default function SeoManagerPage() {
  const [pages, setPages] = useState<PageUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    fetchPages();
  }, [page, search]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("page_urls")
        .select("id, slug, page_type, meta_title, seo_content", { count: "exact" });

      if (search) {
        query = query.ilike("slug", `%${search}%`);
      }

      const { data, error } = await query
        .range((page - 1) * perPage, page * perPage - 1)
        .order("slug", { ascending: true });

      if (error) throw error;
      if (data) {
        setPages(data.map(d => ({
          ...d,
          has_content: !!d.seo_content
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">SEO & Sayfa İçerikleri</h1>
          <p className="text-sm text-[#0F172A]/60 font-medium mt-1">İl, İlçe ve Hizmet sayfalarının içeriklerini ve SSS bölümünü yönetin.</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E2E8F0] flex gap-4">
          <input
            type="text"
            placeholder="URL (slug) içinde ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#0EA5E9]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#0F172A]/60 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">URL (Slug)</th>
                <th className="px-6 py-4 font-bold">Sayfa Tipi</th>
                <th className="px-6 py-4 font-bold">Özel İçerik</th>
                <th className="px-6 py-4 font-bold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-[#0F172A]/40">
                    Yükleniyor...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-[#0F172A]/40">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F172A] text-sm mb-0.5">/{p.slug}</div>
                      <div className="text-xs text-[#0F172A]/50">{p.meta_title || "Başlık Yok"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2.5 py-1 bg-[#F1F5F9] text-[#0F172A]/60 text-[10px] font-bold uppercase tracking-wider rounded-md border border-[#E2E8F0]">
                        {p.page_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {p.has_content ? (
                        <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded border border-emerald-100">
                          Var
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-slate-50 text-slate-400 text-xs font-bold rounded border border-slate-200">
                          Yok
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/panel/admin/seo/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0EA5E9] hover:text-white border border-[#0EA5E9]/30 hover:bg-[#0EA5E9] rounded-lg transition-colors"
                      >
                        Düzenle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-bold border border-[#E2E8F0] rounded text-[#0F172A]/70 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="text-xs font-bold text-[#0F172A]/50">Sayfa {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={pages.length < perPage}
            className="px-3 py-1.5 text-xs font-bold border border-[#E2E8F0] rounded text-[#0F172A]/70 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
}
