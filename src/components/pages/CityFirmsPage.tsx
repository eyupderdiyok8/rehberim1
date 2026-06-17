import React from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import AdvancedFirmList from "@/components/AdvancedFirmList";
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
  banner?: any;
  midBanner?: any;
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

export default async function CityFirmsPage({ pageUrl, firms, banner, midBanner, recentReviews }: Props) {
  // Fetch districts for this city for sidebar links
  const { data: districts } = await supabase
    .from("districts")
    .select("name, slug")
    .eq("city_id", pageUrl.city_id)
    .order("name");

  const relatedServices = ALL_SERVICES
    .filter((s) => s.slug !== pageUrl.service.slug)
    .map((s) => ({
      label: s.name,
      href: `/${pageUrl.city.slug}-${s.slug}-firmalari`,
    }));

  const relatedCities = ALL_CITIES
    .filter((c) => c.slug !== pageUrl.city.slug)
    .slice(0, 6)
    .map((c) => ({
      label: c.name,
      href: `/${c.slug}-${pageUrl.service.slug}-firmalari`,
    }));

  const relatedDistricts = (districts ?? []).map((d) => ({
    label: d.name,
    href: `/${d.slug}-${pageUrl.service.slug}-firmalari`,
  }));

  const premiumCount = firms.filter((f) => f.is_premium).length;

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: pageUrl.city.name, href: `/${pageUrl.city.slug}-${pageUrl.service.slug}-firmalari` },
            { label: `${pageUrl.service.name} Firmaları` },
          ]}
        />

        {/* Top Banner */}
        <div className="mb-8">
          {banner ? (
            <BannerSlot banner={banner} variant="horizontal" />
          ) : (
            <BannerPlaceholder variant="horizontal" />
          )}
        </div>

        <div className="flex flex-col gap-10">
          {/* Advanced Firm List with built-in filter sidebar */}
          <AdvancedFirmList
            initialFirms={firms as any}
            availableServices={ALL_SERVICES.map(s => ({ id: s.slug, name: s.name, slug: s.slug }))}
            defaultServiceSlug={pageUrl.service.slug}
            midBanner={midBanner}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            {/* Main content (SEO block + related) */}
            <div className="lg:col-span-3">
              <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight mb-2">
                {pageUrl.city.name} {pageUrl.service.name} Firmaları
              </h1>
              <p className="text-sm text-[#0F172A]/60 leading-relaxed mb-4">
                {pageUrl.city.name} genelinde faaliyet gösteren{" "}
                <strong>{firms.length}</strong> {pageUrl.service.name.toLowerCase()} firması listelenmektedir.
              </p>

              {/* SEO Content Block */}
              <ProgrammaticSeoBlock
                seoContent={pageUrl.seo_content}
                faqs={pageUrl.faqs}
                recentReviews={recentReviews}
                regionName={pageUrl.city.name}
              />

              {/* Related districts internal link block (SEO) */}
              {relatedDistricts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
                  <h2 className="text-base font-extrabold text-[#0F172A] mb-4">
                    {pageUrl.city.name} İlçelerinde {pageUrl.service.name}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {relatedDistricts.map((d) => (
                      <a
                        key={d.href}
                        href={d.href}
                        className="text-xs text-[#0F172A]/70 hover:text-[#0EA5E9] border border-[#E2E8F0] rounded px-3 py-2 transition-colors duration-150 font-medium"
                      >
                        {d.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <BannerPlaceholder variant="sidebar" />
              <SeoSidebar
                currentLabel={`${pageUrl.city.name} ${pageUrl.service.name} Firmaları`}
                relatedServices={relatedServices}
                relatedCities={relatedCities}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

