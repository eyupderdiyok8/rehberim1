"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import FirmCard from "@/components/FirmCard";
import BannerSlot from "@/components/BannerSlot";
import BannerPlaceholder from "@/components/BannerPlaceholder";
import FirmCompareBar from "@/components/FirmCompareBar";

// Dynamically import the map view so Leaflet doesn't break SSR
const FirmMapView = dynamic(() => import("@/components/FirmMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl">
      <div className="w-10 h-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-bold text-slate-500">Harita yükleniyor...</p>
    </div>
  ),
});

interface Service {
  id: string;
  name: string;
  slug: string;
}

interface Firm {
  id: string;
  name: string;
  slug: string;
  address?: string;
  rating: number;
  review_count: number;
  is_premium: boolean;
  is_verified: boolean;
  logo_url?: string;
  latitude: number | null;
  longitude: number | null;
  district?: { id: string; name: string };
  firm_services: {
    price_min: number | null;
    price_max: number | null;
    service: { name: string; slug: string };
  }[];
}

interface CompareFirm {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  initialFirms: Firm[];
  availableServices: Service[];
  defaultServiceSlug?: string;
  midBanner?: any;
}

export default function AdvancedFirmList({ initialFirms, availableServices, defaultServiceSlug, midBanner }: Props) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Compare selection state (max 3 firms)
  const [compareSelection, setCompareSelection] = useState<CompareFirm[]>([]);

  const toggleCompare = (firm: { id: string; name: string; slug: string }) => {
    setCompareSelection((prev) => {
      const exists = prev.find((f) => f.id === firm.id);
      if (exists) return prev.filter((f) => f.id !== firm.id);
      if (prev.length >= 3) return prev;
      return [...prev, { id: firm.id, name: firm.name, slug: firm.slug }];
    });
  };

  const removeCompare = (id: string) => {
    setCompareSelection((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompare = () => setCompareSelection([]);

  // Filters
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    defaultServiceSlug ? [defaultServiceSlug] : []
  );

  const toggleService = (slug: string) => {
    setSelectedServices(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  // Apply filters
  const filteredFirms = useMemo(() => {
    return initialFirms.filter(firm => {
      // 1. Premium filter
      if (onlyPremium && !firm.is_premium) return false;

      // 2. Rating filter
      if (firm.rating < minRating) return false;

      // 3. Service filter
      if (selectedServices.length > 0) {
        const firmServiceSlugs = firm.firm_services.map(fs => fs.service.slug);
        const hasMatch = selectedServices.some(s => firmServiceSlugs.includes(s));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [initialFirms, onlyPremium, minRating, selectedServices]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 sticky top-24">
          <h2 className="text-[15px] font-bold text-[#0F172A] tracking-tight mb-4 uppercase">Filtreler</h2>
          
          <div className="space-y-6">
            {/* Premium Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={onlyPremium}
                  onChange={(e) => setOnlyPremium(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${onlyPremium ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${onlyPremium ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-bold text-[#0F172A]">Sadece Premium</span>
            </label>

            <hr className="border-[#E2E8F0]" />

            {/* Rating Filter */}
            <div>
              <p className="text-sm font-bold text-[#0F172A] mb-3">Minimum Puan</p>
              <div className="flex flex-col gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <label key={rating} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="rating" 
                      checked={minRating === rating} 
                      onChange={() => setMinRating(rating)}
                      className="w-3.5 h-3.5 text-[#0EA5E9] focus:ring-[#0EA5E9]"
                    />
                    <span className="text-[13px] font-semibold text-[#0F172A]/70 flex items-center gap-1">
                      {rating === 0 ? "Tümü" : `${rating}+ Yıldız`} 
                      {rating > 0 && <span className="text-amber-400">★</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-[#E2E8F0]" />

            {/* Services Filter */}
            <div>
              <p className="text-sm font-bold text-[#0F172A] mb-3">Hizmetler</p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {availableServices.map(srv => (
                  <label key={srv.id} className="flex items-start gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedServices.includes(srv.slug)}
                      onChange={() => toggleService(srv.slug)}
                      className="w-3.5 h-3.5 mt-0.5 text-[#0EA5E9] border-slate-300 rounded focus:ring-[#0EA5E9]"
                    />
                    <span className="text-[13px] font-semibold text-[#0F172A]/70 leading-tight">
                      {srv.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <p className="text-[15px] font-bold text-[#0F172A]/70">
            <span className="text-[#0EA5E9]">{filteredFirms.length}</span> firma bulundu
          </p>

          <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === "list" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#0F172A]/50 hover:text-[#0F172A]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              Liste
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === "map" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#0F172A]/50 hover:text-[#0F172A]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Harita
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredFirms.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-50 border border-slate-200 border-dashed rounded-xl">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="text-slate-500 font-bold text-sm">Arama kriterlerinize uygun firma bulunamadı.</p>
            <button 
              onClick={() => { setOnlyPremium(false); setMinRating(0); setSelectedServices([]); }}
              className="mt-4 text-[#0EA5E9] text-xs font-bold hover:underline"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <div className="flex-1">
            {viewMode === "list" ? (
              <div className="space-y-4">
                {filteredFirms.slice(0, Math.ceil(filteredFirms.length / 2)).map((firm) => (
                  <div key={firm.id} className="relative">
                    <FirmCard
                      firm={firm as any}
                      compareChecked={!!compareSelection.find(f => f.id === firm.id)}
                      compareDisabled={!compareSelection.find(f => f.id === firm.id) && compareSelection.length >= 3}
                      onCompareToggle={() => toggleCompare(firm)}
                    />
                  </div>
                ))}
                {midBanner ? (
                  <BannerSlot banner={midBanner} variant="horizontal" />
                ) : (
                  <BannerPlaceholder variant="horizontal" />
                )}
                {filteredFirms.slice(Math.ceil(filteredFirms.length / 2)).map((firm) => (
                  <div key={firm.id} className="relative">
                    <FirmCard
                      firm={firm as any}
                      compareChecked={!!compareSelection.find(f => f.id === firm.id)}
                      compareDisabled={!compareSelection.find(f => f.id === firm.id) && compareSelection.length >= 3}
                      onCompareToggle={() => toggleCompare(firm)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <FirmMapView firms={filteredFirms} />
            )}
          </div>
        )}

      </div>

      {/* Floating compare bar */}
      <FirmCompareBar
        selectedFirms={compareSelection}
        onRemove={removeCompare}
        onClear={clearCompare}
      />
    </div>
  );
}
