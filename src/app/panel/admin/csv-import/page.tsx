"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { buildFirmSlug, toSlug } from "@/lib/slug";
import { geocodeAddress } from "@/lib/geocode";

// ─── Types ──────────────────────────────────────────────────────────────────

interface City {
  id: string;
  name: string;
  slug: string;
}
interface District {
  id: string;
  name: string;
  slug: string;
  city_id: string;
}

interface ParsedRow {
  _rowIndex: number;
  rawName: string;
  name: string;         // cleaned firm name (city/district stripped)
  cityName: string;
  districtName: string;
  phone: string;
  whatsapp: string;
  address: string;
  logoUrl: string;      // original (external) URL
  // resolved after DB lookup
  cityId?: string;
  districtId?: string;
  cityMatch?: "exact" | "fuzzy" | "none";
  districtMatch?: "exact" | "fuzzy" | "none";
  slug?: string;
  // import state
  status?: "pending" | "importing" | "done" | "error";
  error?: string;
  newLogoUrl?: string;
}

type ImportStatus = "idle" | "parsing" | "previewing" | "importing" | "done";

function normalize(s: string): string {
  if (!s) return "";
  return s
    // 1. First replace uppercase Turkish characters before toLowerCase
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c")
    // 2. Convert to lowercase
    .toLowerCase()
    // 3. Replace lowercase Turkish characters
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    // 4. Decompose and strip diacritics just in case
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────

function parseCSV(text: string): string[][] {
  // Strip UTF-8 BOM
  const clean = text.replace(/^\uFEFF/, "");

  // Detect delimiter: semicolon or comma
  const firstLine = clean.split(/\r?\n/)[0];
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";

  const rows: string[][] = [];
  const lines = clean.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let inQuote = false;
    let cell = "";

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cell += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === delimiter && !inQuote) {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    cells.push(cell.trim());
    rows.push(cells);
  }

  return rows;
}

// ─── City/District Extractor ─────────────────────────────────────────────────

function extractLocation(
  name: string,
  cities: City[],
  districts: District[]
): { firmName: string; cityName: string; districtName: string } {
  // Build normalized lookup maps
  const cityByNorm = new Map(cities.map(c => [normalize(c.name), c.name]));
  const districtByNorm = new Map(districts.map(d => [normalize(d.name), d.name]));

  const words = name.split(/\s+/);
  let cityName = "";
  let districtName = "";
  let firmWords = [...words];

  // Try to find district in last 1–3 words (from end)
  outer: for (let len = 3; len >= 1; len--) {
    for (let start = words.length - len; start >= Math.max(0, words.length - len - 2); start--) {
      const candidate = words.slice(start, start + len).join(" ");
      const norm = normalize(candidate);
      if (districtByNorm.has(norm)) {
        districtName = districtByNorm.get(norm)!;
        firmWords = words.filter((_, i) => i < start || i >= start + len);
        break outer;
      }
    }
  }

  // Try to find city in remaining words (from end)
  const remaining = firmWords;
  outer2: for (let len = 2; len >= 1; len--) {
    for (let start = remaining.length - len; start >= Math.max(0, remaining.length - len - 2); start--) {
      const candidate = remaining.slice(start, start + len).join(" ");
      const norm = normalize(candidate);
      if (cityByNorm.has(norm)) {
        cityName = cityByNorm.get(norm)!;
        firmWords = remaining.filter((_, i) => i < start || i >= start + len);
        break outer2;
      }
    }
  }

  return {
    firmName: firmWords.join(" ").trim() || name.trim(),
    cityName,
    districtName,
  };
}

// ─── Column Guesser ──────────────────────────────────────────────────────────

function guessColumns(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const n = normalize(h);
    if (/firma|ad|isim|name|unvan/.test(n) && map.name === undefined) map.name = i;
    else if (/^il$|sehir|city|^il /.test(n) && map.city === undefined) map.city = i;
    else if (/ilce|ilçe|dist/.test(n) && map.district === undefined) map.district = i;
    else if (/telefon|tel|gsm|phone/.test(n) && map.phone === undefined) map.phone = i;
    else if (/whatsapp|wp|wapp/.test(n) && map.whatsapp === undefined) map.whatsapp = i;
    else if (/adres|address/.test(n) && map.address === undefined) map.address = i;
    else if (/logo|resim|gorsel|img|image/.test(n) && map.logo === undefined) map.logo = i;
  });
  return map;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CsvImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colMap, setColMap] = useState<Record<string, number>>({});
  const [importLog, setImportLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // ── Load cities & districts ──
  useEffect(() => {
    async function load() {
      const [{ data: c }, { data: d }] = await Promise.all([
        supabase.from("cities").select("id, name, slug").order("name"),
        supabase.from("districts").select("id, name, slug, city_id").order("name"),
      ]);
      if (c) setCities(c);
      if (d) setDistricts(d);
    }
    load();
  }, []);

  // ── File Upload ──
  const handleFile = useCallback(
    async (file: File) => {
      setStatus("parsing");
      setRows([]);
      setImportLog([]);

      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        alert("CSV dosyası boş ya da geçersiz.");
        setStatus("idle");
        return;
      }

      const hdrs = parsed[0];
      setHeaders(hdrs);
      const guessed = guessColumns(hdrs);
      setColMap(guessed);

      // Map rows using guessed columns
      const dataRows = parsed.slice(1);
      const mapped: ParsedRow[] = dataRows
        .filter(r => r.some(cell => cell.trim()))
        .map((r, i) => {
          const raw = guessed.name !== undefined ? r[guessed.name] || "" : r[0] || "";
          const cityCol = guessed.city !== undefined ? r[guessed.city] || "" : "";
          const districtCol = guessed.district !== undefined ? r[guessed.district] || "" : "";
          const phone = guessed.phone !== undefined ? r[guessed.phone] || "" : "";
          const whatsapp = guessed.whatsapp !== undefined ? r[guessed.whatsapp] || "" : "";
          const address = guessed.address !== undefined ? r[guessed.address] || "" : "";
          const logoUrl = guessed.logo !== undefined ? r[guessed.logo] || "" : "";

          // Try to extract city/district from firm name if columns are empty
          let firmName = raw;
          let cityName = cityCol;
          let districtName = districtCol;

          if (!cityName || !districtName) {
            const extracted = extractLocation(raw, cities, districts);
            firmName = extracted.firmName || raw;
            if (!cityName) cityName = extracted.cityName;
            if (!districtName) districtName = extracted.districtName;
          }

          return {
            _rowIndex: i,
            rawName: raw,
            name: firmName,
            cityName,
            districtName,
            phone: phone.replace(/\s/g, ""),
            whatsapp: whatsapp.replace(/\s/g, ""),
            address,
            logoUrl,
            status: "pending",
          };
        });

      // Resolve city/district IDs
      const resolved = mapped.map(row => {
        const cityMatch = cities.find(c => normalize(c.name) === normalize(row.cityName));
        const districtMatch = districts.find(d => normalize(d.name) === normalize(row.districtName));

        const slug = buildFirmSlug(row.name, row.cityName, row.districtName);

        return {
          ...row,
          cityId: cityMatch?.id,
          districtId: districtMatch?.id,
          cityMatch: (cityMatch ? (normalize(cityMatch.name) === normalize(row.cityName) ? "exact" : "fuzzy") : "none") as "exact" | "fuzzy" | "none",
          districtMatch: (districtMatch ? "exact" : row.districtName ? "none" : "none") as "exact" | "fuzzy" | "none",
          slug,
        };
      });

      setRows(resolved);
      setStatus("previewing");
    },
    [cities, districts]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Import ──
  const handleImport = async () => {
    setStatus("importing");
    setProgress(0);
    const logs: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "importing" } : r));

      try {
        // 0. Option A duplicate check (by phone or name + city + district)
        let isDuplicate = false;
        let dupReason = "";

        if (row.phone) {
          const cleanPhone = row.phone.replace(/\D/g, "");
          const cleanPhoneWithoutZero = cleanPhone.startsWith("0") ? cleanPhone.substring(1) : cleanPhone;
          
          if (cleanPhoneWithoutZero) {
            const { data: potentialMatches } = await supabase
              .from("firms")
              .select("id, name, phone")
              .not("phone", "is", null);

            if (potentialMatches) {
              const matched = potentialMatches.find(f => {
                if (!f.phone) return false;
                const dbClean = f.phone.replace(/\D/g, "");
                const dbCleanWithoutZero = dbClean.startsWith("0") ? dbClean.substring(1) : dbClean;
                return dbCleanWithoutZero === cleanPhoneWithoutZero;
              });
              if (matched) {
                isDuplicate = true;
                dupReason = `Telefon numarası zaten kayıtlı (${matched.name}: ${matched.phone})`;
              }
            }
          }
        }

        if (!isDuplicate && row.name && row.cityId && row.districtId) {
          const { data: dupName } = await supabase
            .from("firms")
            .select("id")
            .eq("name", row.name)
            .eq("city_id", row.cityId)
            .eq("district_id", row.districtId)
            .maybeSingle();

          if (dupName) {
            isDuplicate = true;
            dupReason = "Bu isimde aynı il ve ilçede kayıtlı firma zaten var.";
          }
        }

        if (isDuplicate) {
          setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: dupReason } : r));
          logs.push(`⚠️ Atlandı (Mükerrer): ${row.name} - ${dupReason}`);
          setImportLog([...logs]);
          setProgress(Math.round(((i + 1) / rows.length) * 100));
          if (i < rows.length - 1) await new Promise(r => setTimeout(r, 600));
          continue;
        }

        // 1. Download & re-upload logo if it's an external URL
        let logoUrl = row.logoUrl;
        if (logoUrl && !logoUrl.includes("supabase")) {
          try {
            const filenameBase = toSlug(row.name) + "-" + Date.now();
            const res = await fetch("/api/admin/download-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: logoUrl, filename: filenameBase }),
            });
            const data = await res.json();
            if (data.url) {
              logoUrl = data.url;
              logs.push(`✅ Logo kopyalandı: ${row.name}`);
            } else {
              logs.push(`⚠️ Logo indirilemedi (${row.name}): ${data.error}`);
            }
          } catch {
            logs.push(`⚠️ Logo indirilemedi: ${row.name}`);
          }
        }

        // 2. Auto-geocode
        let lat: number | null = null;
        let lng: number | null = null;
        try {
          const coords = await geocodeAddress({
            address: row.address || undefined,
            districtName: row.districtName || undefined,
            cityName: row.cityName || undefined,
          });
          if (coords) { lat = coords.latitude; lng = coords.longitude; }
        } catch { /* geocoding is best-effort */ }

        // 3. Build slug (ensure unique by appending random suffix if needed)
        let slug = row.slug || buildFirmSlug(row.name, row.cityName, row.districtName);
        // Check uniqueness
        const { data: existing } = await supabase
          .from("firms")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (existing) {
          slug = slug + "-" + Math.floor(Math.random() * 9000 + 1000);
        }

        // 4. Insert
        const { error } = await supabase.from("firms").insert({
          name: row.name,
          slug,
          phone: row.phone || null,
          whatsapp: row.whatsapp || null,
          address: row.address || null,
          city_id: row.cityId || null,
          district_id: row.districtId || null,
          logo_url: logoUrl || null,
          latitude: lat,
          longitude: lng,
          is_active: true,
          is_verified: false,
          is_premium: false,
          rating: 0,
          review_count: 0,
        });

        if (error) throw error;

        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "done", slug, newLogoUrl: logoUrl } : r));
        logs.push(`✅ Eklendi: ${row.name} (${slug})`);
      } catch (err: any) {
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: "error", error: err.message } : r));
        logs.push(`❌ Hata (${row.name}): ${err.message}`);
      }

      setProgress(Math.round(((i + 1) / rows.length) * 100));
      setImportLog([...logs]);

      // Small delay to avoid hammering geocode API
      if (i < rows.length - 1) await new Promise(r => setTimeout(r, 600));
    }

    setStatus("done");
  };

  const updateRow = (index: number, field: keyof ParsedRow, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };
      // Re-resolve city/district IDs when changed
      if (field === "cityName" || field === "districtName" || field === "name") {
        const cityMatch = cities.find(c => normalize(c.name) === normalize(row.cityName));
        const districtMatch = districts.find(d => normalize(d.name) === normalize(row.districtName));
        row.cityId = cityMatch?.id;
        row.districtId = districtMatch?.id;
        row.cityMatch = cityMatch ? "exact" : row.cityName ? "none" : "none";
        row.districtMatch = districtMatch ? "exact" : row.districtName ? "none" : "none";
        row.slug = buildFirmSlug(row.name, row.cityName, row.districtName);
      }
      updated[index] = row;
      return updated;
    });
  };

  const doneCount = rows.filter(r => r.status === "done").length;
  const errorCount = rows.filter(r => r.status === "error").length;

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Toplu Firma Yükleme</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-1 uppercase tracking-wider">
          CSV dosyasından firma aktar · Logo URL'leri otomatik kopyalanır · Konum otomatik tespit edilir
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 text-xs text-sky-800 space-y-2">
        <p className="font-bold text-sm">📋 CSV Formatı</p>
        <p>Desteklenen sütunlar (herhangi bir sırada olabilir, Türkçe başlıklar desteklenir):</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {[
            ["Firma Adı", "firma, ad, isim, name"],
            ["Şehir", "il, sehir, city"],
            ["İlçe", "ilçe, ilce, district"],
            ["Telefon", "telefon, tel, phone"],
            ["WhatsApp", "whatsapp, wp"],
            ["Adres", "adres, address"],
            ["Logo URL", "logo, resim, image"],
          ].map(([label, keys]) => (
            <div key={label} className="bg-white border border-sky-100 rounded-lg p-2">
              <p className="font-bold">{label}</p>
              <p className="text-sky-600 text-[10px] mt-0.5">{keys}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sky-700">
          💡 <strong>İl/ilçe sütunu yoksa</strong> — sistem firma adından otomatik tespit eder.
          Örn: <em>"Ahmet Su Arıtma İstanbul Bağcılar"</em> → Firma: <em>"Ahmet Su Arıtma"</em>, Şehir: <em>"İstanbul"</em>, İlçe: <em>"Bağcılar"</em>
        </p>
      </div>

      {/* Upload Zone */}
      {status === "idle" || status === "parsing" ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#0EA5E9]/30 rounded-2xl p-16 text-center cursor-pointer hover:border-[#0EA5E9] hover:bg-sky-50 transition-all group"
        >
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-sky-200 transition-colors">
            <svg className="w-8 h-8 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          {status === "parsing" ? (
            <p className="text-sm font-bold text-[#0EA5E9] animate-pulse">CSV ayrıştırılıyor...</p>
          ) : (
            <>
              <p className="text-sm font-bold text-[#0F172A]">CSV dosyasını buraya sürükleyin</p>
              <p className="text-xs text-[#0F172A]/50 mt-1">ya da tıklayarak seçin · .csv, UTF-8 veya Excel (BOM'lu)</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>
      ) : null}

      {/* Preview Table */}
      {(status === "previewing" || status === "importing" || status === "done") && rows.length > 0 && (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
              <span className="text-xs font-bold text-[#0F172A]">{rows.length} satır</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-bold text-emerald-700">
                {rows.filter(r => r.cityId).length} şehir eşleşti
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-xs font-bold text-amber-700">
                {rows.filter(r => !r.cityId).length} şehir eşleşmedi
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
              <span className="text-xs font-bold text-violet-700">
                {rows.filter(r => r.logoUrl).length} logo URL var
              </span>
            </div>

            <div className="ml-auto flex gap-2">
              {status === "previewing" && (
                <>
                  <button
                    onClick={() => { setStatus("idle"); setRows([]); }}
                    className="px-4 py-2 text-xs font-bold border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    ← Yeni Dosya
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-5 py-2 text-xs font-bold bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-xl transition-colors shadow-md shadow-sky-500/20"
                  >
                    🚀 {rows.length} Firmayı İçe Aktar
                  </button>
                </>
              )}
              {status === "importing" && (
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0EA5E9] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#0EA5E9]">%{progress}</span>
                </div>
              )}
              {status === "done" && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600">✅ {doneCount} eklendi</span>
                  {errorCount > 0 && <span className="text-xs font-bold text-red-500">❌ {errorCount} hata</span>}
                  <button
                    onClick={() => { setStatus("idle"); setRows([]); setImportLog([]); setProgress(0); }}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    Yeni İçe Aktarım
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded-xl border border-[#E2E8F0] shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50 w-6">#</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">Firma Adı</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">Şehir</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">İlçe</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">Telefon</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">Logo</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">Slug</th>
                  <th className="text-left px-3 py-3 font-bold text-[#0F172A]/50">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      row.status === "done" ? "bg-emerald-50" :
                      row.status === "error" ? "bg-red-50" :
                      row.status === "importing" ? "bg-sky-50 animate-pulse" :
                      "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-3 py-2 text-[#0F172A]/40 font-mono">{i + 1}</td>

                    {/* Firm Name */}
                    <td className="px-3 py-2">
                      {status === "previewing" ? (
                        <input
                          value={row.name}
                          onChange={e => updateRow(i, "name", e.target.value)}
                          className="w-full min-w-[140px] bg-transparent border-0 border-b border-dashed border-slate-300 focus:border-sky-400 outline-none font-semibold text-[#0F172A] py-0.5"
                        />
                      ) : (
                        <span className="font-semibold text-[#0F172A]">{row.name}</span>
                      )}
                    </td>

                    {/* City */}
                    <td className="px-3 py-2">
                      {status === "previewing" ? (
                        <div className="relative">
                          <input
                            value={row.cityName}
                            onChange={e => updateRow(i, "cityName", e.target.value)}
                            list={`city-list-${i}`}
                            className={`w-full min-w-[100px] bg-transparent border-0 border-b border-dashed outline-none py-0.5 font-medium ${
                              row.cityId ? "border-emerald-400 text-emerald-700" : "border-amber-400 text-amber-700"
                            }`}
                          />
                          <datalist id={`city-list-${i}`}>
                            {cities.map(c => <option key={c.id} value={c.name} />)}
                          </datalist>
                        </div>
                      ) : (
                        <span className={row.cityId ? "text-emerald-700 font-semibold" : "text-amber-600"}>
                          {row.cityName || "—"}
                        </span>
                      )}
                    </td>

                    {/* District */}
                    <td className="px-3 py-2">
                      {status === "previewing" ? (
                        <div>
                          <input
                            value={row.districtName}
                            onChange={e => updateRow(i, "districtName", e.target.value)}
                            list={`district-list-${i}`}
                            className={`w-full min-w-[100px] bg-transparent border-0 border-b border-dashed outline-none py-0.5 font-medium ${
                              row.districtId ? "border-emerald-400 text-emerald-700" : "border-slate-300 text-slate-500"
                            }`}
                          />
                          <datalist id={`district-list-${i}`}>
                            {districts
                              .filter(d => !row.cityId || d.city_id === row.cityId)
                              .map(d => <option key={d.id} value={d.name} />)}
                          </datalist>
                        </div>
                      ) : (
                        <span className={row.districtId ? "text-emerald-700 font-semibold" : "text-slate-400"}>
                          {row.districtName || "—"}
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-2 font-mono text-slate-600">{row.phone || "—"}</td>

                    {/* Logo */}
                    <td className="px-3 py-2">
                      {row.newLogoUrl ? (
                        <a href={row.newLogoUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">
                          ✅ Kopyalandı
                        </a>
                      ) : row.logoUrl ? (
                        <span className="text-violet-600 font-medium truncate max-w-[80px] inline-block" title={row.logoUrl}>
                          🔗 Var
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Slug */}
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-400 max-w-[150px] truncate" title={row.slug}>
                      {row.slug}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      {row.status === "pending" && <span className="text-slate-400">—</span>}
                      {row.status === "importing" && (
                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      {row.status === "done" && <span className="text-emerald-600 font-bold">✅</span>}
                      {row.status === "error" && (
                        <span className="text-red-500 font-bold" title={row.error}>❌</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Log */}
      {importLog.length > 0 && (
        <div className="bg-[#0F172A] rounded-xl p-5 max-h-64 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Import Log</p>
          {importLog.map((line, i) => (
            <p key={i} className={`font-mono text-xs mb-1 ${
              line.startsWith("✅") ? "text-emerald-400" :
              line.startsWith("❌") ? "text-red-400" :
              "text-amber-400"
            }`}>
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
