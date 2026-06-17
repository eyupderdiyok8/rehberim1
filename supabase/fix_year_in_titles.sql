-- ============================================================
-- Fix: meta_title'dan "2025" yılını kaldır
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- Tüm price sayfalarının meta_title'ından " 2025" kaldır
UPDATE page_urls
SET meta_title = REPLACE(meta_title, ' 2025', '')
WHERE page_type IN ('city_price', 'district_price')
  AND meta_title LIKE '% 2025%';
