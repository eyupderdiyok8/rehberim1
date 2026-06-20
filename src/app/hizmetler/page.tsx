import React from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const revalidate = 86400;

export function generateMetadata() {
  return {
    title: "Hizmetler ve İller — Su Arıtma Rehberi",
    description:
      "Türkiye genelinde 81 ilde su arıtma hizmetleri. Şehir ve hizmet türüne göre onaylı firmaları keşfedin.",
    alternates: { canonical: "https://suaritmarehberi.com.tr/hizmetler" },
    openGraph: {
      title: "Hizmetler ve İller — Su Arıtma Rehberi",
      description: "81 ilde su arıtma firmaları ve hizmetleri.",
      url: "https://suaritmarehberi.com.tr/hizmetler",
      siteName: "Su Arıtma Rehberi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function HizmetlerPage() {
  const [{ data: cities }, { data: services }] = await Promise.all([
    supabase
      .from("cities")
      .select("id, name, slug, priority, has_districts")
      .order("priority")
      .order("name"),
    supabase
      .from("services")
      .select("id, name, slug")
      .order("sort_order"),
  ]);

  const citiesList = cities ?? [];
  const servicesList = services ?? [];

  // Group cities by priority
  const tier1 = citiesList.filter((c: any) => c.priority === 1);
  const tier2 = citiesList.filter((c: any) => c.priority === 2);
  const tier3 = citiesList.filter((c: any) => c.priority === 3 || !c.priority);

  // Count firms per city for display
  const { data: firmCounts } = await supabase
    .from("firms")
    .select("city_id")
    .eq("is_active", true);

  const countMap: Record<string, number> = {};
  (firmCounts ?? []).forEach((r: any) => {
    if (r.city_id) countMap[r.city_id] = (countMap[r.city_id] ?? 0) + 1;
  });

  // Service icons map
  const serviceIcons: Record<string, React.ReactNode> = {
    "su-aritma-cihazi": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
    ),
    "su-aritma-filtresi": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
    ),
    "su-aritma-servisi": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    "su-aritma-bakimi": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    ),
    "su-aritma-montaji": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
    ),
    "endustriyel-aritma": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ),
  };

  const defaultIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  );

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Hizmetler ve İller" }]} />

        <div className="mt-6 mb-12">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0EA5E9] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hizmet Bölgeleri
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Hizmetler ve İller
          </h1>
          <p className="mt-4 text-base text-[#0F172A]/65 leading-relaxed max-w-2xl">
            Türkiye genelinde {citiesList.length} ilde su arıtma firmaları ve hizmetleri.
            Şehrinizi ve ihtiyacınız olan hizmeti seçerek onaylı firmaları görüntüleyin.
          </p>
        </div>

        {/* Services Section */}
        <section className="mb-14">
          <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-lg text-[#0F172A]">Hizmet Türleri</h2>
              <p className="text-xs text-[#0F172A]/50 mt-1">
                İhtiyacınız olan hizmet türünü seçin
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {servicesList.map((svc: any) => (
                <a
                  key={svc.id}
                  href={`/istanbul-${svc.slug}-firmalari`}
                  className="group flex items-center gap-3 border border-[#E2E8F0] rounded-xl p-4 hover:border-[#0EA5E9]/40 hover:bg-sky-50/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white group-hover:border-[#0EA5E9] transition-colors shrink-0">
                    {serviceIcons[svc.slug] || defaultIcon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">
                      {svc.name}
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] font-medium">
                      Tüm illerde firmalar →
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Tier 1 Cities — Major */}
        {tier1.length > 0 && (
          <section className="mb-14">
            <h2 className="font-extrabold text-lg text-[#0F172A] mb-2">Büyük Şehirler</h2>
            <p className="text-xs text-[#0F172A]/50 mb-5">En çok firma bulunan iller</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tier1.map((city: any) => (
                <CityCard
                  key={city.id}
                  city={city}
                  services={servicesList}
                  firmCount={countMap[city.id] ?? 0}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* Tier 2 Cities */}
        {tier2.length > 0 && (
          <section className="mb-14">
            <h2 className="font-extrabold text-lg text-[#0F172A] mb-2">Öne Çıkan İller</h2>
            <p className="text-xs text-[#0F172A]/50 mb-5">Aktif su arıtma firmaları bulunan iller</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {tier2.map((city: any) => (
                <CityCard
                  key={city.id}
                  city={city}
                  services={servicesList}
                  firmCount={countMap[city.id] ?? 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tier 3 Cities — All Others */}
        {tier3.length > 0 && (
          <section className="mb-14">
            <h2 className="font-extrabold text-lg text-[#0F172A] mb-2">Diğer İller</h2>
            <p className="text-xs text-[#0F172A]/50 mb-5">Türkiye genelinde tüm iller</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {tier3.map((city: any) => {
                const defaultSvc = servicesList[0]?.slug ?? "su-aritma-cihazi";
                return (
                  <a
                    key={city.id}
                    href={`/${city.slug}-${defaultSvc}-firmalari`}
                    className="group text-xs font-semibold text-[#0F172A]/70 hover:text-[#0EA5E9] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-center hover:border-[#0EA5E9]/30 hover:bg-sky-50/50 transition-all"
                  >
                    {city.name}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Access Grid: Cities x Services */}
        <section className="mb-12">
          <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-lg text-[#0F172A]">Hızlı Erişim</h2>
              <p className="text-xs text-[#0F172A]/50 mt-1">
                Şehir × Hizmet kombinasyonu ile firmaları bulun
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-white">
                    <th className="p-3 border border-[#E2E8F0] text-left font-bold text-[#0F172A] uppercase tracking-wider min-w-[140px]">
                      İl
                    </th>
                    {servicesList.map((svc: any) => (
                      <th key={svc.id} className="p-3 border border-[#E2E8F0] text-center font-bold text-[#0F172A] uppercase tracking-wider whitespace-nowrap">
                        {svc.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {citiesList.slice(0, 20).map((city: any, idx: number) => (
                    <tr key={city.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                      <td className="p-3 border border-[#E2E8F0] font-bold text-[#0F172A]">
                        {city.name}
                      </td>
                      {servicesList.map((svc: any) => (
                        <td key={svc.id} className="p-3 border border-[#E2E8F0] text-center">
                          <a
                            href={`/${city.slug}-${svc.slug}-firmalari`}
                            className="inline-flex items-center justify-center w-6 h-6 rounded bg-sky-50 text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white transition-colors"
                            title={`${city.name} ${svc.name}`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {citiesList.length > 20 && (
              <div className="px-6 py-3 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
                <p className="text-xs text-[#94A3B8]">
                  Yukarıda ilk 20 il gösterilmektedir. Tüm illeri görmek için yukarıdaki bölümlere göz atın.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ─── City Card Sub-component ─── */
function CityCard({
  city,
  services,
  firmCount,
  featured = false,
}: {
  city: { id: string; name: string; slug: string };
  services: any[];
  firmCount: number;
  featured?: boolean;
}) {
  const defaultSvc = services[0]?.slug ?? "su-aritma-cihazi";

  return (
    <div className={`border border-[#E2E8F0] rounded-xl overflow-hidden hover:border-[#0EA5E9]/30 transition-all ${featured ? "sm:col-span-1" : ""}`}>
      <a
        href={`/${city.slug}-${defaultSvc}-firmalari`}
        className="block px-4 py-3 bg-white hover:bg-sky-50/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-[#0F172A] group-hover:text-[#0EA5E9] ${featured ? "text-base" : "text-sm"}`}>
            {city.name}
          </h3>
          {firmCount > 0 && (
            <span className="text-[10px] font-bold text-[#0EA5E9] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
              {firmCount} firma
            </span>
          )}
        </div>
      </a>
      {featured && services.length > 0 && (
        <div className="px-4 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap gap-1">
          {services.slice(0, 4).map((svc: any) => (
            <a
              key={svc.slug}
              href={`/${city.slug}-${svc.slug}-firmalari`}
              className="text-[10px] font-semibold text-[#64748B] hover:text-[#0EA5E9] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded transition-colors"
            >
              {svc.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
