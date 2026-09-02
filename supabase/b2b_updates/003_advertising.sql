-- 003 | Toptancı bildirim ve popup reklamları
-- Ön koşul: Ana B2B kurulumu tamamlanmış olmalı.
BEGIN;

CREATE TABLE IF NOT EXISTS b2b_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wholesaler_id uuid NOT NULL REFERENCES b2b_wholesalers(id) ON DELETE CASCADE,
  ad_type text NOT NULL CHECK (ad_type IN ('notification', 'popup')),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 90),
  body text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 240),
  image_url text,
  cta_label text NOT NULL DEFAULT 'İncele' CHECK (char_length(cta_label) BETWEEN 2 AND 30),
  target_url text NOT NULL CHECK (target_url LIKE '/b2b/%'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'approved', 'active', 'paused', 'rejected', 'expired')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  daily_budget numeric(12,2) CHECK (daily_budget IS NULL OR daily_budget >= 0),
  total_budget numeric(12,2) CHECK (total_budget IS NULL OR total_budget >= 0),
  impressions bigint NOT NULL DEFAULT 0 CHECK (impressions >= 0),
  clicks bigint NOT NULL DEFAULT 0 CHECK (clicks >= 0),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_b2b_ads_active ON b2b_ads(ad_type, status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_b2b_ads_wholesaler ON b2b_ads(wholesaler_id, created_at DESC);

CREATE OR REPLACE FUNCTION track_b2b_ad(p_ad_id uuid, p_event text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_event NOT IN ('impression', 'click') THEN RETURN; END IF;
  UPDATE b2b_ads SET
    impressions = impressions + CASE WHEN p_event = 'impression' THEN 1 ELSE 0 END,
    clicks = clicks + CASE WHEN p_event = 'click' THEN 1 ELSE 0 END
  WHERE id = p_ad_id AND status IN ('approved', 'active')
    AND starts_at <= now() AND ends_at >= now();
END;
$$;

ALTER TABLE b2b_ads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "b2b_ads_owner_read" ON b2b_ads;
CREATE POLICY "b2b_ads_owner_read" ON b2b_ads FOR SELECT TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin()
    OR (status IN ('approved', 'active') AND starts_at <= now() AND ends_at >= now()));
DROP POLICY IF EXISTS "b2b_ads_owner_insert" ON b2b_ads;
CREATE POLICY "b2b_ads_owner_insert" ON b2b_ads FOR INSERT TO authenticated
  WITH CHECK (owns_b2b_wholesaler(wholesaler_id) AND status = 'pending');
DROP POLICY IF EXISTS "b2b_ads_owner_update" ON b2b_ads;
CREATE POLICY "b2b_ads_owner_update" ON b2b_ads FOR UPDATE TO authenticated
  USING (owns_b2b_wholesaler(wholesaler_id) OR is_b2b_admin())
  WITH CHECK (is_b2b_admin()
    OR (owns_b2b_wholesaler(wholesaler_id) AND status IN ('draft', 'pending', 'paused')));
DROP POLICY IF EXISTS "b2b_ads_admin_delete" ON b2b_ads;
CREATE POLICY "b2b_ads_admin_delete" ON b2b_ads FOR DELETE TO authenticated USING (is_b2b_admin());

REVOKE ALL ON FUNCTION track_b2b_ad(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION track_b2b_ad(uuid, text) TO authenticated;

COMMIT;
