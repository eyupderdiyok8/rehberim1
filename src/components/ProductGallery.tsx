"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
  price: number;
  whatsapp: string | null;
}

interface ProductGalleryProps {
  products: Product[];
  firmName: string;
  firmWhatsapp: string | null;
  isPremium: boolean;
}

export default function ProductGallery({ products, firmName, firmWhatsapp, isPremium }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i - 1 + products.length) % products.length : null));
  }, [products.length]);
  const next = useCallback(() => {
    setActiveIndex((i) => (i !== null ? (i + 1) % products.length : null));
  }, [products.length]);

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
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((p, i) => {
          const productWhatsapp = p.whatsapp || firmWhatsapp;
          return (
            <div key={p.id} className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white group">
              <div className="aspect-[4/3] bg-[#F8FAFC] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={`${firmName} ${p.name}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => setActiveIndex(i)}
                />
                {Number(p.price) > 0 ? (
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                    {Number(p.price).toLocaleString("tr-TR")} TL
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Fiyat Sorunuz
                  </span>
                )}
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-xs font-bold text-[#0F172A] line-clamp-1">{p.name}</p>
                {p.description && (
                  <p className="text-[10px] text-[#0F172A]/55 line-clamp-2">{p.description}</p>
                )}
                {productWhatsapp && (
                  <a
                    href={`https://wa.me/${productWhatsapp.replace(/\D/g, "")}${Number(p.price) === 0 ? `?text=${encodeURIComponent(`${p.name} icin fiyat bilgisi almak istiyorum.`)}` : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0EA5E9] hover:underline"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Fiyat Sor
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
          >
            ×
          </button>

          {products.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
            >
              ‹
            </button>
          )}

          {products.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl transition-colors z-10"
            >
              ›
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={products[activeIndex].image_url}
            alt={`${firmName} ${products[activeIndex].name}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-bold text-center max-w-[80vw]">
            {products[activeIndex].name}
            {products.length > 1 && (
              <span className="ml-2 text-white/60">{activeIndex + 1} / {products.length}</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
