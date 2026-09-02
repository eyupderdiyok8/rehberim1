import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BMyRequests from "@/components/b2b/B2BMyRequests";

export default function B2BMyRequestsPage() {
  return <B2BAuthGate><B2BMyRequests /></B2BAuthGate>;
}
