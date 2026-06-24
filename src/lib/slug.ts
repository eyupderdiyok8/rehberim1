/**
 * Turkish-aware slug generator.
 * Key rule: ı (dotless-i) is REMOVED, not replaced with 'i'.
 * So "arıtma" → "artma", "İstanbul" → "istanbul"
 */
export function toSlug(text: string): string {
  return text
    // Handle uppercase Turkish chars first (before toLowerCase)
    .replace(/İ/g, "i")
    .replace(/I/g, "i") // Turkish dotted uppercase I
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    // Lowercase everything
    .toLowerCase()
    // Handle lowercase Turkish chars
    .replace(/ı/g, "i") // dotless-i → i  (arıtma → aritma)
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // Remove anything that's not alphanumeric or space/dash
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a unique firm slug: "firma-adi-sehir-ilce"
 * If suffix causes collision, append a number.
 */
export function buildFirmSlug(name: string, cityName?: string, districtName?: string): string {
  const parts = [name, districtName, cityName].filter(Boolean) as string[];
  return toSlug(parts.join(" "));
}
