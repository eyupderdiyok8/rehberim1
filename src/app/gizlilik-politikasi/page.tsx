import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const revalidate = 86400;

export function generateMetadata() {
  return {
    title: "Gizlilik Politikası — Su Arıtma Rehberi",
    description: "Su Arıtma Rehberi gizlilik politikası. Kişisel verilerinizin korunması ve işlenmesi hakkında bilgi.",
    alternates: { canonical: "https://suaritmarehberi.com.tr/gizlilik-politikasi" },
  };
}

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <Breadcrumb items={[{ label: "Ana Sayfa", href: "/" }, { label: "Gizlilik Politikası" }]} />

        <div className="mt-6 mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
            Gizlilik Politikası
          </h1>
          <p className="mt-3 text-xs text-[#0F172A]/40">Son güncelleme: Ocak 2025</p>
        </div>

        <div className="space-y-8 text-sm text-[#0F172A]/70 leading-relaxed">
          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">1. Genel Bilgi</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Su Arıtma Rehberi ("biz", "bize", "platform") olarak kullanıcılarımızın gizliliğini korumayı
                taahhüt ediyoruz. Bu gizlilik politikası, platformumuzu kullandığınızda toplanan,
                kullanılan ve paylaşılan bilgileri açıklamaktadır.
              </p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">2. Toplanan Veriler</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p><strong className="text-[#0F172A]">Hesap Bilgileri:</strong> Firma kaydı sırasında ad, soyad, e-posta adresi, telefon numarası ve firma bilgileri toplanır.</p>
              <p><strong className="text-[#0F172A]">Yorum ve Değerlendirmeler:</strong> Kullanıcıların firmalara yazdığı yorumlar, puanlar ve yüklenen görseller.</p>
              <p><strong className="text-[#0F172A]">Otomatik Toplanan Veriler:</strong> IP adresi, tarayıcı türü, işletim sistemi, erişim zamanı ve sayfa görüntüleme bilgileri.</p>
              <p><strong className="text-[#0F172A]">Çerezler:</strong> Platformumuz kullanıcı deneyimini iyileştirmek amacıyla çerez kullanmaktadır.</p>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">3. Verilerin Kullanım Amaçları</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>Toplanan veriler aşağıdaki amaçlarla kullanılır:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Hesap oluşturma ve yönetme</li>
                <li>Firma profillerini yayınlama ve arama sonuçlarında gösterme</li>
                <li>Kullanıcı yorumlarını moderasyon sürecinden geçirme</li>
                <li>Platform güvenliğini sağlama ve kötüye kullanımı önleme</li>
                <li>Hizmet kalitesini artırma ve istatistiksel analiz</li>
                <li>Yasal yükümlülükleri yerine getirme</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">4. Veri Paylaşımı</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>
                Kişisel verileriniz yasal zorunluluklar dışında üçüncü şahıslarla paylaşılmaz.
                Aşağıdaki durumlarda veri paylaşımı yapılabilir:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Yasal makamların talebi üzerine</li>
                <li>Platform altyapı sağlayıcıları (barındırma, e-posta servisi)</li>
                <li>İstatistik ve analiz araçları (anonimleştirilmiş olarak)</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">5. Veri Güvenliği</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>
                Verileriniz endüstri standardı güvenlik önlemleri ile korunmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>HTTPS şifreleme ile veri iletimi</li>
                <li>Veri tabanı erişim kısıtlamaları (RLS - Row Level Security)</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Yetkisiz erişim tespit ve engelleme mekanizmaları</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">6. KVKK Haklarınız</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside space-y-1.5 ml-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme veya yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
              </ul>
            </div>
          </section>

          <section className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <h2 className="font-extrabold text-base text-[#0F172A]">7. İletişim</h2>
            </div>
            <div className="px-6 py-5">
              <p>
                Gizlilik politikası hakkında sorularınız veya KVKK kapsamındaki talepleriniz için
                bize ulaşabilirsiniz:
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
