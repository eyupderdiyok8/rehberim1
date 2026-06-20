"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductImageUploader from "@/components/ProductImageUploader";

interface Product {
  id: string;
  firm_id: string;
  name: string;
  description: string | null;
  image_url: string;
  price: number;
  whatsapp: string | null;
  sort_order: number;
  created_at: string;
}

interface Firm {
  id: string;
  name: string;
  is_premium: boolean;
  whatsapp: string | null;
}

export default function FirmProductsPage() {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [editing, setEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formPrice, setFormPrice] = useState("0");
  const [formWhatsapp, setFormWhatsapp] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: firmData } = await supabase
          .from("firms")
          .select("id, name, is_premium, whatsapp")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (firmData) {
          setFirm(firmData);
          await fetchProducts(firmData.id);
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchProducts = async (firmId: string) => {
    const { data } = await supabase
      .from("firm_products")
      .select("*")
      .eq("firm_id", firmId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    setProducts(data || []);
  };

  const openAdd = () => {
    setEditing(null);
    setIsAdding(true);
    setFormName("");
    setFormDesc("");
    setFormImage("");
    setFormPrice("0");
    setFormWhatsapp(firm?.whatsapp || "");
    setError("");
    setSuccess("");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setIsAdding(false);
    setFormName(p.name);
    setFormDesc(p.description || "");
    setFormImage(p.image_url);
    setFormPrice(String(p.price));
    setFormWhatsapp(p.whatsapp || "");
    setError("");
    setSuccess("");
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditing(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firm) return;
    if (!formName.trim()) { setError("Urun adi gerekli."); return; }
    if (!formImage) { setError("Urun gorseli gerekli."); return; }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      firm_id: firm.id,
      name: formName.trim(),
      description: formDesc.trim() || null,
      image_url: formImage,
      price: parseFloat(formPrice) || 0,
      whatsapp: formWhatsapp.trim() || null,
      sort_order: products.length,
    };

    try {
      if (isAdding) {
        const { error: insErr } = await supabase.from("firm_products").insert(payload);
        if (insErr) throw insErr;
        setSuccess("Urun basariyla eklendi.");
      } else if (editing) {
        const { error: updErr } = await supabase
          .from("firm_products")
          .update({ ...payload, firm_id: undefined })
          .eq("id", editing.id);
        if (updErr) throw updErr;
        setSuccess("Urun basariyla guncellendi.");
      }
      await fetchProducts(firm.id);
      closeForm();
    } catch (err: any) {
      setError(err.message.includes("10") ? "En fazla 10 urun ekleyebilirsiniz." : "Kayit hatasi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu urunu silmek istediginize emin misiniz?")) return;
    try {
      const { error: delErr } = await supabase.from("firm_products").delete().eq("id", id);
      if (delErr) throw delErr;
      setSuccess("Urun silindi.");
      if (firm) await fetchProducts(firm.id);
    } catch (err: any) {
      setError("Silme hatasi: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firm) {
    return <div className="text-center py-12 text-sm text-[#0F172A]/50">Firma bilgileri yuklenemedi.</div>;
  }

  // Premium gate
  if (!firm.is_premium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Urunler</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
            Urun Kataloğu
          </p>
        </div>
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg shadow-amber-100/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight mb-2">Premium Uyelik Gereklidir</h2>
          <p className="text-sm text-[#0F172A]/65 leading-relaxed max-w-md mb-6">
            Urun kataloğu ozelliği sadece Premium uyelere ozeldir. Premium&#39;a gecerek urunlerinizi sergileyebilir, fiyat ve WhatsApp iletişim bilgisi ekleyebilirsiniz.
          </p>
          <a
            href="mailto:eyupder@gmail.com?subject=Premium%20Uyelik%20Hakkinda%20-%20Su%20Aritma%20Rehberi"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-amber-500/20"
          >
            Premium&#39;a Gec
          </a>
        </div>
      </div>
    );
  }

  const productCount = products.length;
  const progressPct = (productCount / 10) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Urunler</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">
            Urun Kataloğu - Maksimum 10 Urun
          </p>
        </div>
        {productCount < 10 && !isAdding && !editing && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 self-start px-4 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Yeni Urun Ekle
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#0F172A]/60 uppercase tracking-wider">Urun Sayisi</span>
          <span className="text-sm font-black text-[#0F172A]">{productCount} / 10</span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${productCount >= 10 ? "bg-amber-500" : "bg-[#0EA5E9]"}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-xs font-semibold text-red-800 p-4 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 p-4 rounded-lg">{success}</div>
      )}

      {/* Product Form */}
      {(isAdding || editing) && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-wide">
              {isAdding ? "Yeni Urun Ekle" : `Duzenle: ${editing?.name}`}
            </h3>
            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Urun Adi *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Orn: Aqua Pure Filtre Seti"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Fiyat (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0 = Fiyat sorunuz"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
                <p className="text-[10px] text-[#0F172A]/40 mt-1">0 birakirsaniz &quot;Fiyat icin arayin&quot; gorunur</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">WhatsApp Numarasi</label>
                <input
                  type="text"
                  value={formWhatsapp}
                  onChange={(e) => setFormWhatsapp(e.target.value)}
                  placeholder="905551234567"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Aciklama (Opsiyonel)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={2}
                  placeholder="Urun hakkinda kisa bilgi..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Urun Gorseli *</label>
              <ProductImageUploader
                currentUrl={formImage}
                onUpload={setFormImage}
                firmName={firm.name}
              />
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Iptal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-[#F8FAFC] relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                {Number(p.price) > 0 && (
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#0F172A] text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border border-white/50">
                    {Number(p.price).toLocaleString("tr-TR")} TL
                  </span>
                )}
                {Number(p.price) === 0 && (
                  <span className="absolute top-2 right-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    Fiyat Sorunuz
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-bold text-[#0F172A] line-clamp-1">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-[#0F172A]/60 line-clamp-2">{p.description}</p>
                )}
                {p.whatsapp && (
                  <a
                    href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0EA5E9] hover:underline"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.444 5.703 1.445h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    WhatsApp ile Sor
                  </a>
                )}
                <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 text-xs font-bold text-[#0EA5E9] hover:text-[#0284C7] py-1 cursor-pointer"
                  >
                    Duzenle
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 text-xs font-bold text-red-500 hover:text-red-700 py-1 cursor-pointer"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isAdding ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-sm font-extrabold text-[#0F172A] mb-1">Henuz urun eklenmedi</h3>
          <p className="text-xs text-[#0F172A]/50 mb-4">Urunlerinizi ekleyerek musterilerinize sergileyin.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Ilk Urununuzu Ekleyin
          </button>
        </div>
      ) : null}
    </div>
  );
}
