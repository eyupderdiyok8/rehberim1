import Header from "@/components/Header";
import Footer from "@/components/Footer";

const POPULAR_CITIES = [
  { name: "İstanbul", slug: "istanbul" },
  { name: "Ankara", slug: "ankara" },
  { name: "İzmir", slug: "izmir" },
  { name: "Bursa", slug: "bursa" },
  { name: "Antalya", slug: "antalya" },
  { name: "Adana", slug: "adana" },
  { name: "Kocaeli", slug: "kocaeli" },
  { name: "Tekirdağ", slug: "tekirdag" },
];

const POPULAR_SERVICES = [
  { name: "Su Arıtma Cihazı", slug: "su-aritma-cihazi" },
  { name: "Su Arıtma Filtresi", slug: "su-aritma-filtresi" },
  { name: "Su Arıtma Servisi", slug: "su-aritma-servisi" },
  { name: "Su Arıtma Bakımı", slug: "su-aritma-bakimi" },
  { name: "Su Arıtma Montajı", slug: "su-aritma-montaji" },
  { name: "Endüstriyel Arıtma", slug: "endustriyel-aritma" },
];

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* 404 header */}
          <div className="text-center mb-12">
            <p className="text-7xl font-bold text-[#E2E8F0] leading-none mb-4 select-none">
              404
            </p>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight mb-3">
              Sayfa Bulunamadı
            </h1>
            <p className="text-sm text-[#0F172A]/60 leading-relaxed">
              Aradığınız sayfa kaldırılmış, yeniden adlandırılmış ya da hiç
              oluşturulmamış olabilir. Aşağıdaki bağlantılardan aradığınızı bulabilirsiniz.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-8">
            {/* Popular cities */}
            <div>
              <h2 className="text-xs font-semibold text-[#0F172A]/40 uppercase tracking-wide mb-3">
                Popüler Şehirler
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.map((city) => (
                  <a
                    key={city.slug}
                    href={`/${city.slug}-su-aritma-cihazi-firmalari`}
                    className="text-xs font-medium text-[#0F172A]/70 hover:text-[#0EA5E9] border border-[#E2E8F0] hover:border-[#0EA5E9]/30 px-3 py-2 transition-colors duration-150"
                  >
                    {city.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Popular services */}
            <div>
              <h2 className="text-xs font-semibold text-[#0F172A]/40 uppercase tracking-wide mb-3">
                Hizmet Kategorileri
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SERVICES.map((service) => (
                  <a
                    key={service.slug}
                    href={`/istanbul-${service.slug}-firmalari`}
                    className="text-xs font-medium text-[#0F172A]/70 hover:text-[#0EA5E9] border border-[#E2E8F0] hover:border-[#0EA5E9]/30 px-3 py-2 transition-colors duration-150"
                  >
                    {service.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Price pages */}
            <div>
              <h2 className="text-xs font-semibold text-[#0F172A]/40 uppercase tracking-wide mb-3">
                Fiyat Rehberleri
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_CITIES.slice(0, 5).map((city) => (
                  <a
                    key={city.slug}
                    href={`/${city.slug}-su-aritma-cihazi-fiyatlari`}
                    className="text-xs font-medium text-[#0F172A]/70 hover:text-[#0EA5E9] border border-[#E2E8F0] hover:border-[#0EA5E9]/30 px-3 py-2 transition-colors duration-150"
                  >
                    {city.name} Fiyatları
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <a
              href="/"
              className="inline-block bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold px-6 py-3 transition-colors duration-150"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
