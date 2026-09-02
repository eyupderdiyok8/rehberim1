"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next")?.startsWith("/b2b") ? searchParams.get("next")! : "/b2b";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "register") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/b2b/dogrulama` },
      });
      setLoading(false);
      if (signUpError) return setError(signUpError.message);
      if (!data.session) return setMessage("Hesabınız oluşturuldu. E-postanıza gelen doğrulama bağlantısını açın.");
      router.push("/b2b/dogrulama");
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) return setError("E-posta veya şifre hatalı.");
    router.push(nextPath);
    router.refresh();
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#07111f] px-4 py-10 text-white sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="pointer-events-none absolute -left-48 top-24 size-[32rem] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100vh-12rem)] max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Profesyonel ticaret ağı
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] sm:text-6xl">WhatsApp kalabalığı değil, <span className="text-sky-400">kontrollü ticaret.</span></h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-300">Doğrulanmış tedarikçileri karşılaştırın; minimum siparişi, KDV durumunu, fiyat değişimini ve teslimat koşullarını tek ekrandan yönetin.</p>

          <div className="mt-9 grid max-w-2xl grid-cols-3 divide-x divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]">
            {[["Kapalı", "Fiyat ağı"], ["Belge", "Doğrulama"], ["Çift yönlü", "İtibar"]].map(([value, label]) => (
              <div key={label} className="px-4 py-5 sm:px-6"><strong className="block text-lg font-black text-white sm:text-xl">{value}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span></div>
            ))}
          </div>

          <div className="mt-5 max-w-2xl rounded-2xl border border-white/10 bg-slate-950/45 p-3 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-2 flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500"><span>Pazar hareketleri</span><span className="text-emerald-400">● Canlı katalog</span></div>
            {[['RO membran & filtreler', 'Yeni teklif'], ['Pompa ve bağlantı ekipmanı', 'Stokta'], ['Servis sarf malzemeleri', 'Güncellendi']].map(([name, status], index) => (
              <div key={name} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[.04]">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-400/10 text-xs font-black text-sky-300">0{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-200">{name}</span>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">{status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-white/10 bg-white p-6 text-slate-950 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600">Su Arıtma Pro</p><p className="mt-1 text-sm font-bold text-slate-400">Güvenli işletme erişimi</p></div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">SA</span>
          </div>
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Giriş yap</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Esnaf hesabı aç</button>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">{mode === "login" ? "Ticaret ağına giriş yapın" : "Esnaf hesabınızı oluşturun"}</h2>
        <p className="mt-1 text-sm text-slate-500">Fiyat erişimi için kayıt sonrasında işletme belgesi gerekir.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">E-posta<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-medium normal-case tracking-normal outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" /></label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Şifre<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-medium normal-case tracking-normal outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:opacity-50">{loading ? "İşleniyor…" : mode === "login" ? "Güvenli giriş →" : "Hesabımı oluştur →"}</button>
        </form>
        <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Fiyatlar yalnızca onaylı işletmelere açılır</p>
      </section>
      </div>
    </main>
  );
}

export default function B2BLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
