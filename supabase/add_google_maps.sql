-- ============================================================
-- Google Maps URL — Premium firmalar harita ekleyebilir
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

ALTER TABLE firms ADD COLUMN IF NOT EXISTS google_maps_url text;
