import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCommentSection from "@/components/BlogCommentSection";
import BannerSlot from "@/components/BannerSlot";
import BannerPlaceholder from "@/components/BannerPlaceholder";
import type { Metadata } from "next";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("is_published", true);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) return { title: "Yazı Bulunamadı — Su Arıtma Rehberi" };

  return {
    title: `${post.title} — Su Arıtma Rehberi Blog`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `https://suaritmarehberi.com.tr/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url: `https://suaritmarehberi.com.tr/blog/${slug}`,
      siteName: "Su Arıtma Rehberi",
      locale: "tr_TR",
      type: "article",
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

interface Heading {
  text: string;
  id: string;
  level: 2 | 3;
}

function parseHeadingsAndInjectIds(html: string): { headings: Heading[]; cleanHtml: string } {
  const headings: Heading[] = [];
  let count = 0;

  const cleanHtml = html.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/h[23]>/gi, (match, tag, attrs, content) => {
    count++;
    const text = content.replace(/<[^>]+>/g, "").trim();
    const slug = text
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/Ğ/g, "g")
      .replace(/ü/g, "u").replace(/Ü/g, "u")
      .replace(/ş/g, "s").replace(/Ş/g, "s")
      .replace(/ı/g, "i").replace(/I/g, "i")
      .replace(/ö/g, "o").replace(/Ö/g, "o")
      .replace(/ç/g, "c").replace(/Ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const id = `${slug || "heading"}-${count}`;
    const level = tag.toLowerCase() === "h2" ? 2 : 3;

    headings.push({ text, id, level });

    return `<${tag} id="${id}"${attrs}>${content}</${tag}>`;
  });

  return { headings, cleanHtml };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) notFound();

  const minutes = readingTime(post.content ?? "");
  const { headings, cleanHtml } = parseHeadingsAndInjectIds(post.content ?? "");

  // Fetch banner for blog post bottom placement
  const { data: blogBanner } = await supabase
    .from("banners")
    .select("*")
    .eq("placement", "blog_post_bottom")
    .eq("is_active", true)
    .lte("starts_at", new Date().toISOString())
    .gte("ends_at", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      {/* Cover Hero */}
      {post.cover_image_url && (
        <div className="relative w-full h-64 md:h-96 bg-[#F1F5F9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt={post.cover_image_alt ?? post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Article */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#0F172A]/40 font-medium mb-8">
            <a href="/" className="hover:text-[#0EA5E9] transition-colors">Ana Sayfa</a>
            <span>/</span>
            <a href="/blog" className="hover:text-[#0EA5E9] transition-colors">Blog</a>
            <span>/</span>
            <span className="text-[#0F172A]/60 truncate">{post.title}</span>
          </nav>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/8 px-2.5 py-1 rounded-full border border-[#0EA5E9]/15">
              {minutes} dk okuma
            </span>
            {post.published_at && (
              <time
                dateTime={post.published_at}
                className="text-xs text-[#0F172A]/45 font-medium"
              >
                {new Date(post.published_at).toLocaleDateString("tr-TR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </time>
            )}
            <span className="text-xs text-[#0F172A]/45">· {post.author_name}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-base text-[#0F172A]/60 leading-relaxed mb-8 border-l-4 border-[#0EA5E9]/40 pl-4 italic">
              {post.excerpt}
            </p>
          )}

          {/* Table of Contents */}
          {headings.length > 0 && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 mb-8">
              <p className="font-extrabold text-xs text-[#0F172A]/40 uppercase tracking-widest mb-3">İçindekiler</p>
              <nav className="space-y-2">
                {headings.slice(0, 5).map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`block text-xs font-semibold text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors leading-relaxed ${
                      h.level === 3 ? "pl-4 text-[11px] text-[#0F172A]/50 font-medium" : ""
                    }`}
                  >
                    {h.level === 3 ? "• " : ""}{h.text}
                  </a>
                ))}

                {headings.length > 5 && (
                  <details className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] cursor-pointer list-none flex items-center gap-1 mt-3 select-none outline-none">
                      <span className="group-open:hidden">Daha Fazla Göster ({headings.length - 5})</span>
                      <span className="hidden group-open:inline">Daha Az Göster</span>
                      <svg className="w-3.5 h-3.5 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="space-y-2 mt-2 pt-2 border-t border-dashed border-[#E2E8F0]">
                      {headings.slice(5).map((h) => (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className={`block text-xs font-semibold text-[#0F172A]/70 hover:text-[#0EA5E9] transition-colors leading-relaxed ${
                            h.level === 3 ? "pl-4 text-[11px] text-[#0F172A]/50 font-medium" : ""
                          }`}
                        >
                          {h.level === 3 ? "• " : ""}{h.text}
                        </a>
                      ))}
                    </div>
                  </details>
                )}
              </nav>
            </div>
          )}

          {/* Body */}
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />

          {/* Divider */}
          <hr className="my-12 border-[#E2E8F0]" />

          {/* Author card */}
          <div className="flex items-center gap-4 p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl mb-8">
            <div className="w-12 h-12 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center text-lg font-extrabold shrink-0">
              {post.author_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{post.author_name}</p>
              <p className="text-xs text-[#0F172A]/50">Su Arıtma Rehberi Editörü</p>
            </div>
          </div>

          {/* Banner below author card */}
          <div className="mb-8">
            {blogBanner ? (
              <BannerSlot banner={blogBanner} variant="inline" />
            ) : (
              <BannerPlaceholder variant="inline" />
            )}
          </div>

          {/* Comments */}
          <BlogCommentSection postId={post.id} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
