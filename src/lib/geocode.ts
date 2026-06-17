/**
 * Geocoding utility using Nominatim (OpenStreetMap) — free, no API key needed.
 * Converts a Turkish city/district/address string into lat/lng.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocode a firm's location using Nominatim.
 * Falls back from full address → district+city → city only.
 */
export async function geocodeAddress(opts: {
  address?: string;
  districtName?: string;
  cityName?: string;
}): Promise<Coordinates | null> {
  const { address, districtName, cityName } = opts;

  // Build candidate queries (most specific → least specific)
  const queries: string[] = [];

  if (address && cityName) {
    queries.push(`${address}, ${districtName ?? ""} ${cityName}, Turkey`);
  }
  if (districtName && cityName) {
    queries.push(`${districtName}, ${cityName}, Turkey`);
  }
  if (cityName) {
    queries.push(`${cityName}, Turkey`);
  }

  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=tr`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "SuAritmaRehberi/1.0 (suaritmarehberi.com.tr)",
          "Accept-Language": "tr",
        },
        // Nominatim asks for at most 1 req/sec — we're fine for one-offs
        cache: "no-store",
      });

      if (!res.ok) continue;

      const data = await res.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
    } catch {
      // silently try the next candidate
    }
  }

  return null;
}
