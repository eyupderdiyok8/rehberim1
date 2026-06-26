"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createFirmAccount } from "@/lib/actions";
import LogoUploader from "@/components/LogoUploader";
import CoverUploader from "@/components/CoverUploader";
import ProductImageUploader from "@/components/ProductImageUploader";

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  city_id: string;
}

interface Service {
  id: string;
  name: string;
  slug: string;
}

interface Firm {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city_id: string | null;
  district_id: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  is_verified: boolean;
  is_premium: boolean;
  premium_until: string | null;
  is_active: boolean;
  rating: number;
  review_count: number;
  user_id: string | null;
}

export default function AdminFirms() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form states
  const [editingFirm, setEditingFirm] = useState<Firm | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Firm>>({
    name: "",
    slug: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    city_id: "",
    district_id: "",
    description: "",
    logo_url: "",
    cover_image_url: "",
    is_verified: false,
    is_premium: false,
    premium_until: "",
    is_active: true,
    rating: 5.0,
    review_count: 0,
    user_id: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create account modal state
  const [accountCreating, setAccountCreating] = useState<string | null>(null); // firmId being processed
  const [accountResult, setAccountResult] = useState<{ email: string; password: string } | null>(null);
  const [accountError, setAccountError] = useState("");

  // Products modal state
  interface AdminProduct { id: string; name: string; description: string | null; image_url: string; price: number; whatsapp: string | null; sort_order: number; }
  const [productsFirm, setProductsFirm] = useState<Firm | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productEditing, setProductEditing] = useState<AdminProduct | null>(null);
  const [productAdding, setProductAdding] = useState(false);
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pImage, setPImage] = useState("");
  const [pPrice, setPPrice] = useState("0");
  const [pWhatsapp, setPWhatsapp] = useState("");
  const [productError, setProductError] = useState("");

  const openProductsModal = async (firm: Firm) => {
    setProductsFirm(firm);
    setProductEditing(null);
    setProductAdding(false);
    setProductError("");
    setProductLoading(true);
    const { data } = await supabase
      .from("firm_products")
      .select("*")
      .eq("firm_id", firm.id)
      .order("sort_order")
      .order("created_at");
    setProducts(data || []);
    setProductLoading(false);
  };

  const closeProductsModal = () => {
    setProductsFirm(null);
    setProductEditing(null);
    setProductAdding(false);
  };

  const openProductAdd = () => {
    setProductEditing(null);
    setProductAdding(true);
    setPName(""); setPDesc(""); setPImage(""); setPPrice("0"); setPWhatsapp(productsFirm?.whatsapp || "");
    setProductError("");
  };

  const openProductEdit = (p: AdminProduct) => {
    setProductEditing(p);
    setProductAdding(false);
    setPName(p.name); setPDesc(p.description || ""); setPImage(p.image_url); setPPrice(String(p.price)); setPWhatsapp(p.whatsapp || "");
    setProductError("");
  };

  const handleProductSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productsFirm) return;
    if (!pName.trim()) { setProductError("Urun adi gerekli."); return; }
    if (!pImage) { setProductError("Urun gorseli gerekli."); return; }
    setProductSaving(true);
    setProductError("");
    const payload = { firm_id: productsFirm.id, name: pName.trim(), description: pDesc.trim() || null, image_url: pImage, price: parseFloat(pPrice) || 0, whatsapp: pWhatsapp.trim() || null, sort_order: products.length };
    try {
      if (productAdding) {
        const { error: insErr } = await supabase.from("firm_products").insert(payload);
        if (insErr) throw insErr;
      } else if (productEditing) {
        const { error: updErr } = await supabase.from("firm_products").update({ name: pName.trim(), description: pDesc.trim() || null, image_url: pImage, price: parseFloat(pPrice) || 0, whatsapp: pWhatsapp.trim() || null }).eq("id", productEditing.id);
        if (updErr) throw updErr;
      }
      const { data } = await supabase.from("firm_products").select("*").eq("firm_id", productsFirm.id).order("sort_order").order("created_at");
      setProducts(data || []);
      setProductAdding(false);
      setProductEditing(null);
    } catch (err: any) {
      setProductError(err.message.includes("10") ? "En fazla 10 urun eklenebilir." : "Hata: " + err.message);
    } finally {
      setProductSaving(false);
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm("Bu urunu silmek istediginize emin misiniz?")) return;
    const { error: delErr } = await supabase.from("firm_products").delete().eq("id", id);
    if (delErr) { setProductError("Silme hatasi: " + delErr.message); return; }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: firmsData, error: firmsErr } = await supabase
        .from("firms")
        .select("*")
        .order("name", { ascending: true });

      if (firmsErr) throw firmsErr;
      setFirms(firmsData || []);

      const { data: citiesData } = await supabase.from("cities").select("id, name").order("name");
      setCities(citiesData || []);

      const { data: districtsData } = await supabase.from("districts").select("id, name, city_id").order("name");
      setDistricts(districtsData || []);

      const { data: servicesData } = await supabase.from("services").select("id, name, slug").order("sort_order");
      setServices(servicesData || []);
    } catch (err: any) {
      console.error("Veri yuklenirken hata:", err);
      setError("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = async (firm: Firm) => {
    setEditingFirm(firm);
    setIsAdding(false);
    setFormData({
      ...firm,
      phone: firm.phone || "",
      whatsapp: firm.whatsapp || "",
      email: firm.email || "",
      website: firm.website || "",
      address: firm.address || "",
      city_id: firm.city_id || "",
      district_id: firm.district_id || "",
      description: firm.description || "",
      logo_url: firm.logo_url || "",
      cover_image_url: firm.cover_image_url || "",
      premium_until: firm.premium_until ? firm.premium_until.split("T")[0] : "",
      user_id: firm.user_id || "",
    });
    // Load firm's current services
    const { data: firmSvcs } = await supabase
      .from("firm_services")
      .select("service_id")
      .eq("firm_id", firm.id);
    setSelectedServices((firmSvcs || []).map((s: { service_id: string }) => s.service_id));
    setError("");
    setSuccess("");
  };

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingFirm(null);
    setFormData({
      name: "",
      slug: "",
      phone: "",
      whatsapp: "",
      email: "",
      website: "",
      address: "",
      city_id: "",
      district_id: "",
      description: "",
      logo_url: "",
      cover_image_url: "",
      is_verified: false,
      is_premium: false,
      premium_until: "",
      is_active: true,
      rating: 5.0,
      review_count: 0,
      user_id: "",
    });
    setSelectedServices([]);
    setError("");
    setSuccess("");
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let checked = false;

    if (e.target instanceof HTMLInputElement && type === "checkbox") {
      checked = e.target.checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Generate slug from name if adding
    if (name === "name" && isAdding) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError("");
    setSuccess("");

    const cleanData = {
      name: formData.name,
      slug: formData.slug,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      email: formData.email || null,
      website: formData.website || null,
      address: formData.address || null,
      city_id: formData.city_id || null,
      district_id: formData.district_id || null,
      description: formData.description || null,
      logo_url: formData.logo_url || null,
      cover_image_url: formData.cover_image_url || null,
      is_verified: formData.is_verified ?? false,
      is_premium: formData.is_premium ?? false,
      premium_until: formData.is_premium && formData.premium_until ? new Date(formData.premium_until).toISOString() : null,
      is_active: formData.is_active ?? true,
      rating: Number(formData.rating) || 5.0,
      review_count: Number(formData.review_count) || 0,
      user_id: formData.user_id || null,
    };

    try {
      let firmId: string | null = null;
      if (isAdding) {
        const { data: inserted, error: insErr } = await supabase.from("firms").insert(cleanData).select("id").single();
        if (insErr) throw insErr;
        firmId = inserted.id;
        setSuccess("Firma başarıyla eklendi.");
      } else if (editingFirm) {
        const { error: updErr } = await supabase
          .from("firms")
          .update(cleanData)
          .eq("id", editingFirm.id);
        if (updErr) throw updErr;
        firmId = editingFirm.id;
        setSuccess("Firma başarıyla güncellendi.");
      }

      // Save firm_services
      if (firmId) {
        // Delete old services
        await supabase.from("firm_services").delete().eq("firm_id", firmId);
        // Insert selected services
        if (selectedServices.length > 0) {
          const inserts = selectedServices.map((sid) => ({ firm_id: firmId, service_id: sid }));
          const { error: svcErr } = await supabase.from("firm_services").insert(inserts);
          if (svcErr) throw svcErr;
        }
      }

      setIsAdding(false);
      setEditingFirm(null);
      fetchData();
    } catch (err: any) {
      setError("Kayıt hatası: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu firmayı silmek istediğinize emin misiniz?")) return;
    setError("");
    setSuccess("");
    try {
      const { error: delErr } = await supabase.from("firms").delete().eq("id", id);
      if (delErr) throw delErr;
      setSuccess("Firma başarıyla silindi.");
      fetchData();
    } catch (err: any) {
      setError("Silme hatası: " + err.message);
    }
  };

  const handleCreateAccount = async (firm: Firm) => {
    if (!firm.email) {
      setError("Bu firmanın e-posta adresi yok. Önce düzenlemeden ekleyin.");
      return;
    }
    setAccountCreating(firm.id);
    setAccountError("");
    setAccountResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const result = await createFirmAccount(firm.id, firm.email, firm.name, session?.user?.email || undefined);
      if (result.success && result.email && result.password) {
        setAccountResult({ email: result.email, password: result.password });
        setSuccess(`${firm.name} için hesap oluşturuldu. Şifre ekranda gösteriliyor.`);
        fetchData(); // refresh table
      } else {
        setAccountError(result.error || "Hesap oluşturulamadı.");
      }
    } catch (err: any) {
      setAccountError("Hata: " + err.message);
    } finally {
      setAccountCreating(null);
    }
  };

  const filteredFirms = firms.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeDistricts = districts.filter(
    (d) => !formData.city_id || d.city_id === formData.city_id
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Firmaları Yönet</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Tüm Firma Kayıtları ve Detayları</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 self-start px-4 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg shadow-sm shadow-sky-500/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Firma Ekle
        </button>
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

      {/* Editor Panel Overlay */}
      {(editingFirm || isAdding) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-2xl w-full my-8 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-wide">
                {isAdding ? "Yeni Firma Ekle" : `Düzenle: ${editingFirm?.name}`}
              </h3>
              <button
                onClick={() => {
                  setEditingFirm(null);
                  setIsAdding(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Firma Adı</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    placeholder="Veyra Su Arıtma"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug || ""}
                    onChange={handleInputChange}
                    placeholder="veyra-su-aritma-tekirdag"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Telefon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="0555 123 4567"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp || ""}
                    onChange={handleInputChange}
                    placeholder="905551234567"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">E-Posta</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    placeholder="info@firma.com"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Web Sitesi</label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website || ""}
                    onChange={handleInputChange}
                    placeholder="https://www.firma.com"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Şehir</label>
                  <select
                    name="city_id"
                    value={formData.city_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
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
                    name="district_id"
                    value={formData.district_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  >
                    <option value="">Seçin</option>
                    {activeDistricts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Firma Logosu <span className="text-[#0EA5E9] font-normal lowercase">(Önerilen: 500x500 px - Kare)</span>
                  </label>
                  <LogoUploader
                    currentUrl={formData.logo_url}
                    firmName={formData.name}
                    onUpload={(url) => setFormData((prev) => ({ ...prev, logo_url: url || null }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Owner User ID (Auth.Users UUID)</label>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id || ""}
                    onChange={handleInputChange}
                    placeholder="Supabase Auth User UUID"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Kapak Fotoğrafı <span className="text-[#0EA5E9] font-normal lowercase">(Önerilen: 1200x400 px - Yatay)</span>
                </label>
                <CoverUploader
                  currentUrl={formData.cover_image_url}
                  firmName={formData.name}
                  onUpload={(url) => setFormData((prev) => ({ ...prev, cover_image_url: url || null }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Açıklama</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  placeholder="Firma hakkında detaylı bilgi..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Adres</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  placeholder="Tam adres..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">Hizmetler</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {services.map((svc) => (
                    <label
                      key={svc.id}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                        selectedServices.includes(svc.id)
                          ? "border-[#0EA5E9] bg-[#0EA5E9]/5 text-[#0EA5E9]"
                          : "border-[#E2E8F0] text-[#0F172A]/70 hover:border-[#0EA5E9]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(svc.id)}
                        onChange={() => toggleService(svc.id)}
                        className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-3.5 h-3.5"
                      />
                      {svc.name}
                    </label>
                  ))}
                </div>
                {selectedServices.length === 0 && (
                  <p className="text-[10px] text-[#0F172A]/40 mt-2">En az bir hizmet seçin</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Yapay Puan (Rating)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Yapay Yorum Sayısı</label>
                  <input
                    type="number"
                    name="review_count"
                    value={formData.review_count}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap gap-6 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_premium"
                    checked={formData.is_premium}
                    onChange={handleInputChange}
                    className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Premium Üye</span>
                </label>

                {formData.is_premium && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F172A]/70 uppercase tracking-wide">Bitiş Tarihi:</span>
                    <input
                      type="date"
                      name="premium_until"
                      value={formData.premium_until || ""}
                      onChange={handleInputChange}
                      className="px-2 py-1 text-xs border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-4 h-4"
                  />
                  <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Aktif (Listelenir)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFirm(null);
                    setIsAdding(false);
                  }}
                  className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saveLoading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Firma adıyla ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E8F0] rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Firms Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-6 h-6 border-2 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E2E8F0]">
              <thead className="bg-[#F8FAFC]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Firma Adı</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Konum</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Statü</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Hesap Bağlantısı</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredFirms.length > 0 ? (
                  filteredFirms.map((firm) => {
                    const cityName = cities.find((c) => c.id === firm.city_id)?.name;
                    const districtName = districts.find((d) => d.id === firm.district_id)?.name;
                    return (
                      <tr key={firm.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-[#0F172A]">{firm.name}</p>
                          <p className="text-[10px] text-[#0F172A]/40 mt-0.5">/{firm.slug}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-[#0F172A]/70">
                            {[cityName, districtName].filter(Boolean).join(", ") || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-xs font-semibold text-[#0F172A]">{firm.phone || "-"}</p>
                          <p className="text-[10px] text-[#0F172A]/40">{firm.email || "-"}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-1.5 flex-wrap">
                            {firm.is_premium && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-150 inline-block w-fit">PREMIUM</span>
                                {firm.premium_until && (
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded w-fit ${new Date(firm.premium_until) < new Date() ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-100'}`}>
                                    {new Date(firm.premium_until) < new Date() ? 'SÜRESİ DOLDU: ' : 'BİTİŞ: '}
                                    {new Date(firm.premium_until).toLocaleDateString("tr-TR")}
                                  </span>
                                )}
                              </div>
                            )}
                            {firm.is_active ? (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">AKTİF</span>
                            ) : (
                              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-150">PASİF</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {firm.user_id ? (
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              Bağlı ({firm.user_id.substring(0, 6)}...)
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCreateAccount(firm)}
                              disabled={accountCreating === firm.id || !firm.email}
                              title={firm.email ? "Hesap oluştur ve şifreyi e-posta ile gönder" : "Önce firmaya e-posta ekleyin"}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded border border-emerald-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {accountCreating === firm.id ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                  Oluşturuluyor...
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                  </svg>
                                  Hesap Oluştur
                                </>
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-2">
                          <button
                            onClick={() => handleOpenEdit(firm)}
                            className="text-[#0EA5E9] hover:text-[#0284C7] font-bold cursor-pointer"
                          >
                            Duzenle
                          </button>
                          <button
                            onClick={() => openProductsModal(firm)}
                            className="text-violet-600 hover:text-violet-800 font-bold cursor-pointer"
                          >
                            Urunler
                          </button>
                          <button
                            onClick={() => handleDelete(firm.id)}
                            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-xs text-[#0F172A]/40 font-medium">
                      Firma bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Result Modal */}
      {accountResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-[#E2E8F0] bg-emerald-50 rounded-t-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-900">Hesap Oluşturuldu</h3>
                <p className="text-xs text-emerald-700 font-medium">Şifre e-posta ile gönderildi</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bu şifre yalnızca bir kez gösterilir. Lütfen not alın.
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">E-posta</p>
                <p className="text-sm font-bold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 font-mono">{accountResult.email}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1">Şifre</p>
                <div className="flex gap-2">
                  <p className="flex-1 text-sm font-bold text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 font-mono tracking-wider select-all">{accountResult.password}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(accountResult.password);
                      setSuccess("Şifre panoya kopyalandı.");
                    }}
                    className="px-3 py-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                  >
                    Kopyala
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setAccountResult(null)}
                className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account creation error toast */}
      {accountError && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {accountError}
          <button onClick={() => setAccountError("")} className="ml-2 text-white/70 hover:text-white cursor-pointer">×</button>
        </div>
      )}

      {/* Products Modal */}
      {productsFirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-3xl w-full my-8 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-wide">
                  Urunler: {productsFirm.name}
                </h3>
                <p className="text-[10px] text-[#0F172A]/40 font-semibold mt-0.5">{products.length} / 10 urun</p>
              </div>
              <button onClick={closeProductsModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {productError && (
                <div className="bg-red-50 border border-red-200 text-xs font-semibold text-red-800 p-3 rounded-lg">{productError}</div>
              )}

              {/* Product form (add/edit) */}
              {(productAdding || productEditing) && (
                <form onSubmit={handleProductSave} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                    {productAdding ? "Yeni Urun Ekle" : `Duzenle: ${productEditing?.name}`}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">Urun Adi *</label>
                      <input type="text" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">Fiyat (TL)</label>
                      <input type="number" step="0.01" min="0" value={pPrice} onChange={(e) => setPPrice(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]" />
                      <p className="text-[9px] text-[#0F172A]/40 mt-1">0 = Fiyat sorunuz</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">WhatsApp</label>
                      <input type="text" value={pWhatsapp} onChange={(e) => setPWhatsapp(e.target.value)} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">Aciklama</label>
                      <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={2} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] resize-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#0F172A] uppercase tracking-wider mb-1">Urun Gorseli *</label>
                    <ProductImageUploader currentUrl={pImage} onUpload={setPImage} firmName={productsFirm.name} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setProductAdding(false); setProductEditing(null); }} className="px-3 py-1.5 border border-[#E2E8F0] text-xs font-bold rounded-lg hover:bg-white transition-colors cursor-pointer">Iptal</button>
                    <button type="submit" disabled={productSaving} className="px-4 py-1.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer">
                      {productSaving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                  </div>
                </form>
              )}

              {/* Add button */}
              {products.length < 10 && !productAdding && !productEditing && (
                <button onClick={openProductAdd} className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  Urun Ekle
                </button>
              )}

              {/* Products list */}
              {productLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products.map((p) => (
                    <div key={p.id} className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
                      <div className="aspect-[4/3] bg-[#F8FAFC] relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        {Number(p.price) > 0 ? (
                          <span className="absolute top-2 right-2 bg-white/90 text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded">{Number(p.price).toLocaleString("tr-TR")} TL</span>
                        ) : (
                          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Fiyat Sorunuz</span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-[#0F172A] line-clamp-1">{p.name}</p>
                        {p.description && <p className="text-[10px] text-[#0F172A]/50 line-clamp-1">{p.description}</p>}
                        <div className="flex gap-2 pt-1.5 border-t border-[#E2E8F0]">
                          <button onClick={() => openProductEdit(p)} className="text-[10px] font-bold text-[#0EA5E9] hover:underline cursor-pointer">Duzenle</button>
                          <button onClick={() => handleProductDelete(p.id)} className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Sil</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !productAdding ? (
                <p className="text-center text-xs text-[#0F172A]/40 py-8">Henuz urun eklenmedi.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

