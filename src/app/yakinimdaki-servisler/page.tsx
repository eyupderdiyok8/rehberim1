import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NearbyServicesClient from "@/components/NearbyServicesClient";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Yakınımdaki Su Arıtma Servisleri — Su Arıtma Rehberi",
  description:
    "Konumunuza en yakın su arıtma servislerini bulun, hemen arayın veya WhatsApp ile iletişime geçin.",
  alternates: {
    canonical: "https://suaritmarehberi.com.tr/yakinimdaki-servisler",
  },
};

export const dynamic = "force-dynamic";

export default async function NearbyServicesPage() {
  const [{ data: cities }, { data: districts }, { data: services }] = await Promise.all([
    supabase
      .from("cities")
      .select("id, name, slug")
      .order("priority")
      .order("name"),
    supabase
      .from("districts")
      .select("id, name, slug, city_id")
      .order("name"),
    supabase
      .from("services")
      .select("id, name, slug")
      .order("sort_order"),
  ]);

  return (
    <div className="min-h-full flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <NearbyServicesClient
          cities={cities ?? []}
          districts={districts ?? []}
          services={services ?? []}
        />
      </main>
      <Footer />
    </div>
  );
}
