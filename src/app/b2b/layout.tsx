import type { Metadata } from "next";
import B2BHeader from "@/components/b2b/B2BHeader";
import B2BGlobalLayer from "@/components/b2b/B2BGlobalLayer";

export const metadata: Metadata = {
  title: "Su Arıtma Pro — Özel B2B Pazarı",
  description: "Doğrulanmış su arıtma esnafı ve toptancılarına özel ticaret alanı.",
  robots: { index: false, follow: false, nocache: true },
};

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="b2b-shell min-h-screen bg-[#F4F7FB] text-[#0F172A]">
      <B2BHeader />
      {children}
      <B2BGlobalLayer />
    </div>
  );
}
