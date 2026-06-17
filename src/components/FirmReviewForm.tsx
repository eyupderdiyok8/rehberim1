"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  firmId: string;
  firmName: string;
}

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export default function FirmReviewForm({ firmId, firmName }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const total = images.length + newFiles.length;

    if (total > MAX_IMAGES) {
      setError(`En fazla ${MAX_IMAGES} fotoğraf ekleyebilirsiniz.`);
      return;
    }

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError("Dosya boyutu 5MB'ı aşamaz.");
        return;
      }
    }

    setError("");
    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Lütfen bir puan seçin."); return; }
    if (!authorName.trim()) { setError("Adınızı girin."); return; }
    setError("");
    setSubmitting(true);

    try {
      // 1. Insert review
      const { data: review, error: insertErr } = await supabase
        .from("reviews")
        .insert({
          firm_id: firmId,
          author_name: authorName.trim(),
          rating,
          body: body.trim() || null,
          is_approved: false,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      // 2. Upload images if any
      if (images.length > 0 && review) {
        const firmSlug = slugify(firmName);
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
          const suffix = images.length > 1 ? `-${i + 1}` : "";
          const path = `${review.id}/${firmSlug}-su-aritma-yorumu${suffix}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from("review-images")
            .upload(path, file, { upsert: false, contentType: file.type });

          if (uploadErr) {
            console.error("Image upload error:", uploadErr);
            continue; // Skip failed uploads, don't block review
          }

          const { data: urlData } = supabase.storage
            .from("review-images")
            .getPublicUrl(path);

          await supabase.from("review_images").insert({
            review_id: review.id,
            image_url: urlData.publicUrl,
            sort_order: i,
          });
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setError("Yorum gönderilemedi: " + (err.message || "Bir hata oluştu."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden mt-4">
      {/* Header */}
      <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <h3 className="font-extrabold text-sm text-[#0F172A]">
          {firmName} için Yorum Yaz
        </h3>
        <p className="text-[11px] text-[#0F172A]/45 mt-0.5">
          Deneyiminizi paylaşın — yorumlar moderatör onayıyla yayınlanır.
        </p>
      </div>

      <div className="px-6 py-6">
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-sm font-bold text-[#0F172A]">Yorumunuz alındı!</p>
            <p className="text-xs text-[#0F172A]/50">
              Moderatör incelemesinden sonra sayfada görünecektir.
            </p>
            <button
              type="button"
              onClick={() => { setSuccess(false); setRating(0); setAuthorName(""); setBody(""); setImages([]); setPreviews([]); }}
              className="mt-2 text-xs font-bold text-[#0EA5E9] hover:underline"
            >
              Başka yorum yaz
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Puanınız <span className="text-red-500">*</span>
              </label>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    title={`${star} yıldız`}
                    aria-label={`${star} yıldız`}
                  >
                    <span
                      className={
                        star <= (hovered || rating)
                          ? "text-[#0EA5E9]"
                          : "text-[#E2E8F0]"
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-xs font-bold text-[#0F172A]/50">
                    {["", "Çok Kötü", "Kötü", "Orta", "İyi", "Mükemmel"][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Author name */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Adınız <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => { setAuthorName(e.target.value); setError(""); }}
                placeholder="Örn: Ahmet Y."
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 transition-all"
              />
            </div>

            {/* Review body */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Yorumunuz{" "}
                <span className="text-[#0F172A]/35 font-normal normal-case">(isteğe bağlı)</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                placeholder="Hizmet kalitenizi, fiyat/performans oranını veya deneyiminizi anlatın…"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Fotoğraf Ekle{" "}
                <span className="text-[#0F172A]/35 font-normal normal-case">(max {MAX_IMAGES} adet, 5MB)</span>
              </label>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Fotoğraf ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-[#E2E8F0]"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {previews.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E2E8F0] hover:border-[#0EA5E9]/40 rounded-lg text-xs font-semibold text-[#0F172A]/50 hover:text-[#0EA5E9] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fotoğraf seçin ({previews.length}/{MAX_IMAGES})
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => { handleImageSelect(e.target.files); e.target.value = ""; }}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}

            <p className="text-[10px] text-[#0F172A]/35">
              Yorumlar moderatör onayından sonra yayınlanır. Kişisel bilgileriniz gizli tutulur.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-sky-500/20"
            >
              {submitting ? "Gönderiliyor…" : "Yorum Gönder"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
