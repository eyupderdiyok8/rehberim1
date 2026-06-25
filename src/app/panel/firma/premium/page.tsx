"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Firm {
  id: string;
  name: string;
  is_premium: boolean;
  premium_until: string | null;
}

export default function FirmPremium() {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFirmData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: firmData, error: firmErr } = await supabase
          .from("firms")
          .select("id, name, is_premium, premium_until")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (firmErr) throw firmErr;
        if (firmData) {
          setFirm(firmData);
        }
      } catch (err) {
        console.error("Premium page error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFirmData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#0F172A]/50">Firma verileri yüklenemedi.</p>
      </div>
    );
  }

  // Already Premium view
  if (firm.is_premium) {
    return (
      <div className="space-y-8 max-w-3xl">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Premium Üyelik</h1>
          <p className="text-sm text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Ayrıcalıklı Paket Bilgileriniz</p>
        </div>

        {/* Success Card */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-200 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">Tebrikler, Premium Paketiniz Aktif!</h2>
              <p className="text-sm text-[#0F172A]/60 mt-0.5">Su Arıtma Rehberi ayrıcalıklarının keyfini çıkarıyorsunuz.</p>
            </div>
          </div>

          {/* Expiry Info */}
          {firm.premium_until ? (
            <div className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-[11px] font-bold text-[#0F172A]/50 uppercase tracking-wider">Üyelik Bitiş Tarihi</p>
                <p className="text-sm font-bold text-[#0F172A]">
                  {new Date(firm.premium_until).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              {(() => {
                const daysLeft = Math.ceil((new Date(firm.premium_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysLeft <= 0) return <span className="ml-auto text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">Süresi Dolmuş</span>;
                if (daysLeft <= 30) return <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">{daysLeft} gün kaldı</span>;
                return <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{daysLeft} gün kaldı</span>;
              })()}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[11px] font-bold text-[#0F172A]/50 uppercase tracking-wider">Üyelik Durumu</p>
                <p className="text-sm font-bold text-[#0F172A]">Süresiz Premium Üyelik</p>
              </div>
            </div>
          )}

          <div className="border-t border-amber-200/40 pt-6">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider mb-4">Aktif Özellikleriniz:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Öncelikli Listeleme", desc: "Şehir, ilçe ve hizmet sayfalarında en üst sırada çıkarsınız." },
                { title: "İl Geneli Görünürlük", desc: "Premium firmalar seçtikleri ilin TÜM ilçelerinde listelenir. Tek ilçe seçimiyle tüm şehre ulaşın." },
                { title: "Reklamsız Profil Sayfası", desc: "Profil sayfanızda rakip firmaların reklamları gizlenir." },
                { title: "Yorum Yanıtlama Yetkisi", desc: "Müşterilerinizin onaylanmış yorumlarına doğrudan cevap yazabilirsiniz." },
                { title: "PREMİUM Üye Rozeti", desc: "Kartınızda ve profilinizde altın renkli ⭐ rozet gösterilir." },
                { title: "Gelişmiş İletişim Butonları", desc: "Telefon ve yeşil renkli doğrudan WhatsApp butonları aktiftir." },
                { title: "Harita ve Detay Desteği", desc: "Adresinizi harita ve detaylarla zenginleştirirsiniz." },
                { title: "Ürün Kataloğu (10 Ürün)", desc: "10 ürüne kadar fotoğraf, fiyat ve WhatsApp bilgisiyle ürün vitrini oluşturun." },
                { title: "Ürün Lightbox Galerisi", desc: "Profil sayfanızda ürün görselleri tıklayınca büyük açılır." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 bg-white p-4 border border-amber-100 rounded-xl">
                  <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-[#0F172A]">{item.title}</p>
                    <p className="text-[12px] text-[#0F172A]/55 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Showcase Card for Premium Members */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-4">
                🎥 Premium Rehber Videosu
              </span>
              <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-3">
                Premium Ayrıcalıklarını Keşfedin
              </h2>
              <p className="text-sm text-[#0F172A]/60 leading-relaxed font-semibold">
                Premium üyeliğin getirdiği tüm özellikleri nasıl en etkili şekilde kullanabileceğinizi ve rehber üzerinden müşteri potansiyelinizi nasıl artıracağınızı bu videodan izleyebilirsiniz.
              </p>
            </div>
            <div className="w-full">
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg border border-[#E2E8F0] bg-black">
                <iframe
                  className="w-full h-full border-0"
                  src="https://www.youtube.com/embed/rO7Kq5En-m0"
                  title="Su Arıtma Rehberi Premium Avantajları"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Premium - Show Upsell / Pricing page
  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Premium Üyelik</h1>
        <p className="text-sm text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Firma Profilinizi Yükseltin ve Satışlarınızı Artırın</p>
      </div>

      {/* Video Showcase Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-4">
              🎥 Premium Tanıtım Videosu
            </span>
            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-3">
              Premium Üyelik Size Neler Kazandırır?
            </h2>
            <p className="text-sm text-[#0F172A]/60 leading-relaxed font-semibold">
              Su Arıtma Rehberi Premium paketiyle nasıl daha fazla müşteriye ulaşabileceğinizi, aramalarda nasıl en üst sırada çıkacağınızı ve tüm ilçelerde görünürlük kazanmanın detaylarını bu tanıtım videosunda izleyebilirsiniz.
            </p>
          </div>
          <div className="w-full">
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg border border-[#E2E8F0] bg-black">
              <iframe
                className="w-full h-full border-0"
                src="https://www.youtube.com/embed/rO7Kq5En-m0"
                title="Su Arıtma Rehberi Premium Avantajları"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Comparison Table Card */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <h3 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-wide">Standart vs Premium</h3>
          </div>
          
          <div className="divide-y divide-[#F1F5F9]">
            {[
              {
                feature: "İl Geneli Görünürlük",
                std: "Sadece seçtiğiniz ilçe",
                prem: "TÜM ilçelerde listelenir",
                isHighlight: true
              },
              {
                feature: "Arama Sıralaması",
                std: "Altta",
                prem: "En üst sırada",
                isHighlight: true
              },
              {
                feature: "Rakip Reklamları",
                std: "Gösterilir",
                prem: "Reklamsız profil",
                isHighlight: false
              },
              {
                feature: "Yorum Yanıtlama",
                std: "Kapalı",
                prem: "Müşteri sorularına yanıt",
                isHighlight: true
              },
              {
                feature: "İletişim Butonları",
                std: "Temel görünüm",
                prem: "Vurgulu WhatsApp + Arama",
                isHighlight: false
              },
              {
                feature: "Kart Rozeti",
                std: "Yok",
                prem: "⭐ Premium rozet",
                isHighlight: false
              },
              {
                feature: "Ürün Kataloğu",
                std: "Kapalı",
                prem: "10 ürün + Lightbox",
                isHighlight: true
              }
            ].map((row, idx) => (
              <div key={idx} className="px-5 py-3 grid grid-cols-3 gap-2">
                <div className="text-[13px] font-bold text-[#0F172A]">{row.feature}</div>
                <div className="text-[12px] text-[#0F172A]/40 font-medium text-center flex items-center justify-center">{row.std}</div>
                <div className={`text-[12px] font-bold text-center flex items-center justify-center ${row.isHighlight ? "text-[#0EA5E9]" : "text-[#0F172A]/70"}`}>{row.prem}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Coffee Math Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl px-5 py-3 flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <p className="text-sm font-extrabold text-[#0F172A]">4 Kahve Parasına Yeni Müşteriler Edinmek İster misin?</p>
              <p className="text-[13px] text-[#0F172A]/60 font-semibold">Günde sadece <span className="text-amber-600 font-extrabold">₺29.7</span> — <span className="text-amber-700 font-extrabold">4 kahve parasına</span> tüm ay premium!</p>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Monthly */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex flex-col gap-4 relative">
              <span className="text-[11px] font-black text-[#0F172A]/40 bg-[#F1F5F9] px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start">
                Aylık
              </span>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-[#0F172A] tracking-tight">₺890</span>
                  <span className="text-[13px] font-bold text-[#0F172A]/40">/ay</span>
                </div>
                <p className="text-[12px] text-[#0F172A]/45 font-medium mt-1">Esnek ödeme, istediğiniz zaman iptal.</p>
              </div>
              <div className="border-t border-[#F1F5F9] pt-3 space-y-1.5">
                <p className="text-[12px] text-[#0F172A]/55 font-semibold flex items-center gap-1.5"><span className="text-amber-500">★</span> Tüm Premium özellikler</p>
                <p className="text-[12px] text-[#0F172A]/55 font-semibold flex items-center gap-1.5"><span className="text-amber-500">★</span> İstediğiniz zaman iptal</p>
                <p className="text-[12px] text-[#0F172A]/55 font-semibold flex items-center gap-1.5"><span className="text-amber-500">★</span> 7/24 destek</p>
              </div>
              <a
                href="https://wa.me/905345957147?text=Merhaba%2C%20Ayl%C4%B1k%20Premium%20%C3%BCyelik%20(890%E2%82%BA)%20sat%C4%B1n%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-[13px] font-bold rounded-xl transition-all cursor-pointer"
              >
                Aylık Satın Al
              </a>
            </div>

            {/* Annual — Featured */}
            <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 flex flex-col gap-4 relative shadow-lg shadow-amber-500/10">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                En Popüler
              </div>
              <div className="mt-1">
                <span className="text-[11px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start">
                  Yıllık
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-[#0F172A] tracking-tight">₺7.900</span>
                  <span className="text-[13px] font-bold text-[#0F172A]/40">/yıl</span>
                </div>
                <p className="text-[12px] font-bold text-emerald-600 mt-1">%26 tasarruf <span className="text-[#0F172A]/40 font-medium">(₺658/ay)</span></p>
              </div>
              <div className="border-t border-amber-100 pt-3 space-y-1.5">
                <p className="text-[12px] text-[#0F172A]/55 font-semibold flex items-center gap-1.5"><span className="text-amber-500">★</span> Tüm Premium özellikler</p>
                <p className="text-[12px] text-[#0F172A]/55 font-semibold flex items-center gap-1.5"><span className="text-amber-500">★</span> 2 ay bedava!</p>
                <p className="text-[12px] text-[#0F172A]/55 font-semibold flex items-center gap-1.5"><span className="text-amber-500">★</span> Öncelikli destek</p>
              </div>
              <a
                href="https://wa.me/905345957147?text=Merhaba%2C%20Y%C4%B1ll%C4%B1k%20Premium%20%C3%BCyelik%20(7.900%E2%82%BA)%20sat%C4%B1n%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Yıllık Satın Al
              </a>
            </div>

            {/* Lifetime */}
            <div className="bg-gradient-to-b from-[#0F172A] to-[#1E293B] border border-[#334155] rounded-2xl p-5 flex flex-col gap-4 relative">
              <span className="text-[11px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider self-start">
                Yaşam Boyu
              </span>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-2xl font-black text-white tracking-tight">₺19.900</span>
                  <span className="text-[13px] font-bold text-white/40">tek seferlik</span>
                </div>
                <p className="text-[12px] font-bold text-amber-400 mt-1">Bir kere öde, ömür boyu kullan</p>
              </div>
              <div className="border-t border-white/10 pt-3 space-y-1.5">
                <p className="text-[12px] text-white/55 font-semibold flex items-center gap-1.5"><span className="text-amber-400">★</span> Tüm Premium özellikler</p>
                <p className="text-[12px] text-white/55 font-semibold flex items-center gap-1.5"><span className="text-amber-400">★</span> Asla yenileme yok</p>
                <p className="text-[12px] text-white/55 font-semibold flex items-center gap-1.5"><span className="text-amber-400">★</span> VIP destek</p>
                <p className="text-[12px] text-white/55 font-semibold flex items-center gap-1.5"><span className="text-amber-400">★</span> Tüm yeni özelliklerden yararlanma</p>
              </div>
              <a
                href="https://wa.me/905345957147?text=Merhaba%2C%20Ya%C5%9Fam%20Boyu%20Premium%20%C3%BCyelik%20(19.900%E2%82%BA)%20sat%C4%B1n%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white hover:bg-slate-100 text-[#0F172A] text-[13px] font-bold rounded-xl transition-all cursor-pointer"
              >
                Ömür Boyu Satın Al
              </a>
            </div>

          </div>

          {/* WhatsApp Soru */}
          <a
            href="https://wa.me/905345957147?text=Merhaba%2C%20Premium%20%C3%BCyelik%20hakk%C4%B1nda%20soru%20sormak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20BA56] text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Sorularınız için WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

