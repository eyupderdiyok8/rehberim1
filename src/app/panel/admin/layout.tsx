"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAdminRole } from "@/lib/actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [pendingCounts, setPendingCounts] = useState<{
    firms: number;
    reviews: number;
    blogComments: number;
  }>({ firms: 0, reviews: 0, blogComments: 0 });

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const role = await getAdminRole(session?.user?.email || undefined);
      if (!session || role !== "admin") {
        router.push("/panel/login");
      } else {
        setUserEmail(session.user.email || "");
        setLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  // Fetch pending approval counts
  useEffect(() => {
    const fetchPendingCounts = async () => {
      const [
        { count: firmsCount },
        { count: reviewsCount },
        { count: blogCommentsCount },
      ] = await Promise.all([
        supabase.from("firms").select("id", { count: "exact", head: true }).eq("is_active", false),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
        supabase.from("blog_comments").select("id", { count: "exact", head: true }).eq("is_approved", false),
      ]);
      setPendingCounts({
        firms: firmsCount ?? 0,
        reviews: reviewsCount ?? 0,
        blogComments: blogCommentsCount ?? 0,
      });
    };
    if (!loading) fetchPendingCounts();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPendingCounts, 60000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/panel/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#0F172A]/40 uppercase tracking-wider">Yetki Kontrol Ediliyor...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: "Kontrol Paneli",
      href: "/panel/admin",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Firmaları Yönet",
      href: "/panel/admin/firms",
      badge: pendingCounts.firms,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      name: "Yorum Onay Sırası",
      href: "/panel/admin/reviews",
      badge: pendingCounts.reviews,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: "Reklam Bannerları",
      href: "/panel/admin/banners",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: "Blog Yazıları",
      href: "/panel/admin/blog",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      name: "Blog Yorumları",
      href: "/panel/admin/blog/yorumlar",
      badge: pendingCounts.blogComments,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
    {
      name: "B2B Doğrulamalar",
      href: "/panel/admin/b2b",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: "İstatistikler",
      href: "/panel/admin/stats",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: "SEO & Sayfalar",
      href: "/panel/admin/seo",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ),
    },
    {
      name: "CSV Toplu Yükleme",
      href: "/panel/admin/csv-import",
      badge: 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          <div>
            <span className="font-extrabold text-sm text-[#0F172A] tracking-tight">Su Arıtma Rehberi</span>
            <span className="block text-[10px] font-bold text-[#0EA5E9] tracking-wider uppercase -mt-0.5">Admin Panel</span>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#0EA5E9]/5 text-[#0EA5E9] border border-[#0EA5E9]/10"
                    : "text-[#0F172A]/65 hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent"
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.name}</span>
                {item.badge > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center px-1.5 text-[10px] font-black text-white bg-red-500 rounded-full shadow-sm shadow-red-500/30">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-[#E2E8F0] space-y-2">
          <div className="px-4 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
            <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wide">Giriş Yapan</p>
            <p className="text-xs font-bold text-[#0F172A] truncate">{userEmail}</p>
          </div>
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
          <span className="font-extrabold text-sm text-[#0F172A]">Su Arıtma Rehberi Admin</span>
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

