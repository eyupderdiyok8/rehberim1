import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
    }),
);

if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Supabase environment variables are missing.");
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const stores = [
  {
    email: "aquapro-toptan@demo.invalid",
    name: "AquaPro Toptan",
    slug: "aquapro-toptan",
    city: "İstanbul",
    description: "Evsel ve ticari su arıtma sistemleri için filtre, membran, housing ve bağlantı ekipmanlarında hızlı tedarik.",
    shipping_terms: "Saat 15.00'e kadar verilen siparişler aynı gün kargoda. İstanbul içi toplu siparişlerde araç teslimatı.",
    cover_url: "/b2b/marketplace-hero.webp",
    rating: 4.9,
    review_count: 47,
  },
  {
    email: "membran-merkezi@demo.invalid",
    name: "Membran Merkezi",
    slug: "membran-merkezi",
    city: "Ankara",
    description: "RO membran, pompa ve basınç ekipmanlarında teknik destekli profesyonel tedarik merkezi.",
    shipping_terms: "Türkiye geneli anlaşmalı kargo. Paletli siparişlerde 1–2 iş günü hazırlık süresi.",
    cover_url: "/b2b/catalog-showcase.webp",
    rating: 4.8,
    review_count: 31,
  },
  {
    email: "aritma-deposu@demo.invalid",
    name: "Arıtma Deposu",
    slug: "aritma-deposu",
    city: "İzmir",
    description: "Servislerin düzenli sarf malzeme ihtiyacı için koli ve paket bazında avantajlı ürün grupları.",
    shipping_terms: "Minimum sipariş koşulu ürüne göre değişir. Ege bölgesinde ertesi gün sevkiyat seçeneği.",
    cover_url: "/b2b/marketplace-hero.webp",
    rating: 4.7,
    review_count: 26,
  },
];

const productTemplates = [
  { store: 0, name: "10 İnç Şeffaf Filtre Kabı 1/2 İnç", slug: "10-inc-seffaf-filtre-kabi", brand: "AquaLine", category: "Filtre Kabı", description: "Servis ve montaj ekipleri için dayanıklı şeffaf housing. Anahtar ve askı aparatı dahildir.", image: "/b2b/demo-filtre-kabi.webp", min: 12, unit: "adet", vat: true, stock: "in_stock", lead: 1, price: 685, specs: { Bağlantı: "1/2 inç", Uzunluk: "10 inç", Basınç: "8 bar" } },
  { store: 0, name: "Sediment Filtre 5 Mikron Koli", slug: "sediment-filtre-5-mikron-koli", brand: "PureSed", category: "Sarf Filtre", description: "Yüksek tutma kapasiteli spun sediment filtre. Bir kolide 100 adet bulunur.", image: "/b2b/demo-filtre-seti.webp", min: 1, unit: "koli", vat: false, stock: "in_stock", lead: 1, price: 2850, specs: { Mikron: 5, Koli: "100 adet", Boy: "10 inç" } },
  { store: 0, name: "CTO Karbon Blok Filtre 10 İnç", slug: "cto-karbon-blok-filtre-10-inc", brand: "CarbonPro", category: "Sarf Filtre", description: "Koku, klor ve organik bileşen azaltımı için yoğun karbon blok filtre.", image: "/b2b/demo-filtre-seti.webp", min: 60, unit: "adet", vat: false, stock: "low_stock", lead: 2, price: 62.5, specs: { Tip: "CTO", Boy: "10 inç", Paket: "12 adet" } },
  { store: 1, name: "75 GPD RO Membran", slug: "75-gpd-ro-membran", brand: "MembraneX", category: "Membran", description: "Evsel ters osmoz cihazları için yüksek tuz reddi performansına sahip kuru membran.", image: "/b2b/demo-membran.webp", min: 25, unit: "adet", vat: true, stock: "in_stock", lead: 1, price: 425, specs: { Kapasite: "75 GPD", Çap: "1.8 inç", Tuz_reddi: "%97" } },
  { store: 1, name: "100 GPD Booster Pompa", slug: "100-gpd-booster-pompa", brand: "FlowMax", category: "Pompa", description: "Düşük şebeke basıncında kararlı üretim sağlayan sessiz çalışan RO booster pompası.", image: "/b2b/demo-pompa.webp", min: 12, unit: "adet", vat: true, stock: "in_stock", lead: 2, price: 895, specs: { Voltaj: "24V DC", Kapasite: "100 GPD", Basınç: "125 PSI" } },
  { store: 1, name: "Alçak ve Yüksek Basınç Switch Seti", slug: "basinc-switch-seti", brand: "FlowMax", category: "Elektrik Parçası", description: "Pompalı cihazlar için kablolu alçak ve yüksek basınç anahtarı ikili set.", image: "/b2b/demo-baglanti.webp", min: 30, unit: "paket", vat: true, stock: "preorder", lead: 4, price: 1480, specs: { Paket: "10 takım", Kablo: "Dahil", Uyumluluk: "24V" } },
  { store: 2, name: "Krom Arıtma Musluğu Premium", slug: "krom-aritma-muslugu-premium", brand: "NovaTap", category: "Musluk", description: "Seramik salmastralı, parlak krom kaplama, tezgâh üstü premium arıtma musluğu.", image: "/b2b/demo-baglanti.webp", min: 30, unit: "adet", vat: true, stock: "in_stock", lead: 1, price: 178, specs: { Kaplama: "Krom", Salmastra: "Seramik", Bağlantı: "1/4 inç" } },
  { store: 2, name: "Üçlü Ön Filtre Değişim Seti", slug: "uclu-on-filtre-degisim-seti", brand: "ServiceKit", category: "Bakım Seti", description: "Sediment, GAC ve CTO filtrelerden oluşan standart yıllık bakım paketi.", image: "/b2b/demo-filtre-seti.webp", min: 24, unit: "paket", vat: false, stock: "in_stock", lead: 1, price: 245, specs: { İçerik: "PP + GAC + CTO", Boy: "10 inç", Ambalaj: "Tekli set" } },
  { store: 2, name: "20 İnç Big Blue Housing", slug: "20-inc-big-blue-housing", brand: "AquaLine", category: "Endüstriyel", description: "Yüksek debili giriş filtrasyonu için 20 inç Big Blue housing ve montaj aparatı.", image: "/b2b/demo-filtre-kabi.webp", min: 6, unit: "adet", vat: true, stock: "low_stock", lead: 3, price: 1490, specs: { Boy: "20 inç", Giriş: "1 inç", Basınç: "8 bar" } },
  { store: 2, name: "Quick Bağlantı Parçaları Karma Paket", slug: "quick-baglanti-parcalari-karma-paket", brand: "QuickFit", category: "Bağlantı", description: "Dirsek, T, düz ek ve vana çeşitlerinden oluşan servisler için karma bağlantı paketi.", image: "/b2b/demo-baglanti.webp", min: 4, unit: "paket", vat: false, stock: "in_stock", lead: 1, price: 925, specs: { Paket: "250 parça", Ölçü: "1/4 inç", Malzeme: "POM" } },
];

const { data: usersPage, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (usersError) throw usersError;

const ownerIds = [];
for (const store of stores) {
  let user = usersPage.users.find((candidate) => candidate.email === store.email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: store.email,
      password: `${crypto.randomUUID()}Aa!7`,
      email_confirm: true,
      user_metadata: { demo_account: true, business_name: store.name },
    });
    if (error || !data.user) throw error ?? new Error(`Could not create ${store.name}`);
    user = data.user;
  }
  ownerIds.push(user.id);
  const { error: memberError } = await supabase.from("b2b_members").upsert({ user_id: user.id, account_type: "wholesaler", verification_status: "verified", business_name: store.name, city: store.city, verified_at: new Date().toISOString() });
  if (memberError) throw memberError;
}

const storeIds = [];
for (let index = 0; index < stores.length; index += 1) {
  const store = stores[index];
  const { data, error } = await supabase.from("b2b_wholesalers").upsert({ owner_id: ownerIds[index], name: store.name, slug: store.slug, city: store.city, description: store.description, shipping_terms: store.shipping_terms, cover_url: store.cover_url, is_active: true, rating: store.rating, review_count: store.review_count }, { onConflict: "owner_id" }).select("id").single();
  if (error) throw error;
  storeIds.push(data.id);
}

for (const item of productTemplates) {
  const { data, error } = await supabase.from("b2b_products").upsert({ wholesaler_id: storeIds[item.store], name: item.name, slug: item.slug, brand: item.brand, category: item.category, description: item.description, image_urls: [item.image, "/b2b/catalog-showcase.webp"], specifications: item.specs, minimum_order_quantity: item.min, unit: item.unit, vat_included: item.vat, stock_status: item.stock, lead_time_days: item.lead, is_active: true }, { onConflict: "slug" }).select("id").single();
  if (error) throw error;
  const { error: priceError } = await supabase.from("b2b_product_prices").upsert({ product_id: data.id, price: item.price, currency: "TRY", updated_by: ownerIds[item.store] });
  if (priceError) throw priceError;
}

console.log(`Seeded ${stores.length} demo wholesalers and ${productTemplates.length} demo products.`);
