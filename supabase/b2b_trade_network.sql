-- ============================================================
-- B2B trade network: presence, messaging, quote lifecycle & ads
-- Run after supabase/b2b_marketplace.sql.
-- Safe to run more than once.
-- ============================================================

ALTER TABLE b2b_members ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quoted_unit_price numeric(12,2) CHECK (quoted_unit_price >= 0);
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quoted_currency text CHECK (quoted_currency IN ('TRY', 'USD', 'EUR'));
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quote_note text CHECK (char_length(quote_note) <= 2000);
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quote_valid_until timestamptz;
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE TABLE IF NOT EXISTS b2b_conversations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wholesaler_id      uuid NOT NULL REFERENCES b2b_wholesalers(id) ON DELETE CASCADE,
  trade_request_id   uuid UNIQUE REFERENCES b2b_trade_requests(id) ON DELETE SET NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_b2b_direct_conversation
  ON b2b_conversations(buyer_id, wholesaler_id)
  WHERE trade_request_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_b2b_conversations_buyer ON b2b_conversations(buyer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_conversations_wholesaler ON b2b_conversations(wholesaler_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS b2b_messages (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id    uuid NOT NULL REFERENCES b2b_conversations(id) ON DELETE CASCADE,
  sender_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body                text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 3000),
  seen_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_messages_conversation ON b2b_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS b2b_ads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id      uuid NOT NULL REFERENCES b2b_wholesalers(id) ON DELETE CASCADE,
  ad_type            text NOT NULL CHECK (ad_type IN ('notification', 'popup')),
  title              text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 90),
  body               text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 240),
  image_url          text,
  cta_label          text NOT NULL DEFAULT 'İncele' CHECK (char_length(cta_label) BETWEEN 2 AND 30),
  target_url         text NOT NULL CHECK (target_url LIKE '/b2b/%'),
  status             text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('draft', 'pending', 'approved', 'active', 'paused', 'rejected', 'expired')),
  starts_at          timestamptz NOT NULL,
  ends_at            timestamptz NOT NULL,
  daily_budget       numeric(12,2) CHECK (daily_budget IS NULL OR daily_budget >= 0),
  total_budget       numeric(12,2) CHECK (total_budget IS NULL OR total_budget >= 0),
  impressions        bigint NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  clicks             bigint NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  admin_note         text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_b2b_ads_active ON b2b_ads(ad_type, status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_b2b_ads_wholesaler ON b2b_ads(wholesaler_id, created_at DESC);

CREATE TABLE IF NOT EXISTS b2b_audit_logs (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id           uuid,
  actor_email        text,
  actor_name         text,
  action             text NOT NULL,
  entity_type        text NOT NULL,
  entity_id          text,
  wholesaler_id      uuid,
  summary            text NOT NULL,
  old_data           jsonb,
  new_data           jsonb,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_audit_date ON b2b_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_audit_wholesaler ON b2b_audit_logs(wholesaler_id, created_at DESC);

CREATE OR REPLACE FUNCTION record_b2b_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  previous jsonb := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  current jsonb := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  payload jsonb := COALESCE(current, previous);
  target_wholesaler uuid;
  activity text;
  activity_summary text;
  safe_previous jsonb := previous;
  safe_current jsonb := current;
BEGIN
  IF TG_TABLE_NAME = 'b2b_wholesalers' THEN
    target_wholesaler := (payload ->> 'id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'store_created' WHEN TG_OP = 'DELETE' THEN 'store_deleted' ELSE 'store_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Toptancı mağazası oluşturdu' WHEN TG_OP = 'DELETE' THEN 'Toptancı mağazası silindi' ELSE 'Mağaza profilini güncelledi' END;
  ELSIF TG_TABLE_NAME = 'b2b_products' THEN
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'product_created' WHEN TG_OP = 'DELETE' THEN 'product_deleted' ELSE 'product_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Yeni ürün ekledi: ' WHEN TG_OP = 'DELETE' THEN 'Ürünü sildi: ' ELSE 'Ürünü güncelledi: ' END || COALESCE(payload ->> 'name', 'Ürün');
  ELSIF TG_TABLE_NAME = 'b2b_product_prices' THEN
    SELECT wholesaler_id INTO target_wholesaler FROM b2b_products WHERE id = (payload ->> 'product_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'price_created' ELSE 'price_changed' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Ürün fiyatı belirledi: ' ELSE 'Ürün fiyatını değiştirdi: ' END || COALESCE(payload ->> 'price', '0') || ' ' || COALESCE(payload ->> 'currency', 'TRY');
  ELSIF TG_TABLE_NAME = 'b2b_trade_requests' THEN
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'trade_started' ELSE 'trade_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Yeni satın alma görüşmesi başladı' ELSE 'Ticaret durumunu güncelledi: ' || COALESCE(payload ->> 'status', '') END;
  ELSIF TG_TABLE_NAME = 'b2b_ads' THEN
    IF TG_OP = 'UPDATE' AND (to_jsonb(NEW) - 'impressions' - 'clicks' - 'updated_at') = (to_jsonb(OLD) - 'impressions' - 'clicks' - 'updated_at') THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'ad_created' ELSE 'ad_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Reklam kampanyası oluşturdu: ' ELSE 'Reklam kampanyasını güncelledi: ' END || COALESCE(payload ->> 'title', 'Kampanya');
  ELSIF TG_TABLE_NAME = 'b2b_messages' THEN
    SELECT c.wholesaler_id INTO target_wholesaler FROM b2b_conversations c WHERE c.id = (payload ->> 'conversation_id')::uuid;
    activity := 'message_sent';
    activity_summary := 'Sistem içi mesaj gönderdi';
    safe_previous := NULL;
    safe_current := jsonb_build_object('conversation_id', payload ->> 'conversation_id', 'sender_id', payload ->> 'sender_id', 'created_at', payload ->> 'created_at');
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO b2b_audit_logs(actor_id, actor_email, actor_name, action, entity_type, entity_id, wholesaler_id, summary, old_data, new_data)
  VALUES (
    auth.uid(), auth.jwt() ->> 'email',
    (SELECT business_name FROM b2b_members WHERE user_id = auth.uid()),
    activity, TG_TABLE_NAME, COALESCE(payload ->> 'id', payload ->> 'product_id'), target_wholesaler,
    activity_summary, safe_previous, safe_current
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_audit_wholesalers ON b2b_wholesalers;
CREATE TRIGGER trg_b2b_audit_wholesalers AFTER INSERT OR UPDATE OR DELETE ON b2b_wholesalers FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_products ON b2b_products;
CREATE TRIGGER trg_b2b_audit_products AFTER INSERT OR UPDATE OR DELETE ON b2b_products FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_prices ON b2b_product_prices;
CREATE TRIGGER trg_b2b_audit_prices AFTER INSERT OR UPDATE ON b2b_product_prices FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_trades ON b2b_trade_requests;
CREATE TRIGGER trg_b2b_audit_trades AFTER INSERT OR UPDATE ON b2b_trade_requests FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_ads ON b2b_ads;
CREATE TRIGGER trg_b2b_audit_ads AFTER INSERT OR UPDATE ON b2b_ads FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_messages ON b2b_messages;
CREATE TRIGGER trg_b2b_audit_messages AFTER INSERT ON b2b_messages FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

CREATE OR REPLACE FUNCTION touch_b2b_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE b2b_members SET last_seen_at = now(), updated_at = now() WHERE user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION list_online_b2b_members()
RETURNS TABLE (
  member_id uuid,
  account_type text,
  business_name text,
  city text,
  store_id uuid,
  store_slug text,
  store_name text,
  store_rating numeric,
  last_seen_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.user_id, m.account_type, COALESCE(m.business_name, 'Doğrulanmış esnaf'), m.city,
         w.id, w.slug, w.name, w.rating, m.last_seen_at
  FROM b2b_members m
  LEFT JOIN b2b_wholesalers w ON w.owner_id = m.user_id AND w.is_active
  WHERE m.verification_status = 'verified'
    AND m.last_seen_at > now() - interval '5 minutes'
    AND is_verified_b2b_buyer()
  ORDER BY m.last_seen_at DESC;
$$;

CREATE OR REPLACE FUNCTION open_b2b_conversation(p_wholesaler_id uuid, p_trade_request_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_buyer uuid := auth.uid();
  target_wholesaler uuid := p_wholesaler_id;
  conversation_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT is_verified_b2b_buyer() THEN
    RAISE EXCEPTION 'Mesajlaşmak için doğrulanmış işletme hesabı gerekir';
  END IF;

  IF p_trade_request_id IS NOT NULL THEN
    SELECT buyer_id, wholesaler_id INTO target_buyer, target_wholesaler
    FROM b2b_trade_requests
    WHERE id = p_trade_request_id
      AND (buyer_id = auth.uid() OR owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());
    IF NOT FOUND THEN RAISE EXCEPTION 'Ticaret görüşmesi bulunamadı'; END IF;
  ELSIF owns_b2b_wholesaler(p_wholesaler_id) THEN
    RAISE EXCEPTION 'Kendi mağazanıza mesaj gönderemezsiniz';
  END IF;

  SELECT id INTO conversation_id FROM b2b_conversations
  WHERE buyer_id = target_buyer AND wholesaler_id = target_wholesaler
    AND ((trade_request_id = p_trade_request_id) OR (trade_request_id IS NULL AND p_trade_request_id IS NULL))
  LIMIT 1;

  IF conversation_id IS NULL THEN
    INSERT INTO b2b_conversations(buyer_id, wholesaler_id, trade_request_id)
    VALUES (target_buyer, target_wholesaler, p_trade_request_id)
    RETURNING id INTO conversation_id;
  END IF;
  RETURN conversation_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_b2b_trade_request(p_product_id uuid, p_quantity numeric, p_message text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_wholesaler uuid;
  minimum_quantity numeric;
  request_id uuid;
  conversation_id uuid;
BEGIN
  IF NOT is_verified_b2b_buyer() THEN RAISE EXCEPTION 'Doğrulanmış işletme hesabı gerekir'; END IF;
  SELECT wholesaler_id, minimum_order_quantity INTO target_wholesaler, minimum_quantity
  FROM b2b_products WHERE id = p_product_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ürün bulunamadı'; END IF;
  IF p_quantity < minimum_quantity THEN RAISE EXCEPTION 'Minimum sipariş miktarının altında'; END IF;
  IF char_length(trim(COALESCE(p_message, ''))) < 3 THEN RAISE EXCEPTION 'Satıcıya kısa bir not yazın'; END IF;

  INSERT INTO b2b_trade_requests(product_id, buyer_id, wholesaler_id, quantity)
  VALUES (p_product_id, auth.uid(), target_wholesaler, p_quantity)
  RETURNING id INTO request_id;

  INSERT INTO b2b_conversations(buyer_id, wholesaler_id, trade_request_id)
  VALUES (auth.uid(), target_wholesaler, request_id)
  RETURNING id INTO conversation_id;

  INSERT INTO b2b_messages(conversation_id, sender_id, body)
  VALUES (conversation_id, auth.uid(), trim(p_message));
  RETURN request_id;
END;
$$;

CREATE OR REPLACE FUNCTION list_b2b_conversations()
RETURNS TABLE (
  id uuid,
  trade_request_id uuid,
  counterpart_name text,
  counterpart_type text,
  product_name text,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.trade_request_id,
    CASE WHEN c.buyer_id = auth.uid() THEN w.name ELSE COALESCE(m.business_name, 'Doğrulanmış esnaf') END,
    CASE WHEN c.buyer_id = auth.uid() THEN 'wholesaler' ELSE 'buyer' END,
    p.name,
    (SELECT body FROM b2b_messages lm WHERE lm.conversation_id = c.id ORDER BY lm.created_at DESC LIMIT 1),
    COALESCE((SELECT created_at FROM b2b_messages lm WHERE lm.conversation_id = c.id ORDER BY lm.created_at DESC LIMIT 1), c.created_at),
    (SELECT count(*) FROM b2b_messages um WHERE um.conversation_id = c.id AND um.sender_id <> auth.uid() AND um.seen_at IS NULL)
  FROM b2b_conversations c
  JOIN b2b_wholesalers w ON w.id = c.wholesaler_id
  LEFT JOIN b2b_members m ON m.user_id = c.buyer_id
  LEFT JOIN b2b_trade_requests tr ON tr.id = c.trade_request_id
  LEFT JOIN b2b_products p ON p.id = tr.product_id
  WHERE c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin()
  ORDER BY COALESCE((SELECT created_at FROM b2b_messages lm WHERE lm.conversation_id = c.id ORDER BY lm.created_at DESC LIMIT 1), c.created_at) DESC;
$$;

CREATE OR REPLACE FUNCTION mark_b2b_conversation_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM b2b_conversations c WHERE c.id = p_conversation_id AND (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin())) THEN
    RAISE EXCEPTION 'Görüşmeye erişiminiz yok';
  END IF;
  UPDATE b2b_messages SET seen_at = now() WHERE conversation_id = p_conversation_id AND sender_id <> auth.uid() AND seen_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION submit_b2b_quote(
  p_request_id uuid,
  p_unit_price numeric,
  p_currency text,
  p_note text,
  p_valid_until timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE conversation_id uuid;
BEGIN
  IF p_unit_price <= 0 OR p_currency NOT IN ('TRY', 'USD', 'EUR') THEN RAISE EXCEPTION 'Teklif bilgileri geçersiz'; END IF;
  UPDATE b2b_trade_requests SET status = 'quoted', quoted_unit_price = p_unit_price,
    quoted_currency = p_currency, quote_note = NULLIF(trim(p_note), ''), quote_valid_until = p_valid_until, updated_at = now()
  WHERE id = p_request_id AND status IN ('requested', 'quoted')
    AND (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());
  IF NOT FOUND THEN RAISE EXCEPTION 'Talep bulunamadı veya teklif verilemez'; END IF;
  SELECT id INTO conversation_id FROM b2b_conversations WHERE trade_request_id = p_request_id;
  IF conversation_id IS NOT NULL THEN
    INSERT INTO b2b_messages(conversation_id, sender_id, body)
    VALUES (conversation_id, auth.uid(), 'Teklif hazır: ' || p_unit_price || ' ' || p_currency || ' / birim' || CASE WHEN trim(COALESCE(p_note,'')) = '' THEN '' ELSE E'\n' || trim(p_note) END);
    UPDATE b2b_conversations SET updated_at = now() WHERE id = conversation_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION respond_to_b2b_quote(p_request_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE conversation_id uuid;
BEGIN
  IF p_status NOT IN ('accepted', 'cancelled') THEN RAISE EXCEPTION 'Geçersiz yanıt'; END IF;
  UPDATE b2b_trade_requests SET status = p_status,
    accepted_at = CASE WHEN p_status = 'accepted' THEN now() ELSE accepted_at END, updated_at = now()
  WHERE id = p_request_id AND buyer_id = auth.uid() AND status IN ('requested', 'quoted');
  IF NOT FOUND THEN RAISE EXCEPTION 'Teklif bulunamadı veya yanıtlanamaz'; END IF;
  SELECT id INTO conversation_id FROM b2b_conversations WHERE trade_request_id = p_request_id;
  IF conversation_id IS NOT NULL THEN
    INSERT INTO b2b_messages(conversation_id, sender_id, body)
    VALUES (conversation_id, auth.uid(), CASE WHEN p_status = 'accepted' THEN 'Teklifi kabul ettim. Sipariş detaylarını netleştirebiliriz.' ELSE 'Bu satın alma görüşmesini kapattım.' END);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_own_b2b_trade_request(p_request_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('completed', 'cancelled', 'disputed') THEN RAISE EXCEPTION 'Geçersiz görüşme durumu'; END IF;
  UPDATE b2b_trade_requests SET status = p_status,
    completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE id = p_request_id
    AND (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
    AND ((p_status = 'completed' AND status = 'accepted') OR (p_status <> 'completed' AND status IN ('requested', 'quoted', 'accepted')));
  IF NOT FOUND THEN RAISE EXCEPTION 'Görüşme bulunamadı veya bu adıma geçirilemez'; END IF;
END;
$$;

DROP FUNCTION IF EXISTS list_own_b2b_trade_requests();
CREATE FUNCTION list_own_b2b_trade_requests()
RETURNS TABLE (
  id uuid, product_name text, buyer_user_id uuid, buyer_business_name text, quantity numeric, unit text,
  status text, created_at timestamptz, review_submitted boolean, quoted_unit_price numeric,
  quoted_currency text, quote_note text, quote_valid_until timestamptz, conversation_id uuid
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tr.id, p.name, tr.buyer_id, COALESCE(m.business_name, 'Doğrulanmış esnaf'), tr.quantity, p.unit,
    tr.status, tr.created_at, EXISTS (SELECT 1 FROM b2b_reviews r WHERE r.trade_request_id = tr.id AND r.reviewer_id = auth.uid()),
    tr.quoted_unit_price, tr.quoted_currency, tr.quote_note, tr.quote_valid_until, c.id
  FROM b2b_trade_requests tr JOIN b2b_products p ON p.id = tr.product_id
  LEFT JOIN b2b_members m ON m.user_id = tr.buyer_id LEFT JOIN b2b_conversations c ON c.trade_request_id = tr.id
  WHERE owns_b2b_wholesaler(tr.wholesaler_id) OR is_b2b_admin() ORDER BY tr.created_at DESC;
$$;

DROP FUNCTION IF EXISTS list_my_b2b_trade_requests();
CREATE FUNCTION list_my_b2b_trade_requests()
RETURNS TABLE (
  id uuid, product_name text, wholesaler_name text, wholesaler_owner_id uuid, quantity numeric, unit text,
  status text, created_at timestamptz, review_submitted boolean, quoted_unit_price numeric,
  quoted_currency text, quote_note text, quote_valid_until timestamptz, conversation_id uuid
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT tr.id, p.name, w.name, w.owner_id, tr.quantity, p.unit, tr.status, tr.created_at,
    EXISTS (SELECT 1 FROM b2b_reviews r WHERE r.trade_request_id = tr.id AND r.reviewer_id = auth.uid()),
    tr.quoted_unit_price, tr.quoted_currency, tr.quote_note, tr.quote_valid_until, c.id
  FROM b2b_trade_requests tr JOIN b2b_products p ON p.id = tr.product_id
  JOIN b2b_wholesalers w ON w.id = tr.wholesaler_id LEFT JOIN b2b_conversations c ON c.trade_request_id = tr.id
  WHERE tr.buyer_id = auth.uid() ORDER BY tr.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION track_b2b_ad(p_ad_id uuid, p_event text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_event NOT IN ('impression', 'click') THEN RETURN; END IF;
  UPDATE b2b_ads SET impressions = impressions + CASE WHEN p_event = 'impression' THEN 1 ELSE 0 END,
    clicks = clicks + CASE WHEN p_event = 'click' THEN 1 ELSE 0 END
  WHERE id = p_ad_id AND status IN ('approved', 'active') AND starts_at <= now() AND ends_at >= now();
END;
$$;

ALTER TABLE b2b_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "b2b_conversation_parties_read" ON b2b_conversations;
CREATE POLICY "b2b_conversation_parties_read" ON b2b_conversations FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());

DROP POLICY IF EXISTS "b2b_messages_parties_read" ON b2b_messages;
CREATE POLICY "b2b_messages_parties_read" ON b2b_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM b2b_conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin()))
);
DROP POLICY IF EXISTS "b2b_messages_parties_insert" ON b2b_messages;
CREATE POLICY "b2b_messages_parties_insert" ON b2b_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM b2b_conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin()))
);

DROP POLICY IF EXISTS "b2b_ads_owner_read" ON b2b_ads;
CREATE POLICY "b2b_ads_owner_read" ON b2b_ads FOR SELECT TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin() OR (status IN ('approved', 'active') AND starts_at <= now() AND ends_at >= now()));
DROP POLICY IF EXISTS "b2b_ads_owner_insert" ON b2b_ads;
CREATE POLICY "b2b_ads_owner_insert" ON b2b_ads FOR INSERT TO authenticated
  WITH CHECK (owns_b2b_wholesaler(wholesaler_id) AND status = 'pending');
DROP POLICY IF EXISTS "b2b_ads_owner_update" ON b2b_ads;
CREATE POLICY "b2b_ads_owner_update" ON b2b_ads FOR UPDATE TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
  WITH CHECK (is_b2b_admin() OR (owns_b2b_wholesaler(wholesaler_id) AND status IN ('draft', 'pending', 'paused')));
DROP POLICY IF EXISTS "b2b_ads_admin_delete" ON b2b_ads;
CREATE POLICY "b2b_ads_admin_delete" ON b2b_ads FOR DELETE TO authenticated USING (is_b2b_admin());

DROP POLICY IF EXISTS "b2b_audit_admin_read" ON b2b_audit_logs;
CREATE POLICY "b2b_audit_admin_read" ON b2b_audit_logs FOR SELECT TO authenticated USING (is_b2b_admin());

REVOKE ALL ON FUNCTION touch_b2b_presence() FROM PUBLIC;
REVOKE ALL ON FUNCTION list_online_b2b_members() FROM PUBLIC;
REVOKE ALL ON FUNCTION open_b2b_conversation(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_b2b_trade_request(uuid, numeric, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_b2b_conversations() FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_b2b_conversation_read(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION submit_b2b_quote(uuid, numeric, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION respond_to_b2b_quote(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_own_b2b_trade_requests() FROM PUBLIC;
REVOKE ALL ON FUNCTION list_my_b2b_trade_requests() FROM PUBLIC;
REVOKE ALL ON FUNCTION track_b2b_ad(uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION touch_b2b_presence() TO authenticated;
GRANT EXECUTE ON FUNCTION list_online_b2b_members() TO authenticated;
GRANT EXECUTE ON FUNCTION open_b2b_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_b2b_trade_request(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION list_b2b_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_b2b_conversation_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_b2b_quote(uuid, numeric, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_b2b_quote(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION list_own_b2b_trade_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION list_my_b2b_trade_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION track_b2b_ad(uuid, text) TO authenticated;

-- Realtime is optional in the client (it also polls). Ignore duplicate publication membership.
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE b2b_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
