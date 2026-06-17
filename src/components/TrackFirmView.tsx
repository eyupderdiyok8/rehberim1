"use client";

import { useEffect } from "react";

function getReferrerSource(): string {
  if (typeof document === "undefined") return "direct";
  const ref = document.referrer;
  if (!ref) return "direct";
  try {
    const host = new URL(ref).hostname;
    if (host.includes("google.")) return "google";
    if (host.includes("bing.")) return "bing";
    if (host.includes("yandex.")) return "yandex";
    if (host.includes("facebook.") || host.includes("fb.")) return "facebook";
    if (host.includes("instagram.")) return "instagram";
    if (host.includes("twitter.") || host.includes("x.com")) return "twitter";
    if (host.includes("youtube.")) return "youtube";
    if (host.includes("suaritmarehberi")) return "internal";
    return host;
  } catch {
    return "other";
  }
}

export default function TrackFirmView({ firmId }: { firmId: string }) {
  useEffect(() => {
    // Fire and forget
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firm_id: firmId,
        type: "page_view",
        referrer_source: getReferrerSource(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [firmId]);

  return null;
}
