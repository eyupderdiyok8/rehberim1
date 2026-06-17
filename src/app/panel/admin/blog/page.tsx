"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  author_name: string;
  created_at: string;
  published_at: string | null;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, is_published, author_name, created_at, published_at")
      .order("created_at", { ascending: false });
    if (!error) setPosts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" başlıklı yazıyı silmek istediğinize emin misiniz?`)) return;
    setDeleting(id);
    await supabase.from("blog_posts").delete().eq("id", id);
    await fetchPosts();
    setDeleting(null);
  };

  const togglePublish = async (post: BlogPost) => {
    const newState = !post.is_published;
    await supabase
      .from("blog_posts")
      .update({
        is_published: newState,
        published_at: newState ? new Date().toISOString() : null,
      })
      .eq("id", post.id);
    await fetchPosts();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Blog Yazıları</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
            İçerik Yönetimi
          </p>
        </div>
        <a
          href="/panel/admin/blog/yeni"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-sky-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Yazı
        </a>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <p className="text-xs font-bold text-[#0F172A]/50 uppercase tracking-wider">
            Toplam {posts.length} yazı
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-7 h-7 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#0F172A]/40 font-medium">Henüz blog yazısı yok.</p>
            <a
              href="/panel/admin/blog/yeni"
              className="mt-4 inline-block text-xs font-bold text-[#0EA5E9] hover:underline"
            >
              İlk yazıyı oluştur →
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {["Başlık", "Slug", "Durum", "Tarih", "İşlem"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#0F172A]/40">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#0F172A] max-w-xs truncate">{post.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#0F172A]/50 font-mono">{post.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${
                          post.is_published
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {post.is_published ? "Yayında" : "Taslak"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#0F172A]/50">
                        {new Date(post.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-xs text-[#0F172A]/50 hover:text-[#0EA5E9] font-semibold transition-colors"
                        >
                          Görüntüle
                        </a>
                        <a
                          href={`/panel/admin/blog/${post.id}/duzenle`}
                          className="text-xs text-[#0EA5E9] hover:text-[#0284C7] font-semibold transition-colors"
                        >
                          Düzenle
                        </a>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deleting === post.id}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
                        >
                          {deleting === post.id ? "Siliniyor…" : "Sil"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

