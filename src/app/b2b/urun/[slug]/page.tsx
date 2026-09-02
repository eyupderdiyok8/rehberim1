import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BProductDetail from "@/components/b2b/B2BProductDetail";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <B2BAuthGate><B2BProductDetail slug={slug} /></B2BAuthGate>;
}

