"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocode";
import LogoUploader from "@/components/LogoUploader";
import CoverUploader from "@/components/CoverUploader";

interface Firm {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  google_maps_url: string | null;
  is_premium: boolean;
  latitude: number | null;
  longitude: number | null;
}

export default function FirmProfile() {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Firm>>({
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    address: "",
    description: "",
    logo_url: "",
    cover_image_url: "",
    google_maps_url: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchFirmData();
  }, []);

  const fetchFirmData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: firmData, error: firmErr } = await supabase
        .from("firms")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (firmErr) throw firmErr;
      if (firmData) {
        setFirm(firmData);
        setFormData({
          name: firmData.name || "",
          phone: firmData.phone || "",
          whatsapp: firmData.whatsapp || "",
          email: firmData.email || "",
          website: firmData.website || "",
          address: firmData.address || "",
          description: firmData.description || "",
          logo_url: firmData.logo_url || "",
          cover_image_url: firmData.cover_image_url || "",
          google_maps_url: firmData.google_maps_url || "",
        });
      }
    } catch (err: any) {
      console.error(err);
      setError("Profil bilgileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firm) return;
    setSaveLoading(true);
    setError("");
    setSuccess("");

    const cleanData = {
      name: formData.name,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      website: formData.website || null,
      address: formData.address || null,
      description: formData.description || null,
      logo_url: formData.logo_url || null,
      cover_image_url: formData.cover_image_url || null,
      google_maps_url: formData.google_maps_url || null,
    };

    try {
      // Auto-geocode from address if it has changed
      let geoUpdate: { latitude?: number; longitude?: number } = {};
      if (
        formData.address &&
        (formData.address !== firm.address || firm.latitude === null || firm.longitude === null)
      ) {
        const coords = await geocodeAddress({ address: formData.address });
        if (coords) {
          geoUpdate = { latitude: coords.latitude, longitude: coords.longitude };
        }
      }

      const { error: updErr } = await supabase
        .from("firms")
        .update({ ...cleanData, ...geoUpdate })
        .eq("id", firm.id);

      if (updErr) throw updErr;
      setSuccess("Profil bilgileriniz başarıyla güncellendi.");
      fetchFirmData();
    } catch (err: any) {
      setError("Güncelleme hatası: " + err.message);
    } finally {
      setSaveLoading(false);
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
    <div className="space-y-8 max-w-2xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Profil Bilgileri</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Müşterilerinizin Göreceği Profil Bilgilerini Düzenleyin</p>
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

      {/* Profile Form Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Firma Adı</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A]/40 uppercase tracking-wider mb-1.5">Slug (URL - Değiştirilemez)</label>
              <input
                type="text"
                disabled
                value={firm?.slug || ""}
                className="w-full px-3 py-2 border border-[#E2E8F0] bg-[#F8FAFC] text-slate-500 rounded-lg text-sm focus:outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Telefon Numarası</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="Örn: 0555 123 45 67"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">WhatsApp Numarası</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp || ""}
                onChange={handleInputChange}
                placeholder="Örn: 905551234567"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
              <p className="text-[10px] text-slate-400 mt-1">Ülke kodu dahil, boşluksuz yazın.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">E-Posta Adresi</label>
              <input
                type="email"
                value={formData.email || ""}
                readOnly
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-[#F8FAFC] text-[#0F172A]/50 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">E-posta değişikliği için yönetici ile iletişime geçin.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Web Sitesi</label>
              <input
                type="text"
                name="website"
                value={formData.website || ""}
                onChange={handleInputChange}
                placeholder="Örn: https://www.firmam.com"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
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

          {firm?.is_premium && (
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Kapak Görseli (Premium Özel) <span className="text-[#0EA5E9] font-normal lowercase">(Önerilen: 1200x400 px - Yatay)</span>
              </label>
              <CoverUploader
                currentUrl={formData.cover_image_url}
                firmName={formData.name}
                onUpload={(url) => setFormData((prev) => ({ ...prev, cover_image_url: url || null }))}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Firma Hakkında Kısa Açıklama</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description || ""}
              onChange={handleInputChange}
              placeholder="Firmanızın sunduğu hizmetleri, tecrübenizi ve müşteri odaklı vizyonunuzu anlatın..."
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">Firma Adresi</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address || ""}
              onChange={handleInputChange}
              placeholder="Müşterilerin fiziki olarak sizi ziyaret edebilmesi için açık adres yazın..."
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9] leading-relaxed"
            />
            {firm?.is_premium && (
              <p className="text-[10px] text-slate-400 mt-1">
                Adresi kaydettiğinizde konumunuz ücretsiz OpenStreetMap üzerinde otomatik oluşturulur; Google Maps API anahtarı gerekmez.
              </p>
            )}
          </div>

          {firm?.is_premium && (
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Google Haritalar Bağlantısı (İsteğe Bağlı)
              </label>
              <input
                type="text"
                name="google_maps_url"
                value={formData.google_maps_url || ""}
                onChange={handleInputChange}
                placeholder="https://maps.app.goo.gl/... veya Google Maps embed linki"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Adresinizden otomatik konum oluşturulur. Google Maps'teki mevcut işletme sayfanıza da bağlantı vermek isterseniz buraya ekleyin.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {saveLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

