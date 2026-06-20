import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const revalidate = 86400;

export function generateMetadata() {
  return {
    title: "Çerez Ayarları — Su Arıtma Rehberi",
    description: "Su Arıtma Rehberi çerez politikası ve ayarları.",
    alternates: { canonical: "https://suaritmarehberi.com.tr/cerez-ayarlari" },
  };
}

export default function CerezAyarlariPage() {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Çerez Ayarları" }]} />

        <div className="mt-6 mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Çerez Politikası
          </h1>
          <p className="mt-3 text-xs text-[#0F172A]/40">Son güncelleme: Ocak 2025</p>
        </div>

        <div className="space-y-8 text-sm text-[#0F172A]/70 leading-relaxed">
          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">Çerezler Nedir?</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Çerezler (cookies), web sitelerinin tarayıcınız aracılığıyla cihazınıza yerleştirdiği
                küçük metin dosyalarıdır. Platformumuzun düzgün çalışmasını sağlamak, kullanıcı
                deneyimini iyileştirmek ve istatistiksel analiz yapmak amacıyla çerez kullanıyoruz.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">Kullandığımız Çerez Türleri</h2>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {[
                {
                  name: "Zorunlu Çerezler",
                  required: true,
                  desc: "Platformun temel işlevlerinin çalışması için gereklidir. Oturum yönetimi, güvenlik ve yük dengeleme bu çerezler arasında yer alır. Bu çerezler kapatılamaz.",
                },
                {
                  name: "Performans Çerezleri",
                  required: false,
                  desc: "Ziyaretçilerin platformu nasıl kullandığını anlamamıza yardımcı olur. Sayfa görüntüleme sayıları, ziyaret süreleri ve hata mesajları gibi anonim veriler toplar.",
                },
                {
                  name: "İşlevsellik Çerezleri",
                  required: false,
                  desc: "Tercihlerinizi hatırlayarak daha kişiselleştirilmiş bir deneyim sunar. Dil seçimi, son aramalar ve tercih ettiğiniz şehir gibi bilgileri saklayabilir.",
                },
                {
                  name: "Hedefleme / Reklam Çerezleri",
                  required: false,
                  desc: "İlgi alanlarınıza uygun içerik ve reklamlar göstermek amacıyla kullanılır. Üçüncü taraf reklam ortaklarımız tarafından da yerleştirilebilir.",
                },
              ].map((cookie, i) => (
                <div key={i} className="px-6 py-5 flex gap-4 items-start">
                  <div className="shrink-0 mt-0.5">
                    {cookie.required ? (
                      <span className="flex items-center justify-center w-5 h-5 rounded bg-sky-100 border border-sky-200 text-[#0EA5E9]">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded border-2 border-[#E2E8F0] block" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">{cookie.name}</h3>
                      {cookie.required && (
                        <span className="text-[9px] font-bold text-[#0EA5E9] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded uppercase tracking-wider">
                          Zorunlu
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#0F172A]/55 leading-relaxed mt-1">{cookie.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">Çerezleri Nasıl Kontrol Edebilirim?</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>
                Tarayıcınızın ayarları üzerinden çerezleri kabul etmeyi veya reddetmeyi
                seçebilirsiniz. Ancak zorunlu çerezleri devre dışı bırakmanız platformun bazı
                işlevlerinin çalışmamasına neden olabilir.
              </p>
              <p className="font-semibold text-[#0F172A]">Popüler tarayıcılar için çerez ayarları:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong>Google Chrome:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler</li>
                <li><strong>Firefox:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Site Verileri</li>
                <li><strong>Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezler ve Web Sitesi Verileri</li>
                <li><strong>Microsoft Edge:</strong> Ayarlar &gt; Çerezler ve Site İzinleri</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">Üçüncü Taraf Çerezleri</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>Platformumuzda aşağıdaki üçüncü taraf hizmetleri çerez kullanabilir:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li><strong className="text-[#0F172A]">Vercel Analytics:</strong> Platform trafiğini analiz etmek için</li>
                <li><strong className="text-[#0F172A]">Supabase:</strong> Oturum yönetimi ve kimlik doğrulama için</li>
                <li><strong className="text-[#0F172A]">Resend:</strong> E-posta iletim hizmetleri için</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">İletişim</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Çerez politikamız hakkında sorularınız için:
              </p>
              <p className="mt-2 font-semibold text-[#0F172A]">
                E-posta: destek@suaritmarehberi.com.tr
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
