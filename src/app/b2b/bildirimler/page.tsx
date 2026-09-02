import B2BAuthGate from "@/components/b2b/B2BAuthGate";
import B2BNotifications from "@/components/b2b/B2BNotifications";

export default function NotificationsPage() {
  return <B2BAuthGate><B2BNotifications /></B2BAuthGate>;
}
