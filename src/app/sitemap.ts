import { supabase } from "@/lib/supabase";
import type { MetadataRoute } from "next";

const BASE_URL = "https://suaritmarehberi.com.tr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Programmatic SEO pages from page_urls table
  const { data: pageUrls } = await supabase
    .from("page_urls")
    .select("slug, page_type");

  const seoPages: MetadataRoute.Sitemap = (pageUrls ?? []).map((p) => ({
    url: `${BASE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: (
      p.page_type === "city_price" || p.page_type === "district_price"
        ? "weekly"
        : "daily"
    ) as "daily" | "weekly",
    priority:
      p.page_type === "city_firms"
        ? 0.9
        : p.page_type === "district_firms"
        ? 0.8
        : p.page_type === "city_price"
        ? 0.7
        : 0.6,
  }));

  // Firm profile pages
  const { data: firms } = await supabase
    .from("firms")
    .select("slug")
    .eq("is_active", true);

  const firmPages: MetadataRoute.Sitemap = (firms ?? []).map((f) => ({
    url: `${BASE_URL}/firma/${f.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...seoPages, ...firmPages];
}

