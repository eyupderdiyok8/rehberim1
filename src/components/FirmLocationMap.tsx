"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const premiumMarker = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

type Props = {
  latitude: number;
  longitude: number;
  firmName: string;
};

/** A single-firm map powered by OpenStreetMap; no Google Maps API key required. */
export default function FirmLocationMap({ latitude, longitude, firmName }: Props) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="h-56 w-full">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        aria-label={`${firmName} konum haritası`}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={position} icon={premiumMarker} />
      </MapContainer>
    </div>
  );
}
