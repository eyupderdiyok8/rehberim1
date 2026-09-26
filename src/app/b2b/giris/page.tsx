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
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
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
      if (signUpError) return setError(signUpError.message.includes("already registered") ? "Bu e-posta ile daha önce hesap açılmış. Giriş yapmayı deneyin." : signUpError.message);
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

  const resetPassword = async () => {
    if (!email) return setError("Şifre yenileme bağlantısı için önce e-posta adresinizi yazın.");
    setResetting(true);
    setError("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/b2b/giris` });
    setResetting(false);
    if (resetError) return setError("Şifre yenileme bağlantısı gönderilemedi. E-posta adresinizi kontrol edin.");
    setMessage("Şifre yenileme bağlantısı e-posta adresinize gönderildi.");
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#F4F7FB] px-4 py-10 text-slate-950 sm:py-16">
      <div className="relative mx-auto grid min-h-[calc(100vh-12rem)] max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <section className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-600 shadow-sm">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Profesyonel ticaret ağı
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl">WhatsApp kalabalığı değil, <span className="text-slate-500">kontrollü ticaret.</span></h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600">Doğrulanmış tedarikçileri karşılaştırın; minimum siparişi, KDV durumunu, fiyat değişimini ve teslimat koşullarını tek ekrandan yönetin.</p>

          <div className="mt-9 grid max-w-2xl grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {[["Kapalı", "Fiyat ağı"], ["Belge", "Doğrulama"], ["Çift yönlü", "İtibar"]].map(([value, label]) => (
              <div key={label} className="px-4 py-5 sm:px-6"><strong className="block text-lg font-black text-slate-950 sm:text-xl">{value}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span></div>
            ))}
          </div>

          <div className="mt-5 max-w-2xl rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500"><span>Pazar hareketleri</span><span className="inline-flex items-center gap-1.5 text-slate-600"><i className="size-1.5 rounded-full bg-emerald-500" />Canlı katalog</span></div>
            {[['RO membran & filtreler', 'Yeni teklif'], ['Pompa ve bağlantı ekipmanı', 'Stokta'], ['Servis sarf malzemeleri', 'Güncellendi']].map(([name, status], index) => (
              <div key={name} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">0{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{name}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">{status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-xl shadow-slate-200/60 sm:p-8 lg:order-2 lg:sticky lg:top-28">
          <div className="mb-7 flex items-center justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Su Arıtma Pro</p><p className="mt-1 text-sm font-bold text-slate-400">Güvenli işletme erişimi</p></div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#07111F] text-xs font-black text-white">SA</span>
          </div>
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Giriş yap</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Esnaf hesabı aç</button>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">{mode === "login" ? "Ticaret ağına giriş yapın" : "Esnaf hesabınızı oluşturun"}</h2>
        <p className="mt-1 text-sm text-slate-500">Fiyat erişimi için kayıt sonrasında işletme belgesi gerekir.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">E-posta<input required autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@firma.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-medium normal-case tracking-normal outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white" /></label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Şifre<div className="relative mt-2"><input required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "login" ? "Şifrenizi girin" : "En az 8 karakter"} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-base font-medium normal-case tracking-normal outline-none transition placeholder:text-slate-300 focus:border-slate-400 focus:bg-white" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:text-slate-900">{showPassword ? "Gizle" : "Göster"}</button></div></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-black text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50">{loading ? "İşleniyor…" : mode === "login" ? "Güvenli giriş" : "Hesabımı oluştur"}</button>
        </form>
        {mode === "login" && <button type="button" disabled={resetting} onClick={resetPassword} className="mt-4 w-full text-center text-xs font-bold text-slate-500 hover:text-slate-900 disabled:opacity-50">{resetting ? "Bağlantı gönderiliyor…" : "Şifremi unuttum"}</button>}
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-slate-500"><path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" /></svg> Fiyatlar yalnızca onaylı işletmelere açılır</div>
      </section>
      </div>
    </main>
  );
}

export default function B2BLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
