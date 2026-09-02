-- 005 | Mesaj görüşmesini kullanıcı bazında silme/gizleme
-- Ön koşul: 001_presence_and_messaging.sql çalıştırılmış olmalı.
BEGIN;

ALTER TABLE b2b_conversations ADD COLUMN IF NOT EXISTS buyer_deleted_at timestamptz;
ALTER TABLE b2b_conversations ADD COLUMN IF NOT EXISTS wholesaler_deleted_at timestamptz;

CREATE OR REPLACE FUNCTION delete_b2b_conversation(p_conversation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_conversation b2b_conversations%ROWTYPE;
BEGIN
  SELECT * INTO target_conversation FROM b2b_conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Görüşme bulunamadı'; END IF;

  IF target_conversation.buyer_id = auth.uid() THEN
    UPDATE b2b_conversations SET buyer_deleted_at = now(), updated_at = now()
    WHERE id = p_conversation_id;
  ELSIF owns_b2b_wholesaler(target_conversation.wholesaler_id) OR is_b2b_admin() THEN
    UPDATE b2b_conversations SET wholesaler_deleted_at = now(), updated_at = now()
    WHERE id = p_conversation_id;
  ELSE
    RAISE EXCEPTION 'Bu görüşmeyi silme yetkiniz yok';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION restore_b2b_conversation_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE b2b_conversations SET
    buyer_deleted_at = NULL,
    wholesaler_deleted_at = NULL,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_restore_conversation ON b2b_messages;
CREATE TRIGGER trg_b2b_restore_conversation
AFTER INSERT ON b2b_messages
FOR EACH ROW EXECUTE FUNCTION restore_b2b_conversation_on_message();

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
  ELSE
    UPDATE b2b_conversations SET
      buyer_deleted_at = CASE WHEN target_buyer = auth.uid() THEN NULL ELSE buyer_deleted_at END,
      wholesaler_deleted_at = CASE WHEN owns_b2b_wholesaler(target_wholesaler) OR is_b2b_admin() THEN NULL ELSE wholesaler_deleted_at END,
      updated_at = now()
    WHERE id = conversation_id;
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
  WHERE (c.buyer_id = auth.uid() OR owns_b2b_wholesaler(c.wholesaler_id) OR is_b2b_admin())
    AND CASE
      WHEN c.buyer_id = auth.uid() THEN c.buyer_deleted_at IS NULL
      ELSE c.wholesaler_deleted_at IS NULL
    END
  ORDER BY COALESCE((SELECT created_at FROM b2b_messages lm WHERE lm.conversation_id = c.id ORDER BY lm.created_at DESC LIMIT 1), c.created_at) DESC;
$$;

REVOKE ALL ON FUNCTION delete_b2b_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_b2b_conversation(uuid) TO authenticated;

COMMIT;

