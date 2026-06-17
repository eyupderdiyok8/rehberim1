"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FirmaEklePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!firmName.trim()) throw new Error("Lütfen firma adınızı giriniz.");
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // If session is ready, redirect to onboarding (firm will be created there)
        if (data.session) {
          // Create slug
          const trMap: { [key: string]: string } = {
            ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u"
          };
          const cleanName = firmName.split("").map((c) => trMap[c] || c).join("");
          const baseSlug = cleanName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
          
          // Store firm name and slug in localStorage for onboarding to pick up
          if (typeof window !== "undefined") {
            localStorage.setItem("pending_firm_name", firmName);
            localStorage.setItem("pending_firm_slug", baseSlug);
          }
          router.push("/panel/onboarding");
        } else {
          setSuccess("Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı onayladıktan sonra giriş yapın.");
        }
      }
    } catch (err: any) {
      let msg = err.message || "Bir hata oluştu.";
      if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("email")) {
        msg = "E-posta limitine takıldınız. Yerel testler için Supabase'den 'Confirm Email'i kapatın.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Side: Marketing Copy */}
          <div>
            <span className="text-[#0EA5E9] font-extrabold text-[10px] tracking-widest uppercase bg-[#0EA5E9]/10 px-3 py-1 rounded-full mb-6 inline-block">
              SU ARITMA REHBERİ İŞ ORTAKLIĞI
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] leading-tight tracking-tight mb-6">
              Müşterileriniz Sizi<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-emerald-400">
                Kolayca Bulsun
              </span>
            </h1>
            <p className="text-base text-[#0F172A]/70 leading-relaxed font-medium mb-8">
              Türkiye'nin en hızlı büyüyen su arıtma rehberinde ücretsiz yerinizi alın. 
              Sıfır komisyon, sınırsız müşteri. Profilinizi oluşturun ve binlerce potansiyel müşteriye anında ulaşın.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "100% Ücretsiz Standart Kayıt",
                "İl ve İlçeye Göre Listelenme",
                "Doğrudan Telefon ve WhatsApp Erişimi",
                "Kapsamlı Firma ve Fiyat Analitikleri"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-[#0F172A]/80">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Registration Form */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9] to-emerald-400 opacity-10 blur-3xl rounded-full" />
            <div className="relative bg-white border border-[#E2E8F0] shadow-2xl shadow-slate-200/50 rounded-3xl p-8 sm:p-10">
              <h2 className="text-2xl font-black text-[#0F172A] mb-2">Hemen Başlayın</h2>
              <p className="text-xs text-[#0F172A]/60 font-medium mb-8">
                Dakikalar içinde firmanızı sisteme ekleyin.
              </p>

              <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-100">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">
                    Firma Adı
                  </label>
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Örn: Aqua Life Arıtma"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Örn: info@firmam.com"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] text-sm font-semibold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">
                    Şifre
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] text-sm font-semibold transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-sm py-4 rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 mt-2 disabled:opacity-50"
                >
                  {loading ? "Hesap Oluşturuluyor..." : "Ücretsiz Hesap Oluştur"}
                </button>

                <p className="text-center text-[11px] text-[#0F172A]/50 mt-6 font-medium">
                  Zaten bir hesabınız var mı?{" "}
                  <a href="/panel/login" className="text-[#0EA5E9] font-bold hover:underline">
                    Giriş Yapın
                  </a>
                </p>
              </form>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
