import React from "react";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  placement: string;
}

type Variant = "horizontal" | "sidebar" | "inline";

interface Props {
  banner: Banner;
  variant?: Variant;
}

/**
 * Reusable banner ad slot.
 * - horizontal: full-width banner for list tops/mids
 * - sidebar: compact card for sidebars
 * - inline: compact inline block for blog/content areas
 */
export default function BannerSlot({ banner, variant = "horizontal" }: Props) {
  if (variant === "sidebar") {
    return (
      <a
        href={banner.target_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block border border-[#E2E8F0] rounded-lg overflow-hidden bg-[#F8FAFC] hover:border-[#0EA5E9]/40 transition-colors group"
      >
        <div className="aspect-[4/3] w-full bg-[#E2E8F0] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
          />
        </div>
        <div className="p-3">
          <span className="text-[9px] font-bold text-[#0EA5E9] border border-[#0EA5E9]/15 bg-[#0EA5E9]/5 px-1.5 py-0.5 rounded tracking-wide uppercase">
            Sponsorlu
          </span>
          <p className="font-bold text-xs text-[#0F172A] mt-2 leading-snug">{banner.title}</p>
          <p className="text-[10px] text-[#0EA5E9] font-semibold mt-1 group-hover:underline">
            İncele →
          </p>
        </div>
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <a
        href={banner.target_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 border border-[#E2E8F0] rounded-lg px-5 py-4 bg-[#FAFBFC] hover:border-[#0EA5E9]/30 transition-colors group"
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#E2E8F0] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-bold text-[#0EA5E9] tracking-wide uppercase">
            Sponsorlu
          </span>
          <p className="font-bold text-sm text-[#0F172A] leading-snug truncate">{banner.title}</p>
        </div>
        <span className="text-xs font-bold text-[#0EA5E9] shrink-0 group-hover:underline">
          İncele →
        </span>
      </a>
    );
  }

  // horizontal (default)
  return (
    <a
      href={banner.target_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-6 border border-[#E2E8F0] rounded-lg px-6 py-4 bg-[#F8FAFC] hover:border-[#0EA5E9]/40 transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#E2E8F0] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image_url}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-[#0EA5E9] border border-[#0EA5E9]/20 bg-[#0EA5E9]/5 px-2 py-0.5 rounded tracking-wide uppercase">
            Sponsorlu
          </span>
          <p className="font-bold text-[#0F172A] mt-1 truncate">{banner.title}</p>
        </div>
      </div>
      <span className="text-xs font-bold text-[#0EA5E9] whitespace-nowrap shrink-0 group-hover:underline">
        İncele →
      </span>
    </a>
  );
}
