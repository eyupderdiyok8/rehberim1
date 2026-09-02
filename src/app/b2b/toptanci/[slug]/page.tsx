import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BWholesalerDetail from "@/components/b2b/B2BWholesalerDetail";

export default async function WholesalerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <B2BAuthGate><B2BWholesalerDetail slug={slug} /></B2BAuthGate>;
}

