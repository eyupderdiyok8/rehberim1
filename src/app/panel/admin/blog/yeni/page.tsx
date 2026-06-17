"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { turkishToSlug } from "@/lib/utils";

// Load TipTap only on client
const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), { ssr: false });

function sanitizeFileName(original: string): string {
  const ext = original.slice(original.lastIndexOf(".")).toLowerCase();
  const name = original.slice(0, original.lastIndexOf("."));
  return `${turkishToSlug(name)}${ext}`;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("Admin");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverAlt, setCoverAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate slug from title unless manually overridden
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) setSlug(turkishToSlug(val));
  };

  const handleCoverFile = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    // Suggest alt from filename
    const name = file.name.slice(0, file.name.lastIndexOf(".")).replace(/[-_]/g, " ");
    setCoverAlt((prev) => prev || name);
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { setError("Başlık zorunludur."); return; }
    if (!slug.trim()) { setError("Slug zorunludur."); return; }
    if (!content || content === "<p></p>") { setError("İçerik boş bırakılamaz."); return; }
    setError("");
    setSaving(true);

    try {
      // 1. Upload cover image if selected
      let coverUrl: string | null = null;
      if (coverFile) {
        const safeName = sanitizeFileName(coverFile.name);
        const path = `covers/${Date.now()}-${safeName}`;
        const { error: uploadErr } = await supabase.storage
          .from("blog-images")
          .upload(path, coverFile, { upsert: false, contentType: coverFile.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
        coverUrl = urlData.publicUrl;
      }

      // 2. Check slug uniqueness
      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      let finalSlug = slug;
      if (existing) {
        let i = 2;
        while (true) {
          const candidate = `${slug}-${i}`;
          const { data: check } = await supabase
            .from("blog_posts")
            .select("id")
            .eq("slug", candidate)
            .maybeSingle();
          if (!check) { finalSlug = candidate; break; }
          i++;
        }
      }

      // 3. Insert post
      const { error: insertErr } = await supabase.from("blog_posts").insert({
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content,
        cover_image_url: coverUrl,
        cover_image_alt: coverAlt.trim() || null,
        author_name: authorName.trim() || "Admin",
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      });
      if (insertErr) throw insertErr;

      router.push("/panel/admin/blog");
    } catch (err) {
      setError((err as Error).message ?? "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Yeni Blog Yazısı</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">İçerik Oluştur</p>
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

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Başlık <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Su Arıtma Cihazı Seçerken Dikkat Edilmesi Gerekenler"
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Slug (URL)
            <span className="ml-2 text-[#0F172A]/40 font-normal normal-case">— başlıktan otomatik üretilir</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#0F172A]/40 shrink-0">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(turkishToSlug(e.target.value)); setSlugManual(true); }}
              placeholder="su-aritma-cihazi-secimi"
              className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] font-mono focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
            Özet
            <span className="ml-2 text-[#0F172A]/40 font-normal normal-case">— liste sayfasında görünür, SEO description</span>
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Bu yazıda su arıtma cihazı seçerken dikkat etmeniz gereken…"
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none"
          />
        </div>

        {/* Author */}
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
        {coverPreview ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt={coverAlt || "Kapak"} className="w-full h-52 object-cover rounded-lg border border-[#E2E8F0]" />
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
              <button
                type="button"
                onClick={() => { setCoverFile(null); setCoverPreview(null); setCoverAlt(""); }}
                className="mt-5 text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Kaldır
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="w-full border-2 border-dashed border-[#E2E8F0] hover:border-[#0EA5E9]/40 rounded-xl py-10 text-center transition-colors group"
          >
            <div className="text-2xl mb-2">🖼</div>
            <p className="text-xs font-semibold text-[#0F172A]/50 group-hover:text-[#0EA5E9] transition-colors">
              Kapak görseli seçin
            </p>
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
        <TipTapEditor content={content} onChange={setContent} />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pb-10">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave(false)}
          className="w-full sm:w-auto px-6 py-3 border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Taslak Olarak Kaydet"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave(true)}
          className="w-full sm:w-auto px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] rounded-xl text-sm font-bold text-white transition-colors shadow-sm shadow-sky-500/20 disabled:opacity-50"
        >
          {saving ? "Yayınlanıyor…" : "Yayınla →"}
        </button>
      </div>
    </div>
  );
}

