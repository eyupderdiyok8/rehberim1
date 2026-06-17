/**
 * Converts Turkish city/district names to URL-safe slugs.
 * Example: "Tekirdağ" → "tekirdag", "Süleymanpaşa" → "suleymanpasa"
 */
export function turkishToSlug(str: string): string {
  const map: Record<string, string> = {
    ı: "i", İ: "i",
    ğ: "g", Ğ: "g",
    ü: "u", Ü: "u",
    ş: "s", Ş: "s",
    ö: "o", Ö: "o",
    ç: "c", Ç: "c",
  };
  return str
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

