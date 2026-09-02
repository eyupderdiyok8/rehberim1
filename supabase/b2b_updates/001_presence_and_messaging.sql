-- 001 | Çevrimiçi kullanıcılar ve platform içi mesajlaşma
-- Ön koşul: supabase/b2b_marketplace.sql daha önce çalıştırılmış olmalı.
BEGIN;

ALTER TABLE b2b_members ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

CREATE TABLE IF NOT EXISTS b2b_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wholesaler_id uuid NOT NULL REFERENCES b2b_wholesalers(id) ON DELETE CASCADE,
  trade_request_id uuid UNIQUE REFERENCES b2b_trade_requests(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_b2b_direct_conversation
  ON b2b_conversations(buyer_id, wholesaler_id) WHERE trade_request_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_b2b_conversations_buyer ON b2b_conversations(buyer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_conversations_wholesaler ON b2b_conversations(wholesaler_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS b2b_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES b2b_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 1 AND 3000),
  seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_messages_conversation ON b2b_messages(conversation_id, created_at);

CREATE OR REPLACE FUNCTION touch_b2b_presence()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE b2b_members SET last_seen_at = now(), updated_at = now() WHERE user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION list_online_b2b_members()
RETURNS TABLE (
  member_id uuid, account_type text, business_name text, city text,
  store_id uuid, store_slug text, store_name text, store_rating numeric, last_seen_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION list_b2b_conversations()
RETURNS TABLE (
  id uuid, trade_request_id uuid, counterpart_name text, counterpart_type text,
  product_name text, last_message text, last_message_at timestamptz, unread_count bigint
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM b2b_conversations c WHERE c.id = p_conversation_id
      AND (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin())
  ) THEN RAISE EXCEPTION 'Görüşmeye erişiminiz yok'; END IF;
  UPDATE b2b_messages SET seen_at = now()
  WHERE conversation_id = p_conversation_id AND sender_id <> auth.uid() AND seen_at IS NULL;
END;
$$;

ALTER TABLE b2b_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "b2b_conversation_parties_read" ON b2b_conversations;
CREATE POLICY "b2b_conversation_parties_read" ON b2b_conversations FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin());

DROP POLICY IF EXISTS "b2b_messages_parties_read" ON b2b_messages;
CREATE POLICY "b2b_messages_parties_read" ON b2b_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM b2b_conversations c WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin()))
);
DROP POLICY IF EXISTS "b2b_messages_parties_insert" ON b2b_messages;
CREATE POLICY "b2b_messages_parties_insert" ON b2b_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM b2b_conversations c WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin()))
);

REVOKE ALL ON FUNCTION touch_b2b_presence() FROM PUBLIC;
REVOKE ALL ON FUNCTION list_online_b2b_members() FROM PUBLIC;
REVOKE ALL ON FUNCTION open_b2b_conversation(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION list_b2b_conversations() FROM PUBLIC;
REVOKE ALL ON FUNCTION mark_b2b_conversation_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION touch_b2b_presence() TO authenticated;
GRANT EXECUTE ON FUNCTION list_online_b2b_members() TO authenticated;
GRANT EXECUTE ON FUNCTION open_b2b_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION list_b2b_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_b2b_conversation_read(uuid) TO authenticated;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE b2b_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
