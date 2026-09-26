-- 008 | RFQ: Doğrulanmış esnaf satın alma ilanı açar, toptancılar teklif verir
-- Ön koşul: 001–007 numaralı güncellemeler çalıştırılmış olmalı.
BEGIN;

CREATE TABLE IF NOT EXISTS b2b_rfps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 8 AND 140),
  category text NOT NULL CHECK (char_length(category) BETWEEN 2 AND 80),
  product_details text CHECK (product_details IS NULL OR char_length(product_details) <= 2000),
  quantity numeric(10,2) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL DEFAULT 'adet' CHECK (unit IN ('adet', 'koli', 'paket', 'palet', 'metre', 'kilogram')),
  target_price numeric(12,2) CHECK (target_price IS NULL OR target_price > 0),
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR')),
  city text,
  delivery_note text CHECK (delivery_note IS NULL OR char_length(delivery_note) <= 500),
  valid_until date NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'awarded', 'cancelled', 'expired')),
  awarded_offer_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_rfps_board ON b2b_rfps(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_rfps_buyer ON b2b_rfps(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_rfps_category ON b2b_rfps(category);

CREATE TABLE IF NOT EXISTS b2b_rfq_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid NOT NULL REFERENCES b2b_rfps(id) ON DELETE CASCADE,
  wholesaler_id uuid NOT NULL REFERENCES b2b_wholesalers(id) ON DELETE CASCADE,
  unit_price numeric(12,2) NOT NULL CHECK (unit_price > 0),
  currency text NOT NULL DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD', 'EUR')),
  lead_time_days integer NOT NULL DEFAULT 1 CHECK (lead_time_days >= 0),
  note text CHECK (note IS NULL OR char_length(note) <= 1000),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rfq_id, wholesaler_id)
);

CREATE INDEX IF NOT EXISTS idx_b2b_rfq_offers_rfq ON b2b_rfq_offers(rfq_id, created_at);
CREATE INDEX IF NOT EXISTS idx_b2b_rfq_offers_wholesaler ON b2b_rfq_offers(wholesaler_id, created_at DESC);

DO $$ BEGIN
  ALTER TABLE b2b_rfps
    ADD CONSTRAINT b2b_rfps_awarded_offer_fk
    FOREIGN KEY (awarded_offer_id) REFERENCES b2b_rfq_offers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE b2b_rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_rfq_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "b2b_rfps_board_read" ON b2b_rfps;
CREATE POLICY "b2b_rfps_board_read" ON b2b_rfps
  FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR is_b2b_admin() OR status IN ('open', 'awarded'));
DROP POLICY IF EXISTS "b2b_rfps_buyer_insert" ON b2b_rfps;
CREATE POLICY "b2b_rfps_buyer_insert" ON b2b_rfps
  FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid() AND is_verified_b2b_buyer() AND status = 'open');
DROP POLICY IF EXISTS "b2b_rfps_buyer_update" ON b2b_rfps;
CREATE POLICY "b2b_rfps_buyer_update" ON b2b_rfps
  FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());
DROP POLICY IF EXISTS "b2b_rfps_buyer_delete" ON b2b_rfps;
CREATE POLICY "b2b_rfps_buyer_delete" ON b2b_rfps
  FOR DELETE TO authenticated USING (buyer_id = auth.uid() AND status = 'open');

DROP POLICY IF EXISTS "b2b_rfq_offers_parties_read" ON b2b_rfq_offers;
CREATE POLICY "b2b_rfq_offers_parties_read" ON b2b_rfq_offers
  FOR SELECT TO authenticated
  USING (
    is_b2b_admin()
    OR rfq_id IN (SELECT id FROM b2b_rfps WHERE buyer_id = auth.uid())
    OR owns_b2b_wholesaler(wholesaler_id)
  );
DROP POLICY IF EXISTS "b2b_rfq_offers_wholesaler_insert" ON b2b_rfq_offers;
CREATE POLICY "b2b_rfq_offers_wholesaler_insert" ON b2b_rfq_offers
  FOR INSERT TO authenticated
  WITH CHECK (
    status = 'submitted'
    AND owns_b2b_wholesaler(wholesaler_id)
    AND EXISTS (
      SELECT 1 FROM b2b_rfps r
      WHERE r.id = rfq_id AND r.status = 'open' AND r.valid_until >= CURRENT_DATE
    )
  );
DROP POLICY IF EXISTS "b2b_rfq_offers_wholesaler_update" ON b2b_rfq_offers;
CREATE POLICY "b2b_rfq_offers_wholesaler_update" ON b2b_rfq_offers
  FOR UPDATE TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
  WITH CHECK (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());

-- Durum makinesi ve güncel updated_at tek merkezden korunur.
CREATE OR REPLACE FUNCTION b2b_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_b2b_rfq_identity()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.buyer_id <> OLD.buyer_id OR NEW.category <> OLD.category OR NEW.quantity <> OLD.quantity THEN
    RAISE EXCEPTION 'RFQ ilanının tarafları ve miktarı değiştirilemez';
  END IF;
  IF OLD.status = 'awarded' AND NEW.status <> 'awarded' THEN
    RAISE EXCEPTION 'Sonuçlandırılmış ilan yeniden açılamaz';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_rfq_identity ON b2b_rfps;
CREATE TRIGGER trg_b2b_rfq_identity
BEFORE UPDATE ON b2b_rfps
FOR EACH ROW EXECUTE FUNCTION protect_b2b_rfq_identity();

DROP TRIGGER IF EXISTS trg_b2b_rfq_offer_updated ON b2b_rfq_offers;
CREATE TRIGGER trg_b2b_rfq_offer_updated
BEFORE UPDATE ON b2b_rfq_offers
FOR EACH ROW EXECUTE FUNCTION b2b_touch_updated_at();

-- Bildirim şeması 'rfq' türünü kabul eder.
ALTER TABLE b2b_notifications DROP CONSTRAINT IF EXISTS b2b_notifications_kind_check;
ALTER TABLE b2b_notifications ADD CONSTRAINT b2b_notifications_kind_check
  CHECK (kind IN ('message', 'trade', 'verification', 'advertising', 'system', 'price', 'rfq'));

CREATE OR REPLACE FUNCTION notify_b2b_rfq_events()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  store_owner uuid;
  rfq_row b2b_rfps%ROWTYPE;
  brief text;
BEGIN
  IF TG_TABLE_NAME = 'b2b_rfq_offers' AND TG_OP = 'INSERT' THEN
    SELECT * INTO rfq_row FROM b2b_rfps WHERE id = NEW.rfq_id;
    SELECT title INTO brief FROM b2b_wholesalers WHERE id = NEW.wholesaler_id;
    IF rfq_row.buyer_id IS NOT NULL AND rfq_row.buyer_id <> auth.uid() THEN
      INSERT INTO b2b_notifications(recipient_id, kind, title, body, href, entity_type, entity_id)
      VALUES (
        rfq_row.buyer_id, 'rfq',
        'Talebinize yeni teklif geldi',
        left(coalesce(brief, 'Toptancı'), 60) || ' · ' || rfq_row.title || ': ' || NEW.unit_price || ' ' || NEW.currency || ' / birim',
        '/b2b/rfq/' || NEW.rfq_id, 'b2b_rfq_offers', NEW.id::text
      );
    END IF;
  ELSIF TG_TABLE_NAME = 'b2b_rfps' AND TG_OP = 'UPDATE' AND NEW.status = 'awarded' AND OLD.status <> 'awarded' THEN
    SELECT w.owner_id INTO store_owner
    FROM b2b_rfq_offers o JOIN b2b_wholesalers w ON w.id = o.wholesaler_id
    WHERE o.id = NEW.awarded_offer_id;
    IF store_owner IS NOT NULL AND store_owner <> auth.uid() THEN
      INSERT INTO b2b_notifications(recipient_id, kind, title, body, href, entity_type, entity_id)
      VALUES (
        store_owner, 'rfq',
        'Teklifiniz kabul edildi',
        NEW.title || ' ilanına verdiğiniz teklif seçildi. Sipariş detaylarını görüşebilirsiniz.',
        '/b2b/rfq/' || NEW.id, 'b2b_rfps', NEW.id::text
      );
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_rfq_offer_notifications ON b2b_rfq_offers;
CREATE TRIGGER trg_b2b_rfq_offer_notifications
AFTER INSERT ON b2b_rfq_offers
FOR EACH ROW EXECUTE FUNCTION notify_b2b_rfq_events();

DROP TRIGGER IF EXISTS trg_b2b_rfq_award_notifications ON b2b_rfps;
CREATE TRIGGER trg_b2b_rfq_award_notifications
AFTER UPDATE OF status ON b2b_rfps
FOR EACH ROW EXECUTE FUNCTION notify_b2b_rfq_events();

-- RPC: Doğrulanmış alıcı satın alma ilanı açar.
CREATE OR REPLACE FUNCTION create_b2b_rfq(
  p_title text,
  p_category text,
  p_product_details text DEFAULT NULL,
  p_quantity numeric DEFAULT 1,
  p_unit text DEFAULT 'adet',
  p_target_price numeric DEFAULT NULL,
  p_currency text DEFAULT 'TRY',
  p_city text DEFAULT NULL,
  p_delivery_note text DEFAULT NULL,
  p_valid_until date DEFAULT (CURRENT_DATE + INTERVAL '14 days')::date
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rfq_id uuid;
BEGIN
  IF NOT is_verified_b2b_buyer() THEN RAISE EXCEPTION 'Doğrulanmış işletme hesabı gerekir'; END IF;
  IF length(trim(p_title)) < 8 THEN RAISE EXCEPTION 'İlan başlığı en az 8 karakter olmalı'; END IF;
  IF length(trim(p_category)) < 2 THEN RAISE EXCEPTION 'Ürün kategorisi seçin'; END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN RAISE EXCEPTION 'Geçerli bir miktar girin'; END IF;
  IF p_unit NOT IN ('adet', 'koli', 'paket', 'palet', 'metre', 'kilogram') THEN RAISE EXCEPTION 'Geçersiz birim'; END IF;
  IF p_currency NOT IN ('TRY', 'USD', 'EUR') THEN RAISE EXCEPTION 'Geçersiz para birimi'; END IF;
  IF p_valid_until IS NULL OR p_valid_until < CURRENT_DATE + 1 THEN RAISE EXCEPTION 'Geçerlilik tarihi en az yarının günü olmalı'; END IF;

  INSERT INTO b2b_rfps(
    buyer_id, title, category, product_details, quantity, unit,
    target_price, currency, city, delivery_note, valid_until
  ) VALUES (
    auth.uid(), trim(p_title), trim(p_category),
    NULLIF(trim(COALESCE(p_product_details, '')), ''), p_quantity, p_unit,
    p_target_price, p_currency, NULLIF(trim(COALESCE(p_city, '')), ''),
    NULLIF(trim(COALESCE(p_delivery_note, '')), ''), p_valid_until
  )
  RETURNING id INTO rfq_id;
  RETURN rfq_id;
END;
$$;

-- RPC: Tüm doğrulanmış üyeler için açık ilan havuzu.
CREATE OR REPLACE FUNCTION list_open_b2b_rfps()
RETURNS TABLE (
  id uuid, title text, category text, product_details text, quantity numeric, unit text,
  target_price numeric, currency text, city text, delivery_note text, valid_until date,
  status text, created_at timestamptz, buyer_business_name text,
  offer_count bigint, my_offer boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.title, r.category, r.product_details, r.quantity, r.unit,
    r.target_price, r.currency, r.city, r.delivery_note, r.valid_until, r.status, r.created_at,
    coalesce(m.business_name, 'Doğrulanmış esnaf'),
    (SELECT count(*) FROM b2b_rfq_offers o WHERE o.rfq_id = r.id AND o.status <> 'withdrawn'),
    (SELECT EXISTS (
      SELECT 1 FROM b2b_rfq_offers o
      JOIN b2b_wholesalers w ON w.id = o.wholesaler_id
      WHERE o.rfq_id = r.id AND w.owner_id = auth.uid() AND o.status <> 'withdrawn'
    ))
  FROM b2b_rfps r
  LEFT JOIN b2b_members m ON m.user_id = r.buyer_id
  WHERE (r.status = 'open' AND r.valid_until >= CURRENT_DATE)
     OR (r.buyer_id = auth.uid() AND r.status <> 'expired')
     OR is_b2b_admin()
  ORDER BY (r.status = 'open' AND r.valid_until >= CURRENT_DATE) DESC, r.created_at DESC;
$$;

-- RPC: Toptanının görüntüleyebildiği ilanlar + kendi teklif durumu.
CREATE OR REPLACE FUNCTION list_b2b_rfq_pool()
RETURNS TABLE (
  id uuid, title text, category text, quantity numeric, unit text,
  target_price numeric, currency text, city text, valid_until date, status text,
  created_at timestamptz, buyer_business_name text, offer_count bigint,
  my_offer_status text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.title, r.category, r.quantity, r.unit, r.target_price, r.currency,
    r.city, r.valid_until, r.status, r.created_at,
    coalesce(m.business_name, 'Doğrulanmış esnaf'),
    (SELECT count(*) FROM b2b_rfq_offers o WHERE o.rfq_id = r.id AND o.status <> 'withdrawn'),
    (SELECT o.status FROM b2b_rfq_offers o
     JOIN b2b_wholesalers w ON w.id = o.wholesaler_id
     WHERE o.rfq_id = r.id AND w.owner_id = auth.uid()
     ORDER BY o.created_at DESC LIMIT 1) AS my_offer_status
  FROM b2b_rfps r
  LEFT JOIN b2b_members m ON m.user_id = r.buyer_id
  WHERE EXISTS (SELECT 1 FROM b2b_wholesalers w WHERE w.owner_id = auth.uid() AND w.is_active)
    AND (r.status = 'open'
      OR EXISTS (SELECT 1 FROM b2b_rfq_offers o2
                 JOIN b2b_wholesalers w2 ON w2.id = o2.wholesaler_id
                 WHERE o2.rfq_id = r.id AND w2.owner_id = auth.uid()))
  ORDER BY r.created_at DESC;
$$;

-- RPC: İlan detayı + teklif listesi (alıcı tümünü, toptancı yalnız kendi teklifini görür).
CREATE OR REPLACE FUNCTION get_b2b_rfq_detail(p_rfq_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'rfq', to_jsonb(r) - 'buyer_id',
    'buyer_business_name', coalesce(m.business_name, 'Doğrulanmış esnaf'),
    'is_mine', r.buyer_id = auth.uid(),
    'offers', (
      SELECT coalesce(jsonb_agg(to_jsonb(o) - 'wholesaler_id' - 'updated_at' ORDER BY o.created_at), '[]'::jsonb)
      FROM b2b_rfq_offers o
      JOIN b2b_wholesalers w ON w.id = o.wholesaler_id
      WHERE o.rfq_id = r.id
        AND (r.buyer_id = auth.uid() OR is_b2b_admin() OR w.owner_id = auth.uid())
    ),
    'wholesalers', (
      SELECT jsonb_object_agg(o.id, jsonb_build_object('name', w.name, 'slug', w.slug, 'logo_url', w.logo_url, 'city', w.city, 'rating', w.rating, 'owner_id', w.owner_id))
      FROM b2b_rfq_offers o
      JOIN b2b_wholesalers w ON w.id = o.wholesaler_id
      WHERE o.rfq_id = r.id
        AND (r.buyer_id = auth.uid() OR is_b2b_admin() OR w.owner_id = auth.uid())
    )
  )
  FROM b2b_rfps r
  LEFT JOIN b2b_members m ON m.user_id = r.buyer_id
  WHERE r.id = p_rfq_id
    AND (r.buyer_id = auth.uid() OR is_b2b_admin()
      OR (r.status IN ('open', 'awarded')
          AND EXISTS (SELECT 1 FROM b2b_wholesalers w WHERE w.owner_id = auth.uid() AND w.is_active)));
$$;

-- RPC: Toptancı ilana teklif verir (her toptancıya tek teklif).
CREATE OR REPLACE FUNCTION submit_b2b_rfq_offer(
  p_rfq_id uuid, p_unit_price numeric, p_currency text, p_lead_time_days integer, p_note text
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE store uuid; offer_id uuid;
BEGIN
  SELECT id INTO store FROM b2b_wholesalers WHERE owner_id = auth.uid() AND is_active;
  IF store IS NULL THEN RAISE EXCEPTION 'Aktif toptancı hesabı gerekli'; END IF;
  IF p_unit_price IS NULL OR p_unit_price <= 0 THEN RAISE EXCEPTION 'Teklif fiyatı sıfırdan büyük olmalı'; END IF;
  IF p_currency NOT IN ('TRY', 'USD', 'EUR') THEN RAISE EXCEPTION 'Geçersiz para birimi'; END IF;
  IF p_lead_time_days IS NULL OR p_lead_time_days < 0 OR p_lead_time_days > 365 THEN RAISE EXCEPTION 'Geçerli bir tedarik süresi girin'; END IF;
  IF NOT EXISTS (SELECT 1 FROM b2b_rfps WHERE id = p_rfq_id AND status = 'open' AND valid_until >= CURRENT_DATE) THEN
    RAISE EXCEPTION 'İlan açık değil veya süresi dolmuş';
  END IF;
  IF EXISTS (SELECT 1 FROM b2b_rfq_offers WHERE rfq_id = p_rfq_id AND wholesaler_id = store) THEN
    RAISE EXCEPTION 'Bu ilana zaten teklif verdiniz';
  END IF;

  INSERT INTO b2b_rfq_offers(rfq_id, wholesaler_id, unit_price, currency, lead_time_days, note)
  VALUES (p_rfq_id, store, p_unit_price, p_currency, p_lead_time_days, NULLIF(trim(COALESCE(p_note, '')), ''))
  RETURNING id INTO offer_id;
  RETURN offer_id;
END;
$$;

-- RPC: Toptancı teklifini geri çeker.
CREATE OR REPLACE FUNCTION withdraw_b2b_rfq_offer(p_offer_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE b2b_rfq_offers SET status = 'withdrawn', updated_at = now()
  WHERE id = p_offer_id AND status = 'submitted'
    AND owns_b2b_wholesaler(wholesaler_id);
$$;

-- RPC: Alıcı teklifi kabul eder; ilan sonuçlanır, diğer teklifler reddedilir.
CREATE OR REPLACE FUNCTION accept_b2b_rfq_offer(p_offer_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target uuid;
BEGIN
  UPDATE b2b_rfq_offers o SET status = 'accepted', updated_at = now()
  WHERE o.id = p_offer_id AND o.status = 'submitted'
    AND o.rfq_id IN (SELECT id FROM b2b_rfps WHERE buyer_id = auth.uid() AND status = 'open')
  RETURNING o.rfq_id INTO target;
  IF target IS NULL THEN RAISE EXCEPTION 'Teklif bulunamadı veya ilan üzerinde işlem yapılamaz'; END IF;

  UPDATE b2b_rfq_offers SET status = 'declined', updated_at = now()
  WHERE rfq_id = target AND id <> p_offer_id AND status = 'submitted';
  UPDATE b2b_rfps SET status = 'awarded', awarded_offer_id = p_offer_id, updated_at = now()
  WHERE id = target;
END;
$$;

-- RPC: Alıcı ilanını kapatır.
CREATE OR REPLACE FUNCTION cancel_b2b_rfq(p_rfq_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE b2b_rfps SET status = 'cancelled', updated_at = now()
  WHERE id = p_rfq_id AND buyer_id = auth.uid() AND status IN ('open', 'quoted');
$$;

-- Süresi geçen açık ilanlar sorgu anında expired olarak işaretlenir.
CREATE OR REPLACE FUNCTION mark_expired_b2b_rfps()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE b2b_rfps SET status = 'expired', updated_at = now()
  WHERE status = 'open' AND valid_until < CURRENT_DATE;
$$;

REVOKE ALL ON FUNCTION create_b2b_rfq(text, text, text, numeric, text, numeric, text, text, text, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_open_b2b_rfps() FROM PUBLIC;
REVOKE ALL ON FUNCTION list_b2b_rfq_pool() FROM PUBLIC;
REVOKE ALL ON FUNCTION get_b2b_rfq_detail(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION submit_b2b_rfq_offer(uuid, numeric, text, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION withdraw_b2b_rfq_offer(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION accept_b2b_rfq_offer(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_b2b_rfq(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_expired_b2b_rfps() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_b2b_rfq(text, text, text, numeric, text, numeric, text, text, text, date) TO authenticated;
GRANT EXECUTE ON FUNCTION list_open_b2b_rfps() TO authenticated;
GRANT EXECUTE ON FUNCTION list_b2b_rfq_pool() TO authenticated;
GRANT EXECUTE ON FUNCTION get_b2b_rfq_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_b2b_rfq_offer(uuid, numeric, text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION withdraw_b2b_rfq_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_b2b_rfq_offer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_b2b_rfq(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_expired_b2b_rfps() TO authenticated;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE b2b_rfps;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE b2b_rfq_offers;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;

