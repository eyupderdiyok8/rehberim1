"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface SelectedFirm {
  id: string;
  name: string;
  slug: string;
}

interface FirmCompareBarProps {
  selectedFirms: SelectedFirm[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function FirmCompareBar({ selectedFirms, onRemove, onClear }: FirmCompareBarProps) {
  const router = useRouter();
  const isVisible = selectedFirms.length >= 2;

  const handleCompare = () => {
    const ids = selectedFirms.map((f) => f.id).join(",");
    router.push(`/karsilastir?ids=${ids}`);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t-2 border-[#0EA5E9] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Selected firms chips */}
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#0F172A]/50 uppercase tracking-wider shrink-0">
              Karşılaştır:
            </span>
            {selectedFirms.map((firm) => (
              <span
                key={firm.id}
                className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-[#0EA5E9] text-xs font-bold px-2.5 py-1.5 rounded-lg"
              >
                <span className="line-clamp-1">{firm.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(firm.id)}
                  className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-sky-200 transition-colors text-[#0EA5E9] shrink-0"
                  aria-label={`${firm.name} kaldır`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <span className="text-xs text-[#94A3B8] font-medium">
              {3 - selectedFirms.length} slot kaldı
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-bold text-[#94A3B8] hover:text-[#EF4444] transition-colors px-3 py-2"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              Karşılaştır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
