"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import TrackLink from "@/components/TrackLink";

const FirmMapView = dynamic(() => import("@/components/FirmMapView"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[420px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center">
      <p className="text-sm font-bold text-[#0F172A]/50">Harita yükleniyor...</p>
    </div>
  ),
});

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

interface NearbyFirm {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  rating: number;
  review_count: number;
  is_premium: boolean;
  is_verified: boolean;
  logo_url: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number;
  city?: { name?: string; slug?: string } | null;
  district?: { name?: string; slug?: string } | null;
  firm_services?: Array<{
    price_min?: number | null;
    price_max?: number | null;
    service?: { name: string; slug: string } | null;
  }>;
}

type Status = "idle" | "locating" | "loading" | "success" | "denied" | "unavailable" | "error";

interface Props {
  cities: City[];
  districts: District[];
  services: Service[];
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.max(100, Math.round(km * 1000 / 50) * 50)} m yakınınızda`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km yakınınızda`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}

function NearbyFirmCard({ firm, rank }: { firm: NearbyFirm; rank: number }) {
  const rating = Number(firm.rating);
  const location = [firm.city?.name, firm.district?.name].filter(Boolean).join(", ");
  const whatsapp = firm.whatsapp?.replace(/\D/g, "");

  return (
    <article
      className={`relative overflow-hidden rounded-lg border bg-white ${
        firm.is_premium
          ? "border-amber-300 shadow-[0_18px_45px_-34px_rgba(180,83,9,0.85)]"
          : "border-[#E2E8F0]"
      }`}
    >
      {firm.is_premium && (
        <>
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-50/90 to-transparent" />
        </>
      )}

      <div className="relative p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
            rank === 1
              ? "bg-[#0F172A] text-white"
              : "bg-[#F1F5F9] text-[#475569]"
          }`}>
            {rank === 1 ? "En yakın seçenek" : `${rank}. yakın seçenek`}
          </span>
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">
            Hızlı servis araması
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-lg shrink-0 flex items-center justify-center overflow-hidden border font-black ${
              firm.is_premium
                ? "bg-white border-amber-200 text-[#0F172A] shadow-md shadow-amber-200/50"
                : "bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]"
            }`}
          >
            {firm.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={firm.logo_url} alt={firm.name} className="w-full h-full object-contain p-1" />
            ) : (
              getInitials(firm.name)
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {firm.is_premium && (
                <span className="rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">
                  ★ Premium Servis
                </span>
              )}
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] font-black text-[#0369A1]">
                {formatDistance(Number(firm.distance_km))}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#0F172A] leading-tight">
              <a href={`/firma/${firm.slug}`} className="hover:underline decoration-[#0EA5E9] decoration-2 underline-offset-2">
                {firm.name}
              </a>
            </h2>
            {location && <p className="mt-1 text-sm font-semibold text-[#0F172A]/55">{location}</p>}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`text-sm ${i <= Math.round(rating) ? "text-amber-400" : "text-[#E2E8F0]"}`}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-black text-[#0F172A]">{rating.toFixed(1)}</span>
          <span className="text-xs font-semibold text-[#0F172A]/40">({firm.review_count} yorum)</span>
          {firm.is_verified && (
            <span className="ml-auto rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
              Onaylı firma
            </span>
          )}
        </div>

        {firm.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[#0F172A]/65">
            {firm.description}
          </p>
        )}

        <div className={`mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border ${
          firm.is_premium ? "border-amber-100 bg-amber-100" : "border-[#E2E8F0] bg-[#E2E8F0]"
        }`}>
          <div className="bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/35">Mesafe</p>
            <p className="text-xs font-black text-[#0F172A]">{Number(firm.distance_km).toFixed(Number(firm.distance_km) < 10 ? 1 : 0)} km</p>
          </div>
          <div className="bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/35">Puan</p>
            <p className="text-xs font-black text-[#0F172A]">{rating.toFixed(1)}</p>
          </div>
          <div className="bg-white px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#0F172A]/35">İletişim</p>
            <p className="text-xs font-black text-emerald-600">{whatsapp ? "WhatsApp" : firm.phone ? "Telefon" : "Profil"}</p>
          </div>
        </div>

        {firm.firm_services && firm.firm_services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {firm.firm_services.slice(0, 4).map((fs, index) => (
              fs.service ? (
                <span
                  key={`${fs.service.slug}-${index}`}
                  className="rounded border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-semibold text-[#475569]"
                >
                  {fs.service.name}
                </span>
              ) : null
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 border-t border-[#F1F5F9] pt-4">
          {firm.phone && (
            <TrackLink
              href={`tel:${firm.phone}`}
              firmId={firm.id}
              type="contact_click"
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-black text-white transition-colors ${
                firm.is_premium ? "bg-[#0F172A] hover:bg-[#1E293B]" : "bg-[#0EA5E9] hover:bg-[#0284C7]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Hemen Ara
            </TrackLink>
          )}

          {whatsapp && (
            <TrackLink
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Merhaba, yakınımdaki su arıtma servisi için bilgi almak istiyorum.")}`}
              target="_blank"
              rel="noopener noreferrer"
              firmId={firm.id}
              type="contact_click"
              className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#20BA56]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp ile Yaz
            </TrackLink>
          )}

          <a
            href={`/firma/${firm.slug}`}
            className="flex items-center justify-center rounded-md border border-[#E2E8F0] px-4 py-3 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            Profil
          </a>
        </div>
      </div>
    </article>
  );
}

export default function NearbyServicesClient({ cities, districts, services }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [firms, setFirms] = useState<NearbyFirm[]>([]);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [radiusKm, setRadiusKm] = useState(20);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const serviceName = useMemo(
    () => services.find((service) => service.slug === "su-aritma-servisi")?.name ?? "Su Arıtma Servisi",
    [services]
  );

  const requestLocation = () => {
    setError("");

    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(nextCoords);
      },
      (geoError) => {
        setStatus(geoError.code === geoError.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 1000 * 60 * 10,
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;
    const currentCoords = coords;

    async function loadNearby() {
      setStatus("loading");
      try {
        const response = await fetch("/api/firms/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
            serviceSlug: "su-aritma-servisi",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Yakındaki servisler alınamadı.");
        }

        if (!cancelled) {
          setFirms(data.firms ?? []);
          setExpanded(!!data.expanded);
          setRadiusKm(Number(data.radiusKm ?? 20));
          setStatus("success");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Yakındaki servisler alınamadı.");
          setStatus("error");
        }
      }
    }

    loadNearby();

    return () => {
      cancelled = true;
    };
  }, [coords]);

  const showFallbackSearch = status === "denied" || status === "unavailable" || status === "error";
  const mapFirms = firms.map((firm) => ({
    ...firm,
    address: firm.address ?? undefined,
  }));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-[#0F172A] px-5 py-8 sm:px-8 sm:py-10 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-[#0EA5E9]/40 to-transparent" />
        <p className="text-xs font-black uppercase tracking-widest text-[#0EA5E9] mb-3">
          Acil servis araması
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          Yakınımdaki su arıtma servisleri
        </h1>
        <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
          Konumunuza göre en yakın aktif servisleri listeliyoruz. Yakın mesafe bandında premium firmalar öne çıkar.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
            {serviceName}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
            Hemen Ara / WhatsApp
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80">
            Konum kaydedilmez
          </span>
        </div>
      </section>

      {(status === "locating" || status === "loading" || status === "idle") && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[#0EA5E9] border-t-transparent animate-spin" />
          <p className="text-sm font-black text-[#0F172A]">
            {status === "loading" ? "Yakındaki servisler aranıyor..." : "Konum izni bekleniyor..."}
          </p>
          <p className="mt-2 text-sm text-[#0F172A]/55">
            Tarayıcınız izin isterse konum paylaşımını onaylayın.
          </p>
        </div>
      )}

      {showFallbackSearch && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-black text-[#0F172A]">
            Konum alınamadı
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#0F172A]/60">
            Sorun değil. İl veya ilçenizi yazarak size yakın servis firmalarını listeleyebilirsiniz.
          </p>
          {error && (
            <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}
          <div className="mt-6 rounded-2xl bg-[#0F172A] p-4">
            <SearchBar cities={cities} districts={districts} services={services} />
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="mt-4 rounded-md border border-[#E2E8F0] px-4 py-2.5 text-xs font-black text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            Konumu tekrar dene
          </button>
        </div>
      )}

      {status === "success" && (
        <>
          <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0F172A]">
                <span className="text-[#0EA5E9]">{firms.length}</span> servis bulundu
              </p>
              <p className="mt-1 text-xs font-semibold text-[#0F172A]/50">
                Arama alanı: {radiusKm} km
                {expanded ? " - 20 km içinde az sonuç olduğu için 50 km'ye genişletildi." : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={requestLocation}
              className="rounded-md border border-[#E2E8F0] px-4 py-2.5 text-xs font-black text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
            >
              Konumu yenile
            </button>
          </div>

          {firms.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6">
              <div className="space-y-4">
                {firms.map((firm, index) => (
                  <NearbyFirmCard key={firm.id} firm={firm} rank={index + 1} />
                ))}
              </div>
              <div className="lg:sticky lg:top-24 lg:self-start">
                <FirmMapView firms={mapFirms} center={[coords?.latitude ?? 41.0082, coords?.longitude ?? 28.9784]} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-10 text-center">
              <p className="text-sm font-black text-[#0F172A]">
                Yakınınızda koordinatı kayıtlı servis bulunamadı.
              </p>
              <p className="mt-2 text-sm text-[#0F172A]/55">
                İl veya ilçe yazarak servisleri listeleyebilirsiniz.
              </p>
              <div className="mt-6 rounded-2xl bg-[#0F172A] p-4">
                <SearchBar cities={cities} districts={districts} services={services} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
