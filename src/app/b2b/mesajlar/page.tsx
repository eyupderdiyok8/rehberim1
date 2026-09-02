import { Suspense } from "react";
import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BMessages from "@/components/b2b/B2BMessages";

export default function B2BMessagesPage() {
  return <B2BAuthGate><Suspense><B2BMessages /></Suspense></B2BAuthGate>;
}
