"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TipTapEditor from "@/components/TipTapEditor";
import Link from "next/link";

interface FAQ {
  question: string;
  answer: string;
}

interface PageData {
  id: string;
  slug: string;
  page_type: string;
  meta_title: string | null;
  meta_desc: string | null;
  seo_content: string | null;
  faqs: FAQ[] | null;
}

export default function SeoEditorPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [seoContent, setSeoContent] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetchPageData();
  }, [id]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("page_urls")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setPageData(data);
      setSeoContent(data.seo_content || "");
      setFaqs(data.faqs || []);
    } catch (err: any) {
      setError("Veri çekilemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: updErr } = await supabase
        .from("page_urls")
        .update({
          seo_content: seoContent || null,
          faqs: faqs.length > 0 ? faqs : null,
        })
        .eq("id", id);

      if (updErr) throw updErr;
      setSuccess("Değişiklikler başarıyla kaydedildi.");
    } catch (err: any) {
      setError("Kaydetme hatası: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center font-semibold text-slate-400">Yükleniyor...</div>;
  }

  if (!pageData) {
    return <div className="p-10 text-center text-red-500 font-bold">Sayfa bulunamadı.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/panel/admin/seo" className="text-slate-400 hover:text-sky-500 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">İçerik Düzenle</h1>
          <p className="text-sm font-semibold text-sky-600 mt-1">/{pageData.slug}</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold">{success}</div>}

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h2 className="font-bold text-[#0F172A]">Sayfa Özel İçeriği (Makale)</h2>
          <p className="text-xs text-[#0F172A]/60 mt-1">Bu içerik ilgili bölge/hizmet sayfasının altında görünecektir.</p>
        </div>
        <div className="p-6">
          <TipTapEditor
            content={seoContent}
            onChange={(html) => setSeoContent(html)}
            placeholder="Bu sayfaya özel SEO uyumlu makalenizi yazın..."
          />
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
          <div>
            <h2 className="font-bold text-[#0F172A]">Sıkça Sorulan Sorular (SSS)</h2>
            <p className="text-xs text-[#0F172A]/60 mt-1">Sayfa altında akordiyon olarak listelenir ve Google'a JSON-LD şeması olarak eklenir.</p>
          </div>
          <button
            onClick={handleAddFaq}
            className="px-3 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors"
          >
            + Soru Ekle
          </button>
        </div>
        <div className="p-6 space-y-4">
          {faqs.length === 0 ? (
            <div className="text-center py-6 text-sm font-semibold text-slate-400">Henüz soru eklenmedi.</div>
          ) : (
            faqs.map((faq, index) => (
              <div key={index} className="flex gap-4 items-start p-4 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder="Soru"
                    value={faq.question}
                    onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded bg-white text-sm font-bold focus:border-[#0EA5E9] focus:outline-none"
                  />
                  <textarea
                    placeholder="Cevap"
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded bg-white text-sm focus:border-[#0EA5E9] focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleRemoveFaq(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                  title="Sil"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saveLoading}
          className="px-6 py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {saveLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
