import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

interface Props {
  districtName: string;
  cityName?: string;
  citySlug?: string;
}

export default function EmptyDistrictPage({ districtName, cityName, citySlug }: Props) {
  const cityFirmsSlug = citySlug ? `${citySlug}-su-aritma-firmalari` : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-[#E0F2FE] flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>

          <h1 className="text-2xl font-extrabold text-[#0F172A] mb-3">
            {districtName} Su Arıtma Firmaları
          </h1>
          <p className="text-[#64748B] text-base mb-8 leading-relaxed">
            <strong>{districtName}</strong> ilçesinde henüz kayıtlı su arıtma firması bulunmamaktadır.
            {cityName && (
              <> {cityName} genelindeki firmaları inceleyebilir ya da işletmenizi ücretsiz kaydedebilirsiniz.</>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {cityFirmsSlug && (
              <Link
                href={`/${cityFirmsSlug}`}
                className="inline-flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                {cityName} Firmalarını Gör
              </Link>
            )}
            <Link
              href="/firma-ekle"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F1F5F9] text-[#0F172A] font-semibold px-6 py-3 rounded-xl border border-[#E2E8F0] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Firmanı Ücretsiz Ekle
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
            <Link href="/" className="text-sm text-[#94A3B8] hover:text-[#0EA5E9] transition-colors">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
