import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CityFirmsPage from '@/components/pages/CityFirmsPage';
import DistrictFirmsPage from '@/components/pages/DistrictFirmsPage';
import CityPricePage from '@/components/pages/CityPricePage';
import DistrictPricePage from '@/components/pages/DistrictPricePage';
import EmptyDistrictPage from '@/components/pages/EmptyDistrictPage';

export const revalidate = 3600; // Revalidate every hour

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('page_urls')
    .select('slug');

  return (data ?? []).map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;

  const { data } = await supabase
    .from('page_urls')
    .select('meta_title, meta_desc')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) return {};

  // Dinamik yıl: fiyat sayfalarına otomatik yıl ekle
  const year = new Date().getFullYear();
  const isPricePage = slug.includes('fiyatlari');
  const title = isPricePage ? `${data.meta_title} ${year}` : data.meta_title;

  return {
    title,
    description: data.meta_desc,
    alternates: {
      canonical: `https://suaritmarehberi.com.tr/${slug}`,
    },
    openGraph: {
      title,
      description: data.meta_desc,
      url: `https://suaritmarehberi.com.tr/${slug}`,
      siteName: 'Su Arıtma Rehberi',
      locale: 'tr_TR',
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageParams) {
  const { slug } = await params;

  // Fetch the page URL configuration from Supabase
  const { data: pageUrl } = await supabase
    .from('page_urls')
    .select(`
      *,
      city:cities(*),
      district:districts(*),
      service:services(*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (!pageUrl) {
    // URL pattern: {district-slug}-{service-slug}-firmalari
    // Strip the -firmalari suffix, then find a district whose slug is a prefix of what remains.
    if (slug.endsWith('-firmalari')) {
      const withoutSuffix = slug.slice(0, -'-firmalari'.length);

      const { data: allDistricts } = await supabase
        .from('districts')
        .select('id, name, slug, city:cities(id, name, slug)');

      // Sort longest slug first so the most specific match wins
      const matched = (allDistricts ?? [])
        .sort((a, b) => b.slug.length - a.slug.length)
        .find((d) => withoutSuffix === d.slug || withoutSuffix.startsWith(d.slug + '-'));

      if (matched) {
        const cityObj = Array.isArray(matched.city) ? matched.city[0] : matched.city as any;

        // Check if there are firms in this district
        const { data: districtFirms } = await supabase
          .from('firms')
          .select(`
            id, name, slug, address, rating, review_count,
            is_premium, is_verified, logo_url,
            latitude, longitude,
            district:districts(id, name),
            firm_services(price_min, price_max, service:services(name, slug))
          `)
          .eq('is_active', true)
          .or(`district_id.eq.${matched.id},and(city_id.eq.${cityObj?.id},is_premium.eq.true)`)
          .order('is_premium', { ascending: false })
          .order('rating', { ascending: false })
          .limit(20);

        const firmsList = districtFirms ?? [];

        if (firmsList.length === 0) {
          return (
            <EmptyDistrictPage districtName={matched.name} cityName={cityObj?.name} citySlug={cityObj?.slug} />
          );
        }

        // Detect which service the URL refers to from the slug
        const KNOWN_SERVICES = [
          { name: "Su Arıtma Cihazı",   slug: "su-aritma-cihazi" },
          { name: "Su Arıtma Filtresi", slug: "su-aritma-filtresi" },
          { name: "Su Arıtma Servisi",  slug: "su-aritma-servisi" },
          { name: "Su Arıtma Bakımı",   slug: "su-aritma-bakimi" },
          { name: "Su Arıtma Montajı",  slug: "su-aritma-montaji" },
          { name: "Endüstriyel Arıtma", slug: "endustriyel-aritma" },
        ];
        const detectedService = KNOWN_SERVICES.find((s) =>
          withoutSuffix.includes(s.slug)
        ) ?? { name: "Su Arıtma", slug: "su-aritma" };

        // Synthesize a minimal pageUrl object so DistrictFirmsPage can render
        const syntheticPageUrl = {
          slug,
          page_type: 'district_firms',
          meta_title: `${matched.name} ${detectedService.name} Firmaları`,
          meta_desc: `${matched.name} ilçesindeki ${detectedService.name.toLowerCase()} firmaları, fiyatlar ve müşteri yorumları.`,
          city_id: cityObj?.id,
          district_id: matched.id,
          city: cityObj,
          district: matched,
          service: detectedService,
          faqs: [],
          h1: null,
          body: null,
        };

        return <DistrictFirmsPage pageUrl={syntheticPageUrl as any} firms={firmsList} banner={null} midBanner={null} recentReviews={undefined} />;
      }
    }

    notFound();
  }

  // Dinamik yıl: fiyat sayfalarına otomatik yıl ekle
  const currentYear = new Date().getFullYear();
  const isPricePage = pageUrl.page_type.includes('price');
  const displayTitle = isPricePage ? `${pageUrl.meta_title} ${currentYear}` : pageUrl.meta_title;

  // Fetch firms associated with this city/district
  let query = supabase
    .from('firms')
    .select(`
      id, name, slug, address, rating, review_count,
      is_premium, is_verified, logo_url,
      latitude, longitude,
      district:districts(id, name),
      firm_services(
        price_min, price_max,
        service:services(name, slug)
      )
    `)
    .eq('is_active', true);

  if (pageUrl.district_id) {
    // District page: show district firms + premium firms from the same city
    query = query.or(
      `district_id.eq.${pageUrl.district_id},and(city_id.eq.${pageUrl.city_id},is_premium.eq.true)`
    );
  } else if (pageUrl.city_id) {
    query = query.eq('city_id', pageUrl.city_id);
  }

  const { data: firms } = await query
    .order('is_premium', { ascending: false })
    .order('rating', { ascending: false })
    .limit(20);

  const firmsList = firms ?? [];

  // Fetch banners based on page type
  const buildBannerQuery = (placement: string) =>
    supabase
      .from('banners')
      .select('*')
      .eq('placement', placement)
      .eq('is_active', true)
      .or(`city_id.eq.${pageUrl.city_id || 'null'},city_id.is.null`)
      .lte('starts_at', new Date().toISOString())
      .gte('ends_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

  // Fetch appropriate banners concurrently
  const bannerResults = isPricePage
    ? await Promise.all([buildBannerQuery('price_sidebar')])
    : await Promise.all([buildBannerQuery('firms_list_top'), buildBannerQuery('firms_list_mid')]);

  const banner = bannerResults[0] ?? null;
  const midBanner = !isPricePage ? (bannerResults[1] ?? null) : null;

  // Fetch recent reviews for this region
  let reviewsQuery = supabase
    .from('reviews')
    .select(`
      id, author_name, rating, body, created_at,
      firm:firms!inner(name, slug, city_id, district_id)
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(4);

  if (pageUrl.district_id) {
    reviewsQuery = reviewsQuery.eq('firm.district_id', pageUrl.district_id);
  } else if (pageUrl.city_id) {
    reviewsQuery = reviewsQuery.eq('firm.city_id', pageUrl.city_id);
  }
  const { data: recentReviews } = await reviewsQuery;
  const reviews = (recentReviews ?? undefined) as any[] | undefined;

  // JSON-LD with optional FAQSchema
  const graph = [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Ana Sayfa",
          "item": "https://suaritmarehberi.com.tr"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": pageUrl.city?.name,
          "item": `https://suaritmarehberi.com.tr/${pageUrl.city?.slug}-${pageUrl.service?.slug}-firmalari`
        },
        ...(pageUrl.district ? [{
          "@type": "ListItem",
          "position": 3,
          "name": pageUrl.district.name,
          "item": `https://suaritmarehberi.com.tr/${pageUrl.district.slug}-${pageUrl.service?.slug}-firmalari`
        }] : []),
        {
          "@type": "ListItem",
          "position": pageUrl.district ? 4 : 3,
          "name": displayTitle
        }
      ]
    },
    {
      "@type": "ItemList",
      "name": displayTitle,
      "description": pageUrl.meta_desc,
      "url": `https://suaritmarehberi.com.tr/${slug}`,
      "numberOfItems": firmsList.length,
      "itemListElement": firmsList.map((firm, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": firm.name,
          "url": `https://suaritmarehberi.com.tr/firma/${firm.slug}`
        }
      }))
    }
  ];

  if (pageUrl.faqs && pageUrl.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      // @ts-ignore
      "mainEntity": pageUrl.faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph
  };

  const renderPage = () => {
    switch (pageUrl.page_type) {
      case 'city_firms':
        return <CityFirmsPage pageUrl={pageUrl} firms={firmsList} banner={banner} midBanner={midBanner} recentReviews={reviews} />;
      case 'district_firms':
        return <DistrictFirmsPage pageUrl={pageUrl} firms={firmsList} banner={banner} midBanner={midBanner} recentReviews={reviews} />;
      case 'city_price':
        return <CityPricePage pageUrl={pageUrl} firms={firmsList} sidebarBanner={banner} recentReviews={reviews} />;
      case 'district_price':
        return <DistrictPricePage pageUrl={pageUrl} firms={firmsList} sidebarBanner={banner} recentReviews={reviews} />;
      default:
        return <div>Invalid Page Type</div>;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {renderPage()}
    </>
  );
}
