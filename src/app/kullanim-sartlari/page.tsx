import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const revalidate = 86400;

export function generateMetadata() {
  return {
    title: "Kullanım Şartları — Su Arıtma Rehberi",
    description: "Su Arıtma Rehberi kullanım şartları ve koşulları.",
    alternates: { canonical: "https://suaritmarehberi.com.tr/kullanim-sartlari" },
  };
}

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Kullanım Şartları" }]} />

        <div className="mt-6 mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Kullanım Şartları
          </h1>
          <p className="mt-3 text-xs text-[#0F172A]/40">Son güncelleme: Ocak 2025</p>
        </div>

        <div className="space-y-8 text-sm text-[#0F172A]/70 leading-relaxed">
          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">1. Kabul</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Su Arıtma Rehberi platformunu kullanarak aşağıdaki kullanım şartlarını kabul etmiş
                sayılırsınız. Bu şartları kabul etmiyorsanız platformu kullanmayınız.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">2. Hizmet Tanımı</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>Su Arıtma Rehberi aşağıdaki hizmetleri sunar:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Su arıtma firmalarının listelenmesi ve profil sayfaları</li>
                <li>Kullanıcı yorumları ve puanlama sistemi</li>
                <li>Şehir ve hizmet bazlı firma arama</li>
                <li>Fiyat karşılaştırma bilgileri</li>
                <li>Su arıtma konulu blog içerikleri</li>
                <li>Premium üyelik ile gelişmiş firma özellikleri</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">3. Kullanıcı Sorumlulukları</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>Platform kullanıcıları aşağıdaki kurallara uymayı kabul eder:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Yorumlarda gerçek ve doğru bilgi paylaşımı yapmak</li>
                <li>Hakaret, küfür, nefret söylemi veya yasadışı içerik paylaşmamak</li>
                <li>Başka kişi veya kurumların kimliğini taklit etmemek</li>
                <li>Spam, reklam veya yanıltıcı içerik göndermemek</li>
                <li>Platformun teknik altyapısına zarar verecek eylemlerde bulunmamak</li>
                <li>Otomatik araçlarla (bot, scraper) platforma erişmemek</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">4. Firma Kaydı ve Sorumlulukları</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>Firma sahipleri aşağıdaki şartları kabul eder:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Firma bilgilerinin doğru ve güncel olması</li>
                <li>Yanıltıcı fiyat veya hizmet bilgisi paylaşmamak</li>
                <li>Lisans ve yetki belgelerinin geçerli olması</li>
                <li>Yorumları manipüle etmeye çalışmamak (sahte yorum yazma/yazdırma)</li>
                <li>Premium üyelik ücretinin belirtilen süre içinde ödenmesi</li>
                <li>Su Arıtma Rehberi logosunu ve markasını izinsiz kullanmamak</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">5. İçerik Moderasyonu</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>
                Su Arıtma Rehberi aşağıdaki hakları saklı tutar:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Kullanıcı yorumlarını onaylama veya reddetme</li>
                <li>Uygunsuz içerikleri bildirim yapmaksızın kaldırma</li>
                <li>Kuralları ihlal eden kullanıcıların hesaplarını askıya alma veya silme</li>
                <li>Firma profillerini doğrulama ve yanlış bilgileri düzeltme</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">6. Fikri Mülkiyet</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Platformdaki tüm içerikler (metin, görsel, logo, tasarım, yazılım) Su Arıtma
                Rehberi'nin mülkiyetindedir. İzinsiz kopyalanması, çoğaltılması veya dağıtılması
                yasaktır. Kullanıcıların paylaştığı yorum ve görsellerin telif hakkı kullanıcıya
                aittir; ancak platformda yayınlanmasına izin verilmiş sayılır.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">7. Sorumluluk Sınırı</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>
                Su Arıtma Rehberi bir firma rehberi platformudur. Platformda listelenen firmaların
                sunduğu hizmetlerin kalitesi, fiyatları veya iş sonuçları konusunda garanti vermez.
                Kullanıcılar firma seçimlerini kendi araştırmaları doğrultusunda yapmalıdır.
              </p>
              <p>
                Platform, firmalar ile kullanıcılar arasındaki işlemlerden doğabilecek anlaşmazlıklarda
                taraf değildir.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">8. Değişiklikler</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Su Arıtma Rehberi bu kullanım şartlarını önceden bildirim yapmaksızın güncelleme
                hakkını saklı tutar. Güncellemeler platformda yayınlandığı tarihten itibaren geçerli
                olur.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">9. Uygulanacak Hukuk</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Bu kullanım şartları Türkiye Cumhuriyeti kanunlarına tabidir. Anlaşmazlıkların
                çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">10. İletişim</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Kullanım şartları hakkında sorularınız için:
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
