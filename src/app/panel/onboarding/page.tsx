"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { geocodeAddress } from "@/lib/geocode";
import LogoUploader from "@/components/LogoUploader";
import CoverUploader from "@/components/CoverUploader";

export default function OnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [firmId, setFirmId] = useState<string | null>(null);
  const [firmName, setFirmName] = useState("");
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Form State
  const [cityId, setCityId] = useState<string>("");
  const [districtId, setDistrictId] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/panel/login");
        return;
      }

      // Load firm — create if doesn't exist yet
      let { data: firm } = await supabase
        .from("firms")
        .select("id, name, city_id, district_id, phone, whatsapp, address, description, logo_url, cover_image_url")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      // If no firm exists, create one from localStorage (set by firma-ekle page)
      if (!firm) {
        const pendingName = typeof window !== "undefined" ? localStorage.getItem("pending_firm_name") : null;
        const pendingSlug = typeof window !== "undefined" ? localStorage.getItem("pending_firm_slug") : null;
        
        const firmName = pendingName || session.user.email?.split("@")[0] || "Yeni Firma";
        let firmSlug = pendingSlug || firmName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
        
        // Check slug uniqueness
        const { data: existingSlug } = await supabase.from("firms").select("id").eq("slug", firmSlug).maybeSingle();
        if (existingSlug) {
          firmSlug = `${firmSlug}-${Math.floor(100 + Math.random() * 900)}`;
        }

        const { data: newFirm, error: createErr } = await supabase
          .from("firms")
          .insert({
            name: firmName,
            slug: firmSlug,
            email: session.user.email,
            user_id: session.user.id,
            is_active: false,
            is_verified: false,
            is_premium: false,
            rating: 5.0,
            review_count: 0,
          })
          .select("id, name")
          .single();

        if (createErr) {
          console.error("Firma oluşturulamadı:", createErr);
          throw createErr;
        }

        // Clean up localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("pending_firm_name");
          localStorage.removeItem("pending_firm_slug");
        }

        firm = { ...newFirm, city_id: null, district_id: null, phone: null, whatsapp: null, address: null, description: null, logo_url: null, cover_image_url: null } as any;
      }

      if (firm) {
        setFirmId(firm.id);
        if (firm.name) setFirmName(firm.name);
        if (firm.city_id) setCityId(firm.city_id);
        if (firm.district_id) setDistrictId(firm.district_id);
        if (firm.phone) setPhone(firm.phone);
        if (firm.whatsapp) setWhatsapp(firm.whatsapp);
        if (firm.address) setAddress(firm.address);
        if (firm.description) setDescription(firm.description);
        if (firm.logo_url) setLogoUrl(firm.logo_url);
        if (firm.cover_image_url) setCoverUrl(firm.cover_image_url);

        // Load existing firm services
        const { data: fs } = await supabase.from("firm_services").select("service_id").eq("firm_id", firm.id);
        if (fs) {
          setSelectedServices(fs.map(f => f.service_id));
        }
      }

      // Load dictionaries
      const { data: citiesData } = await supabase.from("cities").select("*").order("name");
      const { data: districtsData } = await supabase.from("districts").select("*").order("name");
      const { data: servicesData } = await supabase.from("services").select("*").order("name");
      
      if (citiesData) setCities(citiesData);
      if (districtsData) setDistricts(districtsData);
      if (servicesData) setServices(servicesData);

      setLoading(false);
    }
    loadData();
  }, [router]);

  const filteredDistricts = districts.filter((d: any) => d.city_id === cityId);
  const selectedCityObj = cities.find((c: any) => c.id === cityId);
  const cityHasDistricts = selectedCityObj?.has_districts ?? false;

  const handleNext = async () => {
    if (!firmId) return;
    setError("");
    setSaving(true);

    try {
      if (step === 1) {
        if (!cityId || !phone) {
          throw new Error("Lütfen zorunlu alanları doldurun.");
        }
        if (cityHasDistricts && !districtId) {
          throw new Error("Lütfen ilçe seçin.");
        }
        // Auto-geocode the firm location from address/city/district
        const selCity = cities.find((c: any) => c.id === cityId);
        const selDistrict = filteredDistricts.find((d: any) => d.id === districtId);
        
        const coords = await geocodeAddress({
          address,
          districtName: selDistrict?.name,
          cityName: selCity?.name,
        });

        await supabase.from("firms").update({
          city_id: cityId,
          district_id: districtId || null,
          phone,
          whatsapp,
          address,
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
        }).eq("id", firmId);
        setStep(2);
      } 
      else if (step === 2) {
        if (selectedServices.length === 0) {
          throw new Error("En az bir hizmet seçmelisiniz.");
        }
        // Save services
        await supabase.from("firm_services").delete().eq("firm_id", firmId);
        const inserts = selectedServices.map(sid => ({
          firm_id: firmId,
          service_id: sid
        }));
        await supabase.from("firm_services").insert(inserts);
        setStep(3);
      }
      else if (step === 3) {
        await supabase.from("firms").update({
          description,
          logo_url: logoUrl,
          cover_image_url: coverUrl
        }).eq("id", firmId);
        setStep(4);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = () => {
    router.push("/panel/firma");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[#E2E8F0]">
            <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#0EA5E9] transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-[10px] font-extrabold uppercase text-[#0F172A]/50 tracking-wider">
            <span className={step >= 1 ? "text-[#0EA5E9]" : ""}>1. İletişim</span>
            <span className={step >= 2 ? "text-[#0EA5E9]" : ""}>2. Hizmetler</span>
            <span className={step >= 3 ? "text-[#0EA5E9]" : ""}>3. Profil</span>
            <span className={step >= 4 ? "text-[#0EA5E9]" : ""}>4. Tamamla</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] shadow-xl shadow-slate-200/50 rounded-2xl p-6 md:p-10">
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 text-xs font-bold p-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] mb-1">İletişim ve Konum</h2>
                <p className="text-xs text-[#0F172A]/60 font-medium">Müşterilerin size ulaşabilmesi için bilgilerinizi eksiksiz girin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Şehir *</label>
                  <select value={cityId} onChange={e => { setCityId(e.target.value); setDistrictId(""); }} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] outline-none">
                    <option value="">Şehir Seçin</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">
                    İlçe {cityHasDistricts ? "*" : "(Opsiyonel)"}
                  </label>
                  {filteredDistricts.length > 0 ? (
                    <select value={districtId} onChange={e => setDistrictId(e.target.value)} className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] outline-none">
                      <option value="">İlçe Seçin</option>
                      {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : cityId ? (
                    <div className="w-full px-4 py-3 bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl text-sm font-medium text-[#0F172A]/40">
                      Bu şehir için ilçe listesi henüz eklenmedi. Boş bırakabilirsiniz.
                    </div>
                  ) : (
                    <select value="" disabled className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold outline-none disabled:opacity-50">
                      <option value="">Önce şehir seçin</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Telefon *</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XX XXX XX XX" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">WhatsApp (Opsiyonel)</label>
                  <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="05XX XXX XX XX" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Açık Adres (Opsiyonel)</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Mahalle, Sokak, No..." className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] outline-none resize-none" />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] mb-1">Verdiğiniz Hizmetler</h2>
                <p className="text-xs text-[#0F172A]/60 font-medium">Hangi konularda hizmet verdiğinizi seçin. Birden fazla seçebilirsiniz.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map(srv => {
                  const isSelected = selectedServices.includes(srv.id);
                  return (
                    <div 
                      key={srv.id} 
                      onClick={() => {
                        if (isSelected) setSelectedServices(selectedServices.filter(id => id !== srv.id));
                        else setSelectedServices([...selectedServices, srv.id]);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isSelected ? 'border-[#0EA5E9] bg-[#F0F9FF]' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#0EA5E9] border-[#0EA5E9]' : 'border-[#94A3B8] bg-white'}`}>
                        {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? 'text-[#0EA5E9]' : 'text-[#0F172A]/70'}`}>{srv.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-[#0F172A] mb-1">Profil Detayları</h2>
                <p className="text-xs text-[#0F172A]/60 font-medium">Markanızı öne çıkaracak görseller ve açıklama ekleyin.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Logo (Opsiyonel)</label>
                  <LogoUploader currentUrl={logoUrl} onUpload={setLogoUrl} firmName={firmName} />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Kapak Fotoğrafı (Opsiyonel)</label>
                  <CoverUploader currentUrl={coverUrl} onUpload={setCoverUrl} firmName={firmName} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">Firma Açıklaması (Opsiyonel)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Kuruluşunuz, vizyonunuz, neden sizi seçmeliler?" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#0EA5E9]/50 focus:border-[#0EA5E9] outline-none resize-none" />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-black text-[#0F172A] mb-3">Tebrikler!</h2>
              <p className="text-sm text-[#0F172A]/70 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
                Profiliniz başarıyla oluşturuldu ve onay sürecine alındı. Onaylandıktan sonra ziyaretçiler sizi rehberde bulabilecek.
              </p>
              <button
                onClick={handleFinish}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all"
              >
                Yönetim Paneline Git
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors"
                >
                  Geri
                </button>
              ) : (
                <div />
              )}
              
              <button
                onClick={handleNext}
                disabled={saving}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {saving ? "Kaydediliyor..." : step === 3 ? "Tamamla" : "Devam Et"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
