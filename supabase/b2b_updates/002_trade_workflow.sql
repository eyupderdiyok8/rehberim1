-- 002 | Satın alma görüşmesi, özel teklif, kabul/red ve tamamlama akışı
-- Ön koşul: 001_presence_and_messaging.sql çalıştırılmış olmalı.
BEGIN;

ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quoted_unit_price numeric(12,2) CHECK (quoted_unit_price >= 0);
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quoted_currency text CHECK (quoted_currency IN ('TRY', 'USD', 'EUR'));
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quote_note text CHECK (char_length(quote_note) <= 2000);
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS quote_valid_until timestamptz;
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE b2b_trade_requests ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE OR REPLACE FUNCTION create_b2b_trade_request(p_product_id uuid, p_quantity numeric, p_message text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION submit_b2b_quote(
  p_request_id uuid, p_unit_price numeric, p_currency text, p_note text, p_valid_until timestamptz
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE conversation_id uuid;
BEGIN
  IF p_unit_price <= 0 OR p_currency NOT IN ('TRY', 'USD', 'EUR') THEN
    RAISE EXCEPTION 'Teklif bilgileri geçersiz';
  END IF;
  UPDATE b2b_trade_requests SET
    status = 'quoted', quoted_unit_price = p_unit_price, quoted_currency = p_currency,
    quote_note = NULLIF(trim(p_note), ''), quote_valid_until = p_valid_until, updated_at = now()
  WHERE id = p_request_id AND status IN ('requested', 'quoted')
    AND (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());
  IF NOT FOUND THEN RAISE EXCEPTION 'Talep bulunamadı veya teklif verilemez'; END IF;
  SELECT id INTO conversation_id FROM b2b_conversations WHERE trade_request_id = p_request_id;
  IF conversation_id IS NOT NULL THEN
    INSERT INTO b2b_messages(conversation_id, sender_id, body)
    VALUES (conversation_id, auth.uid(), 'Teklif hazır: ' || p_unit_price || ' ' || p_currency || ' / birim' ||
      CASE WHEN trim(COALESCE(p_note,'')) = '' THEN '' ELSE E'\n' || trim(p_note) END);
    UPDATE b2b_conversations SET updated_at = now() WHERE id = conversation_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION respond_to_b2b_quote(p_request_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
    VALUES (conversation_id, auth.uid(), CASE WHEN p_status = 'accepted'
      THEN 'Teklifi kabul ettim. Sipariş detaylarını netleştirebiliriz.'
      ELSE 'Bu satın alma görüşmesini kapattım.' END);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION update_own_b2b_trade_request(p_request_id uuid, p_status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_status NOT IN ('completed', 'cancelled', 'disputed') THEN
    RAISE EXCEPTION 'Geçersiz görüşme durumu';
  END IF;
  UPDATE b2b_trade_requests SET status = p_status,
    completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE completed_at END, updated_at = now()
  WHERE id = p_request_id
    AND (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
    AND ((p_status = 'completed' AND status = 'accepted')
      OR (p_status <> 'completed' AND status IN ('requested', 'quoted', 'accepted')));
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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tr.id, p.name, tr.buyer_id, COALESCE(m.business_name, 'Doğrulanmış esnaf'), tr.quantity, p.unit,
    tr.status, tr.created_at,
    EXISTS (SELECT 1 FROM b2b_reviews r WHERE r.trade_request_id = tr.id AND r.reviewer_id = auth.uid()),
    tr.quoted_unit_price, tr.quoted_currency, tr.quote_note, tr.quote_valid_until, c.id
  FROM b2b_trade_requests tr
  JOIN b2b_products p ON p.id = tr.product_id
  LEFT JOIN b2b_members m ON m.user_id = tr.buyer_id
  LEFT JOIN b2b_conversations c ON c.trade_request_id = tr.id
  WHERE owns_b2b_wholesaler(tr.wholesaler_id) OR is_b2b_admin()
  ORDER BY tr.created_at DESC;
$$;

DROP FUNCTION IF EXISTS list_my_b2b_trade_requests();
CREATE FUNCTION list_my_b2b_trade_requests()
RETURNS TABLE (
  id uuid, product_name text, wholesaler_name text, wholesaler_owner_id uuid, quantity numeric, unit text,
  status text, created_at timestamptz, review_submitted boolean, quoted_unit_price numeric,
  quoted_currency text, quote_note text, quote_valid_until timestamptz, conversation_id uuid
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tr.id, p.name, w.name, w.owner_id, tr.quantity, p.unit, tr.status, tr.created_at,
    EXISTS (SELECT 1 FROM b2b_reviews r WHERE r.trade_request_id = tr.id AND r.reviewer_id = auth.uid()),
    tr.quoted_unit_price, tr.quoted_currency, tr.quote_note, tr.quote_valid_until, c.id
  FROM b2b_trade_requests tr
  JOIN b2b_products p ON p.id = tr.product_id
  JOIN b2b_wholesalers w ON w.id = tr.wholesaler_id
  LEFT JOIN b2b_conversations c ON c.trade_request_id = tr.id
  WHERE tr.buyer_id = auth.uid()
  ORDER BY tr.created_at DESC;
$$;

REVOKE ALL ON FUNCTION create_b2b_trade_request(uuid, numeric, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION submit_b2b_quote(uuid, numeric, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION respond_to_b2b_quote(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_own_b2b_trade_requests() FROM PUBLIC;
REVOKE ALL ON FUNCTION list_my_b2b_trade_requests() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_b2b_trade_request(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_b2b_quote(uuid, numeric, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_b2b_quote(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION list_own_b2b_trade_requests() TO authenticated;
GRANT EXECUTE ON FUNCTION list_my_b2b_trade_requests() TO authenticated;

COMMIT;

