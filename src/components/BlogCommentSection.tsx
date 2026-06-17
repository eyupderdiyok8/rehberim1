"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  reply_body: string | null;
  replied_at: string | null;
}

interface Props {
  postId: string;
}

export default function BlogCommentSection({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("blog_comments")
        .select("id, author_name, body, created_at, reply_body, replied_at")
        .eq("post_id", postId)
        .eq("is_approved", true)
        .order("created_at", { ascending: true });
      setComments(data ?? []);
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) { setError("Adınızı girin."); return; }
    if (!body.trim()) { setError("Yorum boş bırakılamaz."); return; }
    setError("");
    setSubmitting(true);

    const { error: insertErr } = await supabase.from("blog_comments").insert({
      post_id: postId,
      author_name: authorName.trim(),
      author_email: authorEmail.trim() || null,
      body: body.trim(),
    });

    setSubmitting(false);
    if (insertErr) {
      setError("Yorum gönderilemedi. Lütfen tekrar deneyin.");
    } else {
      setSuccess(true);
      setAuthorName("");
      setAuthorEmail("");
      setBody("");
    }
  };

  return (
    <section aria-label="Yorumlar">
      <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-8">
        Yorumlar
        {comments.length > 0 && (
          <span className="ml-2 text-sm font-bold text-[#0F172A]/30">({comments.length})</span>
        )}
      </h2>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-5 mb-12">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-4 p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              <div className="w-9 h-9 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center text-sm font-extrabold shrink-0">
                {c.author_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#0F172A]">{c.author_name}</span>
                  <span className="text-[10px] text-[#0F172A]/35">
                    {new Date(c.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-[#0F172A]/75 leading-relaxed">{c.body}</p>

                {/* Admin Reply */}
                {c.reply_body && (
                  <div className="mt-3 ml-2 p-3 border-l-[3px] border-l-[#0EA5E9] bg-[#F0F9FF] rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider">Admin Yanıtı</span>
                      {c.replied_at && (
                        <span className="text-[10px] text-[#0F172A]/30">
                          {new Date(c.replied_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#0F172A]/75 leading-relaxed">{c.reply_body}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-10 p-6 text-center border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
          <p className="text-sm text-[#0F172A]/40 font-medium">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        </div>
      )}

      {/* Comment form — collapsible */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="w-full px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] transition-colors"
        >
          <h3 className="text-sm font-extrabold text-[#0F172A]">Yorum Yap</h3>
          <svg
            className={`w-5 h-5 text-[#0F172A]/30 transition-transform duration-200 shrink-0 ${formOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`px-6 pb-6 transition-all duration-300 ${formOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden !pb-0"}`}>
        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-4 rounded-xl text-center">
            ✅ Yorumunuz alındı! Moderatör onayından sonra yayınlanacaktır.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  Adınız <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => { setAuthorName(e.target.value); setError(""); }}
                  placeholder="Ahmet Yılmaz"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                  E-posta <span className="text-[#0F172A]/30 font-normal">(isteğe bağlı, gizli tutulur)</span>
                </label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="ahmet@ornek.com"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Yorumunuz <span className="text-red-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => { setBody(e.target.value); setError(""); }}
                rows={4}
                placeholder="Düşüncelerinizi paylaşın…"
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium">⚠ {error}</p>
            )}

            <p className="text-[10px] text-[#0F172A]/35">
              Yorumunuz moderatör onayından sonra yayınlanacaktır.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-xl transition-colors shadow-sm shadow-sky-500/20 disabled:opacity-50"
            >
              {submitting ? "Gönderiliyor…" : "Yorum Gönder"}
            </button>
          </form>
        )}
        </div>
      </div>
    </section>
  );
}

