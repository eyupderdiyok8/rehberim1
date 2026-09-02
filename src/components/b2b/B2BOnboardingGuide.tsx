"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type GuideStep = { label: string; detail: string; href: string; complete: boolean };

export default function B2BOnboardingGuide() {
  const pathname = usePathname();
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [hidden, setHidden] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (pathname === "/b2b/giris") return;
    let active = true;
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !active) return;
      const dismissed = window.localStorage.getItem(`b2b-guide-${userData.user.id}`) === "hidden";
      const { data: member } = await supabase.from("b2b_members").select("account_type, verification_status, business_name").eq("user_id", userData.user.id).maybeSingle();
      if (!member || !active) return;
      const { data: conversations } = await supabase.rpc("list_b2b_conversations");
      const hasConversation = (conversations ?? []).length > 0;
      let nextSteps: GuideStep[];
      if (member.account_type === "wholesaler" || member.account_type === "admin") {
        const { data: store } = await supabase.from("b2b_wholesalers").select("id, description, logo_url, cover_url, city").eq("owner_id", userData.user.id).maybeSingle();
        let productCount = 0;
        if (store?.id) {
          const { count } = await supabase.from("b2b_products").select("id", { count: "exact", head: true }).eq("wholesaler_id", store.id);
          productCount = count ?? 0;
        }
        const profileComplete = Boolean(store?.description && store?.logo_url && store?.cover_url && store?.city);
        nextSteps = [
          { label: "İşletme hesabını tamamla", detail: "Hesabınız güvenli ticaret ağına hazır olsun.", href: "/b2b/dogrulama", complete: member.verification_status === "verified" },
          { label: "Mağazanı vitrinde hazırla", detail: "Logo, kapak, şehir ve tanıtım metnini ekleyin.", href: "/b2b/toptanci-paneli?bolum=store", complete: profileComplete },
          { label: "İlk ürününü yayınla", detail: "Görsel, fiyat, stok ve minimum sipariş bilgisini girin.", href: "/b2b/toptanci-paneli?bolum=products", complete: productCount > 0 },
          { label: "İlk görüşmeni yönet", detail: "Esnaftan gelen mesaj ve talepleri tek ekrandan yanıtlayın.", href: "/b2b/mesajlar", complete: hasConversation },
        ];
      } else {
        nextSteps = [
          { label: "İşletme bilgilerini ekle", detail: "İşletme unvanınızı ve iletişim bilgilerinizi tamamlayın.", href: "/b2b/dogrulama", complete: Boolean(member.business_name) },
          { label: "Esnaf hesabını doğrula", detail: "Belgeniz onaylandığında özel fiyatlar açılır.", href: "/b2b/dogrulama", complete: member.verification_status === "verified" },
          { label: "Ürün ve tedarikçi keşfet", detail: "Kategori, marka ve stok durumuna göre arama yapın.", href: "/b2b", complete: member.verification_status === "verified" },
          { label: "İlk ticaret görüşmeni başlat", detail: "Ürün sayfasından miktar seçip satıcıya mesaj gönderin.", href: "/b2b", complete: hasConversation },
        ];
      }
      if (!active) return;
      setSteps(nextSteps);
      setHidden(dismissed || nextSteps.every((step) => step.complete));
    };
    load();
    return () => { active = false; };
  }, [pathname]);

  if (hidden || !steps.length) return null;
  const completeCount = steps.filter((step) => step.complete).length;
  const nextStep = steps.find((step) => !step.complete);

  const dismiss = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) window.localStorage.setItem(`b2b-guide-${data.user.id}`, "hidden");
    setHidden(true);
  };

  return <aside className="border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-violet-50">
    <div className="mx-auto max-w-7xl px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex min-w-0 flex-1 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-black text-sky-300">{completeCount}/{steps.length}</span><div className="min-w-0"><strong className="block text-sm font-black text-slate-950">Başlangıç rehberiniz</strong><p className="truncate text-xs font-medium text-slate-500">Sıradaki: {nextStep?.label}</p></div></div><div className="flex gap-2">{nextStep && <Link href={nextStep.href} className="rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-black text-white">Devam et →</Link>}<button onClick={() => setExpanded((value) => !value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700">{expanded ? "Daralt" : "Tüm adımlar"}</button><button onClick={dismiss} aria-label="Rehberi gizle" className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-white">×</button></div></div>
      {expanded && <div className="mt-4 grid gap-3 border-t border-sky-100 pt-4 md:grid-cols-4">{steps.map((step, index) => <Link key={step.label} href={step.href} className={`rounded-xl border p-4 transition ${step.complete ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-white hover:border-sky-300"}`}><span className={`grid size-6 place-items-center rounded-full text-[10px] font-black ${step.complete ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600"}`}>{step.complete ? "✓" : index + 1}</span><strong className="mt-3 block text-xs font-black text-slate-900">{step.label}</strong><p className="mt-1 text-[11px] font-medium leading-5 text-slate-500">{step.detail}</p></Link>)}</div>}
    </div>
  </aside>;
}
