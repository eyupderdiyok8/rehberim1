-- =====================================================
-- ROW LEVEL SECURITY — Public Read Policies
-- Supabase'de anon key'in tabloları okuyabilmesi için
-- Bu dosyayı schema.sql + seed.sql'den SONRA çalıştır
-- =====================================================

-- RLS'yi aktif et (zaten açıksa sorun olmaz)
ALTER TABLE cities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_urls    ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners      ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver (SELECT)
CREATE POLICY "public_read_cities"
  ON cities FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_districts"
  ON districts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_services"
  ON services FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_firms"
  ON firms FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "public_read_firm_services"
  ON firm_services FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_reviews"
  ON reviews FOR SELECT TO anon, authenticated USING (is_approved = true);

CREATE POLICY "public_read_page_urls"
  ON page_urls FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "public_read_banners"
  ON banners FOR SELECT TO anon, authenticated USING (is_active = true);
