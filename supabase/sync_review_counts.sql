-- =====================================================
-- AUTO-SYNC review_count & rating ON firms TABLE
-- Trigger fires whenever reviews are inserted/update/delete
-- =====================================================

-- 1) One-time sync: fix all current values from real reviews
UPDATE firms f
SET
  review_count = COALESCE(sub.cnt, 0),
  rating       = ROUND(COALESCE(sub.avg_rating, 0)::numeric, 2)
FROM (
  SELECT firm_id, COUNT(*) AS cnt, AVG(rating) AS avg_rating
  FROM reviews
  WHERE is_approved = true
  GROUP BY firm_id
) sub
WHERE f.id = sub.firm_id;

-- Reset firms with no approved reviews
UPDATE firms
SET review_count = 0, rating = 0
WHERE id NOT IN (SELECT DISTINCT firm_id FROM reviews WHERE is_approved = true);

-- 2) Create trigger function
CREATE OR REPLACE FUNCTION sync_firm_review_stats()
RETURNS trigger AS $$
DECLARE
  v_firm_id uuid;
  v_stats record;
BEGIN
  -- Determine which firm_id to update
  IF TG_OP = 'DELETE' THEN
    v_firm_id := OLD.firm_id;
  ELSE
    v_firm_id := NEW.firm_id;
  END IF;

  -- Calculate real stats from approved reviews
  SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg_rating
  INTO v_stats
  FROM reviews
  WHERE firm_id = v_firm_id AND is_approved = true;

  -- Update the firm row
  UPDATE firms
  SET
    review_count = v_stats.cnt,
    rating       = ROUND(v_stats.avg_rating::numeric, 2)
  WHERE id = v_firm_id;

  RETURN NULL; -- AFTER trigger, return value ignored
END;
$$ LANGUAGE plpgsql;

-- 3) Attach trigger to reviews table
DROP TRIGGER IF EXISTS trg_sync_firm_review_stats ON reviews;
CREATE TRIGGER trg_sync_firm_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION sync_firm_review_stats();
