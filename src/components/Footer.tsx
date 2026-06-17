import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-[#1E293B] py-16 px-4 text-slate-300">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <a 
            href="/"
            className="flex items-center gap-1.5 font-black text-xl text-white mb-4 tracking-tight"
          >
            Su Arıtma Rehberi<span className="w-2 h-2 rounded-full bg-[#0EA5E9] inline-block shadow-[0_0_10px_rgba(14,165,233,0.8)]"></span>
          </a>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Türkiye geneli yetkili su arıtma bayi ve teknik servislerini tek adreste toplayan tarafsız, şeffaf ve güvenilir firma rehberi.
          </p>
          <div className="mt-6 flex items-center gap-4">
            {/* Social Icons Placeholder */}
            <a href="#" className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-slate-400 hover:bg-[#0EA5E9] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-slate-400 hover:bg-[#0EA5E9] hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
            </a>
          </div>
        </div>

        {/* Links 1 */}
        <div className="md:ml-auto">
          <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-6">Kurumsal</h4>
          <ul className="space-y-3.5 text-sm text-slate-400 font-medium">
            <li><a href="/hakkimizda" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Hakkımızda</a></li>
            <li><a href="/#sehirler" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Hizmet Bölgeleri</a></li>
            <li><a href="/panel/login" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200 text-emerald-400">Ücretsiz Firma Ekle</a></li>
            <li><a href="/iletisim" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Bize Ulaşın</a></li>
          </ul>
        </div>

        {/* Links 2 */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-6">Popüler Hizmetler</h4>
          <ul className="space-y-3.5 text-sm text-slate-400 font-medium">
            <li><a href="/istanbul-su-aritma-cihazi-firmalari" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Ev Tipi Cihaz Kurulumu</a></li>
            <li><a href="/istanbul-su-aritma-filtresi-firmalari" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Su Arıtma Filtresi</a></li>
            <li><a href="/istanbul-su-aritma-servisi-firmalari" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Su Arıtma Servisi</a></li>
            <li><a href="/istanbul-endustriyel-aritma-firmalari" className="hover:text-[#0EA5E9] hover:translate-x-1 inline-block transition-all duration-200">Endüstriyel Arıtma Çözümleri</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-white mb-6">İletişim</h4>
          <ul className="space-y-4 text-sm text-slate-400 font-medium">
            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              destek@suaritmarehberi.com.tr
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              +90 (212) 555 01 00
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[#0EA5E9] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Maslak, Büyükdere Cd. No:238<br/>İstanbul, Türkiye</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} Su Arıtma Rehberi. Tüm hakları saklıdır.
        </p>
        <div className="flex gap-6 text-xs text-slate-500 font-medium">
          <a href="/kullanim-sartlari" className="hover:text-white transition-colors">Kullanım Şartları</a>
          <a href="/gizlilik-politikasi" className="hover:text-white transition-colors">Gizlilik Politikası</a>
          <a href="/cerez-ayarlari" className="hover:text-white transition-colors">Çerez Ayarları</a>
        </div>
      </div>
    </footer>
  );
}
