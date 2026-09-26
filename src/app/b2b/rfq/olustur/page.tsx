import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BRfqCreate from "@/components/b2b/B2BRfqCreate";

export const metadata = {
  title: "Satın Alma İlanı Aç | Su Arıtma Pro B2B",
  description: "B2B pazarında satın alma ilanı oluştur, tedarikçilerden teklif toplamaya başla.",
};

export default function B2BRfqCreatePage() {
  return <B2BAuthGate><B2BRfqCreate /></B2BAuthGate>;
}
