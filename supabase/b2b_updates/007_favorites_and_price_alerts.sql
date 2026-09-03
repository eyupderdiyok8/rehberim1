-- 007 | Ürün favorileri ve doğrulanmış esnafa özel fiyat alarmları
-- Ön koşul: 006_notifications.sql çalıştırılmış olmalı.
BEGIN;

CREATE TABLE IF NOT EXISTS b2b_product_favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES b2b_products(id) ON DELETE CASCADE,
  target_price numeric(12,2) CHECK (target_price IS NULL OR target_price > 0),
  notify_on_any_drop boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_b2b_favorites_product
  ON b2b_product_favorites(product_id);

ALTER TABLE b2b_product_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_favorites_own_read" ON b2b_product_favorites;
CREATE POLICY "b2b_favorites_own_read" ON b2b_product_favorites
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "b2b_favorites_own_insert" ON b2b_product_favorites;
CREATE POLICY "b2b_favorites_own_insert" ON b2b_product_favorites
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "b2b_favorites_own_update" ON b2b_product_favorites;
CREATE POLICY "b2b_favorites_own_update" ON b2b_product_favorites
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "b2b_favorites_own_delete" ON b2b_product_favorites;
CREATE POLICY "b2b_favorites_own_delete" ON b2b_product_favorites
  FOR DELETE TO authenticated USING (user_id = auth.uid());

ALTER TABLE b2b_notifications DROP CONSTRAINT IF EXISTS b2b_notifications_kind_check;
ALTER TABLE b2b_notifications ADD CONSTRAINT b2b_notifications_kind_check
  CHECK (kind IN ('message', 'trade', 'verification', 'advertising', 'system', 'price'));

CREATE OR REPLACE FUNCTION list_my_b2b_favorites()
RETURNS TABLE (
  product_id uuid, product_name text, product_slug text, brand text, category text,
  image_urls text[], stock_status text, minimum_order_quantity numeric, unit text,
  vat_included boolean, wholesaler_name text, wholesaler_slug text,
  current_price numeric, currency text, target_price numeric,
  notify_on_any_drop boolean, favorited_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.name, p.slug, p.brand, p.category, p.image_urls, p.stock_status,
    p.minimum_order_quantity, p.unit, p.vat_included, w.name, w.slug,
    CASE WHEN is_verified_b2b_buyer() THEN pp.price ELSE NULL END,
    CASE WHEN is_verified_b2b_buyer() THEN pp.currency ELSE NULL END,
    f.target_price, f.notify_on_any_drop, f.created_at
  FROM b2b_product_favorites f
  JOIN b2b_products p ON p.id = f.product_id
  JOIN b2b_wholesalers w ON w.id = p.wholesaler_id
  LEFT JOIN b2b_product_prices pp ON pp.product_id = p.id
  WHERE f.user_id = auth.uid()
  ORDER BY f.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION notify_b2b_favorite_price_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  product_name text;
  product_slug text;
  watcher record;
  price_dropped boolean := TG_OP = 'UPDATE' AND NEW.price < OLD.price;
BEGIN
  IF TG_OP = 'INSERT' OR NOT price_dropped THEN RETURN NEW; END IF;

  SELECT name, slug INTO product_name, product_slug
  FROM b2b_products WHERE id = NEW.product_id;

  FOR watcher IN
    SELECT f.user_id, f.target_price, f.notify_on_any_drop
    FROM b2b_product_favorites f
    JOIN b2b_members m ON m.user_id = f.user_id AND m.verification_status = 'verified'
    WHERE f.product_id = NEW.product_id
      AND (
        f.notify_on_any_drop
        OR (f.target_price IS NOT NULL AND OLD.price > f.target_price AND NEW.price <= f.target_price)
      )
  LOOP
    INSERT INTO b2b_notifications(
      recipient_id, kind, title, body, href, entity_type, entity_id
    ) VALUES (
      watcher.user_id,
      'price',
      CASE WHEN watcher.target_price IS NOT NULL AND OLD.price > watcher.target_price AND NEW.price <= watcher.target_price
        THEN 'Hedef fiyatınıza ulaştı' ELSE 'Favori ürününüzün fiyatı düştü' END,
      product_name || ': ' || OLD.price || ' ' || NEW.currency || ' yerine ' || NEW.price || ' ' || NEW.currency,
      '/b2b/urun/' || product_slug,
      'b2b_product_prices',
      NEW.product_id::text
    );
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_favorite_price_notification ON b2b_product_prices;
CREATE TRIGGER trg_b2b_favorite_price_notification
AFTER INSERT OR UPDATE OF price ON b2b_product_prices
FOR EACH ROW EXECUTE FUNCTION notify_b2b_favorite_price_change();

REVOKE ALL ON FUNCTION list_my_b2b_favorites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION list_my_b2b_favorites() TO authenticated;

COMMIT;
