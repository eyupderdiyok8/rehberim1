-- =====================================================
-- FIX: page_urls RLS violation from auto_create_page_urls trigger
-- The trigger must run as SECURITY DEFINER (postgres)
-- to bypass RLS on page_urls table.
-- Run once in Supabase SQL Editor
-- =====================================================

CREATE OR REPLACE FUNCTION auto_create_page_urls()
RETURNS trigger AS $$
BEGIN
  -- Only act when firm is active and has a city
  IF NEW.is_active = true AND NEW.city_id IS NOT NULL THEN

    -- City x service -> city_firms
    INSERT INTO page_urls (slug, page_type, city_id, service_id, meta_title, meta_desc)
    SELECT
      c.slug || '-' || s.slug || '-firmalari',
      'city_firms', c.id, s.id,
      c.name || ' ' || s.name || ' Firmaları',
      c.name || ' bölgesindeki onaylı ' || s.name || ' firmalarını karşılaştır, teklif al.'
    FROM cities c CROSS JOIN services s
    WHERE c.id = NEW.city_id
    ON CONFLICT (slug) DO NOTHING;

    -- City x service -> city_price
    INSERT INTO page_urls (slug, page_type, city_id, service_id, meta_title, meta_desc)
    SELECT
      c.slug || '-' || s.slug || '-fiyatlari',
      'city_price', c.id, s.id,
      c.name || ' ' || s.name || ' Fiyatları',
      c.name || ' ' || s.name || ' fiyatları, marka karşılaştırmaları ve firma teklifleri.'
    FROM cities c CROSS JOIN services s
    WHERE c.id = NEW.city_id
    ON CONFLICT (slug) DO NOTHING;

    -- District x service (only if district is set)
    IF NEW.district_id IS NOT NULL THEN

      INSERT INTO page_urls (slug, page_type, city_id, district_id, service_id, meta_title, meta_desc)
      SELECT
        d.slug || '-' || s.slug || '-firmalari',
        'district_firms', d.city_id, d.id, s.id,
        d.name || ' ' || s.name || ' Firmaları',
        d.name || ' bölgesindeki onaylı ' || s.name || ' firmalarını karşılaştır.'
      FROM districts d CROSS JOIN services s
      WHERE d.id = NEW.district_id
      ON CONFLICT (slug) DO NOTHING;

      INSERT INTO page_urls (slug, page_type, city_id, district_id, service_id, meta_title, meta_desc)
      SELECT
        d.slug || '-' || s.slug || '-fiyatlari',
        'district_price', d.city_id, d.id, s.id,
        d.name || ' ' || s.name || ' Fiyatları',
        d.name || ' ' || s.name || ' fiyatları ve firma teklifleri.'
      FROM districts d CROSS JOIN services s
      WHERE d.id = NEW.district_id
      ON CONFLICT (slug) DO NOTHING;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
