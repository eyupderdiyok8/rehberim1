import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocode";

/**
 * POST /api/admin/geocode-firms
 * Admin-only route that bulk-geocodes all firms missing coordinates.
 * Requires the X-Admin-Key header matching the env var ADMIN_SECRET.
 */
export async function POST(req: Request) {
  const adminKey = req.headers.get("x-admin-key");
  if (adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get firms missing coordinates
  const { data: firms, error } = await supabase
    .from("firms")
    .select("id, name, address, city_id, district_id")
    .or("latitude.is.null,longitude.is.null")
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!firms || firms.length === 0) {
    return NextResponse.json({ message: "All firms already have coordinates.", updated: 0 });
  }

  // Fetch city/district names for each firm
  const { data: cities } = await supabase.from("cities").select("id, name");
  const { data: districts } = await supabase.from("districts").select("id, name");
  const cityMap = Object.fromEntries((cities ?? []).map(c => [c.id, c.name]));
  const districtMap = Object.fromEntries((districts ?? []).map(d => [d.id, d.name]));

  let updated = 0;
  let failed = 0;

  for (const firm of firms) {
    try {
      // Rate limit: Nominatim requires max 1 req/sec
      await new Promise(resolve => setTimeout(resolve, 1100));

      const coords = await geocodeAddress({
        address: firm.address ?? undefined,
        districtName: firm.district_id ? districtMap[firm.district_id] : undefined,
        cityName: firm.city_id ? cityMap[firm.city_id] : undefined,
      });

      if (coords) {
        await supabase
          .from("firms")
          .update({ latitude: coords.latitude, longitude: coords.longitude })
          .eq("id", firm.id);
        updated++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return NextResponse.json({
    message: `Geocoding tamamlandı. ${updated} güncellendi, ${failed} başarısız.`,
    updated,
    failed,
  });
}
