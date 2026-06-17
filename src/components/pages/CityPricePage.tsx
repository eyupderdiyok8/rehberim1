import React from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import SeoSidebar from "@/components/SeoSidebar";
import BannerSlot from "@/components/BannerSlot";
import BannerPlaceholder from "@/components/BannerPlaceholder";
import ProgrammaticSeoBlock from "@/components/ProgrammaticSeoBlock";

interface PageUrl {
  city_id: string;
  service_id: string;
  city: { name: string; slug: string };
  service: { name: string; slug: string };
  seo_content?: any;
  faqs?: any[];
}

interface Props {
  pageUrl: PageUrl;
  firms: any[];
  sidebarBanner?: any;
  recentReviews?: any[];
}

const ALL_SERVICES = [
  { name: "Su Arıtma Cihazı",   slug: "su-aritma-cihazi" },
  { name: "Su Arıtma Filtresi", slug: "su-aritma-filtresi" },
  { name: "Su Arıtma Servisi",  slug: "su-aritma-servisi" },
  { name: "Su Arıtma Bakımı",   slug: "su-aritma-bakimi" },
  { name: "Su Arıtma Montajı",  slug: "su-aritma-montaji" },
  { name: "Endüstriyel Arıtma", slug: "endustriyel-aritma" },
];

const ALL_CITIES = [
  { name: "İstanbul",  slug: "istanbul" },
  { name: "İzmir",     slug: "izmir" },
  { name: "Ankara",    slug: "ankara" },
  { name: "Bursa",     slug: "bursa" },
  { name: "Antalya",   slug: "antalya" },
  { name: "Adana",     slug: "adana" },
  { name: "Kocaeli",   slug: "kocaeli" },
  { name: "Tekirdağ",  slug: "tekirdag" },
];

const PRICE_TIERS = [
  { label: "Giriş Seviyesi",  range: [2500,  4000] },
  { label: "Orta Segment",    range: [4000,  8000] },
  { label: "Premium Segment", range: [8000, 15000] },
];

export default async function CityPricePage({ pageUrl, firms, sidebarBanner, recentReviews }: Props) {
  // Fetch districts for inline cross-links
  const { data: districts } = await supabase
    .from("districts")
    .select("name, slug")
    .eq("city_id", pageUrl.city_id)
    .order("name");

  // Derive stats from real firm data (fallback to defaults)
  const allPrices: number[] = [];
  firms.forEach((f) =>
    f.firm_services?.forEach((fs: any) => {
      if (fs.price_min) allPrices.push(Number(fs.price_min));
      if (fs.price_max) allPrices.push(Number(fs.price_max));
    })
  );

  const minPrice = allPrices.length ? Math.min(...allPrices) : 2500;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 15000;
  const avgPrice = allPrices.length
    ? Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
    : 5500;

  const relatedServices = ALL_SERVICES
    .filter((s) => s.slug !== pageUrl.service.slug)
    .map((s) => ({
      label: `${pageUrl.city.name} ${s.name} Fiyatları`,
      href: `/${pageUrl.city.slug}-${s.slug}-fiyatlari`,
    }));

  const relatedCities = ALL_CITIES
    .filter((c) => c.slug !== pageUrl.city.slug)
    .slice(0, 6)
    .map((c) => ({
      label: `${c.name} ${pageUrl.service.name} Fiyatları`,
      href: `/${c.slug}-${pageUrl.service.slug}-fiyatlari`,
    }));

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: pageUrl.city.name, href: `/${pageUrl.city.slug}-${pageUrl.service.slug}-firmalari` },
            { label: `${pageUrl.service.name} Fiyatları` },
          ]}
        />

        {/* Top Banner */}
        <div className="mb-8">
          <BannerPlaceholder variant="horizontal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-10">
            {/* Title */}
            <div className="border-b border-[#E2E8F0] pb-6">
              <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                {pageUrl.city.name} {pageUrl.service.name} Fiyatları
              </h1>
              <p className="text-sm text-[#0F172A]/60 leading-relaxed">
                {pageUrl.city.name} bölgesinde{" "}
                {pageUrl.service.name.toLowerCase()} için güncel fiyat aralıkları,
                marka karşılaştırmaları ve onaylı firmalar.
              </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "En Düşük Fiyat",   value: `₺${minPrice.toLocaleString("tr-TR")}` },
                { label: "Ortalama Fiyat",    value: `₺${avgPrice.toLocaleString("tr-TR")}` },
                { label: "En Yüksek Fiyat",   value: `₺${maxPrice.toLocaleString("tr-TR")}+` },
              ].map((stat) => (
                <div key={stat.label} className="border border-[#E2E8F0] rounded-lg p-5 bg-[#F8FAFC]">
                  <p className="text-[10px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-extrabold text-[#0F172A]">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Tier table */}
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">
                Sistem Sınıfına Göre Fiyatlar
              </h2>
              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#0F172A]/50">
                        Sistem Sınıfı
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#0F172A]/50 text-right">
                        Fiyat Aralığı
                      </th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#0F172A]/50 text-right hidden md:table-cell">
                        Kimler İçin?
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {PRICE_TIERS.map((tier) => (
                      <tr key={tier.label} className="hover:bg-[#F8FAFC] transition-colors duration-100">
                        <td className="px-6 py-4 text-sm font-semibold text-[#0F172A]">
                          {tier.label}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#0F172A] text-right">
                          ₺{tier.range[0].toLocaleString("tr-TR")} –{" "}
                          {tier.range[1] >= 15000
                            ? "₺15.000+"
                            : `₺${tier.range[1].toLocaleString("tr-TR")}`}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#0F172A]/50 text-right hidden md:table-cell">
                          {tier.label === "Giriş Seviyesi"
                            ? "Kiracılar, tek kişilik ev"
                            : tier.label === "Orta Segment"
                            ? "Aile kullanımı, orta TDS"
                            : "Yüksek TDS, endüstriyel"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* What affects price */}
            <div className="border-t border-[#E2E8F0] pt-8">
              <h2 className="text-lg font-extrabold text-[#0F172A] mb-4">
                {pageUrl.city.name}'da {pageUrl.service.name} Fiyatını Etkileyen Faktörler
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Filtre Aşama Sayısı",
                    desc: "5, 6 veya 8 aşamalı sistemler farklı fiyatlanır. Aşama arttıkça maliyet ve temizleme kalitesi yükselir.",
                  },
                  {
                    title: "Membran Markası",
                    desc: "Filmtec (Dow), Vontron ve CSM gibi markalar farklı debi ve ömür değerlerine sahiptir.",
                  },
                  {
                    title: "Tank Kapasitesi",
                    desc: "3.2 galon ile 6 galon tank arasında fiyat farkı oluşabilir. Büyük aile evleri için 6 galon önerilir.",
                  },
                  {
                    title: "Montaj ve İşçilik",
                    desc: `${pageUrl.city.name} genelinde montaj ücreti ₺300–₺800 arasında değişmektedir. Bazı firmalar ücretsiz montaj sunar.`,
                  },
                ].map((item) => (
                  <div key={item.title} className="border border-[#E2E8F0] rounded-lg p-5">
                    <h3 className="text-sm font-bold text-[#0F172A] mb-1.5">{item.title}</h3>
                    <p className="text-xs text-[#0F172A]/60 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to firms */}
            <div className="border border-[#E2E8F0] rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F8FAFC]">
              <div>
                <p className="font-bold text-[#0F172A] text-sm">
                  {pageUrl.city.name}'da {pageUrl.service.name} Firmaları
                </p>
                <p className="text-xs text-[#0F172A]/55 mt-0.5">
                  Onaylı firmalar arasında karşılaştırma yapın, teklif alın.
                </p>
              </div>
              <a
                href={`/${pageUrl.city.slug}-${pageUrl.service.slug}-firmalari`}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold px-5 py-2.5 rounded transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Firmaları Gör →
              </a>
            </div>

            <ProgrammaticSeoBlock 
              seoContent={pageUrl.seo_content}
              faqs={pageUrl.faqs}
              recentReviews={recentReviews}
              regionName={pageUrl.city.name}
            />

            {/* District price links (internal linking SEO) */}
            {districts && districts.length > 0 && (
              <div className="pt-8 border-t border-[#E2E8F0]">
                <h2 className="text-base font-bold text-[#0F172A] mb-4">
                  {pageUrl.city.name} İlçelerinde {pageUrl.service.name} Fiyatları
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {districts.map((d: any) => (
                    <a
                      key={d.slug}
                      href={`/${d.slug}-${pageUrl.service.slug}-fiyatlari`}
                      className="text-xs text-[#0F172A]/70 hover:text-[#0EA5E9] border border-[#E2E8F0] px-3 py-2 transition-colors duration-150 font-medium"
                    >
                      {d.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {sidebarBanner ? (
              <BannerSlot banner={sidebarBanner} variant="sidebar" />
            ) : (
              <BannerPlaceholder variant="sidebar" />
            )}
            <SeoSidebar
              currentLabel={`${pageUrl.city.name} ${pageUrl.service.name} Fiyatları`}
              relatedServices={relatedServices}
              relatedCities={relatedCities}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

