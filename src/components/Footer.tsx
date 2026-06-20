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
          <div className="mt-6">
            {/* Google Play Badge - Coming Soon */}
            <div className="relative inline-block">
              <div className="flex items-center gap-2.5 bg-[#1E293B] border border-[#334155] rounded-lg px-4 py-2.5 text-slate-400 select-none">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 3.658L16.8 9.99l-2.302 2.302L5.864 3.658z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 leading-none">Yakında</span>
                  <span className="text-xs font-extrabold text-slate-300 leading-tight">Google Play</span>
                </div>
              </div>
              <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-md">
                Yakında
              </div>
            </div>
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
