-- ============================================================
-- Hizmet Kategorisi Temizliği + Endüstriyel Arıtma Ekleme
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- 1. Silinecek hizmetlerin page_urls kayıtlarını sil
DELETE FROM page_urls
WHERE service_id IN (
  SELECT id FROM services WHERE slug IN ('musluk-filtresi', 'ro-sistemi', 'su-yumusatici')
);

-- 2. firm_services kayıtlarını sil (firmalar bu hizmetleri sunuyordu)
DELETE FROM firm_services
WHERE service_id IN (
  SELECT id FROM services WHERE slug IN ('musluk-filtresi', 'ro-sistemi', 'su-yumusatici')
);

-- 3. Hizmetleri sil
DELETE FROM services WHERE slug IN ('musluk-filtresi', 'ro-sistemi', 'su-yumusatici');

-- 4. Endüstriyel Arıtma hizmetini ekle
INSERT INTO services (name, slug, sort_order)
VALUES ('Endüstriyel Arıtma', 'endustriyel-aritma', 6)
ON CONFLICT (slug) DO NOTHING;

-- 5. Endüstriyel Arıtma için city_firms URL'leri oluştur
INSERT INTO page_urls (slug, page_type, city_id, service_id, meta_title, meta_desc)
SELECT
  c.slug || '-endustriyel-aritma-firmalari'                  AS slug,
  'city_firms'                                               AS page_type,
  c.id                                                       AS city_id,
  s.id                                                       AS service_id,
  c.name || ' Endüstriyel Arıtma Firmaları'                 AS meta_title,
  c.name || ' bölgesindeki onaylı Endüstriyel Arıtma firmalarını karşılaştır, teklif al.' AS meta_desc
FROM cities c CROSS JOIN services s
WHERE s.slug = 'endustriyel-aritma'
ON CONFLICT (slug) DO NOTHING;

-- 6. Endüstriyel Arıtma için city_price URL'leri oluştur
INSERT INTO page_urls (slug, page_type, city_id, service_id, meta_title, meta_desc)
SELECT
  c.slug || '-endustriyel-aritma-fiyatlari'                  AS slug,
  'city_price'                                               AS page_type,
  c.id, s.id,
  c.name || ' Endüstriyel Arıtma Fiyatları'                  AS meta_title,
  c.name || ' Endüstriyel Arıtma fiyatları, marka karşılaştırmaları ve firma teklifleri.' AS meta_desc
FROM cities c CROSS JOIN services s
WHERE s.slug = 'endustriyel-aritma'
ON CONFLICT (slug) DO NOTHING;

-- 7. Endüstriyel Arıtma için district_firms URL'leri oluştur
INSERT INTO page_urls (slug, page_type, city_id, district_id, service_id, meta_title, meta_desc)
SELECT
  d.slug || '-endustriyel-aritma-firmalari'                  AS slug,
  'district_firms'                                           AS page_type,
  d.city_id, d.id, s.id,
  d.name || ' Endüstriyel Arıtma Firmaları'                 AS meta_title,
  d.name || ' bölgesindeki onaylı Endüstriyel Arıtma firmalarını karşılaştır.' AS meta_desc
FROM districts d CROSS JOIN services s
WHERE s.slug = 'endustriyel-aritma'
ON CONFLICT (slug) DO NOTHING;

-- 8. Endüstriyel Arıtma için district_price URL'leri oluştur
INSERT INTO page_urls (slug, page_type, city_id, district_id, service_id, meta_title, meta_desc)
SELECT
  d.slug || '-endustriyel-aritma-fiyatlari'                  AS slug,
  'district_price'                                           AS page_type,
  d.city_id, d.id, s.id,
  d.name || ' Endüstriyel Arıtma Fiyatları'                  AS meta_title,
  d.name || ' Endüstriyel Arıtma fiyatları ve firma teklifleri.' AS meta_desc
FROM districts d CROSS JOIN services s
WHERE s.slug = 'endustriyel-aritma'
ON CONFLICT (slug) DO NOTHING;
