-- =====================================================
-- ADD premium_until TO firms TABLE
-- Tracks when premium membership expires
-- Run once in Supabase SQL Editor
-- =====================================================

ALTER TABLE firms ADD COLUMN IF NOT EXISTS premium_until timestamptz;

COMMENT ON COLUMN firms.premium_until IS 'Premium üyelik bitiş tarihi. NULL = süresiz veya premium değil.';
