"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "@/components/ImageLightbox";

interface Review {
  id: string;
  firm_id: string;
  author_name: string;
  rating: number;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  firm: { name: string; slug: string } | null;
  review_images: { id: string; image_url: string; sort_order: number }[] | null;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editHovered, setEditHovered] = useState(0);
  const [editBody, setEditBody] = useState("");

  const [flash, setFlash] = useState({ type: "", text: "" });

  const showFlash = (type: string, text: string) => {
    setFlash({ type, text });
    setTimeout(() => setFlash({ type: "", text: "" }), 3000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*, firm:firms(name, slug), review_images(id, image_url, sort_order)")
      .order("created_at", { ascending: false });
    if (!error) setReviews((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: true } : r));
    setActionLoading(null);
    showFlash("success", "Yorum onaylandı.");
  };

  const handleDisapprove = async (id: string) => {
    setActionLoading(id);
    await supabase.from("reviews").update({ is_approved: false }).eq("id", id);
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved: false } : r));
    setActionLoading(null);
    showFlash("info", "Onay kaldırıldı.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu tamamen silmek istediğinize emin misiniz?")) return;
    setActionLoading(id);
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setActionLoading(null);
    showFlash("success", "Yorum silindi.");
  };

  const startEdit = (r: Review) => {
    setEditId(r.id);
    setEditAuthor(r.author_name);
    setEditRating(r.rating);
    setEditBody(r.body ?? "");
    setEditHovered(0);
  };

  const saveEdit = async (id: string) => {
    if (!editAuthor.trim()) return;
    setActionLoading(id);
    const { error } = await supabase
      .from("reviews")
      .update({ author_name: editAuthor.trim(), rating: editRating, body: editBody.trim() || null })
      .eq("id", id);
    if (!error) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, author_name: editAuthor.trim(), rating: editRating, body: editBody.trim() || null }
            : r
        )
      );
      showFlash("success", "Yorum güncellendi.");
    } else {
      showFlash("error", "Güncelleme hatası: " + error.message);
    }
    setEditId(null);
    setActionLoading(null);
  };

  const cancelEdit = () => { setEditId(null); setEditBody(""); setEditAuthor(""); };

  const pendingReviews = reviews.filter((r) => !r.is_approved);
  const approvedReviews = reviews.filter((r) => r.is_approved);
  const currentReviews = activeTab === "pending" ? pendingReviews : approvedReviews;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Firma Yorumları</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
          Müşteri Yorumlarını İncele, Düzenle ve Onayla
        </p>
      </div>

      {/* Flash */}
      {flash.text && (
        <div className={`text-xs font-semibold px-4 py-3 rounded-lg border transition-all ${
          flash.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : flash.type === "error" ? "bg-red-50 border-red-200 text-red-700"
          : "bg-sky-50 border-sky-200 text-sky-700"
        }`}>
          {flash.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E2E8F0]">
        {(["pending", "approved"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === t
                ? "border-[#0EA5E9] text-[#0EA5E9]"
                : "border-transparent text-[#0F172A]/50 hover:text-[#0F172A]"
            }`}
          >
            {t === "pending" ? `Onay Bekleyenler (${pendingReviews.length})` : `Onaylanmış (${approvedReviews.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-16 bg-white border border-[#E2E8F0] rounded-xl">
            <div className="w-7 h-7 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentReviews.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-[#E2E8F0] rounded-xl">
            <p className="text-xs text-[#0F172A]/40 font-bold uppercase tracking-wider">
              {activeTab === "pending" ? "Onay bekleyen yorum yok." : "Onaylanmış yorum yok."}
            </p>
          </div>
        ) : (
          currentReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              {editId === review.id ? (
                /* ── EDIT MODE ── */
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-[#0EA5E9] uppercase tracking-wider">Yorumu Düzenle</p>

                  {/* Author name */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Müşteri Adı</label>
                    <input
                      type="text"
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30"
                    />
                  </div>

                  {/* Star rating */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1.5">Puan</label>
                    <div className="flex items-center gap-1" onMouseLeave={() => setEditHovered(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          onMouseEnter={() => setEditHovered(star)}
                          className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                        >
                          <span className={star <= (editHovered || editRating) ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}>★</span>
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-[#0F172A]/50">
                        {editRating}/5
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">Yorum Metni</label>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={3}
                      className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none"
                      placeholder="Yorum metni (boş bırakılabilir)"
                    />
                  </div>

                  {/* Edit actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => saveEdit(review.id)}
                      disabled={actionLoading === review.id || !editAuthor.trim()}
                      className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading === review.id ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-[#E2E8F0] text-[#0F172A]/60 text-xs font-bold rounded-lg hover:bg-[#F8FAFC] transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                /* ── VIEW MODE ── */
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Author + firm + rating */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center text-sm font-extrabold shrink-0">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-[#0F172A]">{review.author_name}</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-xs ${i < review.rating ? "text-[#0EA5E9]" : "text-[#E2E8F0]"}`}>★</span>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-[#0F172A]/35">
                            {new Date(review.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#0F172A]/40 font-semibold uppercase tracking-wider mt-0.5">
                          Firma:{" "}
                          {review.firm ? (
                            <a href={`/firma/${review.firm.slug}`} target="_blank" className="text-[#0EA5E9] hover:underline">
                              {review.firm.name}
                            </a>
                          ) : "Bilinmiyor"}
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <p className="text-xs text-[#0F172A]/70 leading-relaxed italic ml-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5">
                      "{review.body || "Açıklama girilmedi."}"
                    </p>

                    {/* Review Images */}
                    {review.review_images && review.review_images.length > 0 && (
                      <div className="ml-12">
                        <ImageLightbox
                          images={review.review_images}
                          alt={`${review.firm?.name || "Firma"} su arıtma müşteri yorumu`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex sm:flex-row md:flex-col gap-2 shrink-0">
                    {!review.is_approved ? (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        ✓ Onayla
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDisapprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-3 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors"
                      >
                        ↩ Onayı Kaldır
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(review)}
                      className="px-3 py-2 border border-[#0EA5E9]/30 bg-[#F0F9FF] hover:bg-[#E0F2FE] text-[#0EA5E9] text-xs font-bold rounded-lg transition-colors"
                    >
                      ✎ Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors"
                    >
                      🗑 Sil
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

