import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BWholesalers from "@/components/b2b/B2BWholesalers";

export default function WholesalersPage() {
  return <B2BAuthGate><B2BWholesalers /></B2BAuthGate>;
}

