import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const revalidate = 86400;

export function generateMetadata() {
  return {
    title: "İletişim — Su Arıtma Rehberi",
    description:
      "Su Arıtma Rehberi ile iletişime geçin. E-posta, telefon, WhatsApp ve adres bilgilerimiz.",
    alternates: { canonical: "https://suaritmarehberi.com.tr/iletisim" },
    openGraph: {
      title: "İletişim — Su Arıtma Rehberi",
      description: "Bize ulaşın: e-posta, telefon, WhatsApp ve adres bilgileri.",
      url: "https://suaritmarehberi.com.tr/iletisim",
      siteName: "Su Arıtma Rehberi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default function IletisimPage() {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "İletişim" }]} />

        <div className="mt-6 mb-12">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0EA5E9] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Bize Ulaşın
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            İletişim
          </h1>
          <p className="mt-4 text-base text-[#0F172A]/65 leading-relaxed max-w-2xl">
            Platformumuz, firmalar, premium üyelik veya herhangi bir konu hakkında bizimle
            iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {/* Email */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 hover:border-[#0EA5E9]/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0EA5E9] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm text-[#0F172A] mb-1">E-Posta</h3>
            <p className="text-xs text-[#0F172A]/50 mb-3">Genel sorular ve destek için</p>
            <a
              href="mailto:destek@suaritmarehberi.com.tr"
              className="text-sm font-bold text-[#0EA5E9] hover:underline"
            >
              destek@suaritmarehberi.com.tr
            </a>
          </div>

          {/* WhatsApp */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 hover:border-[#25D366]/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#25D366] mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm text-[#0F172A] mb-1">WhatsApp</h3>
            <p className="text-xs text-[#0F172A]/50 mb-3">Hızlı sorular için 7/24</p>
            <a
              href="https://wa.me/905345957147?text=Merhaba%2C%20Su%20Ar%C4%B1tma%20Rehberi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#25D366] hover:underline"
            >
              0534 595 71 47
            </a>
          </div>

          {/* Phone */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 hover:border-[#0EA5E9]/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0EA5E9] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm text-[#0F172A] mb-1">Telefon</h3>
            <p className="text-xs text-[#0F172A]/50 mb-3">Hafta içi 09:00 – 18:00</p>
            <a href="tel:+902125550100" className="text-sm font-bold text-[#0EA5E9] hover:underline">
              +90 (212) 555 01 00
            </a>
          </div>

          {/* Address */}
          <div className="border border-[#E2E8F0] rounded-xl p-6 hover:border-[#0EA5E9]/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0EA5E9] mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-sm text-[#0F172A] mb-1">Adres</h3>
            <p className="text-xs text-[#0F172A]/50 mb-3">Merkez ofis</p>
            <p className="text-sm font-semibold text-[#0F172A]/70">
              Maslak, Büyükdere Cd. No:238
              <br />
              İstanbul, Türkiye
            </p>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <section className="mb-12">
          <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-lg text-[#0F172A]">Sık Sorulan Konular</h2>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {[
                {
                  q: "Firmamı nasıl eklerim?",
                  a: "Ana sayfadaki \"Firma Ekle\" butonuna tıklayarak ücretsiz kayıt olabilirsiniz. Admin onayından sonra firmanız yayına alınır.",
                },
                {
                  q: "Premium üyelik nasıl alırım?",
                  a: "Firma panelinizden \"Premium Üyelik\" menüsüne giderek WhatsApp üzerinden doğrudan satın alabilirsiniz.",
                },
                {
                  q: "Yorumum neden onaylanmadı?",
                  a: "Tüm yorumlar spam ve hakaret kontrolünden geçer. Onay süreci genellikle 24 saat içinde tamamlanır.",
                },
                {
                  q: "Firma bilgilerimi nasıl güncellerim?",
                  a: "Firma paneline giriş yaparak profil bilgilerinizi, hizmetlerinizi ve görsellerinizi dilediğiniz zaman güncelleyebilirsiniz.",
                },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4">
                  <h3 className="text-sm font-bold text-[#0F172A] mb-1">{item.q}</h3>
                  <p className="text-xs text-[#0F172A]/55 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
