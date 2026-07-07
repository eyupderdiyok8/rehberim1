"use client";

import React, { useState } from "react";

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Web Sitesi & Landing Page",
    desc: "Su arıtma firmanıza özel, SEO uyumlu, mobil uyumlu profesyonel web sitesi. Müşteri formları ve WhatsApp entegrasyonu ile anında teklif alın.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: "Teklif & Müşteri Yönetimi",
    desc: "Gelen teklif taleplerini tek panelden yönetin. Müşteri bilgileri, teklif geçmişi, durum takibi ve hatırlatmalar ile hiçbir fırsatı kaçırmayın.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Otomatik Bildirimler",
    desc: "Yeni teklif talebi geldiğinde anında SMS ve e-posta bildirimi. Müşteriye hızlı yanıt vererek rakiplerin önüne geçin.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Performans Raporları",
    desc: "Web sitenizin ziyaretçi sayısı, teklif dönüşüm oranları, en çok talep gelen hizmetler ve bölgeler. Veriye dayalı kararlar alın.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Mobil Uyumlu Panel",
    desc: "Sahada olsanız bile telefonunuzdan teklif yönetin, müşteri bilgilerine erişin ve raporlarınızı inceleyin. Her yerden kontrol sizde.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Teknik Servis Takibi",
    desc: "Montaj, filtre değişimi ve arıza kayıtlarını dijital ortamda tutun. Periyodik bakım hatırlatmaları ile tekrar müşteri kazanın.",
  },
];

const BENEFITS = [
  { stat: "3x", label: "Daha Fazla Teklif", desc: "Profesyonel web sitesi ile organik müşteri trafiği" },
  { stat: "%40", label: "Hızlı Dönüşüm", desc: "Otomatik bildirimler ile anlık müşteri yanıtı" },
  { stat: "7/24", label: "Müşteri Kabul", desc: "Web siteniz siz uyurken de teklif toplar" },
  { stat: "0", label: "Kayıp Müşteri", desc: "Teknik servis hatırlatmaları ile sadık müşteri" },
];

const FOR_WHO = [
  {
    title: "Su Arıtma Bayileri",
    points: [
      "Montaj ve satış sonrası takip",
      "Filtre değişimi hatırlatma",
      "Bölgesel müşteri portföyü yönetimi",
    ],
  },
  {
    title: "Teknik Servis Firmaları",
    points: [
      "Arıza ve bakım kayıtları",
      "Periyodik bakım planlama",
      "Müşteri memnuniyeti takibi",
    ],
  },
  {
    title: "Su Arıtma Üreticileri",
    points: [
      "Bayi ağı yönetimi",
      "Ürün katalog entegrasyonu",
      "Marka bilinirliği artırma",
    ],
  },
];

function RoiCalculator() {
  const [cihazKazanc, setCihazKazanc] = useState(3000);
  const [filtreKazanc, setFiltreKazanc] = useState(1500);
  const [aylikMusteri, setAylikMusteri] = useState(5);

  const aylikKazanc = (cihazKazanc + filtreKazanc) * aylikMusteri;
  const yillikKazanc = aylikKazanc * 12;

  const formatTL = (n: number) =>
    n.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

  return (
    <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-8 shadow-xl shadow-slate-900/20 overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="mb-6">
          <h3 className="text-[15px] font-extrabold text-white uppercase tracking-wider">
            💰 Neden Bu Hizmeti Satın Almalısınız?
          </h3>
          <p className="text-[13px] text-white/50 mt-1">
            Kaydırıcıları hareket ettirerek potansiyel kazancınızı hesaplayın
          </p>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          {/* Cihaz Kazancı */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-white/80">Ortalama Cihaz Kazancı</label>
              <span className="text-[15px] font-black text-emerald-400">{formatTL(cihazKazanc)}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={cihazKazanc}
              onChange={(e) => setCihazKazanc(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
            />
            <div className="flex justify-between text-[11px] text-white/30 font-medium mt-1">
              <span>₺1.000</span>
              <span>₺15.000</span>
            </div>
          </div>

          {/* Filtre Kazancı */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-white/80">Ortalama Filtre Kazancı</label>
              <span className="text-[15px] font-black text-sky-400">{formatTL(filtreKazanc)}</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={250}
              value={filtreKazanc}
              onChange={(e) => setFiltreKazanc(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-sky-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-sky-500/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
            />
            <div className="flex justify-between text-[11px] text-white/30 font-medium mt-1">
              <span>₺500</span>
              <span>₺5.000</span>
            </div>
          </div>

          {/* Aylık Yeni Müşteri */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-white/80">Aylık Yeni Müşteri</label>
              <span className="text-[15px] font-black text-amber-400">{aylikMusteri} müşteri</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={aylikMusteri}
              onChange={(e) => setAylikMusteri(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-500/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
            />
            <div className="flex justify-between text-[11px] text-white/30 font-medium mt-1">
              <span>1</span>
              <span>30</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-emerald-500/15 border border-emerald-500/20 rounded-xl p-5 text-center">
            <p className="text-[12px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1">Aylık Kazanç</p>
            <p className="text-2xl font-black text-emerald-400">{formatTL(aylikKazanc)}</p>
            <p className="text-[11px] text-white/40 mt-1">Müşteri başına × {aylikMusteri} müşteri</p>
          </div>
          <div className="bg-amber-500/15 border border-amber-500/20 rounded-xl p-5 text-center">
            <p className="text-[12px] font-bold text-amber-400/70 uppercase tracking-wider mb-1">Yıllık Kazanç</p>
            <p className="text-2xl font-black text-amber-400">{formatTL(yillikKazanc)}</p>
            <p className="text-[11px] text-white/40 mt-1">12 aylık toplam potansiyel</p>
          </div>
        </div>

        {/* ROI note */}
        <div className="mt-5 bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-[13px] text-white/60 text-center">
            <span className="text-white font-bold">Yatırımınız:</span> sadece{' '}
            <span className="text-emerald-400 font-black">210$ (₺9.600)</span>{' '}
            — İlk <span className="text-amber-400 font-bold">{aylikKazanc >= 9600 ? Math.ceil(9600 / aylikKazanc) : '2'} ayda</span> kendini amorti eder!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FirmAcquisitionPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Müşteri Kazan</h1>
        <p className="text-sm text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
          Su Arıtma Sektörüne Özel Web Sitesi & Teknik Servis Yazılımı
        </p>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white border border-emerald-200/50 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Su Arıtma Rehberi Teknoloji
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] leading-snug">
              Su Arıtma İşletmeniz İçin<br />
              <span className="text-emerald-600">Dijital Müşteri Kazanma Makinesi</span>
            </h2>
            <p className="text-[15px] text-[#0F172A]/60 mt-3 max-w-lg leading-relaxed">
              Sektöre özel geliştirilmiş web sitesi, teklif yönetim paneli ve teknik servis yazılımı ile
              müşteri sayınızı katlayın. Tekliften montaja, filtre değişiminden tekrar satışa — tüm süreci
              dijital ortamda yönetin.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-200/40">
            {BENEFITS.map((b) => (
              <div key={b.label}>
                <p className="text-3xl font-black text-emerald-600">{b.stat}</p>
                <p className="text-[12px] font-bold text-[#0F172A] mt-0.5">{b.label}</p>
                <p className="text-[11px] text-[#0F172A]/45 font-medium">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-extrabold text-[#0F172A] uppercase tracking-wider">Neler Sunuyoruz?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:border-emerald-500/30 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-200">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#0F172A] mb-1">{feature.title}</h4>
                  <p className="text-[13px] text-[#0F172A]/55 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who Is It For */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-extrabold text-[#0F172A] uppercase tracking-wider">Kimler İçin?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FOR_WHO.map((who) => (
            <div key={who.title} className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3">
              <h4 className="text-[15px] font-extrabold text-[#0F172A]">{who.title}</h4>
              <ul className="space-y-2">
                {who.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0 mt-0.5 font-bold text-[13px]">✓</span>
                    <span className="text-[13px] text-[#0F172A]/60 font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison: Before/After */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <h3 className="font-extrabold text-[15px] text-[#0F172A] uppercase tracking-wide">Öncesi & Sonrası</h3>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {[
            { before: "Telefonla müşteri kaydı, kağıt notlar", after: "Dijital müşteri profili, tam geçmiş" },
            { before: "Teklif talepleri WhatsApp karmaşasında kaybolur", after: "Tek panelden teklif yönetimi ve takip" },
            { before: "Filtre değişim zamanı unutulur, müşteri kaybedilir", after: "Otomatik hatırlatma ile tekrar satış" },
            { before: "Web sitesi yok veya etkisiz", after: "SEO uyumlu site, sürekli teklif akışı" },
            { before: "Hangi hizmetin kârlı olduğunu bilmiyorum", after: "Detaylı raporlar ile veriye dayalı kararlar" },
          ].map((row, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">✕</span>
                <span className="text-[13px] text-[#0F172A]/50 font-medium">{row.before}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">✓</span>
                <span className="text-[13px] text-[#0F172A] font-semibold">{row.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Calculator */}
      <RoiCalculator />

      {/* Special Offer */}
      <div className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 rounded-2xl p-7 overflow-hidden shadow-lg shadow-amber-500/15">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-xl" />
        
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Gift icon */}
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>

          {/* Offer text */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-[13px] font-black text-white/80 uppercase tracking-widest mb-1">Özel Tanıtım Teklifi</p>
            <h3 className="text-2xl font-black text-white leading-tight">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/30 text-white inline-block">
                6 Ay Premium Hediye!{" "}
                <span className="text-white/80 font-bold text-xl">(₺5.300 değerinde)</span>
              </span>
            </h3>
            <p className="text-[15px] text-white/85 font-semibold mt-2">
              Müşteri Kazan yazılımını alın, 6 aylık Premium üyeliği <span className="text-white font-extrabold">ÜCRETSİZ</span> kazanın.
            </p>
          </div>

          {/* Price tag */}
          <div className="shrink-0 text-center bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
            <p className="text-[12px] font-bold text-white/70 uppercase tracking-wider mb-1">Yatırımınız</p>
            <p className="text-4xl font-black text-white leading-none">210$</p>
            <p className="text-[15px] font-black text-white/90 mt-1">(₺9.600)</p>
            <p className="text-[13px] font-bold text-white/80 mt-1.5">Toplam Değer: <span className="line-through decoration-2 decoration-white/50 text-white/50">₺14.900</span></p>
            <p className="text-[12px] font-black text-white mt-1">6 Ay Premium HEDİYE dahil!</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-center space-y-5 shadow-lg shadow-emerald-500/10">
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">İşletmenizi Dijitalleştirin</h3>
          <p className="text-[15px] text-white/60 mt-2 max-w-md mx-auto">
            Ücretsiz demo ile yazılımı deneyin. Su arıtma sektörüne özel çözümlerimizi keşfedin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="https://wa.me/905345957147?text=Merhaba%2C%20M%C3%BC%C5%9Fteri%20Kazan%20yaz%C4%B1l%C4%B1m%C4%B1%20%2B%206%20ay%20Premium%20hediye%20teklifi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 text-[13px] font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Tekliften Yararlan
          </a>
          <a
            href="mailto:eyupder@gmail.com?subject=M%C3%BC%C5%9Fteri%20Kazan%20Yaz%C4%B1l%C4%B1m%C4%B1%20-%20Su%20Ar%C4%B1tma%20Rehberi"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:bg-white/10 text-white text-[13px] font-bold rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            E-posta ile Bilgi Al
          </a>
        </div>

        <p className="text-[12px] text-white/30 font-medium pt-2">
          Demo ücretsizdir. Herhangi bir ödeme veya taahhüt gerekmez.
        </p>
      </div>
    </div>
  );
}
