-- =====================
-- ŞEHİRLER
-- =====================

INSERT INTO cities (name, slug, has_districts, priority) VALUES
  ('İstanbul',  'istanbul',  true,  1),
  ('İzmir',     'izmir',     true,  1),
  ('Ankara',    'ankara',    true,  1),
  ('Bursa',     'bursa',     true,  1),
  ('Antalya',   'antalya',   true,  1),
  ('Adana',     'adana',     true,  1),
  ('Kocaeli',   'kocaeli',   true,  1),
  ('Tekirdağ',  'tekirdag',  true,  1),
  -- Tier 2 örnekler
  ('Gaziantep', 'gaziantep', false, 2),
  ('Mersin',    'mersin',    false, 2),
  ('Konya',     'konya',     false, 2),
  ('Kayseri',   'kayseri',   false, 2),
  ('Eskişehir', 'eskisehir', false, 2),
  ('Sakarya',   'sakarya',   false, 2),
  ('Samsun',    'samsun',    false, 2),
  ('Trabzon',   'trabzon',   false, 2),
  ('Diyarbakır','diyarbakir',false, 2)
ON CONFLICT DO NOTHING;

-- =====================
-- İLÇELER (Tekirdağ — tam liste)
-- =====================

INSERT INTO districts (name, slug, city_id) 
SELECT d.name, d.slug, c.id
FROM (VALUES
  ('Süleymanpaşa', 'tekirdag-suleymanpasa'),
  ('Çorlu',        'tekirdag-corlu'),
  ('Ergene',       'tekirdag-ergene'),
  ('Çerkezköy',    'tekirdag-cerkezkoy'),
  ('Kapaklı',      'tekirdag-kapakli'),
  ('Malkara',      'tekirdag-malkara'),
  ('Hayrabolu',    'tekirdag-hayrabolu'),
  ('Şarköy',       'tekirdag-sarkoy'),
  ('Muratlı',      'tekirdag-muratli')
) AS d(name, slug)
CROSS JOIN cities c WHERE c.slug = 'tekirdag'
ON CONFLICT DO NOTHING;

-- İstanbul (popüler ilçeler — tam liste)
INSERT INTO districts (name, slug, city_id)
SELECT d.name, d.slug, c.id
FROM (VALUES
  ('Kadıköy',      'istanbul-kadikoy'),
  ('Beşiktaş',     'istanbul-besiktas'),
  ('Üsküdar',      'istanbul-uskudar'),
  ('Maltepe',      'istanbul-maltepe'),
  ('Ataşehir',     'istanbul-atasehir'),
  ('Pendik',       'istanbul-pendik'),
  ('Kartal',       'istanbul-kartal'),
  ('Bağcılar',     'istanbul-bagcilar'),
  ('Bahçelievler', 'istanbul-bahcelievler'),
  ('Beylikdüzü',   'istanbul-beylikduzu'),
  ('Esenyurt',     'istanbul-esenyurt'),
  ('Fatih',        'istanbul-fatih'),
  ('Gaziosmanpaşa','istanbul-gaziosmanpasa'),
  ('Güngören',     'istanbul-gungoren'),
  ('Küçükçekmece', 'istanbul-kucukcekmece'),
  ('Sultanbeyli',  'istanbul-sultanbeyli'),
  ('Şişli',        'istanbul-sisli'),
  ('Zeytinburnu',  'istanbul-zeytinburnu')
) AS d(name, slug)
CROSS JOIN cities c WHERE c.slug = 'istanbul'
ON CONFLICT DO NOTHING;

-- =====================
-- HİZMETLER
-- =====================

INSERT INTO services (name, slug, sort_order) VALUES
  ('Su Arıtma Cihazı',   'su-aritma-cihazi',   1),
  ('Su Arıtma Filtresi', 'su-aritma-filtresi', 2),
  ('Su Arıtma Servisi',  'su-aritma-servisi',  3),
  ('Su Arıtma Bakımı',   'su-aritma-bakimi',   4),
  ('Su Arıtma Montajı',  'su-aritma-montaji',  5),
  ('Endüstriyel Arıtma', 'endustriyel-aritma', 6)
ON CONFLICT DO NOTHING;

-- =====================
-- GENERATE URLS
-- =====================

-- Şehir × hizmet kombinasyonları (city_firms + city_price)
INSERT INTO page_urls (slug, page_type, city_id, service_id, meta_title, meta_desc)
SELECT
  c.slug || '-' || s.slug || '-firmalari'                    AS slug,
  'city_firms'                                               AS page_type,
  c.id                                                       AS city_id,
  s.id                                                       AS service_id,
  c.name || ' ' || s.name || ' Firmaları'                   AS meta_title,
  c.name || ' bölgesindeki onaylı ' || s.name ||
    ' firmalarını karşılaştır, teklif al.'                   AS meta_desc
FROM cities c CROSS JOIN services s
ON CONFLICT (slug) DO NOTHING;

INSERT INTO page_urls (slug, page_type, city_id, service_id, meta_title, meta_desc)
SELECT
  c.slug || '-' || s.slug || '-fiyatlari'                    AS slug,
  'city_price'                                               AS page_type,
  c.id, s.id,
  c.name || ' ' || s.name || ' Fiyatları'                  AS meta_title,
  c.name || ' ' || s.name || ' fiyatları, marka karşılaştırmaları ve firma teklifleri.' AS meta_desc
FROM cities c CROSS JOIN services s
ON CONFLICT (slug) DO NOTHING;

-- İlçe × hizmet kombinasyonları (district_firms + district_price)
INSERT INTO page_urls (slug, page_type, city_id, district_id, service_id, meta_title, meta_desc)
SELECT
  d.slug || '-' || s.slug || '-firmalari'                    AS slug,
  'district_firms'                                           AS page_type,
  d.city_id, d.id, s.id,
  d.name || ' ' || s.name || ' Firmaları'                   AS meta_title,
  d.name || ' bölgesindeki onaylı ' || s.name ||
    ' firmalarını karşılaştır.'                              AS meta_desc
FROM districts d CROSS JOIN services s
ON CONFLICT (slug) DO NOTHING;

INSERT INTO page_urls (slug, page_type, city_id, district_id, service_id, meta_title, meta_desc)
SELECT
  d.slug || '-' || s.slug || '-fiyatlari'                    AS slug,
  'district_price'                                           AS page_type,
  d.city_id, d.id, s.id,
  d.name || ' ' || s.name || ' Fiyatları'                  AS meta_title,
  d.name || ' ' || s.name || ' fiyatları ve firma teklifleri.' AS meta_desc
FROM districts d CROSS JOIN services s
ON CONFLICT (slug) DO NOTHING;

