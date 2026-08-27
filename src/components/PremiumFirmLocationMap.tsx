"use client";

import dynamic from "next/dynamic";

const FirmLocationMap = dynamic(() => import("@/components/FirmLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-56 w-full animate-pulse bg-amber-50" aria-label="Harita yükleniyor" />
  ),
});

type Props = {
  latitude: number;
  longitude: number;
  firmName: string;
};

/** Keeps Leaflet browser-only while allowing profile pages to be statically generated. */
export default function PremiumFirmLocationMap(props: Props) {
  return <FirmLocationMap {...props} />;
}
