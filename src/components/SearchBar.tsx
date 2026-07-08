"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { turkishToSlug } from "@/lib/utils";

interface City {
  id: string;
  name: string;
  slug: string;
}

interface District {
  id: string;
  name: string;
  slug: string;
  city_id: string;
}

interface Service {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  cities: City[];
  districts?: District[];
  services: Service[];
}

interface SearchItem {
  label: string;
  sublabel?: string;
  slug: string;
  type: "city" | "district";
}

export default function SearchBar({ cities, districts = [], services }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "su-aritma-cihazi");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [filtered, setFiltered] = useState<SearchItem[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build city lookup map for district sublabels
  const cityMap = React.useMemo(() => {
    const m = new Map<string, string>();
    cities.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [cities]);

  // Build combined search items
  const allItems = React.useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = cities.map((c) => ({
      label: c.name,
      slug: c.slug,
      type: "city" as const,
    }));
    districts.forEach((d) => {
      items.push({
        label: d.name,
        sublabel: cityMap.get(d.city_id) ?? "",
        slug: d.slug,
        type: "district" as const,
      });
    });
    return items;
  }, [cities, districts, cityMap]);

  // Filter items based on query
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setFiltered([]);
      setIsOpen(false);
      return;
    }
    const qSlug = turkishToSlug(query);
    const results = allItems
      .filter((item) => {
        const labelLow = item.label.toLowerCase();
        const labelSlug = turkishToSlug(item.label);
        return (
          labelLow.includes(q) ||
          labelSlug.includes(qSlug) ||
          (item.sublabel && item.sublabel.toLowerCase().includes(q))
        );
      })
      .slice(0, 8);
    setFiltered(results);
    setIsOpen(results.length > 0);
    setActiveIdx(-1);
  }, [query, allItems]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navigate = useCallback(
    (slug: string) => {
      router.push(`/${slug}-${serviceSlug}-firmalari`);
      setIsOpen(false);
      setQuery("");
    },
    [router, serviceSlug]
  );

  const navigateToNearbyServices = () => {
    router.push("/yakinimdaki-servisler");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // If dropdown item is active, use it
    if (activeIdx >= 0 && filtered[activeIdx]) {
      navigate(filtered[activeIdx].slug);
      return;
    }

    const q = query.trim();
    if (!q) {
      setError("Lütfen bir şehir veya ilçe girin.");
      return;
    }

    // Try exact match on city, then prefix
    const qSlug = turkishToSlug(q);
    const matchedCity =
      cities.find((c) => c.slug === qSlug) ??
      cities.find((c) => c.slug.startsWith(qSlug)) ??
      cities.find((c) => c.name.toLowerCase() === q.toLowerCase());

    if (matchedCity) {
      navigate(matchedCity.slug);
      return;
    }

    // Try exact match on district
    const matchedDistrict =
      districts.find((d) => d.slug === qSlug) ??
      districts.find((d) => d.name.toLowerCase() === q.toLowerCase());

    if (matchedDistrict) {
      navigate(matchedDistrict.slug);
      return;
    }

    // Fallback: slug-convert and navigate
    navigate(qSlug);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto" ref={wrapperRef}>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-2.5 md:p-3 border border-white/20 rounded-2xl shadow-2xl shadow-slate-900/50 flex flex-col md:flex-row items-stretch gap-2 relative z-10"
      >
        {/* City/District input */}
        <div className="flex-1 flex items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-[#E2E8F0] py-2">
          <svg
            className="w-5 h-5 text-[#0F172A]/40 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Şehir veya ilçe yazın..."
              className={`w-full text-sm text-[#0F172A] placeholder-[#0F172A]/40 focus:outline-none bg-transparent ${
                error ? "placeholder-red-400" : ""
              }`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (filtered.length > 0) setIsOpen(true);
              }}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Service dropdown */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2">
          <svg
            className="w-5 h-5 text-[#0F172A]/40 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <select
            className="w-full text-sm text-[#0F172A] bg-transparent focus:outline-none cursor-pointer"
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white text-base md:text-sm font-bold px-8 py-3.5 md:py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap shrink-0"
        >
          Fiyatları Gör
        </button>
      </form>

      <div className="relative z-10 mt-4 overflow-hidden rounded-2xl border border-sky-300/25 bg-gradient-to-r from-sky-500/15 via-white/[0.08] to-emerald-500/10 p-3 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#0F172A] shadow-lg shadow-slate-950/20">
              <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s7-5.25 7-12a7 7 0 10-14 0c0 6.75 7 12 7 12z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white">
                Acil servis mi lazım?
              </p>
              <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-300">
                Konumunuza en yakın su arıtma servislerini mesafeye göre görün.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75">
                  20 km yakın arama
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75">
                  Hemen Ara / WhatsApp
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/75">
                  Konum kaydedilmez
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={navigateToNearbyServices}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-black text-[#0F172A] shadow-lg shadow-slate-950/20 transition-all hover:-translate-y-0.5 hover:bg-slate-50 sm:min-w-56"
          >
            <svg className="w-4 h-4 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Yakınımdaki Servisleri Bul
          </button>
        </div>
      </div>

      {/* Custom filtered dropdown */}
      {isOpen && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 overflow-hidden">
          {filtered.map((item, idx) => (
            <button
              key={`${item.type}-${item.slug}`}
              type="button"
              className={`w-full text-left px-4 py-2.5 flex items-center gap-2 transition-colors ${
                idx === activeIdx
                  ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                  : "hover:bg-[#F8FAFC] text-[#0F172A]"
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                navigate(item.slug);
              }}
              onMouseEnter={() => setActiveIdx(idx)}
            >
              <svg
                className="w-4 h-4 shrink-0 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium truncate block">
                  {item.sublabel ? (
                    <>
                      <span className="text-[#0F172A]/50">{item.sublabel}</span>
                      {" > "}
                      <span className="font-semibold">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F172A]/30 shrink-0">
                {item.type === "district" ? "İlçe" : "İl"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Error tooltip */}
      {error && (
        <p className="absolute left-3 -bottom-6 text-xs font-medium text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}
