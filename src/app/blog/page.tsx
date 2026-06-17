import React from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BannerSlot from "@/components/BannerSlot";
import BannerPlaceholder from "@/components/BannerPlaceholder";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Su Arıtma Rehberi",
  description: "Su arıtma hakkında uzman içerikleri, cihaz karşılaştırmaları, bakım ipuçları ve sektör haberleri.",
  alternates: { canonical: "https://suaritmarehberi.com.tr/blog" },
  openGraph: {
    title: "Blog — Su Arıtma Rehberi",
    description: "Su arıtma hakkında uzman içerikler ve rehberler.",
    url: "https://suaritmarehberi.com.tr/blog",
    siteName: "Su Arıtma Rehberi",
    locale: "tr_TR",
    type: "website",
  },
};

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, cover_image_alt, author_name, published_at, content")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const list = posts ?? [];

  // Fetch banner for blog sidebar placement
  const { data: blogListBanner } = await supabase
    .from("banners")
    .select("*")
    .eq("placement", "blog_sidebar")
    .eq("is_active", true)
    .lte("starts_at", new Date().toISOString())
    .gte("ends_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Su Arıtma Rehberi Blog
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">
            Su Arıtma Rehberi
          </h1>
          <p className="text-base text-[#0F172A]/60 max-w-xl mx-auto leading-relaxed">
            Uzman içerikler, cihaz karşılaştırmaları, bakım ipuçları ve sektör haberleri.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="flex-1 py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Banner at top of blog list */}
          <div className="mb-10">
            {blogListBanner ? (
              <BannerSlot banner={blogListBanner} variant="horizontal" />
            ) : (
              <BannerPlaceholder variant="horizontal" />
            )}
          </div>
          {list.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-[#E2E8F0] rounded-2xl bg-[#F8FAFC]">
              <p className="text-sm font-semibold text-[#0F172A]/50">Henüz blog yazısı yok.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((post) => {
                const minutes = readingTime(post.content ?? "");
                return (
                  <article key={post.id} className="group flex flex-col bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                    {/* Cover */}
                    <a href={`/blog/${post.slug}`} className="block overflow-hidden aspect-video bg-[#F1F5F9]">
                      {post.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.cover_image_url}
                          alt={post.cover_image_alt ?? post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">💧</div>
                      )}
                    </a>

                    {/* Content */}
                    <div className="flex-1 flex flex-col p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/8 px-2 py-0.5 rounded-full">
                          {minutes} dk okuma
                        </span>
                        {post.published_at && (
                          <span className="text-[10px] text-[#0F172A]/40 font-medium">
                            {new Date(post.published_at).toLocaleDateString("tr-TR", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      <a href={`/blog/${post.slug}`}>
                        <h2 className="text-base font-extrabold text-[#0F172A] leading-snug mb-2 group-hover:text-[#0EA5E9] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </a>

                      {post.excerpt && (
                        <p className="text-xs text-[#0F172A]/60 leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0]">
                        <span className="text-xs text-[#0F172A]/50 font-medium">{post.author_name}</span>
                        <a
                          href={`/blog/${post.slug}`}
                          className="text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                        >
                          Devamını oku →
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

