import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BAdsManager from "@/components/b2b/B2BAdsManager";

export default function B2BAdsPage() {
  return <B2BAuthGate><B2BAdsManager /></B2BAuthGate>;
}
