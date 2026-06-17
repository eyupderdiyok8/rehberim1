import React from "react";

interface RelatedLink {
  label: string;
  href: string;
}

interface SeoSidebarProps {
  /** "Diğer Şehirler" links */
  relatedCities?: RelatedLink[];
  /** "Diğer Hizmetler" links */
  relatedServices?: RelatedLink[];
  /** "İlçeler" links (optional, only on city pages) */
  relatedDistricts?: RelatedLink[];
  currentLabel?: string;
}

export default function SeoSidebar({
  relatedCities,
  relatedServices,
  relatedDistricts,
  currentLabel,
}: SeoSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Quick info box */}
      {currentLabel && (
        <div className="border border-[#E2E8F0] rounded-lg p-5 bg-[#F8FAFC]">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#0F172A]/40 mb-1">
            Şu an bakıyorsunuz
          </p>
          <p className="text-sm font-bold text-[#0F172A]">{currentLabel}</p>
        </div>
      )}

      {/* Related districts */}
      {relatedDistricts && relatedDistricts.length > 0 && (
        <div className="border border-[#E2E8F0] rounded-lg p-5 bg-white">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#0F172A]/50 mb-3">
            İlçeler
          </h3>
          <ul className="space-y-1.5">
            {relatedDistricts.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors duration-150 font-medium flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <span className="text-[#0F172A]/20 group-hover:text-[#0EA5E9] transition-colors">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related services */}
      {relatedServices && relatedServices.length > 0 && (
        <div className="border border-[#E2E8F0] rounded-lg p-5 bg-white">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#0F172A]/50 mb-3">
            Diğer Hizmetler
          </h3>
          <ul className="space-y-1.5">
            {relatedServices.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors duration-150 font-medium flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <span className="text-[#0F172A]/20 group-hover:text-[#0EA5E9] transition-colors">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related cities */}
      {relatedCities && relatedCities.length > 0 && (
        <div className="border border-[#E2E8F0] rounded-lg p-5 bg-white">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[#0F172A]/50 mb-3">
            Diğer Şehirler
          </h3>
          <ul className="space-y-1.5">
            {relatedCities.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-xs text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors duration-150 font-medium flex items-center justify-between group"
                >
                  <span>{link.label}</span>
                  <span className="text-[#0F172A]/20 group-hover:text-[#0EA5E9] transition-colors">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA box */}
      <div className="border border-[#0EA5E9]/20 bg-[#0EA5E9]/3 rounded-lg p-5">
        <p className="text-xs font-bold text-[#0F172A] mb-1">Firmanızı Ekleyin</p>
        <p className="text-[11px] text-[#0F172A]/60 leading-relaxed mb-3">
          Rehberimize ücretsiz kayıt olarak müşterilere ulaşın.
        </p>
        <a
          href="#"
          className="block text-center bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-[11px] font-bold py-2 rounded transition-colors duration-150"
        >
          Firma Ekle
        </a>
      </div>
    </aside>
  );
}

