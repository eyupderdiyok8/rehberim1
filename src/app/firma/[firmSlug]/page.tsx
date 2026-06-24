import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import FirmCard from "@/components/FirmCard";
import FirmReviewForm from "@/components/FirmReviewForm";
import TrackFirmView from "@/components/TrackFirmView";
import TrackLink from "@/components/TrackLink";
import BannerSlot from "@/components/BannerSlot";
import BannerPlaceholder from "@/components/BannerPlaceholder";
import ImageLightbox from "@/components/ImageLightbox";
import ProductGallery from "@/components/ProductGallery";
import Image from "next/image";

export const revalidate = 3600;

function appendUtm(url: string, firmSlug: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    u.searchParams.set("utm_source", "suaritmarehberi");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", firmSlug);
    return u.toString();
  } catch {
    return url;
  }
}

function getMapsEmbedUrl(url: string): string {
  // Already an embed URL
  if (url.includes("/maps/embed")) return url;
  // Google Maps share URL (maps.app.goo.gl/...)
  if (url.includes("maps.app.goo.gl")) {
    return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
  }
  // Google Maps place URL
  if (url.includes("/maps/place/")) {
    const placeMatch = url.match(/\/maps\/place\/([^/?]+)/);
    if (placeMatch) {
      return `https://www.google.com/maps?q=${placeMatch[1]}&output=embed`;
    }
  }
  // Fallback: use as search query
  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

interface PageParams {
  params: Promise<{ firmSlug: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("firms").select("slug");
  return (data ?? []).map((row) => ({ firmSlug: row.slug }));
}

export async function generateMetadata({ params }: PageParams) {
  const { firmSlug } = await params;
  const { data: firm } = await supabase
    .from("firms")
    .select("name, description, city:cities(name)")
    .eq("slug", firmSlug)
    .maybeSingle();

  if (!firm) return {};
  const cityName = Array.isArray(firm.city) ? firm.city[0]?.name : (firm.city as any)?.name;
  return {
    title: `${firm.name} | ${cityName ?? ""} Su Arıtma Firması — Su Arıtma Rehberi`,
    description:
      firm.description ||
      `${firm.name} iletişim bilgileri, hizmet fiyatları ve müşteri yorumları. ${cityName ?? ""} bölgesinde su arıtma çözümleri.`,
    alternates: {
      canonical: `https://suaritmarehberi.com.tr/firma/${firmSlug}`,
    },
    openGraph: {
      title: `${firm.name} | ${cityName ?? ""} Su Arıtma`,
      description: firm.description || `${firm.name} iletişim ve yorumlar.`,
      url: `https://suaritmarehberi.com.tr/firma/${firmSlug}`,
      siteName: "Su Arıtma Rehberi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function FirmProfilePage({ params }: PageParams) {
  const { firmSlug } = await params;

  const { data: firm } = await supabase
    .from("firms")
    .select(`
      *,
      city:cities(id, name, slug),
      district:districts(id, name, slug),
      firm_services(
        price_min, price_max,
        service:services(name, slug)
      )
    `)
    .eq("slug", firmSlug)
    .maybeSingle();

  if (!firm) notFound();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, review_images(id, image_url, sort_order)")
    .eq("firm_id", firm.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const reviewsList = reviews ?? [];

  // Fetch products
  const { data: products } = await supabase
    .from("firm_products")
    .select("*")
    .eq("firm_id", firm.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const productsList = products ?? [];

  const cityObj = Array.isArray(firm.city) ? firm.city[0] : firm.city;
  const districtObj = Array.isArray(firm.district) ? firm.district[0] : firm.district;

  // Fetch banner only if firm is NOT premium
  let banner = null;
  if (!firm.is_premium) {
    const { data: bannerData } = await supabase
      .from("banners")
      .select("*")
      .eq("placement", "firm_profile_sidebar")
      .eq("is_active", true)
      .or(`city_id.eq.${firm.city_id || 'null'},city_id.is.null`)
      .lte('starts_at', new Date().toISOString())
      .gte('ends_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();
    banner = bannerData;
  }

  // Related firms in same city
  const { data: relatedFirms } = await supabase
    .from("firms")
    .select(`
      id, name, slug, rating, review_count,
      is_premium, is_verified,
      district:districts(name),
      firm_services(
        price_min, price_max,
        service:services(name, slug)
      )
    `)
    .eq("city_id", firm.city_id)
    .eq("is_active", true)
    .neq("id", firm.id)
    .order("is_premium", { ascending: false })
    .order("rating", { ascending: false })
    .limit(3);

  const avgRating =
    reviewsList.length > 0
      ? reviewsList.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsList.length
      : Number(firm.rating);

  const firstService = firm.firm_services?.[0]?.service;
  const serviceSlug = firstService?.slug ?? "su-aritma-cihazi";
  const citySlug = cityObj?.slug ?? "";
  const districtSlug = districtObj?.slug ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: firm.name,
    image: "https://suaritmarehberi.com.tr/logo.png",
    "@id": `https://suaritmarehberi.com.tr/firma/${firm.slug}`,
    url: `https://suaritmarehberi.com.tr/firma/${firm.slug}`,
    telephone: firm.phone || "",
    address: {
      "@type": "PostalAddress",
      streetAddress: firm.address || "",
      addressLocality: districtObj?.name || "",
      addressRegion: cityObj?.name || "",
      addressCountry: "TR",
    },
    aggregateRating: reviewsList.length > 0 ? {
      "@type": "AggregateRating",
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviewsList.length,
    } : undefined,
  };

  return (
    <div className="min-h-full flex flex-col bg-white">
      <TrackFirmView firmId={firm.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            ...(cityObj
              ? [{ label: cityObj.name, href: `/${citySlug}-${serviceSlug}-firmalari` }]
              : []),
            ...(districtObj
              ? [{ label: districtObj.name, href: `/${districtSlug}-${serviceSlug}-firmalari` }]
              : []),
            { label: firm.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── LEFT / MAIN ─────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <div className={`border rounded-xl overflow-hidden bg-white shadow-sm ${
              firm.is_premium
                ? "border-amber-200/60 ring-1 ring-amber-100 shadow-amber-100/30"
                : "border-[#E2E8F0]"
            }`}>
              {/* Premium Gold Accent Bar */}
              {firm.is_premium && (
                <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
              )}
              {/* Cover Image */}
              {firm.cover_image_url ? (
                <div className="w-full h-32 sm:h-48 relative bg-[#F8FAFC]">
                  <Image
                    src={firm.cover_image_url}
                    alt={`${firm.name} kapak görseli`}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full h-24 sm:h-32 bg-gradient-to-r from-[#F1F5F9] to-[#E2E8F0]" />
              )}

              <div className="px-6 pb-6 relative">
                {/* Logo & Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12 relative z-10">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center font-bold text-2xl text-[#0F172A] shrink-0 overflow-hidden relative">
                      {firm.logo_url ? (
                        <Image src={firm.logo_url} alt={firm.name} fill sizes="96px" className="object-contain" />
                      ) : (
                        firm.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("")
                      )}
                    </div>
                    <div className="pb-1">
                      <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                        {firm.name}
                      </h1>
                      <p className="text-sm text-[#0F172A]/60 font-semibold mt-1">
                        {[cityObj?.name, districtObj?.name].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap sm:justify-end pb-2">
                    {firm.is_premium && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1.5 border border-amber-200 shadow-sm shadow-amber-100/50">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Premium Üye
                      </span>
                    )}
                    {firm.is_verified && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-emerald-700 bg-emerald-50 px-2.5 py-1.5 border border-emerald-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Onaylı Firma
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating summary */}
                <div className="flex items-center gap-3 pb-5 border-b border-[#E2E8F0] mb-5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < Math.round(avgRating) ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-extrabold text-[#0F172A]">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-[#0F172A]/45 font-medium">
                    ({reviewsList.length} müşteri yorumu)
                  </span>
                </div>

                {/* Description */}
                {firm.description && (
                  <p className="text-[15px] text-[#0F172A]/75 leading-relaxed font-medium">
                    {firm.description}
                  </p>
                )}

                {/* Premium Trust Strip */}
                {firm.is_premium && (
                  <div className="mt-5 pt-5 border-t border-amber-100 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-black text-amber-600">{reviewsList.length}</p>
                      <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Müşteri Yorumu</p>
                    </div>
                    <div className="text-center border-x border-amber-100">
                      <p className="text-lg font-black text-amber-600">{avgRating.toFixed(1)}</p>
                      <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Ortalama Puan</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-amber-600">✓</p>
                      <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Onaylı Firma</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services & Prices */}
            {firm.firm_services && firm.firm_services.length > 0 && (
              <div className={`border rounded-lg overflow-hidden ${
                firm.is_premium ? "border-amber-200/60" : "border-[#E2E8F0]"
              }`}>
                <div className={`px-6 py-4 border-b ${
                  firm.is_premium
                    ? "bg-gradient-to-r from-amber-50/50 to-transparent border-amber-200/60"
                    : "bg-[#F8FAFC] border-[#E2E8F0]"
                }`}>
                  <h2 className="font-extrabold text-sm text-[#0F172A]">
                    Sunulan Hizmetler ve Fiyat Aralıkları
                  </h2>
                </div>
                <div className="divide-y divide-[#E2E8F0]">
                  {firm.firm_services.map((fs: any) => (
                    <div
                      key={fs.service.slug}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shrink-0" />
                        <span className="text-sm font-semibold text-[#0F172A]">
                          {fs.service.name}
                        </span>
                      </div>
                      <span className="text-sm text-[#0F172A]/60 font-medium">
                        {fs.price_min && fs.price_max
                          ? `₺${Number(fs.price_min).toLocaleString("tr-TR")} – ₺${Number(fs.price_max).toLocaleString("tr-TR")}`
                          : "Fiyat için arayın"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {productsList.length > 0 && (
              <div className={`border rounded-lg overflow-hidden ${
                firm.is_premium ? "border-amber-200/60" : "border-[#E2E8F0]"
              }`}>
                <div className={`px-6 py-4 border-b ${
                  firm.is_premium
                    ? "bg-gradient-to-r from-amber-50/50 to-transparent border-amber-200/60"
                    : "bg-[#F8FAFC] border-[#E2E8F0]"
                }`}>
                  <h2 className="font-extrabold text-sm text-[#0F172A]">
                    Ürünler
                  </h2>
                </div>
                <ProductGallery
                  products={productsList}
                  firmName={firm.name}
                  firmWhatsapp={firm.whatsapp}
                  isPremium={firm.is_premium}
                />
              </div>
            )}

            {/* Reviews */}
            <div className={`border rounded-lg overflow-hidden ${
              firm.is_premium ? "border-amber-200/60" : "border-[#E2E8F0]"
            }`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                firm.is_premium
                  ? "bg-gradient-to-r from-amber-50/50 to-transparent border-amber-200/60"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}>
                <h2 className="font-extrabold text-sm text-[#0F172A]">
                  Müşteri Yorumları
                </h2>
                <span className="text-xs text-[#0F172A]/45 font-medium">
                  {reviewsList.length} yorum
                </span>
              </div>

              {reviewsList.length > 0 ? (
                <div className="divide-y divide-[#E2E8F0]">
                  {reviewsList.map((review: any) => (
                    <div key={review.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">
                            {review.author_name}
                          </p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${i < review.rating ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[11px] text-[#0F172A]/35 shrink-0">
                          {new Date(review.created_at).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {review.body && (
                        <p className="text-sm text-[#0F172A]/65 leading-relaxed">
                          {review.body}
                        </p>
                      )}
                      {review.review_images && review.review_images.length > 0 && (
                        <ImageLightbox
                          images={review.review_images}
                          alt={`${firm.name} su arıtma müşteri yorumu`}
                        />
                      )}
                      {review.reply_body && (
                        <div className="mt-3 ml-4 p-3.5 border-l-[3px] border-l-amber-400 bg-gradient-to-r from-amber-50/60 to-transparent rounded-r-lg space-y-1">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                            ⭐ Firma Yanıtı
                          </p>
                          <p className="text-sm text-[#0F172A]/75 leading-relaxed">
                            {review.reply_body}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-[#0F172A]/50">
                    Henüz onaylanmış yorum bulunmuyor.
                  </p>
                </div>
              )}
            </div>

            {/* Review Submission Form */}
            <FirmReviewForm firmId={firm.id} firmName={firm.name} />

            {/* Related firms */}
            {!firm.is_premium && relatedFirms && relatedFirms.length > 0 && (
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] mb-4">
                  {cityObj?.name} Bölgesindeki Diğer Firmalar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedFirms.map((f: any) => (
                    <FirmCard key={f.id} firm={f} cityName={cityObj?.name} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT / CONTACT SIDEBAR ─────────────── */}
          <div className="space-y-4">
            {/* Contact card */}
            <div className={`border rounded-lg overflow-hidden ${
              firm.is_premium ? "border-amber-200/60" : "border-[#E2E8F0]"
            }`}>
              <div className={`px-5 py-4 border-b ${
                firm.is_premium
                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200/60"
                  : "bg-[#F8FAFC] border-[#E2E8F0]"
              }`}>
                <h3 className={`font-bold text-[15px] ${
                  firm.is_premium ? "text-amber-800" : "text-[#0F172A]"
                }`}>
                  {firm.is_premium ? "⭐ İletişim" : "İletişim"}
                </h3>
              </div>
              <div className="px-5 py-5 space-y-5">
                {firm.phone && (
                  <div>
                    <p className="text-[11px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-1">
                      Telefon
                    </p>
                    <a
                      href={`tel:${firm.phone}`}
                      className="text-sm font-bold text-[#0F172A] hover:text-[#0EA5E9] transition-colors"
                    >
                      {firm.phone}
                    </a>
                  </div>
                )}

                {firm.whatsapp && (
                  <div>
                    <p className="text-[11px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-1">
                      WhatsApp
                    </p>
                    <a
                      href={`https://wa.me/${firm.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                    >
                      Mesaj Gönder →
                    </a>
                  </div>
                )}

                {firm.email && (
                  <div>
                    <p className="text-[11px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-1">
                      E-Posta
                    </p>
                    <a
                      href={`mailto:${firm.email}`}
                      className="text-sm font-semibold text-[#0F172A] hover:underline break-all"
                    >
                      {firm.email}
                    </a>
                  </div>
                )}

                {firm.website && (
                  <div>
                    <p className="text-[11px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-1">
                      Web Sitesi
                    </p>
                    <a
                      href={appendUtm(firm.website, firm.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#0EA5E9] hover:underline break-all"
                    >
                      {firm.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                {firm.address && (
                  <div className="pt-4 border-t border-[#E2E8F0]">
                    <p className="text-[11px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-1">
                      Adres
                    </p>
                    <p className="text-sm text-[#0F172A]/65 leading-relaxed">
                      {firm.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Google Maps (Premium) */}
            {firm.is_premium && firm.google_maps_url && (
              <div className="border border-amber-200/60 rounded-lg overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200/60">
                  <h3 className="font-extrabold text-sm text-amber-800">📍 Konum</h3>
                </div>
                <div className="aspect-video w-full">
                  <iframe
                    src={getMapsEmbedUrl(firm.google_maps_url)}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${firm.name} konum haritası`}
                  />
                </div>
              </div>
            )}

            {/* Quick CTA */}
            {firm.phone && (
              <TrackLink
                href={`tel:${firm.phone}`}
                firmId={firm.id}
                type="contact_click"
                className={`w-full flex items-center justify-center gap-2 text-center font-bold text-sm py-3 rounded-lg transition-colors duration-150 ${
                  firm.is_premium
                    ? "bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-md shadow-sky-500/10"
                    : "bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hemen Ara
              </TrackLink>
            )}
            {firm.whatsapp && (
              <TrackLink
                href={`https://wa.me/${firm.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                firmId={firm.id}
                type="contact_click"
                className={`w-full flex items-center justify-center gap-2 text-center font-bold text-sm py-3 rounded-lg transition-colors duration-150 ${
                  firm.is_premium
                    ? "bg-[#25D366] hover:bg-[#20BA56] border-none text-white shadow-md shadow-green-500/10"
                    : "border border-[#0F172A] hover:bg-[#0F172A] hover:text-white text-[#0F172A]"
                }`}
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp ile Yaz
              </TrackLink>
            )}

            {/* Sidebar Banner (competitor ad) shown ONLY for standard firms */}
            {!firm.is_premium && (
              banner ? (
                <BannerSlot banner={banner} variant="sidebar" />
              ) : (
                <BannerPlaceholder variant="sidebar" />
              )
            )}

            {/* Back to listings */}
            {cityObj && firstService && (
              <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#F8FAFC]">
                <p className="text-[10px] uppercase font-bold text-[#0F172A]/40 tracking-wide mb-2">
                  Diğer Firmalar
                </p>
                <a
                  href={`/${citySlug}-${serviceSlug}-firmalari`}
                  className="text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                >
                  {cityObj.name} {firstService.name} Firmalarına Dön →
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
