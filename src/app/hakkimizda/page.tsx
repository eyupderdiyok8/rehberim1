import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const revalidate = 86400;

export function generateMetadata() {
  return {
    title: "Hakkımızda — Su Arıtma Rehberi",
    description:
      "Su Arıtma Rehberi, Türkiye genelinde yetkili su arıtma bayi ve teknik servislerini tek adreste toplayan tarafsız, şeffaf ve güvenilir firma rehberidir.",
    alternates: {
      canonical: "https://suaritmarehberi.com.tr/hakkimizda",
    },
    openGraph: {
      title: "Hakkımızda — Su Arıtma Rehberi",
      description:
        "Türkiye'nin en kapsamlı su arıtma firma rehberi. Tarafsız, şeffaf ve güvenilir.",
      url: "https://suaritmarehberi.com.tr/hakkimizda",
      siteName: "Su Arıtma Rehberi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export default function HakkimizdaPage() {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Hakkımızda" }]} />

        {/* Hero */}
        <div className="mt-6 mb-12">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0EA5E9] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hakkımızda
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Su Arıtma Rehberi Nedir?
          </h1>
          <p className="mt-4 text-base text-[#0F172A]/65 leading-relaxed max-w-2xl">
            Su Arıtma Rehberi, Türkiye genelindeki yetkili su arıtma bayilerini ve teknik servislerini
            tarafsız, şeffaf ve güvenilir bir platformda bir araya getiren dijital firma rehberidir.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12">
          <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-lg text-[#0F172A]">Misyonumuz</h2>
            </div>
            <div className="px-6 py-6 space-y-4 text-sm text-[#0F172A]/70 leading-relaxed">
              <p>
                Türkiye'de su arıtma sektörü hızla büyürken, tüketiciler güvenilir firma bulmakta
                zorlanıyor. Fiyat karşılaştırması yapmak, gerçek müşteri yorumlarını okumak ve
                yetkili servisleri tek bir yerde bulmak neredeyse imkansız.
              </p>
              <p>
                <strong className="text-[#0F172A]">Su Arıtma Rehberi</strong> bu sorunu çözmek
                için kuruldu. Amacımız; şeffaf fiyat bilgisi, doğrulanmış müşteri yorumları ve
                detaylı firma profilleri ile tüketicilerin doğru kararı vermesine yardımcı olmaktır.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="font-extrabold text-lg text-[#0F172A] mb-5">Değerlerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Güvenilirlik",
                desc: "Tüm firmalar doğrulama sürecinden geçer. Sadece yetkili bayiler ve lisanslı servisler platformda yer alır.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ),
                title: "Şeffaflık",
                desc: "Fiyatlar, hizmet detayları ve müşteri yorumları açıkça gösterilir. Gizli maliyet veya yönlendirme yoktur.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                ),
                title: "Tarafsızlık",
                desc: "Hiçbir firmaya ayrıcalık tanınmaz. Sıralamalar müşteri puanları ve premium üyelik durumuna göre belirlenir.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="border border-[#E2E8F0] rounded-xl p-5 space-y-3 bg-white hover:border-[#0EA5E9]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0EA5E9]">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-sm text-[#0F172A]">{item.title}</h3>
                <p className="text-xs text-[#0F172A]/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What we offer */}
        <section className="mb-12">
          <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-5 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-lg text-[#0F172A]">Platformumuzda Neler Var?</h2>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {[
                {
                  title: "Detaylı Firma Profilleri",
                  desc: "Her firmanın iletişim bilgileri, hizmet alanları, fiyat aralıkları, müşteri yorumları ve fotoğraf galerisi.",
                },
                {
                  title: "Gerçek Müşteri Yorumları",
                  desc: "Sadece onaylanmış müşteri yorumları yayınlanır. Firmalar yorumlara yanıt verebilir.",
                },
                {
                  title: "Fiyat Karşılaştırması",
                  desc: "Farklı firmaların hizmet fiyatlarını yan yana karşılaştırarak bütçenize en uygun seçeneği bulun.",
                },
                {
                  title: "Şehir ve İlçe Bazlı Arama",
                  desc: "Türkiye'nin 81 ilinde su arıtma firmalarını şehir ve ilçe bazında filtreleyin.",
                },
                {
                  title: "Premium Firma Ayrıcalıkları",
                  desc: "Premium üyeler öncelikli sıralama, reklamsız profil, ürün kataloğu ve gelişmiş iletişim butonları elde eder.",
                },
                {
                  title: "Su Arıtma Blog",
                  desc: "Su arıtma cihazları, filtre değişimi, su kalitesi ve sağlık konularında uzman yazılar.",
                },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4 flex gap-4 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] shrink-0 mt-2" />
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">{item.title}</h3>
                    <p className="text-xs text-[#0F172A]/55 leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "81", label: "İl Kapsamında" },
              { value: "500+", label: "Kayıtlı Firma" },
              { value: "10.000+", label: "Müşteri Yorumu" },
              { value: "4.8", label: "Ortalama Puan" },
            ].map((stat, i) => (
              <div
                key={i}
                className="border border-[#E2E8F0] rounded-xl p-5 text-center bg-white"
              >
                <p className="text-2xl font-black text-[#0EA5E9]">{stat.value}</p>
                <p className="text-[10px] font-bold text-[#0F172A]/50 uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* For Firms */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
                  Firma Sahibi misiniz?
                </h2>
                <p className="text-sm text-[#0F172A]/65 leading-relaxed">
                  Su Arıtma Rehberi'nde firmanızı ücretsiz listeleyerek yeni müşterilere ulaşın.
                  Premium üyelik ile öncelikli sıralama, ürün kataloğu ve gelişmiş iletişim
                  özelliklerinden yararlanın.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href="/firma-ekle"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Ücretsiz Firma Ekle
                  </a>
                  <a
                    href="/panel/firma/premium"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Premium Üyelik Hakkında
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mb-12">
          <div className="border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight mb-2">
              Sorularınız mı Var?
            </h2>
            <p className="text-sm text-[#0F172A]/55 mb-5 max-w-md mx-auto">
              Platformumuz, firmalar veya premium üyelik hakkında herhangi bir sorunuz varsa
              bizimle iletişime geçmekten çekinmeyin.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:destek@suaritmarehberi.com.tr"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                destek@suaritmarehberi.com.tr
              </a>
              <a
                href="https://wa.me/905345957147?text=Merhaba%2C%20Su%20Ar%C4%B1tma%20Rehberi%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA56] text-white text-xs font-bold rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
