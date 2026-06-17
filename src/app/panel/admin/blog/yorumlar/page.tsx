"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  body: string;
  is_approved: boolean;
  created_at: string;
  blog_posts: { title: string; slug: string } | null;
}

export default function AdminBlogComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*, blog_posts(title, slug)")
      .order("created_at", { ascending: false });
    if (!error) setComments((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, []);

  const filtered = comments.filter((c) =>
    tab === "pending" ? !c.is_approved : c.is_approved
  );

  const flash = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const approve = async (id: string) => {
    setActionId(id);
    await supabase.from("blog_comments").update({ is_approved: true }).eq("id", id);
    await fetchComments();
    setActionId(null);
    flash("success", "Yorum onaylandı.");
  };

  const disapprove = async (id: string) => {
    setActionId(id);
    await supabase.from("blog_comments").update({ is_approved: false }).eq("id", id);
    await fetchComments();
    setActionId(null);
    flash("info", "Yorum onayı kaldırıldı.");
  };

  const remove = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    setActionId(id);
    await supabase.from("blog_comments").delete().eq("id", id);
    await fetchComments();
    setActionId(null);
    flash("success", "Yorum silindi.");
  };

  const startEdit = (c: Comment) => {
    setEditId(c.id);
    setEditBody(c.body);
  };

  const saveEdit = async (id: string) => {
    if (!editBody.trim()) return;
    setActionId(id);
    await supabase.from("blog_comments").update({ body: editBody.trim() }).eq("id", id);
    await fetchComments();
    setActionId(null);
    setEditId(null);
    flash("success", "Yorum güncellendi.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Blog Yorumları</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
          Yorum Moderasyonu
        </p>
      </div>

      {/* Flash */}
      {msg.text && (
        <div className={`text-xs font-semibold px-4 py-3 rounded-lg border ${
          msg.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-sky-50 border-sky-200 text-sky-700"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["pending", "approved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === t
                ? "bg-[#0EA5E9] text-white shadow-sm shadow-sky-500/20"
                : "bg-white border border-[#E2E8F0] text-[#0F172A]/60 hover:text-[#0F172A]"
            }`}
          >
            {t === "pending" ? "⏳ Onay Bekleyen" : "✅ Onaylı"}
            <span className="ml-1.5 text-[10px] opacity-70">
              ({comments.filter((c) => (t === "pending" ? !c.is_approved : c.is_approved)).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-7 h-7 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#0F172A]/40 font-medium">
              {tab === "pending" ? "Onay bekleyen yorum yok." : "Onaylı yorum yok."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filtered.map((c) => {
              const post = c.blog_posts;
              return (
                <div key={c.id} className="p-5 hover:bg-[#F8FAFC] transition-colors">
                  {/* Post info */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-[#0EA5E9] bg-[#0EA5E9]/8 px-2 py-0.5 rounded-full border border-[#0EA5E9]/15 uppercase tracking-wide">
                      Blog
                    </span>
                    {post && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-[#0F172A]/60 hover:text-[#0EA5E9] transition-colors truncate max-w-xs"
                      >
                        {post.title}
                      </a>
                    )}
                  </div>

                  {/* Author + date */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center text-xs font-extrabold shrink-0">
                      {c.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0F172A]">{c.author_name}</span>
                      {c.author_email && (
                        <span className="ml-2 text-[10px] text-[#0F172A]/40">{c.author_email}</span>
                      )}
                    </div>
                    <span className="ml-auto text-[10px] text-[#0F172A]/35 shrink-0">
                      {new Date(c.created_at).toLocaleDateString("tr-TR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Body — edit mode or display */}
                  {editId === c.id ? (
                    <div className="space-y-2 mb-3">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={3}
                        className="w-full border border-[#0EA5E9]/40 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none bg-[#F0F9FF]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={actionId === c.id}
                          className="px-3 py-1.5 text-xs font-bold bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284C7] transition-colors disabled:opacity-50"
                        >
                          {actionId === c.id ? "Kaydediliyor…" : "Kaydet"}
                        </button>
                        <button
                          onClick={() => { setEditId(null); setEditBody(""); }}
                          className="px-3 py-1.5 text-xs font-bold border border-[#E2E8F0] text-[#0F172A]/60 rounded-lg hover:bg-[#F8FAFC] transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#0F172A]/75 leading-relaxed mb-3 bg-[#F8FAFC] rounded-lg px-3 py-2.5 border border-[#E2E8F0]">
                      {c.body}
                    </p>
                  )}

                  {/* Actions */}
                  {editId !== c.id && (
                    <div className="flex items-center gap-3 flex-wrap">
                      {!c.is_approved ? (
                        <button
                          onClick={() => approve(c.id)}
                          disabled={actionId === c.id}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                        >
                          ✓ Onayla
                        </button>
                      ) : (
                        <button
                          onClick={() => disapprove(c.id)}
                          disabled={actionId === c.id}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50 transition-colors"
                        >
                          ↩ Onayı Kaldır
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(c)}
                        className="text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] transition-colors"
                      >
                        ✎ Düzenle
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        disabled={actionId === c.id}
                        className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        🗑 Sil
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

