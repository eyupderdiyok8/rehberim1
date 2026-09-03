import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BFavorites from "@/components/b2b/B2BFavorites";

export default function FavoritesPage() {
  return <B2BAuthGate><B2BFavorites /></B2BAuthGate>;
}
