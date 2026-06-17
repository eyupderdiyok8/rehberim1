"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const premiumIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Firm {
  id: string;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  review_count: number;
  is_premium: boolean;
  address?: string;
}

interface Props {
  firms: Firm[];
  center?: [number, number];
}

// A helper component to auto-fit the map to markers
function MapFitter({ firms, defaultCenter }: { firms: Firm[], defaultCenter: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    const validFirms = firms.filter(f => f.latitude && f.longitude);
    if (validFirms.length > 0) {
      const bounds = L.latLngBounds(validFirms.map(f => [f.latitude!, f.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView(defaultCenter, 10);
    }
  }, [firms, map, defaultCenter]);

  return null;
}

export default function FirmMapView({ firms, center = [41.0082, 28.9784] }: Props) {
  // We filter firms that actually have coordinates
  const validFirms = firms.filter(f => f.latitude && f.longitude);

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm z-0 relative">
      <MapContainer 
        center={center} 
        zoom={10} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapFitter firms={validFirms} defaultCenter={center} />

        {validFirms.map(firm => (
          <Marker 
            key={firm.id} 
            position={[firm.latitude!, firm.longitude!]}
            icon={firm.is_premium ? premiumIcon : customIcon}
            zIndexOffset={firm.is_premium ? 1000 : 0}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                {firm.is_premium && (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block border border-amber-200">
                    Premium
                  </span>
                )}
                <h3 className="font-bold text-sm text-[#0F172A] leading-tight mb-1">{firm.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs font-bold text-[#0F172A]">{Number(firm.rating).toFixed(1)}</span>
                  <span className="text-[10px] text-[#0F172A]/50">({firm.review_count} Yorum)</span>
                </div>
                
                <a 
                  href={`/firma/${firm.slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block w-full text-center bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-[11px] font-bold py-1.5 rounded transition-colors"
                >
                  Profili İncele
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
