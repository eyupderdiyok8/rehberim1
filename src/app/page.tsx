import React from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import FirmCard from "@/components/FirmCard";
import BannerSlot from "@/components/BannerSlot";
import BannerPlaceholder from "@/components/BannerPlaceholder";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    title: "Su Arıtma Firmaları, Fiyatları ve Gerçek Yorumlar — Su Arıtma Rehberi",
    description: "Türkiye genelinde onaylı su arıtma bayileri, şeffaf fiyat karşılaştırması ve müşteri yorumları tek adreste.",
    alternates: {
      canonical: "https://suaritmarehberi.com.tr/",
    },
    openGraph: {
      title: "Su Arıtma Firmaları, Fiyatları ve Gerçek Yorumlar — Su Arıtma Rehberi",
      description: "Türkiye genelinde onaylı su arıtma bayileri, şeffaf fiyat karşılaştırması ve müşteri yorumları tek adreste.",
      url: "https://suaritmarehberi.com.tr/",
      siteName: "Su Arıtma Rehberi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function Home() {
  // Fetch all data concurrently
  const [
    { data: cities },
    { data: services },
    { data: firms },
    { data: firmCityIds },
    { data: districts },
  ] = await Promise.all([
    supabase
      .from("cities")
      .select("id, name, slug, priority")
      .order("priority")
      .order("name"),
    supabase
      .from("services")
      .select("id, name, slug")
      .order("sort_order"),
    supabase
      .from("firms")
      .select(`
        id, name, slug, rating, review_count,
        is_premium, is_verified, address, logo_url, description, phone,
        city:cities(name),
        district:districts(name),
        firm_services(
          price_min, price_max,
          service:services(name, slug)
        )
      `)
      .eq("is_active", true)
      .order("is_premium", { ascending: false })
      .order("rating", { ascending: false })
      .order("review_count", { ascending: false })
      .limit(6),
    // For city firm counts
    supabase
      .from("firms")
      .select("city_id")
      .eq("is_active", true),
    // All districts for search
    supabase
      .from("districts")
      .select("id, name, slug, city_id"),
  ]);

  const citiesList = cities ?? [];
  const servicesList = services ?? [];
  const firmsList = firms ?? [];
  const districtsList = districts ?? [];

  // Only show Tier 1 cities in the popular cities bar
  const popularCities = citiesList.filter((c: any) => c.priority === 1);

  // Prioritize big cities first, then sort remainder alphabetically
  const prioritizedSlugs = ["istanbul", "izmir", "ankara", "bursa", "antalya"];
  popularCities.sort((a: any, b: any) => {
    const idxA = prioritizedSlugs.indexOf(a.slug);
    const idxB = prioritizedSlugs.indexOf(b.slug);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name, "tr");
  });

  // Count firms per city
  const cityCountMap: Record<string, number> = {};
  (firmCityIds ?? []).forEach((row) => {
    if (row.city_id) {
      cityCountMap[row.city_id] = (cityCountMap[row.city_id] ?? 0) + 1;
    }
  });

  // Default service slug for city pill links
  const defaultServiceSlug = servicesList[0]?.slug ?? "su-aritma-cihazi";

  // Price guide — fetch avg prices from firm_services
  const { data: priceData } = await supabase
    .from("firm_services")
    .select("price_min, price_max")
    .not("price_min", "is", null);

  const allPrices = (priceData ?? []).flatMap((p) =>
    [p.price_min, p.price_max].filter(Boolean).map(Number)
  ).sort((a, b) => a - b);

  const avgPrice =
    allPrices.length > 0
      ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
      : 4500;

  // Calculate dynamic segments if we have enough data, else fallback
  let segments = [
    { label: "Temel Sistem", range: "₺2.500 – ₺4.000" },
    { label: "Orta Segment", range: "₺4.000 – ₺8.000" },
    { label: "Premium Sistem", range: "₺8.000+" },
  ];

  if (allPrices.length >= 3) {
    const p33 = allPrices[Math.floor(allPrices.length * 0.33)];
    const p66 = allPrices[Math.floor(allPrices.length * 0.66)];
    const minP = allPrices[0];
    const maxP = allPrices[allPrices.length - 1];
    
    segments = [
      { 
        label: "Temel Sistem", 
        range: `₺${minP.toLocaleString("tr-TR")} – ₺${p33.toLocaleString("tr-TR")}` 
      },
      { 
        label: "Orta Segment", 
        range: `₺${p33.toLocaleString("tr-TR")} – ₺${p66.toLocaleString("tr-TR")}` 
      },
      { 
        label: "Premium Sistem", 
        range: `₺${p66.toLocaleString("tr-TR")} – ₺${maxP.toLocaleString("tr-TR")}` 
      },
    ];
  }

  // Fetch homepage banners
  const [{ data: topBanner }, { data: bottomBanner }] = await Promise.all([
    supabase
      .from("banners")
      .select("*")
      .eq("placement", "homepage_top")
      .eq("is_active", true)
      .lte("starts_at", new Date().toISOString())
      .gte("ends_at", new Date().toISOString())
      .limit(1)
      .maybeSingle(),
    supabase
      .from("banners")
      .select("*")
      .eq("placement", "homepage_bottom")
      .eq("is_active", true)
      .lte("starts_at", new Date().toISOString())
      .gte("ends_at", new Date().toISOString())
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Su arıtma cihazı ne kadar sürede kurulur?", "acceptedAnswer": { "@type": "Answer", "text": "Yetkili firmalar genellikle aynı gün veya ertesi gün kurulum yapmaktadır. Standart bir ev tipi su arıtma cihazı kurulumu ortalama 1-2 saat sürer." } },
            { "@type": "Question", "name": "Filtre değişimi ne sıklıkta yapılmalı?", "acceptedAnswer": { "@type": "Answer", "text": "Ön filtreler 6 ayda bir, ana membran filtre ise kullanım yoğunluğuna göre 1-2 yılda bir değiştirilmelidir. Yetkili servisler periyodik bakım planı sunar." } },
            { "@type": "Question", "name": "Sitenizdeki firmalar güvenilir mi?", "acceptedAnswer": { "@type": "Answer", "text": "Tüm firmalar ekibimiz tarafından onaylandıktan sonra listeye eklenir. Gerçek müşteri yorumları ve puanlama sistemi ile şeffaf bir değerlendirme sunarız." } },
            { "@type": "Question", "name": "Firmalarla iletişim ücretli mi?", "acceptedAnswer": { "@type": "Answer", "text": "Hayır, sitemizdeki tüm firmalarla telefon veya WhatsApp üzerinden doğrudan ve ücretsiz iletişime geçebilirsiniz." } },
            { "@type": "Question", "name": "Su arıtma cihazı fiyatları ne kadar?", "acceptedAnswer": { "@type": "Answer", "text": "Giriş seviyesi sistemler 2.500 TL'den başlarken, premium ters osmoz sistemleri 8.000-15.000 TL aralığındadır." } },
            { "@type": "Question", "name": "Hangi şehirlerde hizmet veriyorsunuz?", "acceptedAnswer": { "@type": "Answer", "text": "Su Arıtma Rehberi olarak Türkiye genelinde 81 il ve 900+ ilçede onaylı firmalar listeliyoruz." } }
          ]
        }) }}
      />
      <Header />

      {/* ── 1. HERO ──────────────────────────────── */}
      <section className="relative bg-[#0F172A] pt-20 pb-24 px-4">
        {/* Subtle geometric accent — not blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-px h-[60%] bg-gradient-to-b from-[#0EA5E9]/40 to-transparent" style={{ right: '18%' }} />
          <div className="absolute bottom-0 left-0 w-[40%] h-px bg-gradient-to-r from-transparent to-[#0EA5E9]/20" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <p className="text-[#0EA5E9] text-xs font-semibold tracking-wide uppercase mb-5">
            Türkiye'nin Su Arıtma Rehberi
          </p>
          <h1 className="text-4xl md:text-[3.5rem] font-bold text-white tracking-tight leading-[1.15] mb-5">
            Su Arıtma Firmaları,<br className="hidden md:block" />
            <span className="text-[#0EA5E9]">Fiyatları</span> ve Gerçek Yorumlar
          </h1>
          <p className="text-base md:text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Türkiye genelinde onaylı su arıtma bayileri, şeffaf fiyat karşılaştırması ve müşteri yorumları tek adreste.
          </p>

          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar cities={citiesList} districts={districtsList} services={servicesList} />
          </div>

          <div className="max-w-2xl mx-auto mb-12 aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
            <iframe
              className="w-full h-full border-0"
              src="https://www.youtube.com/embed/rYT-repwfnU"
              title="Su Arıtma Rehberi Tanıtım Videosu"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Doğrulanmış Firmalar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Gerçek Müşteri Yorumları
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              Ücretsiz İletişim
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. POPULAR CITIES ───────────────────────── */}
      {citiesList.length > 0 && (
        <section className="border-b border-[#E2E8F0] py-4 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-1">
              <span className="text-sm font-bold uppercase tracking-wider text-[#0F172A]/50 whitespace-nowrap shrink-0">
                Popüler İller:
              </span>
              {popularCities.map((city: any) => {
                const count = cityCountMap[city.id] ?? 0;
                return (
                  <a
                    key={city.id}
                    href={`/${city.slug}-${defaultServiceSlug}-firmalari`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E2E8F0] hover:border-[#0EA5E9] bg-white text-sm font-medium text-[#0F172A] transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    <span>{city.name}</span>
                    {count > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] bg-[#F1F5F9] text-[#0F172A]/60">
                        {count.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── BANNER: TOP ──────────────────────────── */}
      <section className="py-6 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {topBanner ? (
            <BannerSlot banner={topBanner} variant="horizontal" />
          ) : (
            <BannerPlaceholder variant="horizontal" />
          )}
        </div>
      </section>

      {/* ── 3. FEATURED FIRMS ───────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Öne Çıkan Firmalar
              </h2>
              <p className="text-[15px] text-[#0F172A]/60 mt-1">
                Kullanıcı değerlendirmeleri ve hizmet kalitesine göre sıralanmıştır.
              </p>
            </div>
            <a
              href={`/istanbul-${defaultServiceSlug}-firmalari`}
              className="text-sm font-bold text-[#0EA5E9] hover:text-[#0284C7] mt-3 md:mt-0 transition-colors"
            >
              Tüm firmaları gör →
            </a>
          </div>

          {firmsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {firmsList.map((firm) => (
                <FirmCard key={firm.id} firm={firm} />
              ))}
            </div>
          ) : (
            /* Empty state — shown until firms are added to Supabase */
            <div className="text-center py-16 border border-dashed border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
              <p className="text-sm font-semibold text-[#0F172A]">
                Henüz firma kaydı bulunmuyor.
              </p>
              <p className="text-xs text-[#0F172A]/55 mt-1">
                Supabase'e firma ekledikten sonra burası otomatik olarak dolacaktır.
              </p>
              <a
                href="#"
                className="mt-4 inline-block bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold px-5 py-2 rounded transition-colors duration-150"
              >
                Firma Ekle
              </a>
            </div>
          )}
        </div>
      </section>



      {/* ── 4. HOW IT WORKS ─────────────────────────── */}
      <section className="py-20 px-4 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
              Nasıl Çalışır?
            </h2>
            <p className="text-sm text-[#0F172A]/55 mt-2">3 adımda su arıtma firmanızı bulun.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-px bg-[#E2E8F0] rounded-lg overflow-hidden border border-[#E2E8F0]">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                ),
                num: "01",
                step: "Şehrinizi Seçin",
                desc: "Bulunduğunuz ili veya ilçeyi belirterek size en yakın yetkili su arıtma bayilerini saniyeler içinde listeleyin.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" />
                ),
                num: "02",
                step: "Karşılaştırma Yapın",
                desc: "Gerçek müşteri yorumlarına, hizmet puanlarına ve sunulan garantilere bakarak firmalar arasında güvenle karşılaştırma yapın.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                ),
                num: "03",
                step: "Firmayla İletişime Geçin",
                desc: "Beğendiğiniz su arıtma firmasına telefon veya WhatsApp üzerinden anında ulaşın, doğrudan profesyonellerle görüşün.",
              },
            ].map(({ icon, num, step, desc }) => (
              <div key={num} className="bg-white p-8 flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-xs font-bold text-[#0EA5E9] tracking-wider">{num}</span>
                  <div className="w-10 h-10 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]/70">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                  </div>
                </div>
                <h3 className="font-bold text-base text-[#0F172A] mb-2">{step}</h3>
                <p className="text-[15px] text-[#0F172A]/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. PRICE GUIDE TEASER ───────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug mb-4">
              Şehrinizde Su Arıtma Cihazı Ne Kadar?
            </h2>
            <p className="text-[15px] text-[#0F172A]/65 leading-relaxed mb-2">
              Güncel piyasa ortalamalarını inceleyin. Cihaz kapasitesine ve
              filtre kalitesine göre fiyatlar değişkenlik göstermektedir.
            </p>
            {allPrices.length > 0 && (
              <p className="text-xs text-[#0F172A]/45 mb-6">
                Rehberdeki firma verilerinden hesaplanmıştır. Ortalama:{" "}
                <strong className="text-[#0F172A]/70">
                  ₺{avgPrice.toLocaleString("tr-TR")}
                </strong>
              </p>
            )}
            <a
              href={`/istanbul-${defaultServiceSlug}-fiyatlari`}
              className="text-[#0EA5E9] hover:text-[#0284C7] text-sm font-bold inline-flex items-center gap-1 transition-colors duration-150"
            >
              Tüm fiyatları gör →
            </a>
          </div>

          <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#0F172A]/55">
                    Sistem Sınıfı
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#0F172A]/55 text-right">
                    Ortalama Fiyat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {segments.map((row) => (
                  <tr key={row.label} className="hover:bg-[#F8FAFC] transition-colors duration-100">
                    <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#0F172A] text-right">
                      {row.range}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── BANNER: BOTTOM ───────────────────────── */}
      <section className="py-6 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {bottomBanner ? (
            <BannerSlot banner={bottomBanner} variant="horizontal" />
          ) : (
            <BannerPlaceholder variant="horizontal" />
          )}
        </div>
      </section>

      {/* ── 6. SERVICE LINKS (SEO internal linking) ─── */}
      {servicesList.length > 0 && citiesList.length > 0 && (
        <section className="py-20 px-4 bg-white border-t border-[#E2E8F0]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl font-black text-[#0F172A] mb-8 tracking-tight">
              Tüm İhtiyaçlarınız İçin Hizmet Kategorileri
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {servicesList.map((service) => (
                <a
                  key={service.id}
                  href={`/istanbul-${service.slug}-firmalari`}
                  className="group bg-[#F8FAFC] border border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#0F172A]/70 hover:text-[#0EA5E9] hover:border-[#0EA5E9]/30 transition-colors duration-200"
                >
                  <span className="flex items-center gap-2">
                    {service.name}
                    <svg className="w-3.5 h-3.5 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. SSS (FAQ) ─────────────────────────── */}
      <section className="py-20 px-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#0EA5E9] text-xs font-semibold tracking-wide uppercase mb-3">Merak Edilenler</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">Sık Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Su arıtma cihazı ne kadar sürede kurulur?",
                a: "Yetkili firmalar genellikle aynı gün veya ertesi gün kurulum yapmaktadır. Standart bir ev tipi su arıtma cihazı kurulumu ortalama 1-2 saat sürer."
              },
              {
                q: "Filtre değişimi ne sıklıkta yapılmalı?",
                a: "Ön filtreler 6 ayda bir, ana membran filtre ise kullanım yoğunluğuna göre 1-2 yılda bir değiştirilmelidir. Yetkili servisler periyodik bakım planı sunar."
              },
              {
                q: "Sitenizdeki firmalar güvenilir mi?",
                a: "Tüm firmalar ekibimiz tarafından onaylandıktan sonra listeye eklenir. Gerçek müşteri yorumları ve puanlama sistemi ile şeffaf bir değerlendirme sunarız."
              },
              {
                q: "Firmalarla iletişim ücretli mi?",
                a: "Hayır, sitemizdeki tüm firmalarla telefon veya WhatsApp üzerinden doğrudan ve ücretsiz iletişime geçebilirsiniz."
              },
              {
                q: "Su arıtma cihazı fiyatları ne kadar?",
                a: "Giriş seviyesi sistemler 2.500 TL'den başlarken, premium ters osmoz sistemleri 8.000-15.000 TL aralığındadır. Güncel fiyatları sitemizdeki fiyat sayfalarından inceleyebilirsiniz."
              },
              {
                q: "Hangi şehirlerde hizmet veriyorsunuz?",
                a: "Su Arıtma Rehberi olarak Türkiye genelinde 81 il ve 900+ ilçede onaylı firmalar listeliyoruz. Şehirler sayfasından bölgenizdeki firmaları kolayca bulabilirsiniz."
              }
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer text-[15px] font-bold text-[#0F172A] hover:text-[#0EA5E9] transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-[#0F172A]/30 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <p className="px-6 pb-5 text-[15px] text-[#0F172A]/65 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

