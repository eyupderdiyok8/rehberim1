import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BWholesalerDashboard from "@/components/b2b/B2BWholesalerDashboard";

export default function B2BWholesalerPanelPage() {
  return <B2BAuthGate><B2BWholesalerDashboard /></B2BAuthGate>;
}
