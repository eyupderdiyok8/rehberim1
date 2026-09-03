"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function B2BFavoriteButton({ productId, initialFavorite, showLabel = false, onChange }: {
  productId: string;
  initialFavorite?: boolean;
  showLabel?: boolean;
  onChange?: (favorite: boolean) => void;
}) {
  const [favorite, setFavorite] = useState(initialFavorite ?? false);
  const [ready, setReady] = useState(initialFavorite !== undefined);
  const [busy, setBusy] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (initialFavorite !== undefined) return;
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return setReady(true);
      const { data, error } = await supabase.from("b2b_product_favorites").select("product_id").eq("user_id", userData.user.id).eq("product_id", productId).maybeSingle();
      if (!error) setFavorite(Boolean(data));
      setReady(true);
    };
    load();
  }, [initialFavorite, productId]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setNeedsSetup(false);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setBusy(false); return; }
    const next = !favorite;
    setFavorite(next);
    const result = next
      ? await supabase.from("b2b_product_favorites").insert({ user_id: userData.user.id, product_id: productId })
      : await supabase.from("b2b_product_favorites").delete().eq("user_id", userData.user.id).eq("product_id", productId);
    setBusy(false);
    if (result.error) {
      setFavorite(!next);
      setNeedsSetup(result.error.message.includes("b2b_product_favorites"));
      return;
    }
    onChange?.(next);
  };

  return <div className="relative">
    <button type="button" disabled={!ready || busy} onClick={toggle} aria-pressed={favorite} aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"} className={`flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black shadow-sm transition disabled:opacity-50 ${favorite ? "border-rose-200 bg-rose-50 text-rose-600" : "border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:text-rose-600"}`}><span className="text-lg leading-none">{favorite ? "♥" : "♡"}</span>{showLabel && <span>{favorite ? "Favorilerde" : "Favoriye ekle"}</span>}</button>
    {needsSetup && <Link href="/b2b/favoriler" className="absolute right-0 top-12 z-10 w-48 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[10px] font-bold leading-4 text-amber-800 shadow-lg">Favoriler kurulumu bekliyor.</Link>}
  </div>;
}
