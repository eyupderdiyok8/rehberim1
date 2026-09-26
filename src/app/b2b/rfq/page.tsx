import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BRfqBoard from "@/components/b2b/B2BRfqBoard";

export const metadata = {
  title: "RFQ Tahtası | Su Arıtma Pro B2B",
  description: "Satın alma ilanlarını yayınla, doğrulanmış toptancılardan rekabetçi teklifleri topla.",
};

export default function B2BRfqPage() {
  return <B2BAuthGate><B2BRfqBoard /></B2BAuthGate>;
}
