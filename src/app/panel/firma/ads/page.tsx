"use client";

import React from "react";

const AD_SPACES = [
  {
    key: "homepage_top",
    title: "Ana Sayfa — Üst Alan",
    location: "Ana sayfa, Öne Çıkan Firmalar ile Nasıl Çalışır bölümü arasında",
    format: "Yatay Banner",
    size: "Görsel: 200 × 200 px (Kare / Logo)",
    description: "Siteye ilk girişte görünen en değerli reklam alanıdır. Tüm ziyaretçilere ulaşır, marka bilinirliği için idealdir.",
    visibility: "Tüm ziyaretçiler",
    badge: "En Popüler",
    badgeColor: "bg-red-50 text-red-600 border-red-150",
  },
  {
    key: "homepage_bottom",
    title: "Ana Sayfa — Alt Alan",
    location: "Ana sayfa, Fiyat Rehberi ile Hizmet Kategorileri arasında",
    format: "Yatay Banner",
    size: "Görsel: 200 × 200 px (Kare / Logo)",
    description: "Fiyat araştırması yapan bilinçli tüketicilere ulaşır. Karar aşamasındaki kullanıcılara yönelik etkili bir alandır.",
    visibility: "Tüm ziyaretçiler",
    badge: "Yüksek Dönüşüm",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-150",
  },
  {
    key: "firms_list_top",
    title: "Firma Listeleri — Üst",
    location: "Şehir/ilçe firma listeleme sayfalarının en üstünde",
    format: "Yatay Banner",
    size: "Görsel: 200 × 200 px (Kare / Logo)",
    description: "Firma arayan kullanıcıların ilk gördüğü alandır. Belirli bir şehir veya hizmet için hedeflenebilir.",
    visibility: "Şehir/hizmet arayan kullanıcılar",
    badge: "Hedeflenebilir",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-150",
  },
  {
    key: "firms_list_mid",
    title: "Firma Listeleri — Orta",
    location: "Firma kartları listesinin ortasında, kullanıcılar scroll ederken görünür",
    format: "Yatay Banner",
    size: "Görsel: 200 × 200 px (Kare / Logo)",
    description: "Kullanıcılar firma karşılaştırması yaparken dikkat çeker. Scroll sırasında doğal bir duraklama noktası oluşturur.",
    visibility: "Şehir/hizmet arayan kullanıcılar",
    badge: null,
    badgeColor: "",
  },
  {
    key: "price_sidebar",
    title: "Fiyat Sayfaları — Yan Menü",
    location: "Şehir/ilçe fiyat sayfalarının sağ yan menüsünde",
    format: "Sidebar Kart",
    size: "Görsel: 600 × 450 px (4:3 Oranında)",
    description: "Fiyat araştırması yapan ve bütçe karşılaştıran kullanıcılara ulaşır. Satın alma niyeti yüksek bir kitle.",
    visibility: "Fiyat araştıran kullanıcılar",
    badge: "Satın Alma Niyeti Yüksek",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-150",
  },
  {
    key: "blog_sidebar",
    title: "Blog Listesi — Üst Alan",
    location: "Blog ana sayfasında, yazı listelerinin üstünde",
    format: "Yatay Banner",
    size: "Görsel: 200 × 200 px (Kare / Logo)",
    description: "İçerik tüketen, bilgi arayan kullanıcılara ulaşır. Eğitim ve bilinçlendirme odaklı reklamlar için idealdir.",
    visibility: "Blog okuyucuları",
    badge: null,
    badgeColor: "",
  },
  {
    key: "blog_post_bottom",
    title: "Blog Yazısı — Alt",
    location: "Blog yazılarının sonunda, yazar kartının altında",
    format: "Inline Banner",
    size: "Görsel: 200 × 200 px (Kare / Logo)",
    description: "Yazıyı sonuna kadar okuyan ilgili kullanıcılara ulaşır. İçerik bağlamına uygun teklifler için etkili.",
    visibility: "Aktif okuyucular",
    badge: null,
    badgeColor: "",
  },
  {
    key: "firm_profile_sidebar",
    title: "Firma Profili — Yan Menü",
    location: "Standart (non-premium) firma profil sayfalarının sağ menüsünde",
    format: "Sidebar Kart",
    size: "Görsel: 600 × 450 px (4:3 Oranında)",
    description: "Rakip firma profillerini inceleyen kullanıcılara ulaşır. Karşılaştırma aşamasındaki karar vericilere hitap eder.",
    visibility: "Firma profili ziyaretçileri",
    badge: "Rakip Hedefleme",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-150",
  },
];

export default function FirmAdsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Reklam Alanları</h1>
        <p className="text-sm text-[#0F172A]/50 font-semibold mt-1 uppercase tracking-wider">
          Su Arıtma Rehberi&apos;de Markanızı Görünür Kılın
        </p>
      </div>

      {/* Intro Card */}
      <div className="bg-gradient-to-r from-[#0EA5E9]/5 via-[#0EA5E9]/3 to-white border border-[#0EA5E9]/15 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0EA5E9] flex items-center justify-center shrink-0 shadow-md shadow-sky-500/10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.833c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0F172A] mb-1">Su Arıtma Sektörünün En Hedefli Reklam Ağı</h2>
            <p className="text-sm text-[#0F172A]/60 leading-relaxed">
              Su Arıtma Rehberi, Türkiye genelinde su arıtma cihazı arayan binlerce kullanıcıyı firmalarla buluşturuyor.
              Reklam alanlarımız, tam olarak doğru kitleye — cihaz satın almak üzere olan, aktif arama yapan
              kullanıcılara — ulaşmanızı sağlar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#0EA5E9]/10">
          {[
            { icon: "👥", label: "Aktif Kullanıcı", value: "Aylık binlerce ziyaretçi" },
            { icon: "🎯", label: "Hedefleme", value: "Şehir, hizmet ve sayfa bazlı" },
            { icon: "📊", label: "8 Farklı Alan", value: "Her ihtiyaca uygun format" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
              <span className="text-lg">{stat.icon}</span>
              <p className="text-xs font-bold text-[#0F172A]/40 uppercase tracking-wider mt-2">{stat.label}</p>
              <p className="text-base font-bold text-[#0F172A]">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Spaces Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-[#0F172A] uppercase tracking-wider">Mevcut Reklam Alanları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AD_SPACES.map((space) => (
            <div
              key={space.key}
              className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#0EA5E9]/30 hover:shadow-sm transition-all duration-200 group"
            >
              {/* Visual mockup */}
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-4 relative">
                {space.format === "Yatay Banner" ? (
                  <div className="border border-dashed border-[#CBD5E1] rounded-lg bg-white px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#E2E8F0] shrink-0" />
                      <div>
                        <div className="h-2 bg-[#E2E8F0] rounded w-6 mb-1" />
                        <div className="h-2.5 bg-[#E2E8F0] rounded w-24" />
                      </div>
                    </div>
                    <div className="h-2 bg-[#E2E8F0] rounded w-8" />
                  </div>
                ) : space.format === "Sidebar Kart" ? (
                  <div className="max-w-[140px] mx-auto">
                    <div className="border border-dashed border-[#CBD5E1] rounded-lg bg-white overflow-hidden">
                      <div className="aspect-[4/3] bg-[#E2E8F0] flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#CBD5E1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                      <div className="p-2">
                        <div className="h-1.5 bg-[#E2E8F0] rounded w-8 mb-1" />
                        <div className="h-2 bg-[#E2E8F0] rounded w-full mb-1" />
                        <div className="h-1.5 bg-[#E2E8F0] rounded w-10" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#CBD5E1] rounded-lg bg-white px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#E2E8F0] shrink-0" />
                    <div className="flex-1">
                      <div className="h-1.5 bg-[#E2E8F0] rounded w-8 mb-1" />
                      <div className="h-2 bg-[#E2E8F0] rounded w-3/4" />
                    </div>
                  </div>
                )}
                {/* Format label */}
                <span className="absolute top-2 right-2 text-[10px] font-bold text-[#0F172A]/30 uppercase tracking-wider">
                  {space.format}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-extrabold text-[#0F172A] leading-snug">{space.title}</h4>
                  {space.badge && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border whitespace-nowrap shrink-0 ${space.badgeColor}`}>
                      {space.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#0F172A]/55 leading-relaxed">{space.description}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-[#0F172A]/30 uppercase tracking-wider">Ölçüler</span>
                    <p className="text-xs text-[#0EA5E9] font-bold">{space.size}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#0F172A]/30 uppercase tracking-wider">Konum</span>
                    <p className="text-xs text-[#0F172A]/60 font-medium">{space.location}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#0F172A]/30 uppercase tracking-wider">Hedef Kitle</span>
                    <p className="text-xs text-[#0F172A]/60 font-medium">{space.visibility}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <h3 className="font-extrabold text-base text-[#0F172A] uppercase tracking-wide">Fiyatlandırma & Süreç</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Alan Seçimi",
                desc: "Hedef kitlenize ve bütçenize uygun reklam alanını belirleyin. Şehir veya hizmet bazlı hedefleme mümkündür.",
              },
              {
                step: "02",
                title: "Teklif & Onay",
                desc: "WhatsApp veya e-posta ile iletişime geçin. Teklifinizi alın, görselinizi ve linklerinizi gönderin.",
              },
              {
                step: "03",
                title: "Yayına Alma",
                desc: "Reklamınız belirlenen tarihlerde aktif olur. Süre sonunda otomatik sona erer, yenileme opsiyonludur.",
              },
            ].map((item) => (
              <div key={item.step} className="relative pl-8">
                <span className="absolute left-0 top-0 text-sm font-black text-[#0EA5E9]">{item.step}</span>
                <h4 className="text-base font-bold text-[#0F172A] mb-1">{item.title}</h4>
                <p className="text-sm text-[#0F172A]/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="border-t border-[#E2E8F0] pt-5 space-y-3">
            <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Bilmeniz Gerekenler</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "📅", text: "Minimum yayın süresi 7 gündür" },
                { icon: "🎨", text: "Banner görselini siz sağlarsınız (JPG/PNG, max 5 MB)" },
                { icon: "🔄", text: "Yayın süresi sonunda otomatik sona erer" },
                { icon: "📊", text: "Şehir bazlı hedefleme ile bütçenizi optimize edin" },
                { icon: "🚫", text: "Premium firmaların profil sayfalarında rakip reklamı gösterilmez" },
                { icon: "💰", text: "Fiyatlar alan, süre ve hedeflemeye göre değişir" },
              ].map((note) => (
                <div key={note.text} className="flex items-start gap-2.5">
                  <span className="text-sm shrink-0">{note.icon}</span>
                  <p className="text-sm text-[#0F172A]/60 font-medium leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-8 text-center space-y-5">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Reklam Vermeye Hazır mısınız?</h3>
          <p className="text-sm text-white/50 mt-2 max-w-md mx-auto">
            Hemen iletişime geçin, hedef kitlenize en uygun alanı birlikte belirleyelim.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="https://wa.me/905345957147?text=Merhaba%2C%20Su%20Ar%C4%B1tma%20Rehberi%27nde%20reklam%20vermek%20istiyorum.%20Reklam%20alanlar%C4%B1%20hakk%C4%B1nda%20bilgi%20alabilir%20miyim%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BA56] text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp ile Teklif Al
          </a>
          <a
            href="mailto:eyupder@gmail.com?subject=Reklam%20Teklifi%20Talebi%20-%20Su%20Ar%C4%B1tma%20Rehberi"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:bg-white/10 text-white text-sm font-bold rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            E-posta ile Talep Gönder
          </a>
        </div>
      </div>
    </div>
  );
}
