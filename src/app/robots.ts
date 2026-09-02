import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/b2b/", "/panel/"],
    },
    sitemap: "https://suaritmarehberi.com.tr/sitemap.xml",
  };
}

