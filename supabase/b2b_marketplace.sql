-- ============================================================
-- Private B2B marketplace
-- Run once in Supabase SQL Editor before enabling /b2b.
-- Storefronts and products require login; prices require a verified buyer.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS b2b_members (
  user_id               uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type          text NOT NULL DEFAULT 'buyer'
                        CHECK (account_type IN ('buyer', 'wholesaler', 'admin')),
  verification_status   text NOT NULL DEFAULT 'unverified'
                        CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'suspended')),
  business_name         text,
  tax_number            text,
  tax_office            text,
  city                   text,
  phone                  text,
  review_note            text,
  verified_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_verification_documents (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type          text NOT NULL CHECK (document_type IN ('tax_certificate', 'trade_registry', 'chamber_registration', 'other')),
  object_path            text NOT NULL,
  status                 text NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_wholesalers (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id               uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name                   text NOT NULL,
  slug                   text NOT NULL UNIQUE,
  description            text,
  logo_url               text,
  cover_url              text,
  city                   text,
  phone                  text,
  whatsapp               text,
  website                text,
  shipping_terms         text,
  is_active              boolean NOT NULL DEFAULT false,
  rating                 numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count           integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_products (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id          uuid NOT NULL REFERENCES b2b_wholesalers(id) ON DELETE CASCADE,
  name                   text NOT NULL,
  slug                   text NOT NULL UNIQUE,
  brand                  text,
  category               text NOT NULL,
  description            text,
  image_urls             text[] NOT NULL DEFAULT '{}',
  specifications         jsonb NOT NULL DEFAULT '{}'::jsonb,
  minimum_order_quantity numeric(10,2) NOT NULL DEFAULT 1 CHECK (minimum_order_quantity > 0),
  unit                   text NOT NULL DEFAULT 'adet' CHECK (unit IN ('adet', 'koli', 'paket', 'palet', 'metre', 'kilogram')),
  vat_included           boolean NOT NULL DEFAULT true,
  stock_status           text NOT NULL DEFAULT 'in_stock'
                         CHECK (stock_status IN ('in_stock', 'low_stock', 'preorder', 'out_of_stock')),
  lead_time_days         integer NOT NULL DEFAULT 1 CHECK (lead_time_days >= 0),
  is_active              boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- Price is intentionally isolated from the product table. Product queries can
-- never accidentally serialize a price to an unverified visitor.
CREATE TABLE IF NOT EXISTS b2b_product_prices (
  product_id             uuid PRIMARY KEY REFERENCES b2b_products(id) ON DELETE CASCADE,
  price                  numeric(12,2) NOT NULL CHECK (price >= 0),
  currency               text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR')),
  valid_until            timestamptz,
  updated_by             uuid REFERENCES auth.users(id),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_price_history (
  id                     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id             uuid NOT NULL REFERENCES b2b_products(id) ON DELETE CASCADE,
  price                  numeric(12,2) NOT NULL,
  currency               text NOT NULL,
  vat_included           boolean NOT NULL,
  recorded_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_trade_requests (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id             uuid NOT NULL REFERENCES b2b_products(id),
  buyer_id               uuid NOT NULL REFERENCES auth.users(id),
  wholesaler_id          uuid NOT NULL REFERENCES b2b_wholesalers(id),
  quantity               numeric(10,2) NOT NULL CHECK (quantity > 0),
  status                 text NOT NULL DEFAULT 'requested'
                         CHECK (status IN ('requested', 'quoted', 'accepted', 'completed', 'cancelled', 'disputed')),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_reviews (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_request_id       uuid NOT NULL REFERENCES b2b_trade_requests(id) ON DELETE CASCADE,
  reviewer_id            uuid NOT NULL REFERENCES auth.users(id),
  target_user_id         uuid NOT NULL REFERENCES auth.users(id),
  rating                 integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body                   text CHECK (char_length(body) <= 1200),
  created_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trade_request_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_b2b_products_search ON b2b_products(category, brand, is_active);
CREATE INDEX IF NOT EXISTS idx_b2b_products_wholesaler ON b2b_products(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_b2b_price_history_product_date ON b2b_price_history(product_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_documents_user ON b2b_verification_documents(user_id);

CREATE OR REPLACE FUNCTION is_b2b_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT account_type = 'admin' FROM b2b_members WHERE user_id = auth.uid()),
    false
  ) OR COALESCE(auth.jwt() ->> 'email' = 'eyupder@gmail.com', false);
$$;

CREATE OR REPLACE FUNCTION is_verified_b2b_buyer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT verification_status = 'verified' FROM b2b_members WHERE user_id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION owns_b2b_wholesaler(target_wholesaler uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM b2b_wholesalers
    WHERE id = target_wholesaler AND owner_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION is_b2b_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_verified_b2b_buyer() FROM PUBLIC;
REVOKE ALL ON FUNCTION owns_b2b_wholesaler(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_b2b_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_verified_b2b_buyer() TO authenticated;
GRANT EXECUTE ON FUNCTION owns_b2b_wholesaler(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION create_b2b_wholesaler_account(
  p_owner_id uuid,
  p_name text,
  p_slug text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE wholesaler_id uuid;
BEGIN
  IF NOT is_b2b_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  IF trim(p_name) = '' OR trim(p_slug) !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN
    RAISE EXCEPTION 'Geçersiz toptancı adı veya adresi';
  END IF;

  INSERT INTO b2b_members (user_id, account_type, verification_status, business_name, verified_at)
  VALUES (p_owner_id, 'wholesaler', 'verified', trim(p_name), now())
  ON CONFLICT (user_id) DO UPDATE SET
    account_type = 'wholesaler', verification_status = 'verified',
    business_name = EXCLUDED.business_name, verified_at = now(), updated_at = now();

  INSERT INTO b2b_wholesalers (owner_id, name, slug, is_active)
  VALUES (p_owner_id, trim(p_name), trim(p_slug), true)
  ON CONFLICT (owner_id) DO UPDATE SET
    name = EXCLUDED.name, slug = EXCLUDED.slug, is_active = true, updated_at = now()
  RETURNING id INTO wholesaler_id;

  RETURN wholesaler_id;
END;
$$;

REVOKE ALL ON FUNCTION create_b2b_wholesaler_account(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_b2b_wholesaler_account(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION update_own_b2b_wholesaler_profile(
  p_name text,
  p_description text,
  p_logo_url text,
  p_cover_url text,
  p_city text,
  p_phone text,
  p_whatsapp text,
  p_website text,
  p_shipping_terms text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE b2b_wholesalers SET
    name = trim(p_name),
    description = nullif(trim(p_description), ''),
    logo_url = nullif(trim(p_logo_url), ''),
    cover_url = nullif(trim(p_cover_url), ''),
    city = nullif(trim(p_city), ''),
    phone = nullif(trim(p_phone), ''),
    whatsapp = nullif(trim(p_whatsapp), ''),
    website = nullif(trim(p_website), ''),
    shipping_terms = nullif(trim(p_shipping_terms), ''),
    updated_at = now()
  WHERE owner_id = auth.uid();

  IF NOT FOUND THEN RAISE EXCEPTION 'Toptancı hesabı bulunamadı'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION update_own_b2b_wholesaler_profile(text, text, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_own_b2b_wholesaler_profile(text, text, text, text, text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION submit_b2b_verification(
  p_business_name text,
  p_tax_number text,
  p_tax_office text,
  p_city text,
  p_phone text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Oturum gerekli';
  END IF;

  INSERT INTO b2b_members (
    user_id, account_type, verification_status, business_name,
    tax_number, tax_office, city, phone, updated_at
  ) VALUES (
    auth.uid(), 'buyer', 'pending', trim(p_business_name),
    trim(p_tax_number), nullif(trim(p_tax_office), ''), trim(p_city), nullif(trim(p_phone), ''), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    verification_status = 'pending',
    business_name = EXCLUDED.business_name,
    tax_number = EXCLUDED.tax_number,
    tax_office = EXCLUDED.tax_office,
    city = EXCLUDED.city,
    phone = EXCLUDED.phone,
    review_note = NULL,
    updated_at = now()
  WHERE b2b_members.account_type = 'buyer';
END;
$$;

REVOKE ALL ON FUNCTION submit_b2b_verification(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_b2b_verification(text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION review_b2b_verification(
  p_user_id uuid,
  p_status text,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_b2b_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  IF p_status NOT IN ('verified', 'rejected', 'suspended') THEN RAISE EXCEPTION 'Geçersiz durum'; END IF;

  UPDATE b2b_members SET
    verification_status = p_status,
    review_note = nullif(trim(p_note), ''),
    verified_at = CASE WHEN p_status = 'verified' THEN now() ELSE NULL END,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION review_b2b_verification(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION review_b2b_verification(uuid, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION record_b2b_price_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE product_vat boolean;
BEGIN
  SELECT vat_included INTO product_vat FROM b2b_products WHERE id = NEW.product_id;
  INSERT INTO b2b_price_history(product_id, price, currency, vat_included)
  VALUES (NEW.product_id, NEW.price, NEW.currency, COALESCE(product_vat, true));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_price_history ON b2b_product_prices;
CREATE TRIGGER trg_b2b_price_history
AFTER INSERT OR UPDATE OF price, currency ON b2b_product_prices
FOR EACH ROW EXECUTE FUNCTION record_b2b_price_change();

CREATE OR REPLACE FUNCTION protect_b2b_trade_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.product_id <> OLD.product_id
     OR NEW.buyer_id <> OLD.buyer_id
     OR NEW.wholesaler_id <> OLD.wholesaler_id
     OR NEW.quantity <> OLD.quantity THEN
    RAISE EXCEPTION 'Talebin tarafları ve ürün bilgisi değiştirilemez';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_trade_identity ON b2b_trade_requests;
CREATE TRIGGER trg_b2b_trade_identity
BEFORE UPDATE ON b2b_trade_requests
FOR EACH ROW EXECUTE FUNCTION protect_b2b_trade_identity();

CREATE OR REPLACE FUNCTION refresh_b2b_wholesaler_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target_owner uuid;
BEGIN
  target_owner := COALESCE(NEW.target_user_id, OLD.target_user_id);
  UPDATE b2b_wholesalers w SET
    rating = COALESCE((SELECT round(avg(r.rating)::numeric, 1) FROM b2b_reviews r WHERE r.target_user_id = target_owner), 0),
    review_count = (SELECT count(*) FROM b2b_reviews r WHERE r.target_user_id = target_owner),
    updated_at = now()
  WHERE w.owner_id = target_owner;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_wholesaler_rating ON b2b_reviews;
CREATE TRIGGER trg_b2b_wholesaler_rating
AFTER INSERT OR UPDATE OR DELETE ON b2b_reviews
FOR EACH ROW EXECUTE FUNCTION refresh_b2b_wholesaler_rating();

CREATE OR REPLACE FUNCTION list_own_b2b_trade_requests()
RETURNS TABLE (
  id uuid,
  product_name text,
  buyer_user_id uuid,
  buyer_business_name text,
  quantity numeric,
  unit text,
  status text,
  created_at timestamptz,
  review_submitted boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tr.id, p.name, tr.buyer_id, COALESCE(m.business_name, 'Doğrulanmış esnaf'), tr.quantity, p.unit, tr.status, tr.created_at,
    EXISTS (SELECT 1 FROM b2b_reviews r WHERE r.trade_request_id = tr.id AND r.reviewer_id = auth.uid())
  FROM b2b_trade_requests tr
  JOIN b2b_products p ON p.id = tr.product_id
  LEFT JOIN b2b_members m ON m.user_id = tr.buyer_id
  WHERE owns_b2b_wholesaler(tr.wholesaler_id) OR is_b2b_admin()
  ORDER BY tr.created_at DESC;
$$;

REVOKE ALL ON FUNCTION list_own_b2b_trade_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION list_own_b2b_trade_requests() TO authenticated;

CREATE OR REPLACE FUNCTION list_my_b2b_trade_requests()
RETURNS TABLE (
  id uuid,
  product_name text,
  wholesaler_name text,
  wholesaler_owner_id uuid,
  quantity numeric,
  unit text,
  status text,
  created_at timestamptz,
  review_submitted boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tr.id, p.name, w.name, w.owner_id, tr.quantity, p.unit, tr.status, tr.created_at,
    EXISTS (SELECT 1 FROM b2b_reviews r WHERE r.trade_request_id = tr.id AND r.reviewer_id = auth.uid())
  FROM b2b_trade_requests tr
  JOIN b2b_products p ON p.id = tr.product_id
  JOIN b2b_wholesalers w ON w.id = tr.wholesaler_id
  WHERE tr.buyer_id = auth.uid()
  ORDER BY tr.created_at DESC;
$$;

REVOKE ALL ON FUNCTION list_my_b2b_trade_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION list_my_b2b_trade_requests() TO authenticated;

CREATE OR REPLACE FUNCTION update_own_b2b_trade_request(p_request_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('quoted', 'completed', 'cancelled', 'disputed') THEN
    RAISE EXCEPTION 'Geçersiz talep durumu';
  END IF;
  UPDATE b2b_trade_requests
  SET status = p_status, updated_at = now()
  WHERE id = p_request_id
    AND (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());
  IF NOT FOUND THEN RAISE EXCEPTION 'Talep bulunamadı veya yetkiniz yok'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION update_own_b2b_trade_request(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION update_own_b2b_trade_request(uuid, text) TO authenticated;

ALTER TABLE b2b_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_wholesalers ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "b2b_members_own_or_admin_read" ON b2b_members;
CREATE POLICY "b2b_members_own_or_admin_read" ON b2b_members
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_b2b_admin());

DROP POLICY IF EXISTS "b2b_documents_own_insert" ON b2b_verification_documents;
CREATE POLICY "b2b_documents_own_insert" ON b2b_verification_documents
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending');
DROP POLICY IF EXISTS "b2b_documents_own_or_admin_read" ON b2b_verification_documents;
CREATE POLICY "b2b_documents_own_or_admin_read" ON b2b_verification_documents
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_b2b_admin());

DROP POLICY IF EXISTS "b2b_wholesalers_authenticated_read" ON b2b_wholesalers;
CREATE POLICY "b2b_wholesalers_authenticated_read" ON b2b_wholesalers
  FOR SELECT TO authenticated USING (is_active OR owner_id = auth.uid() OR is_b2b_admin());
DROP POLICY IF EXISTS "b2b_wholesalers_owner_write" ON b2b_wholesalers;
DROP POLICY IF EXISTS "b2b_wholesalers_admin_write" ON b2b_wholesalers;
CREATE POLICY "b2b_wholesalers_admin_write" ON b2b_wholesalers
  FOR ALL TO authenticated
  USING (is_b2b_admin())
  WITH CHECK (is_b2b_admin());

DROP POLICY IF EXISTS "b2b_products_authenticated_read" ON b2b_products;
CREATE POLICY "b2b_products_authenticated_read" ON b2b_products
  FOR SELECT TO authenticated
  USING (
    (is_active AND wholesaler_id IN (SELECT id FROM b2b_wholesalers WHERE is_active))
    OR owns_b2b_wholesaler(wholesaler_id)
    OR is_b2b_admin()
  );
DROP POLICY IF EXISTS "b2b_products_owner_write" ON b2b_products;
CREATE POLICY "b2b_products_owner_write" ON b2b_products
  FOR ALL TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
  WITH CHECK (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());

DROP POLICY IF EXISTS "b2b_prices_verified_or_owner_read" ON b2b_product_prices;
CREATE POLICY "b2b_prices_verified_or_owner_read" ON b2b_product_prices
  FOR SELECT TO authenticated
  USING (
    is_verified_b2b_buyer()
    OR is_b2b_admin()
    OR EXISTS (
      SELECT 1 FROM b2b_products p
      WHERE p.id = product_id AND owns_b2b_wholesaler(p.wholesaler_id)
    )
  );
DROP POLICY IF EXISTS "b2b_prices_owner_write" ON b2b_product_prices;
CREATE POLICY "b2b_prices_owner_write" ON b2b_product_prices
  FOR ALL TO authenticated
  USING (
    is_b2b_admin() OR EXISTS (
      SELECT 1 FROM b2b_products p
      WHERE p.id = product_id AND owns_b2b_wholesaler(p.wholesaler_id)
    )
  )
  WITH CHECK (
    is_b2b_admin() OR EXISTS (
      SELECT 1 FROM b2b_products p
      WHERE p.id = product_id AND owns_b2b_wholesaler(p.wholesaler_id)
    )
  );

DROP POLICY IF EXISTS "b2b_history_verified_or_owner_read" ON b2b_price_history;
CREATE POLICY "b2b_history_verified_or_owner_read" ON b2b_price_history
  FOR SELECT TO authenticated
  USING (
    is_verified_b2b_buyer()
    OR is_b2b_admin()
    OR EXISTS (
      SELECT 1 FROM b2b_products p
      WHERE p.id = product_id AND owns_b2b_wholesaler(p.wholesaler_id)
    )
  );

DROP POLICY IF EXISTS "b2b_trade_parties" ON b2b_trade_requests;
DROP POLICY IF EXISTS "b2b_trade_parties_read" ON b2b_trade_requests;
CREATE POLICY "b2b_trade_parties_read" ON b2b_trade_requests
  FOR SELECT TO authenticated
  USING (
    buyer_id = auth.uid()
    OR owns_b2b_wholesaler(wholesaler_id)
    OR is_b2b_admin()
  );
DROP POLICY IF EXISTS "b2b_trade_buyer_insert" ON b2b_trade_requests;
CREATE POLICY "b2b_trade_buyer_insert" ON b2b_trade_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    buyer_id = auth.uid()
    AND is_verified_b2b_buyer()
    AND status = 'requested'
    AND EXISTS (
      SELECT 1 FROM b2b_products p
      WHERE p.id = product_id AND p.wholesaler_id = wholesaler_id AND p.is_active
    )
  );
DROP POLICY IF EXISTS "b2b_trade_wholesaler_update" ON b2b_trade_requests;
CREATE POLICY "b2b_trade_wholesaler_update" ON b2b_trade_requests
  FOR UPDATE TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
  WITH CHECK (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());

DROP POLICY IF EXISTS "b2b_reviews_trade_parties_read" ON b2b_reviews;
CREATE POLICY "b2b_reviews_trade_parties_read" ON b2b_reviews
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "b2b_reviews_completed_trade_insert" ON b2b_reviews;
CREATE POLICY "b2b_reviews_completed_trade_insert" ON b2b_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM b2b_trade_requests tr
      WHERE tr.id = trade_request_id
        AND tr.status = 'completed'
        AND (
          (tr.buyer_id = auth.uid() AND target_user_id = (
            SELECT w.owner_id FROM b2b_wholesalers w WHERE w.id = tr.wholesaler_id
          ))
          OR
          (owns_b2b_wholesaler(tr.wholesaler_id) AND target_user_id = tr.buyer_id)
        )
    )
  );

-- Private verification document bucket. Never expose tax certificates publicly.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'b2b-verification-documents',
  'b2b-verification-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "b2b_verification_storage_own_insert" ON storage.objects;
CREATE POLICY "b2b_verification_storage_own_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'b2b-verification-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
DROP POLICY IF EXISTS "b2b_verification_storage_own_read" ON storage.objects;
CREATE POLICY "b2b_verification_storage_own_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'b2b-verification-documents'
    AND ((storage.foldername(name))[1] = auth.uid()::text OR is_b2b_admin())
  );
