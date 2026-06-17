"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAdminRole } from "@/lib/actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = await getAdminRole(session.user.email);
        router.push(role === "admin" ? "/panel/admin" : "/panel/firma");
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const role = await getAdminRole(data.user.email);
        router.push(role === "admin" ? "/panel/admin" : "/panel/firma");
      }
    } catch (err: any) {
      setError(err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#0EA5E9] flex items-center justify-center shadow-lg shadow-sky-500/20">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Su Arıtma Rehberi Panel
        </h2>
        <p className="mt-2 text-center text-sm text-[#0F172A]/55">
          Yönetici veya Firma sahibi girişi yapın
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-[#E2E8F0] shadow-sm rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}



            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Örn: info@firmam.com"
                className="appearance-none block w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg shadow-sm placeholder-[#94A3B8] focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] text-sm font-medium text-[#0F172A]"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg shadow-sm placeholder-[#94A3B8] focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] text-sm font-medium text-[#0F172A]"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0EA5E9] transition-all duration-150 disabled:opacity-50"
              >
                {loading ? "İşlem yapılıyor..." : "Giriş Yap"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-2 bg-white text-[#0F172A]/40 font-bold">Veya</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/firma-ekle"
                className="text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-all"
              >
                Yeni bir firma sahibi hesabı oluşturun
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

