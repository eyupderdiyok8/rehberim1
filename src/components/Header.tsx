"use client";

import React, { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="/"
          className="flex items-center gap-1.5 font-black text-xl tracking-tight text-[#0F172A]"
        >
          Su Arıtma Rehberi
          <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] inline-block" />
        </a>

        {/* Center Links (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/"
            className="text-sm font-bold text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors uppercase tracking-wider"
          >
            Ana Sayfa
          </a>
          
          {/* Şehirler Dropdown */}
          <div className="relative group">
            <button className="text-sm font-bold text-[#0F172A]/70 group-hover:text-[#0EA5E9] transition-colors uppercase tracking-wider flex items-center gap-1 py-4">
              Şehirler
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:-rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {/* Invisible hover bridge to prevent menu from closing when mouse moves */}
            <div className="absolute top-[80%] left-0 w-full h-4" />
            <div className="absolute top-full left-0 w-40 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 py-2">
              <a href="/istanbul-su-aritma-cihazi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">İstanbul</a>
              <a href="/ankara-su-aritma-cihazi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Ankara</a>
              <a href="/izmir-su-aritma-cihazi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">İzmir</a>
              <a href="/bursa-su-aritma-cihazi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Bursa</a>
              <a href="/antalya-su-aritma-cihazi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Antalya</a>
              <div className="border-t border-[#E2E8F0] mx-3 my-1.5" />
              <a href="/hizmetler" className="block px-4 py-2 text-[13px] font-bold text-[#0EA5E9] hover:bg-sky-50">Tüm İller ve Hizmetler →</a>
            </div>
          </div>

          {/* Hizmetler Dropdown */}
          <div className="relative group">
            <button className="text-sm font-bold text-[#0F172A]/70 group-hover:text-[#0EA5E9] transition-colors uppercase tracking-wider flex items-center gap-1 py-4">
              Hizmetler
              <svg className="w-3 h-3 transition-transform duration-200 group-hover:-rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="absolute top-[80%] left-0 w-full h-4" />
            <div className="absolute top-full left-0 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 py-2">
              <a href="/istanbul-su-aritma-cihazi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Su Arıtma Cihazı</a>
              <a href="/istanbul-su-aritma-filtresi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Su Arıtma Filtresi</a>
              <a href="/istanbul-su-aritma-servisi-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Su Arıtma Servisi</a>
              <a href="/istanbul-endustriyel-aritma-firmalari" className="block px-4 py-2 text-[13px] font-semibold text-[#0F172A]/70 hover:bg-[#F8FAFC] hover:text-[#0EA5E9]">Endüstriyel Arıtma</a>
            </div>
          </div>

          <a
            href="/blog"
            className="text-sm font-bold text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors uppercase tracking-wider py-4"
          >
            Blog
          </a>
        </nav>

        {/* Right Action & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/panel/login"
            className="hidden sm:inline-block text-sm font-bold text-[#0F172A]/65 hover:text-[#0F172A] px-3 py-2 transition-colors"
          >
            Firma Girişi
          </a>
          <a
            href="/firma-ekle"
            className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-150 shadow-sm shadow-sky-500/10"
          >
            Firma Ekle
          </a>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-lg md:hidden transition-colors"
            aria-label="Menüyü Aç/Kapat"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-4 space-y-3 shadow-lg">
          <a
            href="/"
            className="block text-sm font-bold text-[#0F172A]/70 hover:text-[#0EA5E9] py-1.5 border-b border-slate-50 transition-colors"
          >
            Ana Sayfa
          </a>

          {/* Popular Cities in Mobile */}
          <div className="space-y-1.5 py-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Popüler Şehirler</span>
            <div className="grid grid-cols-2 gap-1">
              <a href="/istanbul-su-aritma-cihazi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9] py-1">İstanbul</a>
              <a href="/ankara-su-aritma-cihazi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9] py-1">Ankara</a>
              <a href="/izmir-su-aritma-cihazi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9] py-1">İzmir</a>
              <a href="/bursa-su-aritma-cihazi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9] py-1">Bursa</a>
              <a href="/antalya-su-aritma-cihazi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9] py-1">Antalya</a>
              <a href="/hizmetler" className="text-xs font-bold text-[#0EA5E9] py-1">Tüm İller →</a>
            </div>
          </div>

          {/* Services in Mobile */}
          <div className="space-y-1.5 py-1 border-t border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Hizmetler</span>
            <div className="flex flex-col gap-1.5">
              <a href="/istanbul-su-aritma-cihazi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9]">Su Arıtma Cihazı</a>
              <a href="/istanbul-su-aritma-filtresi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9]">Su Arıtma Filtresi</a>
              <a href="/istanbul-su-aritma-servisi-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9]">Su Arıtma Servisi</a>
              <a href="/istanbul-endustriyel-aritma-firmalari" className="text-xs font-semibold text-[#0F172A]/80 hover:text-[#0EA5E9]">Endüstriyel Arıtma</a>
            </div>
          </div>

          <a
            href="/blog"
            className="block text-sm font-bold text-[#0F172A]/70 hover:text-[#0EA5E9] py-2 border-t border-slate-100 transition-colors"
          >
            Blog
          </a>
          <a
            href="/panel/login"
            className="block text-sm font-bold text-slate-500 hover:text-[#0EA5E9] py-2 border-t border-slate-100 transition-colors"
          >
            Firma Girişi
          </a>
        </div>
      )}
    </header>
  );
}
