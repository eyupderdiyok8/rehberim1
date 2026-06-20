-- ============================================================
-- Firm Products — Premium firma urun kataloğu
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- 1. firm_products tablosu
CREATE TABLE IF NOT EXISTS firm_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id     uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  image_url   text NOT NULL,
  price       numeric(10,2) DEFAULT 0,
  whatsapp    text,
  sort_order  int DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_firm_products_firm ON firm_products(firm_id);

-- 2. Max 10 urun trigger
CREATE OR REPLACE FUNCTION check_product_limit() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM firm_products WHERE firm_id = NEW.firm_id) >= 10 THEN
    RAISE EXCEPTION 'En fazla 10 urun eklenebilir.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_limit ON firm_products;
CREATE TRIGGER trg_product_limit
  BEFORE INSERT ON firm_products
  FOR EACH ROW EXECUTE FUNCTION check_product_limit();

-- 3. RLS
ALTER TABLE firm_products ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "firm_products_select" ON firm_products;
DROP POLICY IF EXISTS "firm_products_admin_all" ON firm_products;
DROP POLICY IF EXISTS "firm_products_owner_all" ON firm_products;

-- Public: read products of active firms
CREATE POLICY "firm_products_select" ON firm_products
  FOR SELECT TO anon, authenticated
  USING (
    firm_id IN (SELECT id FROM firms WHERE is_active = true)
    OR auth.jwt() ->> 'email' = 'eyupder@gmail.com'
  );

-- Admin: full access
CREATE POLICY "firm_products_admin_all" ON firm_products
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Firm owner: full CRUD (only if premium)
CREATE POLICY "firm_products_owner_all" ON firm_products
  FOR ALL TO authenticated
  USING (
    firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid() AND is_premium = true)
  );

-- 4. Storage bucket: firm-products
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('firm-products', 'firm-products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Drop old storage policies if they exist
DROP POLICY IF EXISTS "firm_products_bucket_select" ON storage.objects;
DROP POLICY IF EXISTS "firm_products_bucket_insert" ON storage.objects;
DROP POLICY IF EXISTS "firm_products_bucket_delete" ON storage.objects;

-- Public read
CREATE POLICY "firm_products_bucket_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'firm-products');

-- Authenticated users can upload (firm owners)
CREATE POLICY "firm_products_bucket_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'firm-products');

-- Admin can delete
CREATE POLICY "firm_products_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'firm-products' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');
