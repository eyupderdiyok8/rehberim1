import React from "react";

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
  compareChecked?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: () => void;
}

export default function FirmCard({ firm, cityName, compareChecked, compareDisabled, onCompareToggle }: FirmCardProps) {
  const initials = firm.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("");

  const displayCity = cityName || unwrap(firm.city)?.name;
  const displayDistrict = unwrap(firm.district)?.name;
  const locationText = [displayCity, displayDistrict].filter(Boolean).join(", ");
  const ratingNum = Number(firm.rating);
  const visibleServices = firm.is_premium ? 4 : 3;

  return (
    <div className={`relative bg-white rounded-lg transition-all duration-200 group overflow-hidden flex flex-col ${
      firm.is_premium
        ? "border border-amber-300 shadow-[0_18px_45px_-32px_rgba(180,83,9,0.75)] hover:-translate-y-1 hover:shadow-[0_24px_60px_-30px_rgba(180,83,9,0.9)]"
        : "border border-[#E2E8F0] hover:border-[#CBD5E1]"
    }`}>
      {firm.is_premium && (
        <>
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-amber-50/90 via-amber-50/35 to-transparent" />
        </>
      )}

      <div className="relative p-5 flex-1 flex flex-col">
        {/* Logo + name row */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`rounded-lg flex items-center justify-center font-bold shrink-0 overflow-hidden relative ${
            firm.is_premium
              ? "w-14 h-14 bg-white text-[#0F172A] border border-amber-200 shadow-md shadow-amber-200/50 text-base"
              : "w-12 h-12 bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] text-sm"
          }`}>
            {firm.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firm.logo_url} alt={firm.name} className="w-full h-full object-contain p-1" loading="lazy" />
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
            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-white px-2.5 py-1.5 rounded-full border border-amber-300 shrink-0 mt-0.5 shadow-sm shadow-amber-200/50 uppercase tracking-wide">
              <span className="text-amber-500">★</span>
              Premium
            </span>
          )}
        </div>

        {firm.is_premium && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-200 px-2 py-1 rounded-full">
              Öne çıkan üye
            </span>
            {firm.is_verified && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
                Onaylı firma
              </span>
            )}
          </div>
        )}

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
            {firm.firm_services.slice(0, visibleServices).map((fs, i) => {
              const svc = unwrap(fs.service);
              if (!svc) return null;
              return (
                <span
                  key={svc.slug + i}
                  className={`text-[11px] font-medium border px-2 py-0.5 rounded ${
                    firm.is_premium
                      ? "text-[#334155] bg-white/80 border-amber-100"
                      : "text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]"
                  }`}
                >
                  {svc.name}
                </span>
              );
            })}
            {firm.firm_services.length > visibleServices && (
              <span className="text-[11px] font-medium text-[#94A3B8] px-1 py-0.5">
                +{firm.firm_services.length - visibleServices}
              </span>
            )}
          </div>
        )}

        {firm.is_premium && (
          <div className="mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-amber-100 bg-amber-100">
            <div className="bg-white/80 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/40">Puan</p>
              <p className="text-sm font-black text-amber-700">{ratingNum.toFixed(1)}</p>
            </div>
            <div className="bg-white/80 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/40">Yorum</p>
              <p className="text-sm font-black text-amber-700">{firm.review_count}</p>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA row */}
        <div className="mt-auto flex items-center gap-2 pt-3 border-t border-[#F1F5F9]">
          <a
            href={`/firma/${firm.slug}`}
            className={`text-center text-[12px] font-semibold py-2 px-4 rounded-md transition-colors whitespace-nowrap ${
              firm.is_premium
                ? "bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white shadow-sm shadow-slate-900/20 hover:from-[#1E293B] hover:to-[#334155]"
                : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
            }`}
          >
            Profili Görüntüle
          </a>
          {onCompareToggle && (
            <label className="flex items-center gap-1 cursor-pointer group/cmp" title={compareChecked ? 'Karşılaştırmadan çıkar' : compareDisabled ? 'Maksimum 3 firma seçebilirsiniz' : 'Karşılaştırmaya ekle'}>
              <input
                type="checkbox"
                checked={!!compareChecked}
                onChange={onCompareToggle}
                disabled={!!compareDisabled}
                className="w-3.5 h-3.5 rounded border-slate-300 text-[#0EA5E9] focus:ring-[#0EA5E9] disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <span className="text-[10px] font-bold text-[#64748B] group-hover/cmp:text-[#0EA5E9] uppercase tracking-wider select-none hidden sm:inline">Karşılaştır</span>
            </label>
          )}
          {firm.phone && (
            <a
              href={`tel:${firm.phone}`}
              className="ml-auto px-2.5 py-2 rounded-md border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] transition-colors text-[12px] font-medium flex items-center gap-1.5"
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
