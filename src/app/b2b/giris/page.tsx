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
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
      <section>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-sky-600">Sadece sektör profesyonelleri</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">WhatsApp kalabalığını geride bırakın.</h1>
        <p className="mt-5 max-w-lg text-base font-medium leading-7 text-slate-600">Toptancıları ve ürünleri tek yerde bulun. Doğrulama sonrasında güncel fiyatları, KDV bilgisini ve fiyat geçmişini güvenle inceleyin.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Gizli fiyatlar", "Doğrulanmış işletmeler", "Çift taraflı güven"].map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700">✓ {item}</div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Giriş yap</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Esnaf hesabı aç</button>
        </div>
        <h2 className="text-xl font-black text-slate-950">{mode === "login" ? "B2B hesabınıza giriş yapın" : "Ücretsiz hesap oluşturun"}</h2>
        <p className="mt-1 text-sm text-slate-500">Fiyat erişimi için kayıt sonrasında işletme belgesi gerekir.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">E-posta<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">Şifre<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-base font-medium normal-case tracking-normal outline-none focus:border-sky-500" /></label>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
          <button disabled={loading} className="w-full rounded-lg bg-sky-600 px-4 py-3.5 text-sm font-black text-white hover:bg-sky-700 disabled:opacity-50">{loading ? "İşleniyor…" : mode === "login" ? "Güvenli giriş" : "Hesabımı oluştur"}</button>
        </form>
      </section>
    </main>
  );
}

export default function B2BLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
