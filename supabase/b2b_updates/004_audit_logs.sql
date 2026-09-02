-- 004 | Toptancı hareket ve denetim kayıtları
-- Ön koşul: 001, 002 ve 003 numaralı güncellemeler çalıştırılmış olmalı.
BEGIN;

CREATE TABLE IF NOT EXISTS b2b_audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid,
  actor_email text,
  actor_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  wholesaler_id uuid,
  summary text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_audit_date ON b2b_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_audit_wholesaler ON b2b_audit_logs(wholesaler_id, created_at DESC);

CREATE OR REPLACE FUNCTION record_b2b_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'store_created'
      WHEN TG_OP = 'DELETE' THEN 'store_deleted' ELSE 'store_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Toptancı mağazası oluşturdu'
      WHEN TG_OP = 'DELETE' THEN 'Toptancı mağazası silindi'
      ELSE 'Mağaza profilini güncelledi' END;
  ELSIF TG_TABLE_NAME = 'b2b_products' THEN
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'product_created'
      WHEN TG_OP = 'DELETE' THEN 'product_deleted' ELSE 'product_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Yeni ürün ekledi: '
      WHEN TG_OP = 'DELETE' THEN 'Ürünü sildi: ' ELSE 'Ürünü güncelledi: ' END
      || COALESCE(payload ->> 'name', 'Ürün');
  ELSIF TG_TABLE_NAME = 'b2b_product_prices' THEN
    SELECT wholesaler_id INTO target_wholesaler
    FROM b2b_products WHERE id = (payload ->> 'product_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'price_created' ELSE 'price_changed' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Ürün fiyatı belirledi: '
      ELSE 'Ürün fiyatını değiştirdi: ' END
      || COALESCE(payload ->> 'price', '0') || ' ' || COALESCE(payload ->> 'currency', 'TRY');
  ELSIF TG_TABLE_NAME = 'b2b_trade_requests' THEN
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'trade_started' ELSE 'trade_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Yeni satın alma görüşmesi başladı'
      ELSE 'Ticaret durumunu güncelledi: ' || COALESCE(payload ->> 'status', '') END;
  ELSIF TG_TABLE_NAME = 'b2b_ads' THEN
    IF TG_OP = 'UPDATE'
      AND (to_jsonb(NEW) - 'impressions' - 'clicks' - 'updated_at')
        = (to_jsonb(OLD) - 'impressions' - 'clicks' - 'updated_at') THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'ad_created' ELSE 'ad_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Reklam kampanyası oluşturdu: '
      ELSE 'Reklam kampanyasını güncelledi: ' END || COALESCE(payload ->> 'title', 'Kampanya');
  ELSIF TG_TABLE_NAME = 'b2b_messages' THEN
    SELECT c.wholesaler_id INTO target_wholesaler
    FROM b2b_conversations c WHERE c.id = (payload ->> 'conversation_id')::uuid;
    activity := 'message_sent';
    activity_summary := 'Sistem içi mesaj gönderdi';
    safe_previous := NULL;
    safe_current := jsonb_build_object(
      'conversation_id', payload ->> 'conversation_id',
      'sender_id', payload ->> 'sender_id',
      'created_at', payload ->> 'created_at'
    );
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO b2b_audit_logs(
    actor_id, actor_email, actor_name, action, entity_type, entity_id,
    wholesaler_id, summary, old_data, new_data
  ) VALUES (
    auth.uid(), auth.jwt() ->> 'email',
    (SELECT business_name FROM b2b_members WHERE user_id = auth.uid()),
    activity, TG_TABLE_NAME, COALESCE(payload ->> 'id', payload ->> 'product_id'),
    target_wholesaler, activity_summary, safe_previous, safe_current
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_audit_wholesalers ON b2b_wholesalers;
CREATE TRIGGER trg_b2b_audit_wholesalers AFTER INSERT OR UPDATE OR DELETE ON b2b_wholesalers
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_products ON b2b_products;
CREATE TRIGGER trg_b2b_audit_products AFTER INSERT OR UPDATE OR DELETE ON b2b_products
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_prices ON b2b_product_prices;
CREATE TRIGGER trg_b2b_audit_prices AFTER INSERT OR UPDATE ON b2b_product_prices
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_trades ON b2b_trade_requests;
CREATE TRIGGER trg_b2b_audit_trades AFTER INSERT OR UPDATE ON b2b_trade_requests
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_ads ON b2b_ads;
CREATE TRIGGER trg_b2b_audit_ads AFTER INSERT OR UPDATE ON b2b_ads
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();
DROP TRIGGER IF EXISTS trg_b2b_audit_messages ON b2b_messages;
CREATE TRIGGER trg_b2b_audit_messages AFTER INSERT ON b2b_messages
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

ALTER TABLE b2b_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_audit_admin_read" ON b2b_audit_logs;
CREATE POLICY "b2b_audit_admin_read" ON b2b_audit_logs
  FOR SELECT TO authenticated USING (is_b2b_admin());

COMMIT;

