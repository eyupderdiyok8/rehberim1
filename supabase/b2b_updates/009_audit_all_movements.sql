-- 009 | Tüm platform hareketlerinin denetim izi
-- Ön koşul: 001–008 numaralı güncellemeler çalıştırılmış olmalı.
-- 004 numaralı dosyadaki tetikçi genişletilir: mesaj kim→kime, fiyat kaçtan kaça,
-- RFQ/teklif, hesap doğrulama ve değerlendirme hareketleri de kayıt altına alınır.
BEGIN;

-- Tutarları yönetim ekranında okunur biçimde göstermek için ortak biçimleyici.
CREATE OR REPLACE FUNCTION b2b_audit_money(p_amount numeric, p_currency text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_amount IS NULL THEN '—'
    ELSE replace(trim(to_char(p_amount, 'FM999999999990.00')), '.', ',')
      || CASE p_currency WHEN 'USD' THEN ' $' WHEN 'EUR' THEN ' €' ELSE ' ₺' END
  END;
$$;

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
  target_entity text;
  activity text;
  activity_summary text;
  safe_previous jsonb := previous;
  safe_current jsonb := current;
  product_name text;
  rfq_title text;
  store_name text;
  conversation_wholesaler uuid;
  conversation_buyer uuid;
  counterparty_id uuid;
  counterparty_name text;
BEGIN
  IF TG_TABLE_NAME = 'b2b_wholesalers' THEN
    IF TG_OP = 'UPDATE'
      AND (to_jsonb(NEW) - 'updated_at' - 'rating' - 'review_count')
        = (to_jsonb(OLD) - 'updated_at' - 'rating' - 'review_count') THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'id')::uuid;
    target_entity := payload ->> 'id';
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'store_created'
      WHEN TG_OP = 'DELETE' THEN 'store_deleted' ELSE 'store_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Mağazasını açtı: ' || COALESCE(payload ->> 'name', 'Toptancı')
      WHEN TG_OP = 'DELETE' THEN 'Toptancı mağazası silindi: ' || COALESCE(payload ->> 'name', 'Toptancı')
      ELSE 'Mağaza profilini güncelledi: ' || COALESCE(payload ->> 'name', 'Toptancı') END;

  ELSIF TG_TABLE_NAME = 'b2b_products' THEN
    IF TG_OP = 'UPDATE' AND (to_jsonb(NEW) - 'updated_at') = (to_jsonb(OLD) - 'updated_at') THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    target_entity := payload ->> 'id';
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'product_created'
      WHEN TG_OP = 'DELETE' THEN 'product_deleted' ELSE 'product_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Yeni ürün ekledi: '
      WHEN TG_OP = 'DELETE' THEN 'Ürünü sildi: '
      ELSE 'Ürün bilgisini güncelledi: ' END
      || COALESCE(payload ->> 'name', 'Ürün');

  ELSIF TG_TABLE_NAME = 'b2b_product_prices' THEN
    IF TG_OP = 'UPDATE' AND OLD.price = NEW.price AND OLD.currency = NEW.currency THEN
      RETURN NEW;
    END IF;
    target_entity := payload ->> 'product_id';
    SELECT name, wholesaler_id INTO product_name, target_wholesaler
    FROM b2b_products WHERE id = (payload ->> 'product_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'price_created' ELSE 'price_changed' END;
    activity_summary := CASE
      WHEN TG_OP = 'INSERT' THEN 'Ürün fiyatını '
        || b2b_audit_money((payload ->> 'price')::numeric, payload ->> 'currency') || ' yaptı: '
        || COALESCE(product_name, 'Ürün')
      ELSE 'Ürün fiyatını ' || b2b_audit_money(OLD.price, OLD.currency) || ' → '
        || b2b_audit_money(NEW.price, NEW.currency) || ' yaptı: '
        || COALESCE(product_name, 'Ürün') END;
    -- Yalnızca fiyat alanları saklanır; satırın geri kalanı loga taşınmaz.
    safe_previous := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE jsonb_build_object(
      'price', OLD.price, 'currency', OLD.currency, 'updated_at', OLD.updated_at) END;
    safe_current := jsonb_build_object(
      'price', (payload ->> 'price')::numeric, 'currency', payload ->> 'currency',
      'product', product_name, 'updated_at', payload ->> 'updated_at');

  ELSIF TG_TABLE_NAME = 'b2b_trade_requests' THEN
    IF TG_OP = 'UPDATE' AND COALESCE(OLD.status, '') = COALESCE(NEW.status, '')
      AND OLD.quantity = NEW.quantity
      AND COALESCE(OLD.quoted_unit_price::text, '') = COALESCE(NEW.quoted_unit_price::text, '') THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    target_entity := payload ->> 'id';
    SELECT name INTO product_name FROM b2b_products WHERE id = (payload ->> 'product_id')::uuid;
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'trade_started' ELSE 'trade_updated' END;
    activity_summary := CASE
      WHEN TG_OP = 'INSERT' THEN 'Satın alma görüşmesi başlattı: '
        || COALESCE(product_name, 'Ürün') || ' × '
        || COALESCE(trim(trailing '.00' from payload ->> 'quantity'), '0')
      WHEN payload ->> 'status' = 'quoted' THEN 'Teklif verdi '
        || b2b_audit_money((payload ->> 'quoted_unit_price')::numeric, payload ->> 'quoted_currency') || ': '
        || COALESCE(product_name, 'Ürün')
      WHEN payload ->> 'status' = 'accepted' THEN 'Teklifi kabul etti: ' || COALESCE(product_name, 'Ürün')
      WHEN payload ->> 'status' = 'completed' THEN 'Ticareti tamamladı: ' || COALESCE(product_name, 'Ürün')
      WHEN payload ->> 'status' = 'cancelled' THEN 'Görüşmeyi iptal etti: ' || COALESCE(product_name, 'Ürün')
      WHEN payload ->> 'status' = 'disputed' THEN 'Ticareti anlaşmazlığa taşıdı: ' || COALESCE(product_name, 'Ürün')
      ELSE 'Görüşme durumunu güncelledi: ' || COALESCE(payload ->> 'status', '') END;

  ELSIF TG_TABLE_NAME = 'b2b_ads' THEN
    IF TG_OP = 'UPDATE'
      AND (to_jsonb(NEW) - 'impressions' - 'clicks' - 'updated_at')
        = (to_jsonb(OLD) - 'impressions' - 'clicks' - 'updated_at') THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    target_entity := payload ->> 'id';
    activity := CASE WHEN TG_OP = 'INSERT' THEN 'ad_created' ELSE 'ad_updated' END;
    activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Reklam kampanyası oluşturdu: '
      ELSE 'Reklam kampanyasını güncelledi: ' END || COALESCE(payload ->> 'title', 'Kampanya');

  ELSIF TG_TABLE_NAME = 'b2b_messages' THEN
    SELECT c.wholesaler_id, c.buyer_id INTO conversation_wholesaler, conversation_buyer
    FROM b2b_conversations c WHERE c.id = (payload ->> 'conversation_id')::uuid;
    target_wholesaler := conversation_wholesaler;
    target_entity := payload ->> 'id';
    activity := 'message_sent';
    IF conversation_buyer = (payload ->> 'sender_id')::uuid THEN
      -- Gönderen alıcı: karşı taraf mağazanın kendisidir.
      SELECT name, owner_id INTO counterparty_name, counterparty_id
      FROM b2b_wholesalers WHERE id = conversation_wholesaler;
    ELSE
      counterparty_id := conversation_buyer;
      SELECT business_name INTO counterparty_name FROM b2b_members WHERE user_id = conversation_buyer;
    END IF;
    activity_summary := 'Mesaj gönderdi: ' || COALESCE(counterparty_name, 'Karşı taraf');
    -- Mesaj içeriği denetim kaydına yazılmaz; yalnızca kim ve kaç karakter.
    safe_previous := NULL;
    safe_current := jsonb_build_object(
      'conversation_id', payload ->> 'conversation_id',
      'sender_id', payload ->> 'sender_id',
      'recipient_id', counterparty_id,
      'recipient', counterparty_name,
      'character_count', char_length(payload ->> 'body'));

  ELSIF TG_TABLE_NAME = 'b2b_conversations' THEN
    IF TG_OP <> 'INSERT' THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
    target_wholesaler := NEW.wholesaler_id;
    target_entity := NEW.id;
    SELECT name INTO store_name FROM b2b_wholesalers WHERE id = NEW.wholesaler_id;
    activity := 'conversation_started';
    activity_summary := 'Yeni görüşme başlattı: ' || COALESCE(store_name, 'Toptancı');
    safe_previous := NULL;
    safe_current := jsonb_build_object(
      'buyer_id', NEW.buyer_id, 'wholesaler_id', NEW.wholesaler_id,
      'store', store_name, 'trade_request_id', NEW.trade_request_id);

  ELSIF TG_TABLE_NAME = 'b2b_rfps' THEN
    IF TG_OP = 'UPDATE'
      AND (to_jsonb(NEW) - 'updated_at') = (to_jsonb(OLD) - 'updated_at') THEN
      RETURN NEW;
    END IF;
    target_entity := payload ->> 'id';
    IF TG_OP = 'INSERT' OR NEW.status = 'open' THEN
      activity := CASE WHEN TG_OP = 'INSERT' THEN 'rfq_created' ELSE 'rfq_updated' END;
      activity_summary := CASE WHEN TG_OP = 'INSERT' THEN 'Satın alma ilanı açtı: '
        ELSE 'Açık satın alma ilanını güncelledi: ' END
        || COALESCE(payload ->> 'title', 'Talep')
        || ' (' || COALESCE(trim(trailing '.00' from payload ->> 'quantity'), '0')
        || ' ' || COALESCE(payload ->> 'unit', 'adet') || ')';
    ELSE
      activity := CASE NEW.status
        WHEN 'awarded' THEN 'rfq_awarded'
        WHEN 'cancelled' THEN 'rfq_cancelled'
        ELSE 'rfq_expired' END;
      activity_summary := CASE NEW.status
        WHEN 'awarded' THEN 'Satın alma ilanına teklifi kabul etti: '
        WHEN 'cancelled' THEN 'Satın alma ilanını iptal etti: '
        ELSE 'Satın alma ilanının süresi doldu: ' END
        || COALESCE(NEW.title, 'Talep');
      IF NEW.status = 'awarded' THEN
        SELECT o.wholesaler_id INTO target_wholesaler
        FROM b2b_rfq_offers o WHERE o.id = NEW.awarded_offer_id;
      END IF;
    END IF;

  ELSIF TG_TABLE_NAME = 'b2b_rfq_offers' THEN
    IF TG_OP = 'UPDATE' AND COALESCE(OLD.status, '') = COALESCE(NEW.status, '')
      AND OLD.unit_price = NEW.unit_price THEN
      RETURN NEW;
    END IF;
    target_wholesaler := (payload ->> 'wholesaler_id')::uuid;
    target_entity := payload ->> 'id';
    SELECT title INTO rfq_title FROM b2b_rfps WHERE id = (payload ->> 'rfq_id')::uuid;
    activity := CASE
      WHEN TG_OP = 'INSERT' THEN 'offer_submitted'
      WHEN NEW.status = 'accepted' THEN 'offer_accepted'
      WHEN NEW.status = 'withdrawn' THEN 'offer_withdrawn'
      WHEN NEW.status = 'declined' THEN 'offer_declined'
      ELSE 'offer_updated' END;
    activity_summary := CASE
      WHEN TG_OP = 'INSERT' THEN 'Teklif verdi '
        || b2b_audit_money((payload ->> 'unit_price')::numeric, payload ->> 'currency') || ': '
      WHEN NEW.status = 'accepted' THEN 'Teklifi kabul etti '
        || b2b_audit_money((payload ->> 'unit_price')::numeric, payload ->> 'currency') || ': '
      WHEN NEW.status = 'withdrawn' THEN 'Teklifini geri çekti: '
      WHEN NEW.status = 'declined' THEN 'Teklif reddedildi: '
      ELSE 'Teklifi güncelledi: ' END
      || COALESCE(rfq_title, 'Satın alma ilanı');

  ELSIF TG_TABLE_NAME = 'b2b_reviews' THEN
    IF TG_OP <> 'INSERT' THEN
      RETURN COALESCE(NEW, OLD);
    END IF;
    target_entity := NEW.id;
    SELECT t.wholesaler_id INTO target_wholesaler
    FROM b2b_trade_requests t WHERE t.id = NEW.trade_request_id;
    activity := 'review_created';
    activity_summary := 'Değerlendirme yaptı: ' || NEW.rating || '/5 puan';
    safe_previous := NULL;
    safe_current := jsonb_build_object(
      'rating', NEW.rating, 'reviewer_id', NEW.reviewer_id,
      'target_user_id', NEW.target_user_id, 'trade_request_id', NEW.trade_request_id);

  ELSIF TG_TABLE_NAME = 'b2b_members' THEN
    -- Son görünürlük kalbi (touch_b2b_presence) her dakika güncelleme yapar;
    -- yalnızca hesap türü ve doğrulama durumu değiştiğinde kayıt bırakılır.
    IF TG_OP = 'UPDATE'
      AND COALESCE(OLD.verification_status, '') = COALESCE(NEW.verification_status, '')
      AND COALESCE(OLD.account_type, '') = COALESCE(NEW.account_type, '') THEN
      RETURN NEW;
    END IF;
    target_entity := payload ->> 'user_id';
    activity := CASE
      WHEN TG_OP = 'INSERT' THEN 'account_created'
      WHEN COALESCE(NEW.account_type, '') <> COALESCE(OLD.account_type, '') THEN 'account_type_changed'
      WHEN NEW.verification_status = 'pending' THEN 'verification_requested'
      WHEN NEW.verification_status = 'verified' THEN 'verification_approved'
      WHEN NEW.verification_status = 'rejected' THEN 'verification_rejected'
      WHEN NEW.verification_status = 'suspended' THEN 'account_suspended'
      ELSE 'verification_reset' END;
    activity_summary := CASE
      WHEN TG_OP = 'INSERT' THEN 'B2B hesabı açıldı: ' || COALESCE(payload ->> 'business_name', 'Yeni hesap')
      WHEN NEW.account_type = 'wholesaler' AND OLD.account_type <> 'wholesaler'
        THEN 'Hesabını toptancıya dönüştürdü: ' || COALESCE(payload ->> 'business_name', 'Hesap')
      WHEN NEW.verification_status = 'pending' THEN 'Doğrulama için inceleme başlattı: '
      WHEN NEW.verification_status = 'verified' THEN 'Hesap doğrulandı: '
      WHEN NEW.verification_status = 'rejected' THEN 'Hesap doğrulaması reddedildi: '
      WHEN NEW.verification_status = 'suspended' THEN 'Hesap askıya alındı: '
      ELSE 'Hesap doğrulaması sıfırlandı: ' END
      || COALESCE(payload ->> 'business_name', payload ->> 'user_id');
    -- Vergi numarası ve telefon gibi hassas alanlar loga kopyalanmaz.
    safe_previous := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE jsonb_build_object(
      'account_type', OLD.account_type, 'verification_status', OLD.verification_status) END;
    safe_current := jsonb_build_object(
      'account_type', payload ->> 'account_type',
      'verification_status', payload ->> 'verification_status');

  ELSE
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO b2b_audit_logs(
    actor_id, actor_email, actor_name, action, entity_type, entity_id,
    wholesaler_id, summary, old_data, new_data
  ) VALUES (
    auth.uid(),
    auth.jwt() ->> 'email',
    COALESCE((SELECT business_name FROM b2b_members WHERE user_id = auth.uid()), auth.jwt() ->> 'email'),
    activity, TG_TABLE_NAME, target_entity,
    target_wholesaler, activity_summary, safe_previous, safe_current
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fiyat tetikçisi yalnızca gerçek fiyat değişikliklerine çalışır.
DROP TRIGGER IF EXISTS trg_b2b_audit_prices ON b2b_product_prices;
CREATE TRIGGER trg_b2b_audit_prices AFTER INSERT OR UPDATE OF price, currency ON b2b_product_prices
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

DROP TRIGGER IF EXISTS trg_b2b_audit_conversations ON b2b_conversations;
CREATE TRIGGER trg_b2b_audit_conversations AFTER INSERT ON b2b_conversations
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

DROP TRIGGER IF EXISTS trg_b2b_audit_rfps ON b2b_rfps;
CREATE TRIGGER trg_b2b_audit_rfps AFTER INSERT OR UPDATE ON b2b_rfps
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

DROP TRIGGER IF EXISTS trg_b2b_audit_rfq_offers ON b2b_rfq_offers;
CREATE TRIGGER trg_b2b_audit_rfq_offers AFTER INSERT OR UPDATE OF status, unit_price ON b2b_rfq_offers
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

DROP TRIGGER IF EXISTS trg_b2b_audit_reviews ON b2b_reviews;
CREATE TRIGGER trg_b2b_audit_reviews AFTER INSERT ON b2b_reviews
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

DROP TRIGGER IF EXISTS trg_b2b_audit_members ON b2b_members;
CREATE TRIGGER trg_b2b_audit_members AFTER INSERT OR UPDATE OF verification_status, account_type ON b2b_members
  FOR EACH ROW EXECUTE FUNCTION record_b2b_audit_log();

-- Yönetim akışı işlem türü ve tarih üzerine sayfalandırılarak okunduğu için bu iki indeks şarttır.
CREATE INDEX IF NOT EXISTS idx_b2b_audit_action_date ON b2b_audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_b2b_audit_entity ON b2b_audit_logs(entity_type, entity_id);

-- Akışın canlı düşmesi için denetim tablosu yayın listesine alınır.
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE b2b_audit_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
