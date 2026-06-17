"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  images: { id: string; image_url: string; sort_order?: number }[];
  alt?: string;
  thumbnailSize?: string;
}

export default function ImageLightbox({ images, alt = "Yorum fotoğrafı", thumbnailSize = "w-20 h-20" }: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i - 1 + sorted.length) % sorted.length : null));
  }, [sorted.length]);
  const next = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i + 1) % sorted.length : null));
  }, [sorted.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [activeIndex, close, prev, next]);

  return (
    <>
      {/* Thumbnails */}
      <div className="flex flex-wrap gap-2 mt-3">
        {sorted.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            className="p-0 border-0 bg-transparent cursor-pointer relative"
          >
            <Image
              src={img.image_url}
              alt={alt}
              width={80}
              height={80}
              className={`${thumbnailSize} object-cover rounded-lg border border-[#E2E8F0] hover:border-[#0EA5E9] transition-colors`}
            />
          </button>
        ))}
      </div>

      {/* Modal */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
          >
            ×
          </button>

          {/* Prev */}
          {sorted.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
            >
              ‹
            </button>
          )}

          {/* Next */}
          {sorted.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
            >
              ›
            </button>
          )}

          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sorted[activeIndex].image_url}
            alt={alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          {sorted.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold">
              {activeIndex + 1} / {sorted.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
