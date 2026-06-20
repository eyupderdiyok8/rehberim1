import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ComparisonTable from "@/components/ComparisonTable";

export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

export function generateMetadata() {
  return {
    title: "Firma Karsilastir — Su Aritma Rehberi",
    description: "Su aritma firmalarini puan, yorum sayisi ve fiyatlara gore yan yana karsilastirin.",
    alternates: { canonical: "https://suaritmarehberi.com.tr/karsilastir" },
    openGraph: {
      title: "Firma Karsilastir — Su Aritma Rehberi",
      description: "Su aritma firmalarini yan yana karsilastirin.",
      url: "https://suaritmarehberi.com.tr/karsilastir",
      siteName: "Su Aritma Rehberi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default async function KarsilastirPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const idsParam = params.ids;
  const ids = idsParam ? idsParam.split(",").filter(Boolean).slice(0, 3) : [];

  let firms: any[] = [];

  if (ids.length >= 2) {
    const { data } = await supabase
      .from("firms")
      .select(`
        *,
        city:cities(name),
        district:districts(name),
        firm_services(
          price_min, price_max,
          service:services(name, slug)
        )
      `)
      .in("id", ids);

    // Preserve the order from the URL param
    firms = ids
      .map((id) => (data ?? []).find((f) => f.id === id))
      .filter(Boolean) as any[];
  }

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Firma Karsilastir" },
          ]}
        />

        <div className="mt-6 mb-8">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0EA5E9] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Karsilastir
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Firma Karsilastirma
          </h1>
          <p className="mt-3 text-sm text-[#0F172A]/55 max-w-2xl">
            Sectiginiz firmalari puan, yorum sayisi ve hizmet fiyatlarina gore yan yana karsilastirin.
            En iyi secenegi kolayca belirleyin.
          </p>
        </div>

        {ids.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#F8FAFC] border border-[#E2E8F0] border-dashed rounded-2xl">
            <svg className="w-16 h-16 text-[#CBD5E1] mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-extrabold text-[#0F172A] mb-2">
              Karsilastirma icin firma secin
            </h2>
            <p className="text-sm text-[#0F172A]/50 text-center max-w-md mb-6">
              Karsilastirma yapmak icin firma listeleme sayfalarindan en az 2, en fazla 3 firma secebilirsiniz.
              Firma kartlarinin uzerindeki &quot;Karsilastir&quot; kutucugunu isaretleyin.
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Firma Ara
            </a>
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
              <ComparisonTable firms={firms} />
            </div>

            {/* Helper text */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 inline-block" />
                En iyi deger vurgulandi
              </span>
              <span>Fiyatlar firma tarafindan belirlenir ve degisebilir.</span>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
