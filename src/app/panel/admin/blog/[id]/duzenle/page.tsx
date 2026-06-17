"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { turkishToSlug } from "@/lib/utils";

const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), { ssr: false });

function sanitizeFileName(original: string): string {
  const ext = original.slice(original.lastIndexOf(".")).toLowerCase();
  const name = original.slice(0, original.lastIndexOf("."));
  return `${turkishToSlug(name)}${ext}`;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("Admin");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverAlt, setCoverAlt] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error: fetchErr } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchErr || !data) { setError("Yazı bulunamadı."); setLoading(false); return; }
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt ?? "");
      setContent(data.content);
      setAuthorName(data.author_name);
      setCoverUrl(data.cover_image_url);
      setCoverAlt(data.cover_image_alt ?? "");
      setIsPublished(data.is_published);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleCoverFile = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    const name = file.name.slice(0, file.name.lastIndexOf(".")).replace(/[-_]/g, " ");
    setCoverAlt((prev) => prev || name);
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { setError("Başlık zorunludur."); return; }
    if (!slug.trim()) { setError("Slug zorunludur."); return; }
    setError("");
    setSaving(true);

    try {
      let finalCoverUrl = coverUrl;

      // Upload new cover if selected
      if (coverFile) {
        const safeName = sanitizeFileName(coverFile.name);
        const path = `covers/${Date.now()}-${safeName}`;
        const { error: uploadErr } = await supabase.storage
          .from("blog-images")
          .upload(path, coverFile, { upsert: false, contentType: coverFile.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
        finalCoverUrl = urlData.publicUrl;
      }

      const { error: updateErr } = await supabase
        .from("blog_posts")
        .update({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim() || null,
          content,
          cover_image_url: finalCoverUrl,
          cover_image_alt: coverAlt.trim() || null,
          author_name: authorName.trim() || "Admin",
          is_published: publish,
          published_at: publish && !isPublished ? new Date().toISOString() : undefined,
        })
        .eq("id", id);
      if (updateErr) throw updateErr;

      router.push("/panel/admin/blog");
    } catch (err) {
      setError((err as Error).message ?? "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayCover = coverPreview ?? coverUrl;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Yazıyı Düzenle</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">İçerik Yönetimi</p>
        </div>
        <a href="/panel/admin/blog" className="text-xs font-bold text-[#0F172A]/50 hover:text-[#0EA5E9] transition-colors">
          ← Geri
        </a>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl">
          ⚠ {error}
        </div>
      )}

      {/* Meta */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]/50">Yazı Bilgileri</h2>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Başlık <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#0F172A]/40 shrink-0">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(turkishToSlug(e.target.value))}
              className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Özet</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Yazar</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]/50">Kapak Fotoğrafı</h2>
        {displayCover ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayCover} alt={coverAlt || "Kapak"} className="w-full h-52 object-cover rounded-lg border border-[#E2E8F0]" />
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-[#0F172A] mb-1">Alt Etiketi (SEO)</label>
                <input
                  type="text"
                  value={coverAlt}
                  onChange={(e) => setCoverAlt(e.target.value)}
                  placeholder="Örn: Su arıtma cihazı kurulumu"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                />
              </div>
              <div className="flex flex-col gap-1 mt-5">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="text-xs text-[#0EA5E9] hover:text-[#0284C7] font-semibold"
                >
                  Değiştir
                </button>
                <button
                  type="button"
                  onClick={() => { setCoverUrl(null); setCoverFile(null); setCoverPreview(null); setCoverAlt(""); }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#E2E8F0] hover:border-[#0EA5E9]/40 rounded-xl py-10 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">🖼</div>
            <p className="text-xs font-semibold text-[#0F172A]/50 group-hover:text-[#0EA5E9] transition-colors">Kapak görseli seçin</p>
            <p className="text-[10px] text-[#0F172A]/30 mt-1">JPG, PNG, WebP — Orijinal dosya adı korunur</p>
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); e.target.value = ""; }}
        />
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]/50">İçerik</h2>
        {!loading && <TipTapEditor content={content} onChange={setContent} />}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pb-10">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave(false)}
          className="w-full sm:w-auto px-6 py-3 border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Taslak Olarak Güncelle"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave(true)}
          className="w-full sm:w-auto px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-xl text-sm font-bold text-white transition-colors shadow-sm shadow-sky-500/20 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : isPublished ? "Güncelle →" : "Yayınla →"}
        </button>
      </div>
    </div>
  );
}
