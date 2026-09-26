import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BRfqDetail from "@/components/b2b/B2BRfqDetail";

export default async function B2BRfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <B2BAuthGate><B2BRfqDetail rfqId={id} /></B2BAuthGate>;
}
