-- Add referrer_source column to firm_stats for traffic source tracking
-- This allows us to see where visitors come from (google, facebook, direct, etc.)

ALTER TABLE firm_stats
  ADD COLUMN IF NOT EXISTS referrer_source text DEFAULT 'direct';

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_firm_stats_source ON firm_stats(referrer_source);
