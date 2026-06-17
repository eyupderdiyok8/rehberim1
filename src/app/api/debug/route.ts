import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    { data: firms, error: firmsError },
    { data: cities, error: citiesError },
    { data: services, error: servicesError },
  ] = await Promise.all([
    supabase.from("firms").select("id, name, slug, city_id, is_active").limit(20),
    supabase.from("cities").select("id, name, slug").limit(20),
    supabase.from("services").select("id, name, slug").limit(20),
  ]);

  return NextResponse.json({
    firms: { data: firms, error: firmsError, count: firms?.length ?? 0 },
    cities: { data: cities, error: citiesError, count: cities?.length ?? 0 },
    services: { data: services, error: servicesError, count: services?.length ?? 0 },
  });
}

