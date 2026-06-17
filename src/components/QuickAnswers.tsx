"use client";

import { useState, useRef, useEffect, useMemo } from "react";

/* ──────────────────────────────────────────────────────────
   Q&A Data — categorised, with optional firm-page deep links
   ────────────────────────────────────────────────────────── */
type QAItem = {
  q: string;
  a: string;
  cat: Category;
  linkLabel?: string;
  linkHref?: string;
};

type Category =
  | "fiyat"
  | "kurulum"
  | "bakim"
  | "guvenilirlik"
  | "iletisim";

const CATEGORIES: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "fiyat", label: "Fiyatlar" },
  { key: "kurulum", label: "Kurulum" },
  { key: "bakim", label: "Bakım" },
  { key: "guvenilirlik", label: "Güvenilirlik" },
  { key: "iletisim", label: "İletişim" },
];

const QA_DATA: QAItem[] = [
  // ── Fiyat
  {
    q: "Su arıtma cihazı fiyatları ne kadar?",
    a: "Giriş seviyesi sistemler 5.000₺'den başlar, orta segment 6.000₺ - 15.000₺, premium ters osmoz sistemleri ise 15.000₺ –30.000 aralığındadır.",
    cat: "fiyat",
    linkLabel: "İstanbul fiyatlarını gör",
    linkHref: "/istanbul-su-aritma-cihazi-fiyatlari",
  },
  {
    q: "Fiyatı etkileyen faktörler nelerdir?",
    a: "Filtre sayısı, membran kalitesi (Ters Osmoz / Ultrafiltrasyon), tank kapasitesi ve marka belirleyici faktörlerdir. NSF sertifikalı ürünler genellikle daha pahalıdır.",
    cat: "fiyat",
  },
  {
    q: "Taksit imkânı var mı?",
    a: "Çoğu firma kredi kartına 6–12 ay taksit imkânı sunmaktadır. Detayları firmayla doğrudan görüşebilirsiniz.",
    cat: "fiyat",
    linkLabel: "Firmaları incele",
    linkHref: "/istanbul-su-aritma-cihazi-firmalari",
  },

  // ── Kurulum
  {
    q: "Su arıtma cihazı ne kadar sürede kurulur?",
    a: "Yetkili firmalar genellikle aynı gün veya ertesi gün kurulum yapar. Standart bir ev tipi cihazın kurulumu ortalama 1–2 saat sürer.",
    cat: "kurulum",
  },
  {
    q: "Kurulum için evde ne gerekli?",
    a: "Tezgâh altı montaj için musluk bağlantısına yakın bir alan ve elektrik prizi(pompalı cihaz ise) yeterlidir. Kurulum teknisyeni tüm malzemeyi yanında getirir.",
    cat: "kurulum",
  },
  // ── Bakım
  {
    q: "Filtre değişimi ne sıklıkta yapılmalı?",
    a: "Ön filtreler 6 ayda bir, ana membran filtre ise kullanım yoğunluğuna göre 1–2 yılda bir değiştirilmelidir.",
    cat: "bakim",
  },
  {
    q: "Filtre değişim maliyeti nedir?",
    a: "Ön filtre seti 900₺-1500₺, membran filtre ₺1.000 - 1.500₺ civarındadır. Yıllık ortalama bakım maliyeti ₺2000–₺4.000 arasındadır.",
    cat: "bakim",
  },
  {
    q: "Bakım yapmazsam ne olur?",
    a: "Filtre ömrü dolunca arıtma kalitesi düşer, su tadı bozulur ve cihazın ömrü kısalır. Düzenli bakım uzun vadede tasarruf sağlar.",
    cat: "bakim",
    linkLabel: "Bakım hizmeti veren firmalar",
    linkHref: "/istanbul-su-aritma-cihazi-firmalari",
  },

  // ── Güvenilirlik
  {
    q: "Sitenizdeki firmalar güvenilir mi?",
    a: "Tüm firmalar ekibimiz tarafından onaylandıktan sonra listeye eklenir. Gerçek müşteri yorumları ve puanlama sistemi ile şeffaf bir değerlendirme sunarız.",
    cat: "guvenilirlik",
  },
  {
    q: "Yorumlar gerçek mi?",
    a: "Evet, yalnızca hizmeti almış kullanıcılar yorum bırakabilir. Spam ve sahte yorumlar moderasyon ekibimiz tarafından filtrelenir.",
    cat: "guvenilirlik",
  },
  {
    q: "Hangi marka cihazlar tavsiye ediliyor?",
    a: "NSF/ANSI sertifikalı, Türkiye'de yetkili servisi bulunan markalar önerilir. Firmalar sayfasından kullanıcı puanlarına göre marka karşılaştırması yapabilirsiniz.",
    cat: "guvenilirlik",
    linkLabel: "Puanlı firmaları gör",
    linkHref: "/istanbul-su-aritma-cihazi-firmalari",
  },

  // ── İletişim
  {
    q: "Firmalarla iletişim ücretli mi?",
    a: "Hayır, sitemizdeki tüm firmalarla telefon veya WhatsApp üzerinden doğrudan ve ücretsiz iletişime geçebilirsiniz.",
    cat: "iletisim",
  },
  {
    q: "Hangi şehirlerde firma var?",
    a: "Su Arıtma Rehberi olarak Türkiye genelinde 17+ şehirde onaylı firmalar listeliyoruz.",
    cat: "iletisim",
    linkLabel: "Şehirleri keşfet",
    linkHref: "/istanbul-su-aritma-cihazi-firmalari",
  },
  {
    q: "Teklif almak için ne yapmalıyım?",
    a: "Beğendiğiniz firmanın sayfasından telefon veya WhatsApp ile doğrudan teklif isteyebilirsiniz. Birden fazla firmadan teklif almanızı öneririz.",
    cat: "iletisim",
  },
];

/* ──────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────── */
export default function QuickAnswers() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "all">("all");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setExpandedQ(null);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return QA_DATA.filter((item) => {
      const catMatch = activeCat === "all" || item.cat === activeCat;
      const searchMatch =
        !q ||
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [search, activeCat]);

  return (
    <div ref={panelRef} className="fixed bottom-[5.5rem] right-5 z-50">
      {/* ── Panel ── */}
      {open && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl bg-white shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0EA5E9] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-sm text-[#0F172A]">Hızlı Cevaplar</span>
            </div>
            <button
              onClick={() => { setOpen(false); setExpandedQ(null); }}
              className="w-7 h-7 rounded-full hover:bg-[#E2E8F0] flex items-center justify-center transition-colors"
              aria-label="Kapat"
            >
              <svg className="w-4 h-4 text-[#0F172A]/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setExpandedQ(null); }}
                placeholder="Sorunuzu yazın..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] placeholder:text-[#0F172A]/35 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#E2E8F0] flex items-center justify-center hover:bg-[#CBD5E1] transition-colors"
                >
                  <svg className="w-2.5 h-2.5 text-[#0F172A]/50" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => { setActiveCat(c.key); setExpandedQ(null); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  activeCat === c.key
                    ? "bg-[#0EA5E9] text-white"
                    : "bg-[#F1F5F9] text-[#0F172A]/55 hover:bg-[#E2E8F0]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Q&A list */}
          <div className="max-h-72 overflow-y-auto px-2 pb-3">
            {filtered.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-[#0F172A]/40 mb-3">Aradığınız soru bulunamadı.</p>
                <a
                  href="https://wa.me/905345957147?text=Merhaba%2C%20Su%20Ar%C4%B1tma%20Rehberi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-xs font-bold rounded-full hover:bg-[#1ebe57] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp ile sorun
                </a>
              </div>
            ) : (
              <div className="space-y-1">
                {filtered.map((item, i) => {
                  const isExpanded = expandedQ === i;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl overflow-hidden transition-all duration-150 ${
                        isExpanded ? "bg-[#F8FAFC] border border-[#E2E8F0]" : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedQ(isExpanded ? null : i)}
                        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5"
                      >
                        <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold transition-colors ${
                          isExpanded ? "bg-[#0EA5E9] text-white" : "bg-[#F1F5F9] text-[#0F172A]/40"
                        }`}>
                          {isExpanded ? "−" : "?"}
                        </span>
                        <span className={`text-[13px] font-semibold leading-snug ${
                          isExpanded ? "text-[#0F172A]" : "text-[#0F172A]/75"
                        }`}>
                          {item.q}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pl-[1.625rem]">
                          <p className="text-[13px] text-[#0F172A]/60 leading-relaxed mb-2">
                            {item.a}
                          </p>
                          {item.linkLabel && item.linkHref && (
                            <a
                              href={item.linkHref}
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                            >
                              {item.linkLabel}
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer — WhatsApp fallback */}
          <div className="px-4 py-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <a
              href="https://wa.me/905345957147?text=Merhaba%2C%20Su%20Ar%C4%B1tma%20Rehberi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-[#0F172A]/50 hover:text-[#25D366] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Cevabı bulamadınız? WhatsApp ile yazın
            </a>
          </div>
        </div>
      )}

      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Hızlı Cevaplar"
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group ${
          open
            ? "bg-[#0F172A] shadow-[#0F172A]/30 scale-95"
            : "bg-[#0EA5E9] shadow-[#0EA5E9]/30 hover:scale-110 hover:shadow-xl"
        }`}
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="absolute inset-0 rounded-full bg-[#0EA5E9] animate-ping opacity-15" />
          </>
        )}
      </button>
    </div>
  );
}
