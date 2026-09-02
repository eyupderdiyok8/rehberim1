"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import { supabase } from "@/lib/supabase";
import type { B2BMember } from "@/types/b2b";

function VerificationForm() {
  const [member, setMember] = useState<B2BMember | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: current } = await supabase
        .from("b2b_members")
        .select("user_id, account_type, verification_status, business_name, review_note")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (current) {
        setMember(current as B2BMember);
        setBusinessName(current.business_name ?? "");
      }
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!documentFile) return setError("Vergi levhası veya işletme belgesi seçmelisiniz.");
    if (documentFile.size > 10 * 1024 * 1024) return setError("Belge en fazla 10 MB olabilir.");

    setLoading(true);
    setError("");
    setSuccess("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setLoading(false);
      return setError("Oturum bulunamadı.");
    }

    const extension = documentFile.name.split(".").pop()?.toLowerCase() || "bin";
    const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("b2b-verification-documents")
      .upload(objectPath, documentFile, { upsert: false });

    if (uploadError) {
      setLoading(false);
      return setError("Belge yüklenemedi: " + uploadError.message);
    }

    const { error: profileError } = await supabase.rpc("submit_b2b_verification", {
      p_business_name: businessName,
      p_tax_number: taxNumber,
      p_tax_office: taxOffice,
      p_city: city,
      p_phone: phone,
    });

    if (profileError) {
      setLoading(false);
      return setError("Başvuru oluşturulamadı: " + profileError.message);
    }

    const { error: documentError } = await supabase.from("b2b_verification_documents").insert({
      user_id: user.id,
      document_type: "tax_certificate",
      object_path: objectPath,
      status: "pending",
    });

    setLoading(false);
    if (documentError) return setError("Belge kaydı oluşturulamadı: " + documentError.message);
    setMember({ user_id: user.id, account_type: "buyer", verification_status: "pending", business_name: businessName, review_note: null });
    setSuccess("Başvurunuz alındı. Belgeniz yalnızca yetkili yönetici tarafından incelenecek.");
  };

  const status = member?.verification_status;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-sky-600">Esnaf doğrulama</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Toptan fiyat erişimini açın</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600">Fiyatları yalnızca sektörde faaliyet gösteren işletmelere açıyoruz. Belgeniz herkese açık değildir ve toptancılarla paylaşılmaz.</p>
      </div>

      {status === "verified" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
          <h2 className="text-xl font-black text-emerald-900">✓ İşletmeniz doğrulandı</h2>
          <p className="mt-2 text-sm font-medium text-emerald-800">Tüm ürün fiyatlarını ve fiyat geçmişini görüntüleyebilirsiniz.</p>
          <Link href="/b2b" className="mt-5 inline-block rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white">Ürünlere dön</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {status === "pending" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Başvurunuz inceleniyor. Gerekirse bilgilerinizi güncelleyip yeniden gönderebilirsiniz.</div>}
          {status === "rejected" && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">Başvuru yeniden düzenlenmeli.{member?.review_note ? ` Yönetici notu: ${member.review_note}` : ""}</div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-600">İşletme unvanı<input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Vergi numarası<input required minLength={10} maxLength={11} inputMode="numeric" value={taxNumber} onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, ""))} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Vergi dairesi<input value={taxOffice} onChange={(e) => setTaxOffice(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-600">Şehir<input required value={city} onChange={(e) => setCity(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-600 sm:col-span-2">Telefon<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
          </div>
          <label className="block rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center cursor-pointer hover:border-sky-400">
            <span className="block text-sm font-black text-slate-800">Vergi levhası veya esnaf faaliyet belgesi</span>
            <span className="mt-1 block text-xs text-slate-500">PDF, JPG, PNG veya WebP · en fazla 10 MB</span>
            <input required type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} className="mt-4 block w-full text-sm text-slate-600" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {success && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-sky-600 px-5 py-3.5 text-sm font-black text-white hover:bg-sky-700 disabled:opacity-50">{loading ? "Belge güvenli şekilde yükleniyor…" : "Doğrulamaya gönder"}</button>
        </form>
      )}
    </main>
  );
}

export default function VerificationPage() {
  return <B2BAuthGate><VerificationForm /></B2BAuthGate>;
}
