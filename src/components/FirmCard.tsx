import React from "react";
import Image from "next/image";

type MaybeArray<T> = T | T[] | null | undefined;

function unwrap<T>(val: MaybeArray<T>): T | null {
  if (!val) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

interface Firm {
  id: string;
  name: string;
  slug: string;
  rating: number;
  review_count: number;
  is_premium?: boolean;
  is_verified?: boolean;
  address?: string;
  logo_url?: string | null;
  description?: string | null;
  phone?: string | null;
  city?: MaybeArray<{ name: string }>;
  district?: MaybeArray<{ name: string }>;
  firm_services?: Array<{
    price_min?: number | null;
    price_max?: number | null;
    service: MaybeArray<{ name: string; slug: string }>;
  }>;
}

interface FirmCardProps {
  firm: Firm;
  cityName?: string;
}

export default function FirmCard({ firm, cityName }: FirmCardProps) {
  const initials = firm.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("");

  const displayCity = cityName || unwrap(firm.city)?.name;
  const displayDistrict = unwrap(firm.district)?.name;
  const locationText = [displayCity, displayDistrict].filter(Boolean).join(", ");
  const ratingNum = Number(firm.rating);

  return (
    <div className={`bg-white rounded-lg hover:shadow-md transition-all duration-200 group overflow-hidden flex flex-col ${
      firm.is_premium
        ? "border-t-2 border-t-amber-400 border-l border-l-amber-100 border-r border-r-amber-100 border-b border-b-amber-100 shadow-amber-50 hover:shadow-amber-100/50"
        : "border border-[#E2E8F0] hover:border-[#CBD5E1]"
    }`}>

      <div className="p-5 flex-1 flex flex-col">
        {/* Logo + name row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] relative">
            {firm.logo_url ? (
              <Image src={firm.logo_url} alt={firm.name} fill sizes="48px" className="object-contain p-1" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base text-[#0F172A] leading-snug line-clamp-2 group-hover:underline decoration-[#0EA5E9] decoration-2 underline-offset-2">
              <a href={`/firma/${firm.slug}`}>{firm.name}</a>
            </h3>
            {locationText && (
              <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
                {locationText}
              </p>
            )}
          </div>
          {firm.is_premium && (
            <span className="text-[10px] font-bold text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1 rounded border border-amber-200 shrink-0 mt-0.5 shadow-sm">
              ⭐ Premium
            </span>
          )}
        </div>

        {/* Description (premium only) */}
        {firm.is_premium && firm.description && (
          <p className="text-sm text-[#64748B] leading-relaxed mb-3 line-clamp-2">
            {firm.description}
          </p>
        )}

        {/* Rating + review count */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`text-sm ${i <= Math.round(ratingNum) ? "text-amber-400" : "text-[#E2E8F0]"}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-[#334155]">
            {ratingNum.toFixed(1)}
          </span>
          <span className="text-xs text-[#94A3B8]">
            ({firm.review_count})
          </span>
        </div>

        {/* Service tags */}
        {firm.firm_services && firm.firm_services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {firm.firm_services.slice(0, 3).map((fs, i) => {
              const svc = unwrap(fs.service);
              if (!svc) return null;
              return (
                <span
                  key={svc.slug + i}
                  className="text-[11px] font-medium text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded"
                >
                  {svc.name}
                </span>
              );
            })}
            {firm.firm_services.length > 3 && (
              <span className="text-[11px] font-medium text-[#94A3B8] px-1 py-0.5">
                +{firm.firm_services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA row */}
        <div className="mt-auto flex gap-2 pt-3 border-t border-[#F1F5F9]">
          <a
            href={`/firma/${firm.slug}`}
            className="flex-1 text-center text-[13px] font-semibold py-2.5 rounded-md bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors"
          >
            Profili Görüntüle
          </a>
          {firm.phone && (
            <a
              href={`tel:${firm.phone}`}
              className="px-3 py-2.5 rounded-md border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors text-[13px] font-medium flex items-center gap-1.5"
              title="Ara"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Ara
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
