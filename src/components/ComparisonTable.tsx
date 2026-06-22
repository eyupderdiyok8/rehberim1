import React from "react";
import Image from "next/image";

type MaybeArray<T> = T | T[] | null | undefined;

function unwrap<T>(val: MaybeArray<T>): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

export interface CompareFirm {
  id: string;
  name: string;
  slug: string;
  rating: number;
  review_count: number;
  is_premium: boolean;
  is_verified: boolean;
  logo_url?: string | null;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: MaybeArray<{ name: string }>;
  district?: MaybeArray<{ name: string }>;
  firm_services?: Array<{
    price_min?: number | null;
    price_max?: number | null;
    service: MaybeArray<{ name: string; slug: string }>;
  }>;
}

interface ComparisonTableProps {
  firms: CompareFirm[];
}

export default function ComparisonTable({ firms }: ComparisonTableProps) {
  // Collect all unique services across firms
  const allServiceSlugs = new Map<string, string>();
  firms.forEach((f) => {
    (f.firm_services ?? []).forEach((fs) => {
      const svc = unwrap(fs.service);
      if (svc) allServiceSlugs.set(svc.slug, svc.name);
    });
  });
  const serviceList = Array.from(allServiceSlugs.entries()).map(([slug, name]) => ({ slug, name }));

  // Find best values for highlighting
  const bestRating = Math.max(...firms.map((f) => Number(f.rating) || 0));
  const bestReviews = Math.max(...firms.map((f) => f.review_count || 0));

  // Find lowest price per service
  const lowestPricePerService: Record<string, number> = {};
  serviceList.forEach(({ slug }) => {
    let lowest = Infinity;
    firms.forEach((f) => {
      const fs = (f.firm_services ?? []).find((s) => unwrap(s.service)?.slug === slug);
      if (fs?.price_min && fs.price_min < lowest) lowest = fs.price_min;
    });
    lowestPricePerService[slug] = lowest;
  });

  const formatPrice = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "—";
    if (min && max) return `₺${min.toLocaleString("tr-TR")} – ₺${max.toLocaleString("tr-TR")}`;
    if (min) return `₺${min.toLocaleString("tr-TR")}'den başlayan`;
    return `₺${(max ?? 0).toLocaleString("tr-TR")}'e kadar`;
  };

  const colWidth = firms.length === 2 ? "w-1/2" : "w-1/3";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* Header: Logo + Name */}
        <thead>
          <tr>
            <td className="w-32 sm:w-40 p-4 bg-[#F8FAFC] border border-[#E2E8F0] font-bold text-xs text-[#0F172A] uppercase tracking-wider align-middle">
              Firma
            </td>
            {firms.map((firm) => (
              <td key={firm.id} className={`${colWidth} p-4 bg-[#F8FAFC] border border-[#E2E8F0] text-center align-middle`}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-[#E2E8F0] relative shrink-0">
                    {firm.logo_url ? (
                      <Image src={firm.logo_url} alt={firm.name} fill sizes="56px" className="object-contain p-1" />
                    ) : (
                      <span className="text-sm font-bold text-[#64748B]">
                        {firm.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                      </span>
                    )}
                  </div>
                  <a
                    href={`/firma/${firm.slug}`}
                    className="font-bold text-sm text-[#0F172A] hover:text-[#0EA5E9] transition-colors line-clamp-2"
                  >
                    {firm.name}
                  </a>
                  <div className="flex items-center gap-1">
                    {firm.is_premium && (
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Premium</span>
                    )}
                    {firm.is_verified && (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Onaylı</span>
                    )}
                  </div>
                </div>
              </td>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Rating */}
          <tr>
            <td className="p-4 border border-[#E2E8F0] font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-white">
              Puan
            </td>
            {firms.map((firm) => {
              const r = Number(firm.rating) || 0;
              const isBest = r === bestRating && r > 0 && firms.length > 1;
              return (
                <td key={firm.id} className={`p-4 border border-[#E2E8F0] text-center ${isBest ? "bg-emerald-50/50" : "bg-white"}`}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`text-base ${i <= Math.round(r) ? "text-amber-400" : "text-[#E2E8F0]"}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className={`text-lg font-black ${isBest ? "text-emerald-600" : "text-[#0F172A]"}`}>
                      {r.toFixed(1)}
                    </span>
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Review Count */}
          <tr>
            <td className="p-4 border border-[#E2E8F0] font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-[#F8FAFC]">
              Yorum Sayısı
            </td>
            {firms.map((firm) => {
              const count = firm.review_count || 0;
              const isBest = count === bestReviews && count > 0 && firms.length > 1;
              return (
                <td key={firm.id} className={`p-4 border border-[#E2E8F0] text-center ${isBest ? "bg-emerald-50/50" : "bg-[#F8FAFC]"}`}>
                  <span className={`text-lg font-black ${isBest ? "text-emerald-600" : "text-[#0F172A]"}`}>
                    {count}
                  </span>
                  <span className="text-xs text-[#94A3B8] ml-1">yorum</span>
                </td>
              );
            })}
          </tr>

          {/* Location */}
          <tr>
            <td className="p-4 border border-[#E2E8F0] font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-white">
              Konum
            </td>
            {firms.map((firm) => {
              const city = unwrap(firm.city)?.name;
              const district = unwrap(firm.district)?.name;
              const location = [city, district].filter(Boolean).join(", ");
              return (
                <td key={firm.id} className="p-4 border border-[#E2E8F0] text-center bg-white">
                  <span className="text-sm font-semibold text-[#0F172A]/70">
                    {location || "—"}
                  </span>
                </td>
              );
            })}
          </tr>

          {/* Services & Prices */}
          {serviceList.map(({ slug, name }, idx) => {
            const isEvenRow = idx % 2 === 0;
            return (
              <tr key={slug}>
                <td className={`p-4 border border-[#E2E8F0] font-bold text-xs text-[#0F172A] uppercase tracking-wider ${isEvenRow ? "bg-[#F8FAFC]" : "bg-white"}`}>
                  {name}
                  <span className="block text-[10px] font-medium text-[#94A3B8] normal-case tracking-normal mt-0.5">Fiyat</span>
                </td>
                {firms.map((firm) => {
                  const fs = (firm.firm_services ?? []).find((s) => unwrap(s.service)?.slug === slug);
                  if (!fs) {
                    return (
                      <td key={firm.id} className={`p-4 border border-[#E2E8F0] text-center ${isEvenRow ? "bg-[#F8FAFC]" : "bg-white"}`}>
                        <span className="text-sm text-[#94A3B8]">Hizmet verilmiyor</span>
                      </td>
                    );
                  }
                  const priceVal = fs.price_min ?? fs.price_max;
                  const isBest = priceVal != null && priceVal === lowestPricePerService[slug] && lowestPricePerService[slug] !== Infinity;
                  return (
                    <td key={firm.id} className={`p-4 border border-[#E2E8F0] text-center ${isBest ? "bg-emerald-50/50" : isEvenRow ? "bg-[#F8FAFC]" : "bg-white"}`}>
                      <span className={`text-sm font-bold ${isBest ? "text-emerald-600" : "text-[#0F172A]"}`}>
                        {formatPrice(fs.price_min, fs.price_max)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}

          {/* Phone */}
          <tr>
            <td className="p-4 border border-[#E2E8F0] font-bold text-xs text-[#0F172A] uppercase tracking-wider bg-white">
              Telefon
            </td>
            {firms.map((firm) => (
              <td key={firm.id} className="p-4 border border-[#E2E8F0] text-center bg-white">
                {firm.phone ? (
                  <a href={`tel:${firm.phone}`} className="text-sm font-semibold text-[#0EA5E9] hover:underline">
                    {firm.phone}
                  </a>
                ) : (
                  <span className="text-sm text-[#94A3B8]">—</span>
                )}
              </td>
            ))}
          </tr>

          {/* CTA */}
          <tr>
            <td className="p-4 border border-[#E2E8F0] bg-[#F8FAFC]"></td>
            {firms.map((firm) => (
              <td key={firm.id} className="p-4 border border-[#E2E8F0] text-center bg-[#F8FAFC]">
                <a
                  href={`/firma/${firm.slug}`}
                  className="inline-block text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] px-4 py-2 rounded-lg transition-colors"
                >
                  Profili Görüntüle
                </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
