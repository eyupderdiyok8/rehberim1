import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DEFAULT_SERVICE_SLUG = "su-aritma-servisi";
const MIN_RESULTS = 3;

function toNumber(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  return value;
}

function isValidCoordinate(lat: number, lng: number) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

async function fetchNearby(lat: number, lng: number, radiusKm: number, serviceSlug: string) {
  return supabase.rpc("get_nearby_firms", {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
    service_slug: serviceSlug,
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const payload = body as {
    latitude?: unknown;
    longitude?: unknown;
    serviceSlug?: unknown;
  };

  const latitude = toNumber(payload.latitude);
  const longitude = toNumber(payload.longitude);

  if (latitude === null || longitude === null || !isValidCoordinate(latitude, longitude)) {
    return Response.json({ error: "Geçerli bir konum bilgisi alınamadı." }, { status: 400 });
  }

  const serviceSlug =
    typeof payload.serviceSlug === "string" && payload.serviceSlug.trim()
      ? payload.serviceSlug.trim()
      : DEFAULT_SERVICE_SLUG;

  const first = await fetchNearby(latitude, longitude, 20, serviceSlug);

  if (first.error) {
    return Response.json({ error: first.error.message }, { status: 500 });
  }

  if ((first.data ?? []).length >= MIN_RESULTS) {
    return Response.json({
      firms: first.data ?? [],
      radiusKm: 20,
      expanded: false,
      serviceSlug,
    });
  }

  const expanded = await fetchNearby(latitude, longitude, 50, serviceSlug);

  if (expanded.error) {
    return Response.json({ error: expanded.error.message }, { status: 500 });
  }

  return Response.json({
    firms: expanded.data ?? [],
    radiusKm: 50,
    expanded: true,
    serviceSlug,
  });
}
