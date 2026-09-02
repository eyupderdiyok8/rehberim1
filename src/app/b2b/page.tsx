import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BMarketplace from "@/components/b2b/B2BMarketplace";

export default function B2BPage() {
  return <B2BAuthGate><B2BMarketplace /></B2BAuthGate>;
}

