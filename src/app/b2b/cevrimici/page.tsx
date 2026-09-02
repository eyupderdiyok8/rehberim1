import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BNetwork from "@/components/b2b/B2BNetwork";

export default function B2BOnlinePage() {
  return <B2BAuthGate><B2BNetwork /></B2BAuthGate>;
}
