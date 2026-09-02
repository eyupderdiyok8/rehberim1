-- 006 | Gerçek zamanlı kullanıcı bildirim merkezi
-- Ön koşul: 001, 002, 003 ve 005 numaralı güncellemeler çalıştırılmış olmalı.
BEGIN;

CREATE TABLE IF NOT EXISTS b2b_notifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('message', 'trade', 'verification', 'advertising', 'system')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  body text NOT NULL CHECK (char_length(body) BETWEEN 2 AND 500),
  href text CHECK (href IS NULL OR href LIKE '/b2b/%'),
  entity_type text,
  entity_id text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_b2b_notifications_recipient
  ON b2b_notifications(recipient_id, read_at, created_at DESC);

ALTER TABLE b2b_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_notifications_own_read" ON b2b_notifications;
CREATE POLICY "b2b_notifications_own_read" ON b2b_notifications
  FOR SELECT TO authenticated USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS "b2b_notifications_own_update" ON b2b_notifications;
CREATE POLICY "b2b_notifications_own_update" ON b2b_notifications
  FOR UPDATE TO authenticated USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE OR REPLACE FUNCTION create_b2b_event_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_user uuid;
  target_title text;
  target_body text;
  target_href text;
  target_kind text;
  target_entity_type text := TG_TABLE_NAME;
  target_entity_id text;
  conversation_row b2b_conversations%ROWTYPE;
  store_owner uuid;
BEGIN
  IF TG_TABLE_NAME = 'b2b_messages' THEN
    -- Teklif ve durum RPC'leri ayrıca mesaj satırı oluşturur. Aynı olay için iki
    -- bildirim göstermemek amacıyla bu sistem mesajlarını ticaret tetikleyicisi yönetir.
    IF NEW.body LIKE 'Teklif hazır:%'
      OR NEW.body = 'Teklifi kabul ettim. Sipariş detaylarını netleştirebiliriz.'
      OR NEW.body = 'Bu satın alma görüşmesini kapattım.' THEN
      RETURN NEW;
    END IF;
    SELECT * INTO conversation_row FROM b2b_conversations WHERE id = NEW.conversation_id;
    SELECT owner_id INTO store_owner FROM b2b_wholesalers WHERE id = conversation_row.wholesaler_id;
    target_user := CASE WHEN NEW.sender_id = conversation_row.buyer_id THEN store_owner ELSE conversation_row.buyer_id END;
    target_kind := 'message';
    target_title := 'Yeni mesajınız var';
    target_body := left(NEW.body, 160);
    target_href := '/b2b/mesajlar?conversation=' || NEW.conversation_id;
    target_entity_id := NEW.conversation_id::text;
  ELSIF TG_TABLE_NAME = 'b2b_trade_requests' AND TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT owner_id INTO store_owner FROM b2b_wholesalers WHERE id = NEW.wholesaler_id;
    target_user := CASE
      WHEN NEW.status = 'quoted' THEN NEW.buyer_id
      WHEN auth.uid() = NEW.buyer_id THEN store_owner
      ELSE NEW.buyer_id
    END;
    target_kind := 'trade';
    target_title := CASE NEW.status
      WHEN 'quoted' THEN 'Toptancı teklifini gönderdi'
      WHEN 'accepted' THEN 'Teklif kabul edildi'
      WHEN 'completed' THEN 'Ticaret tamamlandı'
      WHEN 'cancelled' THEN 'Görüşme kapatıldı'
      WHEN 'disputed' THEN 'Görüşme incelemeye alındı'
      ELSE 'Ticaret durumu güncellendi'
    END;
    target_body := CASE NEW.status
      WHEN 'quoted' THEN 'Özel fiyatı ve teklif koşullarını şimdi inceleyebilirsiniz.'
      WHEN 'accepted' THEN 'Teslimat ve ödeme ayrıntılarını mesajlardan netleştirebilirsiniz.'
      WHEN 'completed' THEN 'İşlem tamamlandı. Ticaret ortağınızı değerlendirebilirsiniz.'
      WHEN 'cancelled' THEN 'Satın alma görüşmesi taraflardan biri tarafından kapatıldı.'
      WHEN 'disputed' THEN 'Görüşme yönetici incelemesine gönderildi.'
      ELSE 'Satın alma görüşmenizde yeni bir hareket var.'
    END;
    target_href := '/b2b/taleplerim';
    IF target_user = store_owner THEN target_href := '/b2b/toptanci-paneli'; END IF;
    target_entity_id := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'b2b_members' AND TG_OP = 'UPDATE' AND NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    target_user := NEW.user_id;
    target_kind := 'verification';
    target_title := CASE NEW.verification_status
      WHEN 'verified' THEN 'İşletmeniz doğrulandı'
      WHEN 'rejected' THEN 'Belgenizi güncellemeniz gerekiyor'
      WHEN 'suspended' THEN 'Hesabınız incelemeye alındı'
      ELSE 'Doğrulama durumunuz güncellendi'
    END;
    target_body := CASE NEW.verification_status
      WHEN 'verified' THEN 'B2B fiyatlarını görebilir ve toptancılarla ticaret görüşmesi başlatabilirsiniz.'
      WHEN 'rejected' THEN COALESCE(NULLIF(NEW.review_note, ''), 'Yönetici notunu inceleyip belgenizi yeniden gönderin.')
      WHEN 'suspended' THEN 'Ayrıntılar için doğrulama sayfasını inceleyin.'
      ELSE 'Başvurunuzun güncel durumunu doğrulama sayfasında görebilirsiniz.'
    END;
    target_href := '/b2b/dogrulama';
    target_entity_id := NEW.user_id::text;
  ELSIF TG_TABLE_NAME = 'b2b_ads' AND TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status
    AND NEW.status IN ('approved', 'active', 'rejected') THEN
    SELECT owner_id INTO target_user FROM b2b_wholesalers WHERE id = NEW.wholesaler_id;
    target_kind := 'advertising';
    target_title := CASE WHEN NEW.status = 'rejected' THEN 'Reklamınız için düzenleme gerekiyor' ELSE 'Reklamınız onaylandı' END;
    target_body := CASE WHEN NEW.status = 'rejected'
      THEN COALESCE(NULLIF(NEW.admin_note, ''), 'Yönetici notunu inceleyip kampanyanızı güncelleyin.')
      ELSE NEW.title || ' kampanyası yayınlanmaya hazır.' END;
    target_href := '/b2b/reklamlar';
    target_entity_id := NEW.id::text;
  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF target_user IS NOT NULL AND target_user IS DISTINCT FROM auth.uid() THEN
    INSERT INTO b2b_notifications(recipient_id, kind, title, body, href, entity_type, entity_id)
    VALUES (target_user, target_kind, target_title, left(target_body, 500), target_href, target_entity_type, target_entity_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_b2b_notify_message ON b2b_messages;
CREATE TRIGGER trg_b2b_notify_message AFTER INSERT ON b2b_messages
  FOR EACH ROW EXECUTE FUNCTION create_b2b_event_notification();
DROP TRIGGER IF EXISTS trg_b2b_notify_trade ON b2b_trade_requests;
CREATE TRIGGER trg_b2b_notify_trade AFTER UPDATE ON b2b_trade_requests
  FOR EACH ROW EXECUTE FUNCTION create_b2b_event_notification();
DROP TRIGGER IF EXISTS trg_b2b_notify_verification ON b2b_members;
CREATE TRIGGER trg_b2b_notify_verification AFTER UPDATE ON b2b_members
  FOR EACH ROW EXECUTE FUNCTION create_b2b_event_notification();
DROP TRIGGER IF EXISTS trg_b2b_notify_ad ON b2b_ads;
CREATE TRIGGER trg_b2b_notify_ad AFTER UPDATE ON b2b_ads
  FOR EACH ROW EXECUTE FUNCTION create_b2b_event_notification();

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE b2b_notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
