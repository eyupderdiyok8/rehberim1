"use client";

import React, { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { supabase } from "@/lib/supabase";
import { turkishToSlug } from "@/lib/utils";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function sanitizeFileName(original: string): string {
  const ext = original.slice(original.lastIndexOf(".")).toLowerCase();
  const name = original.slice(0, original.lastIndexOf("."));
  return `${turkishToSlug(name)}${ext}`;
}

export default function TipTapEditor({ content, onChange, placeholder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [imgDialog, setImgDialog] = useState<{ src: string; alt: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder: placeholder || "Blog yazınızı buraya yazın…" }),
      CharacterCount,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[400px] px-6 py-5 focus:outline-none text-[#0F172A] text-sm leading-relaxed",
      },
    },
  });

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      try {
        const safeName = sanitizeFileName(file.name);
        const path = `posts/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage
          .from("blog-images")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
        setImgDialog({ src: urlData.publicUrl, alt: safeName.replace(/\.[^.]+$/, "").replace(/-/g, " ") });
      } catch (err) {
        alert("Görsel yüklenemedi: " + (err as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const confirmImage = () => {
    if (!editor || !imgDialog) return;
    editor.chain().focus().setImage({ src: imgDialog.src, alt: imgDialog.alt }).run();
    setImgDialog(null);
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("URL girin:", prev);
    if (url === null) return;
    if (!url) { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, title: string, onClick: () => void, children: React.ReactNode) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1.5 rounded text-xs font-semibold transition-all ${
        active
          ? "bg-[#0EA5E9] text-white"
          : "text-[#0F172A]/60 hover:bg-[#F1F5F9] hover:text-[#0F172A]"
      }`}
    >
      {children}
    </button>
  );

  const inTable = editor.isActive("table");

  return (
    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        {/* History */}
        {btn(false, "Geri Al", () => editor.chain().focus().undo().run(), "↩")}
        {btn(false, "İleri Al", () => editor.chain().focus().redo().run(), "↪")}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Headings */}
        {btn(editor.isActive("heading", { level: 2 }), "Başlık H2",
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "H2")}
        {btn(editor.isActive("heading", { level: 3 }), "Başlık H3",
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "H3")}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Marks */}
        {btn(editor.isActive("bold"), "Kalın", () => editor.chain().focus().toggleBold().run(),
          <strong>B</strong>)}
        {btn(editor.isActive("italic"), "İtalik", () => editor.chain().focus().toggleItalic().run(),
          <em>I</em>)}
        {btn(editor.isActive("underline"), "Altı Çizgili", () => editor.chain().focus().toggleUnderline().run(),
          <span className="underline">U</span>)}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Lists */}
        {btn(editor.isActive("bulletList"), "Madde İşaretli Liste",
          () => editor.chain().focus().toggleBulletList().run(), "• —")}
        {btn(editor.isActive("orderedList"), "Sıralı Liste",
          () => editor.chain().focus().toggleOrderedList().run(), "1.")}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Text align */}
        {btn(editor.isActive({ textAlign: "left" }), "Sola Hizala",
          () => editor.chain().focus().setTextAlign("left").run(), "⫷")}
        {btn(editor.isActive({ textAlign: "center" }), "Ortala",
          () => editor.chain().focus().setTextAlign("center").run(), "≡")}
        {btn(editor.isActive({ textAlign: "right" }), "Sağa Hizala",
          () => editor.chain().focus().setTextAlign("right").run(), "⫸")}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Quote & Code */}
        {btn(editor.isActive("blockquote"), "Alıntı",
          () => editor.chain().focus().toggleBlockquote().run(), "❝")}
        {btn(editor.isActive("code"), "Kod",
          () => editor.chain().focus().toggleCode().run(), "</>")}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Link */}
        {btn(editor.isActive("link"), "Bağlantı", setLink, "🔗")}

        {/* Image upload */}
        <button
          type="button"
          title="Görsel Ekle"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-2 py-1.5 rounded text-xs font-semibold text-[#0F172A]/60 hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all disabled:opacity-50"
        >
          {uploading ? "⏳" : "🖼"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
            e.target.value = "";
          }}
        />

        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />
        {/* HR */}
        {btn(false, "Yatay Çizgi",
          () => editor.chain().focus().setHorizontalRule().run(), "—")}

        {/* ── Tablo Araçları ── */}
        <div className="w-px h-5 bg-[#E2E8F0] mx-1" />

        {/* Tablo Ekle */}
        {btn(
          editor.isActive("table"),
          "Tablo Ekle (3×3)",
          () =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          <span className="flex items-center gap-0.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
            </svg>
            Tablo
          </span>
        )}

        {/* Tablo içindeyken: sütun / satır / sil araçları */}
        {inTable && (
          <>
            <div className="w-px h-5 bg-[#E2E8F0] mx-0.5" />
            {btn(false, "Sütun Ekle (sağ)", () => editor.chain().focus().addColumnAfter().run(),
              <span title="Sütun Ekle →">+↕</span>)}
            {btn(false, "Sütun Sil", () => editor.chain().focus().deleteColumn().run(),
              <span title="Sütun Sil" className="text-red-400">−↕</span>)}
            {btn(false, "Satır Ekle (alt)", () => editor.chain().focus().addRowAfter().run(),
              <span title="Satır Ekle ↓">+↔</span>)}
            {btn(false, "Satır Sil", () => editor.chain().focus().deleteRow().run(),
              <span title="Satır Sil" className="text-red-400">−↔</span>)}
            <div className="w-px h-5 bg-[#E2E8F0] mx-0.5" />
            {btn(false, "Hücreyi Birleştir", () => editor.chain().focus().mergeCells().run(), "⊞")}
            {btn(false, "Hücreyi Böl", () => editor.chain().focus().splitCell().run(), "⊟")}
            {btn(false, "Başlık Hücresi Geçiş", () => editor.chain().focus().toggleHeaderCell().run(), "Th")}
            <div className="w-px h-5 bg-[#E2E8F0] mx-0.5" />
            <button
              type="button"
              title="Tabloyu Sil"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-1.5 rounded text-xs font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              🗑 Tablo Sil
            </button>
          </>
        )}
      </div>

      {/* ── Tablo ipucu (tablo aktifken) ── */}
      {inTable && (
        <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <span className="text-[10px] text-amber-700 font-semibold">
            📋 Tablo seçili — satır/sütun ekle/sil araçları toolbar'da görünür
          </span>
        </div>
      )}

      {/* ── Editor Content ── */}
      <EditorContent editor={editor} />

      {/* ── Character Count ── */}
      <div className="px-6 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
        <span className="text-[10px] text-[#0F172A]/40 font-medium">
          {editor.storage.characterCount.characters()} karakter · {editor.storage.characterCount.words()} kelime
        </span>
        <span className="text-[10px] text-[#0F172A]/30">TipTap Editör</span>
      </div>

      {/* ── Alt Tag Dialog ── */}
      {imgDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-sm font-extrabold text-[#0F172A] mb-1">Görsel Alt Etiketi</h3>
            <p className="text-xs text-[#0F172A]/50 mb-4">
              SEO ve erişilebilirlik için görseli açıklayan bir metin girin.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgDialog.src} alt={imgDialog.alt} className="w-full h-40 object-cover rounded-lg mb-4 border border-[#E2E8F0]" />
            <input
              type="text"
              value={imgDialog.alt}
              onChange={(e) => setImgDialog({ ...imgDialog, alt: e.target.value })}
              placeholder="Örn: Su arıtma cihazı kurulumu 2026"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 mb-4"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmImage}
                className="flex-1 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-bold py-2 rounded-lg transition-colors"
              >
                Editöre Ekle
              </button>
              <button
                type="button"
                onClick={() => setImgDialog(null)}
                className="flex-1 border border-[#E2E8F0] text-[#0F172A]/60 text-xs font-bold py-2 rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

