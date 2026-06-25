"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAdminRole } from "@/lib/actions";

export default function FirmLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasFirm, setHasFirm] = useState<boolean | null>(null);
  const [firm, setFirm] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form states for inline firm creation
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cityId, setCityId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const checkFirmOwner = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/panel/login");
        return;
      }

      // Check if logged in user is admin, if so redirect them to admin panel
      const role = await getAdminRole(session.user.email);
      if (role === "admin") {
        router.push("/panel/admin");
        return;
      }

      const { data: firmData, error: firmErr } = await supabase
        .from("firms")
        .select("id, name, is_premium, is_active")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (firmErr) {
        console.error("Firma sorgulama hatası:", firmErr);
      }

      if (firmData) {
        setHasFirm(true);
        setFirm(firmData);
      } else {
        setHasFirm(false);
      }
      setLoading(false);
    };

    checkFirmOwner();
  }, [router, pathname]);

  // Fetch cities and districts if they don't have a firm linked
  useEffect(() => {
    if (hasFirm === false) {
      const fetchGeoData = async () => {
        try {
          const { data: citiesData } = await supabase.from("cities").select("id, name").order("name");
          setCities(citiesData || []);

          const { data: districtsData } = await supabase.from("districts").select("id, name, city_id").order("name");
          setDistricts(districtsData || []);
        } catch (err) {
          console.error("Coğrafi veriler çekilemedi:", err);
        }
      };
      fetchGeoData();
    }
  }, [hasFirm]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/panel/login");
  };

  const handleCreateFirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Lütfen firma adını giriniz.");
      return;
    }
    setFormLoading(true);
    setFormError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");

      // Turkish character slugification mapping
      const trMap: { [key: string]: string } = {
        ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u"
      };
      const cleanName = name.split("").map((c) => trMap[c] || c).join("");
      const baseSlug = cleanName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
      
      const citySlugObj = cities.find((c) => c.id === cityId);
      const targetSlug = citySlugObj ? `${baseSlug}-${citySlugObj.slug}` : baseSlug;

      // Check database if target slug is already taken
      let finalSlug = targetSlug;
      const { data: existing } = await supabase.from("firms").select("id").eq("slug", finalSlug).maybeSingle();
      if (existing) {
        finalSlug = `${targetSlug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const { data, error } = await supabase
        .from("firms")
        .insert({
          name: name.trim(),
          slug: finalSlug,
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
          email: session.user.email,
          city_id: cityId || null,
          district_id: districtId || null,
          user_id: session.user.id,
          is_active: false, // Wait for admin approval
          is_verified: false,
          is_premium: false,
          rating: 5.0,
          review_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFirm(data);
        setHasFirm(true);
      }
    } catch (err: any) {
      setFormError(err.message || "Firma profili oluşturulurken bir hata oluştu.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#0F172A]/40 uppercase tracking-wider">Firma Bilgisi Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Not associated with any firm - show a beautiful create form!
  if (hasFirm === false) {
    const activeDistricts = districts.filter((d) => !cityId || d.city_id === cityId);

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-[#0EA5E9] flex items-center justify-center shadow-lg shadow-sky-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Firma Profilinizi Oluşturun
          </h2>
          <p className="mt-2 text-center text-xs text-[#0F172A]/55 font-medium max-w-sm mx-auto leading-relaxed">
            Su Arıtma Rehberi'ne katılmak ve yönetim panelinizi kullanmaya başlamak için lütfen temel bilgilerinizi giriniz.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 border border-[#E2E8F0] shadow-sm rounded-xl sm:px-10 space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-xs font-semibold text-red-800 p-4 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateFirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Firma Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Aqua Life Su Arıtma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] placeholder-[#94A3B8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Şehir</label>
                  <select
                    value={cityId}
                    onChange={(e) => {
                      setCityId(e.target.value);
                      setDistrictId("");
                    }}
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-semibold focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  >
                    <option value="">Seçin</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">İlçe</label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-semibold focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  >
                    <option value="">Seçin</option>
                    {activeDistricts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Telefon Numarası</label>
                <input
                  type="text"
                  placeholder="0555 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] placeholder-[#94A3B8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">WhatsApp Numarası</label>
                <input
                  type="text"
                  placeholder="905551234567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-sm font-medium focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] placeholder-[#94A3B8]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Ülke kodu dahil, boşluksuz yazın.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0EA5E9] hover:bg-[#0284C7] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? "Oluşturuluyor..." : "Firma Profilini Oluştur"}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={handleLogout}
                className="w-full text-center text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-all cursor-pointer"
              >
                Giriş Ekranına Dön / Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: "Genel Bakış",
      href: "/panel/firma",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Profil Bilgileri",
      href: "/panel/firma/profile",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Hizmet & Fiyatlar",
      href: "/panel/firma/services",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: "Ürünler",
      href: "/panel/firma/products",
      premiumOnly: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      name: "Müşteri Yorumları",
      href: "/panel/firma/reviews",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: "Premium Üyelik",
      href: "/panel/firma/premium",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      name: "Reklam Alanları",
      href: "/panel/firma/ads",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.833c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      name: "Müşteri Kazan",
      href: "/panel/firma/acquisition",
      premiumOnly: false,
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#E2E8F0] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 border-b border-[#E2E8F0] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] flex items-center justify-center shadow-md shadow-sky-500/10 shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm text-[#0F172A] tracking-tight block truncate">
              {firm?.name}
            </span>
            <span className="block text-[10px] font-bold text-[#0EA5E9] tracking-wider uppercase -mt-0.5">
              {firm?.is_premium ? "Premium Üye" : "Standart Üye"}
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const effectiveHref = item.premiumOnly && !firm?.is_premium
              ? "/panel/firma/premium"
              : item.href;
            return (
              <a
                key={item.href}
                href={effectiveHref}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#0EA5E9]/5 text-[#0EA5E9] border border-[#0EA5E9]/10"
                    : "text-[#0F172A]/65 hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent"
                }`}
              >
                {item.icon}
                {item.name}
                {item.premiumOnly && !firm?.is_premium && (
                  <span className="ml-auto text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Premium
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-[#E2E8F0]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-[#F1F5F9] text-[#0F172A]/70"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-extrabold text-sm text-[#0F172A] truncate max-w-[180px]">{firm?.name} Paneli</span>
          <div className="w-8" />
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

