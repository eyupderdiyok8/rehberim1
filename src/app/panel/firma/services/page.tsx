"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface FirmService {
  service_id: string;
  price_min: number | null;
  price_max: number | null;
  is_selected: boolean;
}

export default function FirmServices() {
  const [firmId, setFirmId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: FirmService }>({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: firmData, error: firmErr } = await supabase
        .from("firms")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (firmErr) throw firmErr;
      if (!firmData) return;

      setFirmId(firmData.id);

      // Fetch all system services
      const { data: allServices, error: svcErr } = await supabase
        .from("services")
        .select("*")
        .order("sort_order");

      if (svcErr) throw svcErr;
      setServices(allServices || []);

      // Fetch services this firm already offers
      const { data: offeredServices, error: offErr } = await supabase
        .from("firm_services")
        .select("*")
        .eq("firm_id", firmData.id);

      if (offErr) throw offErr;

      // Populate selected states
      const initialMap: { [key: string]: FirmService } = {};
      allServices?.forEach((s) => {
        const found = offeredServices?.find((os) => os.service_id === s.id);
        initialMap[s.id] = {
          service_id: s.id,
          price_min: found ? Number(found.price_min) : null,
          price_max: found ? Number(found.price_max) : null,
          is_selected: !!found,
        };
      });

      setSelectedServices(initialMap);
    } catch (err: any) {
      console.error(err);
      setError("Hizmet bilgileri yüklenemedi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (svcId: string) => {
    setSelectedServices((prev) => ({
      ...prev,
      [svcId]: {
        ...prev[svcId],
        is_selected: !prev[svcId].is_selected,
      },
    }));
  };

  const handlePriceChange = (svcId: string, field: "price_min" | "price_max", value: string) => {
    const numericValue = value === "" ? null : Number(value);
    setSelectedServices((prev) => ({
      ...prev,
      [svcId]: {
        ...prev[svcId],
        [field]: numericValue,
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmId) return;
    setSaveLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Fetch current db states
      const { data: currentDb } = await supabase
        .from("firm_services")
        .select("service_id")
        .eq("firm_id", firmId);

      const dbServiceIds = (currentDb || []).map((fs) => fs.service_id);

      // We process each selected/unselected service
      for (const serviceId of Object.keys(selectedServices)) {
        const state = selectedServices[serviceId];

        if (state.is_selected) {
          // If already in DB, update. Else, insert.
          if (dbServiceIds.includes(serviceId)) {
            const { error: updErr } = await supabase
              .from("firm_services")
              .update({
                price_min: state.price_min,
                price_max: state.price_max,
              })
              .match({ firm_id: firmId, service_id: serviceId });
            if (updErr) throw updErr;
          } else {
            const { error: insErr } = await supabase.from("firm_services").insert({
              firm_id: firmId,
              service_id: serviceId,
              price_min: state.price_min,
              price_max: state.price_max,
            });
            if (insErr) throw insErr;
          }
        } else {
          // If not selected but exists in DB, delete.
          if (dbServiceIds.includes(serviceId)) {
            const { error: delErr } = await supabase
              .from("firm_services")
              .delete()
              .match({ firm_id: firmId, service_id: serviceId });
            if (delErr) throw delErr;
          }
        }
      }

      setSuccess("Hizmetleriniz ve fiyatlarınız başarıyla güncellendi.");
      fetchData();
    } catch (err: any) {
      setError("Kaydetme hatası: " + err.message);
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
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Hizmet & Fiyat Yönetimi</h1>
        <p className="text-xs text-[#0F172A]/50 font-semibold mt-0.5 uppercase tracking-wider">Sunduğunuz Hizmetleri ve Fiyat Aralıklarını Belirleyin</p>
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

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-[#E2E8F0]">
            {services.map((svc) => {
              const state = selectedServices[svc.id] || {
                service_id: svc.id,
                price_min: null,
                price_max: null,
                is_selected: false,
              };

              return (
                <div key={svc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/20">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      id={`svc-${svc.id}`}
                      checked={state.is_selected}
                      onChange={() => handleToggle(svc.id)}
                      className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] w-4.5 h-4.5 mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-1">
                      <label htmlFor={`svc-${svc.id}`} className="text-sm font-bold text-[#0F172A] cursor-pointer">
                        {svc.name}
                      </label>
                      {svc.description && (
                        <p className="text-xs text-[#0F172A]/55 font-medium leading-relaxed">
                          {svc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Inputs */}
                  {state.is_selected && (
                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                      <div className="w-28">
                        <label className="block text-[9px] font-bold text-[#0F172A]/40 uppercase tracking-wide mb-1">Min. Fiyat (₺)</label>
                        <input
                          type="number"
                          placeholder="Fiyat girin"
                          value={state.price_min !== null ? state.price_min : ""}
                          onChange={(e) => handlePriceChange(svc.id, "price_min", e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-xs font-semibold focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                        />
                      </div>
                      <span className="text-slate-300 pt-5 text-sm">–</span>
                      <div className="w-28">
                        <label className="block text-[9px] font-bold text-[#0F172A]/40 uppercase tracking-wide mb-1">Max. Fiyat (₺)</label>
                        <input
                          type="number"
                          placeholder="Fiyat girin"
                          value={state.price_max !== null ? state.price_max : ""}
                          onChange={(e) => handlePriceChange(svc.id, "price_max", e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-xs font-semibold focus:outline-none focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0284C7] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {saveLoading ? "Güncelleniyor..." : "Hizmetleri ve Fiyatları Güncelle"}
          </button>
        </div>
      </form>
    </div>
  );
}

