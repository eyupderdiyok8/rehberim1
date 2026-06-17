"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import BannerUploader from "@/components/BannerUploader";

interface City {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  placement: string;
  city_id: string | null;
  service_id: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  // Modal / Form state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Banner>>({
    title: "",
    image_url: "",
    target_url: "",
    placement: "firms_list_top",
    city_id: "",
    service_id: "",
    is_active: true,
    starts_at: "",
    ends_at: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: bannersData, error: bannersErr } = await supabase
        .from("banners")
        .select("*")
        .order("title");

      if (bannersErr) throw bannersErr;
      setBanners(bannersData || []);

      const { data: citiesData } = await supabase.from("cities").select("id, name").order("name");
      setCities(citiesData || []);

      const { data: servicesData } = await supabase.from("services").select("id, name").order("name");
      setServices(servicesData || []);
    } catch (err: any) {
      console.error(err);
      setError("Veriler yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsAdding(false);
    setFormData({
      ...banner,
      city_id: banner.city_id || "",
      service_id: banner.service_id || "",
      starts_at: banner.starts_at ? banner.starts_at.substring(0, 16) : "",
      ends_at: banner.ends_at ? banner.ends_at.substring(0, 16) : "",
    });
    setError("");
    setSuccess("");
  };

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingBanner(null);
    setFormData({
      title: "",
      image_url: "",
      target_url: "",
      placement: "firms_list_top",
      city_id: "",
      service_id: "",
      is_active: true,
      starts_at: new Date().toISOString().substring(0, 16),
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16), // 30 days later
    });
    setError("");
    setSuccess("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError("");
    setSuccess("");

    const cleanData = {
      title: formData.title,
      image_url: formData.image_url,
      target_url: formData.target_url,
      placement: formData.placement,
      city_id: formData.city_id || null,
      service_id: formData.service_id || null,
      is_active: formData.is_active ?? true,
      starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
      ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
    };

    try {
      if (isAdding) {
        const { error: insErr } = await supabase.from("banners").insert(cleanData);
        if (insErr) throw insErr;
        setSuccess("Banner başarıyla oluşturuldu.");
        setIsAdding(false);
      } else if (editingBanner) {
        const { error: updErr } = await supabase
          .from("banners")
          .update(cleanData)
          .eq("id", editingBanner.id);
        if (updErr) throw updErr;
        setSuccess("Banner başarıyla güncellendi.");
        setEditingBanner(null);
      }
      fetchData();
    } catch (err: any) {
      setError("Kaydetme hatası: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bannerı silmek istediğinize emin misiniz?")) return;
    setError("");
    setSuccess("");
    try {
      const { error: delErr } = await supabase.from("banners").delete().eq("id", id);
      if (delErr) throw delErr;
      setSuccess("Banner başarıyla silindi.");
      fetchData();
    } catch (err: any) {
      setError("Silme hatası: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Reklam Bannerları</h1>
          <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Reklam Alanları ve Hedefleme Kuralları</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 self-start px-4 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold rounded-lg shadow-sm shadow-sky-500/10 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Yeni Banner Ekle
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

      {/* Editor Modal Overlay */}
      {(editingBanner || isAdding) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xl max-w-xl w-full my-8 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#0F172A] uppercase tracking-wide">
                {isAdding ? "Yeni Banner Oluştur" : `Düzenle: ${editingBanner?.title}`}
              </h3>
              <button
                onClick={() => {
                  setEditingBanner(null);
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
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Banner Başlığı / Sponsor Adı</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title || ""}
                  onChange={handleInputChange}
                  placeholder="Örn: Toptan Su Filtresi Tedariği"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Görsel (Yükleme veya URL)</label>
                <BannerUploader
                  currentUrl={formData.image_url || null}
                  onUpload={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                />
                <div className="mt-3">
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url || ""}
                    onChange={handleInputChange}
                    placeholder="veya harici bir görsel URL'si yapıştırın: https://..."
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Hedef Yönlendirme Linki (Website veya WhatsApp)</label>
                <input
                  type="text"
                  name="target_url"
                  required
                  value={formData.target_url || ""}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Yerleşim Alanı</label>
                  <select
                    name="placement"
                    value={formData.placement || "firms_list_top"}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  >
                    <option value="homepage_top">Ana Sayfa - Üst Kısım</option>
                    <option value="homepage_bottom">Ana Sayfa - Alt Kısım</option>
                    <option value="firms_list_top">Firma Listeleri - Üst Kısım</option>
                    <option value="firms_list_mid">Firma Listeleri - Orta Kısım</option>
                    <option value="price_sidebar">Fiyat Sayfaları - Yan Menü (Sidebar)</option>
                    <option value="blog_post_bottom">Blog Yazısı - Alt Kısım</option>
                    <option value="blog_sidebar">Blog Listesi - Yan Menü</option>
                    <option value="firm_profile_sidebar">Firma Profili - Yan Menü</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Hedef Şehir (Boş bırakılırsa hepsi)</label>
                  <select
                    name="city_id"
                    value={formData.city_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  >
                    <option value="">Tüm Şehirler</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Hedef Hizmet (Boş bırakılırsa hepsi)</label>
                  <select
                    name="service_id"
                    value={formData.service_id || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  >
                    <option value="">Tüm Hizmetler</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer mt-7">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active || false}
                      onChange={handleInputChange}
                      className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-4 h-4"
                    />
                    <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">Aktif Reklam</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Başlangıç Tarihi</label>
                  <input
                    type="datetime-local"
                    name="starts_at"
                    value={formData.starts_at || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Bitiş Tarihi</label>
                  <input
                    type="datetime-local"
                    name="ends_at"
                    value={formData.ends_at || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(null);
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

      {/* Banners Table Card */}
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
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Reklam Başlığı</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Yerleşim</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Hedefleme</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Geçerlilik Tarihi</th>
                  <th className="px-6 py-3 text-left text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold text-[#0F172A]/40 uppercase tracking-wider">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {banners.length > 0 ? (
                  banners.map((banner) => {
                    const cityName = cities.find((c) => c.id === banner.city_id)?.name || "Tüm Şehirler";
                    const serviceName = services.find((s) => s.id === banner.service_id)?.name || "Tüm Hizmetler";
                    return (
                      <tr key={banner.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-[#0F172A]">{banner.title}</p>
                          <a
                            href={banner.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#0EA5E9] hover:underline block mt-0.5"
                          >
                            Link İncele →
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {banner.placement === "homepage_top"
                              ? "Ana Sayfa Üst"
                              : banner.placement === "homepage_bottom"
                              ? "Ana Sayfa Alt"
                              : banner.placement === "firms_list_top"
                              ? "Liste Üstü"
                              : banner.placement === "firms_list_mid"
                              ? "Liste Ortası"
                              : banner.placement === "price_sidebar"
                              ? "Fiyat Sidebar"
                              : banner.placement === "blog_post_bottom"
                              ? "Blog Alt"
                              : banner.placement === "blog_sidebar"
                              ? "Blog Yan Menü"
                              : "Firma Profil Yan Menü"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[#0F172A]/70">
                          <p>Şehir: {cityName}</p>
                          <p className="text-[10px] text-[#0F172A]/40">Hizmet: {serviceName}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-[#0F172A]/70 font-medium">
                          <p>Başlangıç: {banner.starts_at ? new Date(banner.starts_at).toLocaleDateString("tr-TR") : "Belirtilmedi"}</p>
                          <p className="text-[10px] text-[#0F172A]/40">Bitiş: {banner.ends_at ? new Date(banner.ends_at).toLocaleDateString("tr-TR") : "Belirtilmedi"}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {banner.is_active ? (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">AKTİF</span>
                          ) : (
                            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-150">PASİF</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-2">
                          <button
                            onClick={() => handleOpenEdit(banner)}
                            className="text-[#0EA5E9] hover:text-[#0284C7] font-bold cursor-pointer"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
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
                      Kayıtlı reklam bannerı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

