"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageLightbox from "@/components/ImageLightbox";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  body: string | null;
  reply_body: string | null;
  reply_created_at: string | null;
  created_at: string;
  review_images: { id: string; image_url: string; sort_order: number }[] | null;
}

interface Firm {
  id: string;
  name: string;
  is_premium: boolean;
}

export default function FirmReviews() {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: firmData, error: firmErr } = await supabase
        .from("firms")
        .select("id, name, is_premium")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (firmErr) throw firmErr;
      if (!firmData) return;

      setFirm(firmData);

      // Fetch reviews
      const { data: reviewsData, error: revErr } = await supabase
        .from("reviews")
        .select("*, review_images(id, image_url, sort_order)")
        .eq("firm_id", firmData.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (revErr) throw revErr;
      setReviews(reviewsData || []);

      // Initialize reply inputs
      const inputMap: { [key: string]: string } = {};
      reviewsData?.forEach((r) => {
        inputMap[r.id] = r.reply_body || "";
      });
      setReplyInputs(inputMap);
    } catch (err: any) {
      console.error(err);
      setError("Yorumlar yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (reviewId: string, val: string) => {
    setReplyInputs((prev) => ({
      ...prev,
      [reviewId]: val,
    }));
  };

  const handleReplySubmit = async (reviewId: string) => {
    if (!firm?.is_premium) return;
    setActionLoading(reviewId);
    setError("");
    setSuccess("");

    const replyText = replyInputs[reviewId]?.trim();

    try {
      const { error: updErr } = await supabase
        .from("reviews")
        .update({
          reply_body: replyText || null,
          reply_created_at: replyText ? new Date().toISOString() : null,
        })
        .eq("id", reviewId);

      if (updErr) throw updErr;
      setSuccess("Cevabınız başarıyla kaydedildi.");
      // Refresh list to show updated reply timestamp
      fetchReviews();
    } catch (err: any) {
      setError("Cevap kaydetme hatası: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Müşteri Yorumları</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Müşterileriniz Tarafından Yazılan ve Onaylanan Yorumlar</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-xs font-semibold text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Paywall Banner for Standard Firms */}
      {firm && !firm.is_premium && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/15 border border-amber-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-sm font-extrabold text-amber-800 flex items-center justify-center md:justify-start gap-1.5">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Yorum Cevaplama Kilitli
            </h3>
            <p className="text-xs text-[#0F172A]/70 leading-relaxed font-semibold">
              Müşteri değerlendirmelerine cevap yazmak ve profil sayfanızda yayımlamak bir **Premium** üye özelliğidir.
            </p>
          </div>
          <a
            href="/panel/firma/premium"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Premium Modeline Geç →
          </a>
        </div>
      )}

      {/* Reviews Queue */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4 hover:shadow-md transition-all duration-150"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{review.author_name}</h3>
                  <p className="text-[10px] text-[#0F172A]/40 font-medium">
                    Tarih: {new Date(review.created_at).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg shrink-0">
                  <span className="text-[#0EA5E9] text-xs">★</span>
                  <span className="text-xs font-bold text-[#0F172A]">{review.rating}</span>
                </div>
              </div>

              {/* Comment Body */}
              {review.body && (
                <p className="text-xs text-[#0F172A]/70 font-medium leading-relaxed italic bg-slate-50/50 p-3.5 border border-slate-100 rounded-lg">
                  &quot;{review.body}&quot;
                </p>
              )}

              {/* Review Images */}
              {review.review_images && review.review_images.length > 0 && (
                <ImageLightbox
                  images={review.review_images}
                  alt={`${firm?.name || "Firma"} su arıtma müşteri yorumu`}
                />
              )}

              {/* Reply Section */}
              <div className="pt-2 border-t border-[#E2E8F0] space-y-3">
                <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">
                  Firma Yanıtı
                </p>

                {firm?.is_premium ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Müşterinize teşekkür edin veya sorunu gidermeyi teklif edin..."
                      value={replyInputs[review.id] || ""}
                      onChange={(e) => handleInputChange(review.id, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-lg text-xs font-medium focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400">
                        {review.reply_created_at
                          ? `Son yanıtlanma: ${new Date(review.reply_created_at).toLocaleDateString("tr-TR")}`
                          : "Henüz yanıtlanmadı."}
                      </span>
                      <button
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={actionLoading === review.id}
                        className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {actionLoading === review.id ? "Kaydediliyor..." : "Cevabı Kaydet"}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Disabled view for standard users
                  <div className="space-y-3 opacity-60 pointer-events-none relative select-none">
                    {review.reply_body ? (
                      <div className="p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg text-xs text-slate-600 font-medium leading-relaxed">
                        {review.reply_body}
                      </div>
                    ) : (
                      <textarea
                        disabled
                        placeholder="Müşterinize cevap yazmak için premium üye olmanız gerekir."
                        rows={2}
                        className="w-full px-3 py-2.5 border border-[#E2E8F0] bg-slate-50/50 rounded-lg text-xs font-medium cursor-not-allowed blur-[1.5px]"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-[#E2E8F0] rounded-xl">
            <p className="text-xs text-[#0F172A]/40 font-bold uppercase tracking-wider">
              Henüz onaylanmış müşteri yorumu bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

