"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type UploadedB2BImage = { path: string; url: string };

export default function B2BImageUploader({ value, onChange, max = 8 }: { value: UploadedB2BImage[]; onChange: (images: UploadedB2BImage[]) => void; max?: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  const upload = async (files: File[]) => {
    const accepted = files.filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
    const available = accepted.slice(0, Math.max(0, max - value.length));
    if (!available.length) return setError(value.length >= max ? `En fazla ${max} görsel yükleyebilirsiniz.` : "JPG, PNG veya WebP görsel seçin.");
    setError("");
    setUploading(available.length);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) { setUploading(0); return setError("Oturum bulunamadı."); }

    const uploaded: UploadedB2BImage[] = [];
    for (const file of available) {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/b2b/product-image", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body });
      const result = await response.json() as { path?: string; url?: string; error?: string };
      if (!response.ok || !result.path || !result.url) setError(result.error ?? `${file.name} yüklenemedi.`);
      else uploaded.push({ path: result.path, url: result.url });
      setUploading((count) => Math.max(0, count - 1));
    }
    if (uploaded.length) onChange([...value, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const pick = (event: ChangeEvent<HTMLInputElement>) => upload(Array.from(event.target.files ?? []));
  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    upload(Array.from(event.dataTransfer.files));
  };
  const remove = async (image: UploadedB2BImage) => {
    onChange(value.filter((item) => item.path !== image.path));
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    await fetch("/api/b2b/product-image", { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ path: image.path }) });
  };

  return <div>
    <div
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)}
      onDrop={drop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-sky-50/60"}`}
    >
      <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">↥</div>
      <strong className="mt-3 block text-sm text-slate-800">Görselleri buraya sürükleyin</strong>
      <span className="mt-1 block text-xs font-medium text-slate-500">veya bilgisayardan seçin · JPG, PNG, WebP · en fazla 6 MB</span>
      <span className="mt-3 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-xs font-black text-white">{uploading ? `${uploading} görsel yükleniyor…` : "Görsel seç"}</span>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pick} className="sr-only" />
    </div>
    {error && <p role="alert" className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    {value.length > 0 && <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">{value.map((image, index) => <div key={image.path} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={image.url} alt={`Ürün görseli ${index + 1}`} className="h-full w-full object-cover" />{index === 0 && <span className="absolute left-2 top-2 rounded-md bg-slate-950/85 px-2 py-1 text-[9px] font-black text-white">KAPAK</span>}<button type="button" onClick={(event) => { event.stopPropagation(); remove(image); }} aria-label="Görseli kaldır" className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/95 text-sm font-black text-red-600 opacity-0 shadow transition group-hover:opacity-100">×</button></div>)}</div>}
  </div>;
}
