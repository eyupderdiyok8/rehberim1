"use client";

import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  currentUrl: string | null | undefined;
  onUpload: (url: string) => void;
}

export default function BannerUploader({ currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Sadece görsel dosyaları kabul edilir (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5 MB'ı geçemez.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const path = `banner-${Date.now()}${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("banners")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("banners").getPublicUrl(path);
      setPreview(data.publicUrl);
      onUpload(data.publicUrl);
    } catch (err: any) {
      setError("Yükleme hatası: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all cursor-pointer select-none overflow-hidden
          ${uploading ? "opacity-60 cursor-wait" : "hover:border-[#0EA5E9] hover:bg-[#F0F9FF]"}
          ${preview ? "border-[#E2E8F0] bg-[#F8FAFC]" : "border-[#CBD5E1] bg-[#F8FAFC]"}
        `}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Banner görseli"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#0F172A]/0 hover:bg-[#0F172A]/40 transition-all flex items-center justify-center">
              <span className="opacity-0 hover:opacity-100 text-white text-sm font-bold transition-opacity">
                Görseli Değiştir
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#0F172A]/40 pointer-events-none p-4 text-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-semibold">Banner görseli yüklemek için tıklayın</p>
            <p className="text-xs">JPG, PNG, WEBP · max 5 MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-[#0EA5E9]">Yükleniyor…</span>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-xs font-bold bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? "Yükleniyor…" : preview ? "Görseli Değiştir" : "Görsel Yükle"}
        </button>
        {preview && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => { setPreview(null); onUpload(""); }}
            className="px-4 py-2 text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Kaldır
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500 font-medium">⚠ {error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
