"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Application = {
  user_id: string;
  business_name: string | null;
  tax_number: string | null;
  tax_office: string | null;
  city: string | null;
  phone: string | null;
  verification_status: string;
  review_note: string | null;
  created_at: string;
};

type VerificationDocument = {
  id: string;
  user_id: string;
  document_type: string;
  object_path: string;
  status: string;
};

export default function B2BAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [wholesaler, setWholesaler] = useState({ ownerId: "", name: "", slug: "" });

  const load = async () => {
    setLoading(true);
    const [membersResult, documentsResult] = await Promise.all([
      supabase.from("b2b_members").select("user_id, business_name, tax_number, tax_office, city, phone, verification_status, review_note, created_at").eq("account_type", "buyer").order("created_at", { ascending: false }),
      supabase.from("b2b_verification_documents").select("id, user_id, document_type, object_path, status").order("created_at", { ascending: false }),
    ]);
    if (membersResult.error) setError(membersResult.error.message);
    setApplications((membersResult.data ?? []) as Application[]);
    setDocuments((documentsResult.data ?? []) as VerificationDocument[]);
    setLoading(false);
  };

  useEffect(() => {
    // Initial moderation data is loaded from Supabase after the client session exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const openDocument = async (document: VerificationDocument) => {
    const { data, error: signedError } = await supabase.storage.from("b2b-verification-documents").createSignedUrl(document.object_path, 300);
    if (signedError || !data?.signedUrl) return setError("Belge açılamadı: " + (signedError?.message ?? "Bilinmeyen hata"));
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const review = async (userId: string, status: "verified" | "rejected") => {
    const note = status === "rejected" ? window.prompt("Başvuru sahibine gösterilecek ret nedenini yazın:") : null;
    if (status === "rejected" && note === null) return;
    setBusyId(userId);
    const { error: reviewError } = await supabase.rpc("review_b2b_verification", { p_user_id: userId, p_status: status, p_note: note });
    setBusyId(null);
    if (reviewError) return setError("Başvuru güncellenemedi: " + reviewError.message);
    await load();
  };

  const createWholesaler = async (event: FormEvent) => {
    event.preventDefault();
    setBusyId("wholesaler");
    setError("");
    const { error: createError } = await supabase.rpc("create_b2b_wholesaler_account", {
      p_owner_id: wholesaler.ownerId.trim(),
      p_name: wholesaler.name.trim(),
      p_slug: wholesaler.slug.trim(),
    });
    setBusyId(null);
    if (createError) return setError("Toptancı hesabı oluşturulamadı: " + createError.message);
    setWholesaler({ ownerId: "", name: "", slug: "" });
  };

  if (loading) return <div className="py-20 text-center text-sm font-bold text-slate-500">Başvurular yükleniyor…</div>;

  return (
    <div className="space-y-7">
      <div><span className="text-xs font-black uppercase tracking-wider text-sky-600">B2B güven merkezi</span><h1 className="mt-2 text-2xl font-black text-slate-950">Esnaf doğrulama başvuruları</h1><p className="mt-2 text-sm font-medium text-slate-500">Vergi ve faaliyet belgelerini inceleyerek fiyat erişimini yönetin.</p></div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      <form onSubmit={createWholesaler} className="rounded-xl border border-sky-200 bg-sky-50 p-5"><div className="mb-4"><h2 className="text-base font-black text-sky-950">Toptancı mağazası aç</h2><p className="mt-1 text-xs font-medium text-sky-800">Kullanıcının kimliğini, mağaza adını ve bağlantı adresini girin. Profil sadece giriş yapanlara açılır.</p></div><div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]"><input required value={wholesaler.ownerId} onChange={(e)=>setWholesaler({...wholesaler,ownerId:e.target.value})} placeholder="Kullanıcı UUID" className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 text-sm" /><input required value={wholesaler.name} onChange={(e)=>setWholesaler({...wholesaler,name:e.target.value})} placeholder="Mağaza adı" className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 text-sm" /><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={wholesaler.slug} onChange={(e)=>setWholesaler({...wholesaler,slug:e.target.value.toLowerCase()})} placeholder="magaza-adresi" className="rounded-lg border border-sky-200 bg-white px-3 py-2.5 text-sm" /><button disabled={busyId==="wholesaler"} className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">Mağazayı aç</button></div></form>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {applications.length === 0 ? <div className="py-16 text-center text-sm font-semibold text-slate-500">Henüz B2B başvurusu bulunmuyor.</div> : <div className="divide-y divide-slate-100">{applications.map((application) => {
          const applicationDocuments = documents.filter((document) => document.user_id === application.user_id);
          return <article key={application.user_id} className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-base font-black text-slate-950">{application.business_name || "İsimsiz işletme"}</h2><span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${application.verification_status === "verified" ? "bg-emerald-50 text-emerald-700" : application.verification_status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{application.verification_status}</span></div><p className="mt-2 font-mono text-[10px] text-slate-400">{application.user_id}</p><dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2"><div><dt className="text-xs font-bold text-slate-400">Vergi numarası</dt><dd className="font-bold text-slate-800">{application.tax_number || "—"}</dd></div><div><dt className="text-xs font-bold text-slate-400">Vergi dairesi</dt><dd className="font-bold text-slate-800">{application.tax_office || "—"}</dd></div><div><dt className="text-xs font-bold text-slate-400">Şehir</dt><dd className="font-bold text-slate-800">{application.city || "—"}</dd></div><div><dt className="text-xs font-bold text-slate-400">Telefon</dt><dd className="font-bold text-slate-800">{application.phone || "—"}</dd></div></dl></div><div className="flex flex-wrap gap-2">{applicationDocuments.map((document) => <button key={document.id} onClick={() => openDocument(document)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Belgeyi aç</button>)}<button disabled={busyId === application.user_id} onClick={() => review(application.user_id, "verified")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50">Onayla</button><button disabled={busyId === application.user_id} onClick={() => review(application.user_id, "rejected")} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100 disabled:opacity-50">Reddet</button></div></div></article>;
        })}</div>}
      </div>
    </div>
  );
}
