-- =====================================================
-- FİRMA SEED VERİLERİ
-- Önce çalıştır: schema.sql + seed.sql (cities/districts/services)
-- =====================================================

-- =====================================================
-- İSTANBUL FİRMALARI
-- =====================================================

INSERT INTO firms (name, slug, phone, whatsapp, email, website, address, city_id, district_id, description, is_verified, is_premium, is_active, rating, review_count)
SELECT
  f.name, f.slug, f.phone, f.whatsapp, f.email, f.website, f.address,
  c.id AS city_id,
  d.id AS district_id,
  f.description, f.is_verified, f.is_premium, true,
  f.rating, f.review_count
FROM (VALUES
  (
    'Marmara Arıtma Sistemleri',
    'marmara-aritma-sistemleri-istanbul',
    '0212 555 01 00',
    '905325550100',
    'info@marmaraaritma.com',
    'https://marmaraaritma.com',
    'Moda Cad. No:42, Kadıköy',
    'İstanbul', 'istanbul-kadikoy',
    'İstanbul Kadıköy merkezli su arıtma firması. 2012 yılından bu yana evsel ve ticari su arıtma sistemleri kurulumu, periyodik bakım ve filtre değişimi hizmetleri sunmaktayız.',
    true, true, 4.8, 289
  ),
  (
    'Şişli Su Teknolojileri',
    'sisli-su-teknolojileri-istanbul',
    '0212 444 02 10',
    '905444021010',
    'bilgi@sislisu.com',
    NULL,
    'Halaskargazi Cad. No:78, Şişli',
    'İstanbul', 'istanbul-sisli',
    'Şişli ve çevre ilçelere hizmet veren yetkili su arıtma bayisi. RO sistemleri, su yumuşatıcı ve musluk filtresi konusunda uzmanız.',
    true, false, 4.6, 134
  ),
  (
    'Pendik Temiz Su Merkezi',
    'pendik-temiz-su-merkezi-istanbul',
    '0216 399 10 20',
    '905359910200',
    NULL,
    NULL,
    'Kurtköy Mah. Atatürk Cad. No:15, Pendik',
    'İstanbul', 'istanbul-pendik',
    'Pendik ve Kartal bölgesinde su arıtma cihazı satış, montaj ve teknik servis hizmetleri. 7 gün hizmet.',
    false, false, 4.5, 67
  ),
  (
    'Beylikdüzü Arıtma Uzmanları',
    'beylikduzu-aritma-uzmanlari-istanbul',
    '0212 871 33 44',
    '905333334411',
    'destek@beylikduzuaritma.com',
    NULL,
    'Büyükşehir Mah. No:22, Beylikdüzü',
    'İstanbul', 'istanbul-beylikduzu',
    'Beylikdüzü, Esenyurt ve Avcılar bölgelerinde su arıtma sistemleri kurulumu ve bakımı.',
    true, false, 4.7, 89
  )
) AS f(name, slug, phone, whatsapp, email, website, address, city_name, district_slug, description, is_verified, is_premium, rating, review_count)
JOIN cities c ON c.name = f.city_name
LEFT JOIN districts d ON d.slug = f.district_slug
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- TEKİRDAĞ FİRMALARI
-- =====================================================

INSERT INTO firms (name, slug, phone, whatsapp, email, website, address, city_id, district_id, description, is_verified, is_premium, is_active, rating, review_count)
SELECT
  f.name, f.slug, f.phone, f.whatsapp, f.email, f.website, f.address,
  c.id AS city_id,
  d.id AS district_id,
  f.description, f.is_verified, f.is_premium, true,
  f.rating, f.review_count
FROM (VALUES
  (
    'Trakya Temiz Su Sistemleri',
    'trakya-temiz-su-sistemleri-tekirdag',
    '0282 261 10 10',
    '905262611010',
    'info@trakyatemizsu.com',
    'https://trakyatemizsu.com',
    'Namık Kemal Mah. Atatürk Blv. No:55, Süleymanpaşa',
    'Tekirdağ', 'tekirdag-suleymanpasa',
    'Tekirdağ merkezde 2009''dan bu yana faaliyet gösteren su arıtma firması. Evsel RO sistemleri, endüstriyel arıtma ve periyodik bakım hizmetleri sunuyoruz. Tekirdağ''ın yüksek kireç oranına özel çözümler.',
    true, true, 4.9, 312
  ),
  (
    'Çorlu Su Arıtma Merkezi',
    'corlu-su-aritma-merkezi-tekirdag',
    '0282 652 44 55',
    '905326524455',
    'corlu@suaritma.com',
    NULL,
    'Reşadiye Mah. Alparslan Cad. No:28, Çorlu',
    'Tekirdağ', 'tekirdag-corlu',
    'Çorlu ve Ergene ilçelerinde su arıtma sistemleri satış ve teknik servisi. Endüstriyel tesisler için özel arıtma çözümleri.',
    true, false, 4.7, 145
  ),
  (
    'Çerkezköy Arıtma Mühendislik',
    'cerkezkoy-aritma-muhendislik-tekirdag',
    '0282 725 30 30',
    '905327253030',
    NULL,
    NULL,
    'İstasyon Mah. Ankara Cad. No:9, Çerkezköy',
    'Tekirdağ', 'tekirdag-cerkezkoy',
    'Çerkezköy, Kapaklı ve Ergene bölgesine hizmet veren yetkili arıtma bayisi.',
    false, false, 4.6, 58
  )
) AS f(name, slug, phone, whatsapp, email, website, address, city_name, district_slug, description, is_verified, is_premium, rating, review_count)
JOIN cities c ON c.name = f.city_name
LEFT JOIN districts d ON d.slug = f.district_slug
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- İZMİR FİRMALARI
-- =====================================================

INSERT INTO firms (name, slug, phone, whatsapp, email, website, address, city_id, district_id, description, is_verified, is_premium, is_active, rating, review_count)
SELECT
  f.name, f.slug, f.phone, f.whatsapp, f.email, f.website, f.address,
  c.id AS city_id,
  NULL AS district_id,
  f.description, f.is_verified, f.is_premium, true,
  f.rating, f.review_count
FROM (VALUES
  (
    'Ege Su Teknolojileri',
    'ege-su-teknolojileri-izmir',
    '0232 441 20 20',
    '905324412020',
    'info@egesutek.com',
    'https://egesutek.com',
    'Kazımdirik Mah. 285 Sok. No:12, Bornova',
    'İzmir',
    'İzmir ve çevre ilçeler için evsel ve ticari su arıtma çözümleri. 15 yıllık deneyim.',
    true, true, 4.9, 421
  ),
  (
    'Karşıyaka Su Arıtma',
    'karsiyaka-su-aritma-izmir',
    '0232 368 50 60',
    '905323685060',
    NULL,
    NULL,
    'Yali Mah. Cemal Gürsel Cad. No:88, Karşıyaka',
    'İzmir',
    'Karşıyaka ve Bornova bölgesinde su arıtma sistemleri kurulumu, bakım ve filtre değişimi.',
    true, false, 4.7, 178
  )
) AS f(name, slug, phone, whatsapp, email, website, address, city_name, description, is_verified, is_premium, rating, review_count)
JOIN cities c ON c.name = f.city_name
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ANKARA FİRMALARI
-- =====================================================

INSERT INTO firms (name, slug, phone, whatsapp, email, website, address, city_id, district_id, description, is_verified, is_premium, is_active, rating, review_count)
SELECT
  f.name, f.slug, f.phone, f.whatsapp, f.email, f.website, f.address,
  c.id AS city_id,
  NULL AS district_id,
  f.description, f.is_verified, f.is_premium, true,
  f.rating, f.review_count
FROM (VALUES
  (
    'Başkent Su Arıtma Merkezi',
    'baskent-su-aritma-merkezi-ankara',
    '0312 419 88 00',
    '905324198800',
    'info@baskentsu.com',
    'https://baskentsu.com',
    'Kızılay Mah. Atatürk Blv. No:121, Çankaya',
    'Ankara',
    'Ankara genelinde su arıtma sistemleri kurulumu ve teknik servis. Sertifikalı teknisyenler, orijinal yedek parça garantisi.',
    true, true, 4.8, 367
  ),
  (
    'Ankara Arıtma Sistemleri',
    'ankara-aritma-sistemleri-ankara',
    '0312 231 10 11',
    '905322311011',
    NULL,
    NULL,
    'Demetevler Mah. Konya Yolu No:45, Yenimahalle',
    'Ankara',
    'Ankara Yenimahalle ve Etimesgut bölgesinde su arıtma hizmetleri.',
    false, false, 4.5, 92
  )
) AS f(name, slug, phone, whatsapp, email, website, address, city_name, description, is_verified, is_premium, rating, review_count)
JOIN cities c ON c.name = f.city_name
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- BURSA, ANTALYA, KOCAELİ, ADANA
-- =====================================================

INSERT INTO firms (name, slug, phone, whatsapp, email, address, city_id, district_id, description, is_verified, is_premium, is_active, rating, review_count)
SELECT
  f.name, f.slug, f.phone, f.whatsapp, f.email, f.address,
  c.id AS city_id,
  NULL AS district_id,
  f.description, f.is_verified, f.is_premium, true,
  f.rating, f.review_count
FROM (VALUES
  (
    'Bursa Arıtma Market',
    'bursa-aritma-market-bursa',
    '0224 220 30 30',
    '905322203030',
    'info@bursaaritma.com',
    'Setbaşı Mah. Altıparmak Cad. No:18, Osmangazi',
    'Bursa',
    'Bursa genelinde su arıtma cihazı satış, montaj ve bakım hizmetleri. Nilüfer, Osmangazi ve Yıldırım ilçelerine özel teknik ekip.',
    true, true, 4.7, 245
  ),
  (
    'Akdeniz Su Arıtma',
    'akdeniz-su-aritma-antalya',
    '0242 311 44 55',
    '905323114455',
    'info@akdenizsu.com',
    'Meltem Mah. Dumlupınar Blv. No:33, Muratpaşa',
    'Antalya',
    'Antalya ve tatil bölgelerinde su arıtma sistemleri. Yazlık ve site uygulamaları uzmanlığı.',
    true, false, 4.9, 189
  ),
  (
    'Körfez Arıtma Mühendislik',
    'korfez-aritma-muhendislik-kocaeli',
    '0262 321 55 66',
    '905322215566',
    'bilgi@korfezaritma.com',
    'Serdar Mah. Ankara Cad. No:77, İzmit',
    'Kocaeli',
    'Kocaeli ve Gebze bölgesinde sanayi tipi ve evsel su arıtma sistemleri. ISO 9001 kalite belgeli.',
    true, true, 4.8, 156
  ),
  (
    'Çukurova Su Sistemleri',
    'cukurova-su-sistemleri-adana',
    '0322 458 90 00',
    '905324589000',
    NULL,
    'Kurtuluş Mah. Ziyapaşa Blv. No:52, Seyhan',
    'Adana',
    'Adana ve çevre illerde su arıtma kurulumu ve teknik servis. Tarımsal sulama arıtma sistemleri de yapılır.',
    true, false, 4.6, 78
  )
) AS f(name, slug, phone, whatsapp, email, address, city_name, description, is_verified, is_premium, rating, review_count)
JOIN cities c ON c.name = f.city_name
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FİRMA HİZMETLERİ + FİYAT ARALIKLARI
-- =====================================================

INSERT INTO firm_services (firm_id, service_id, price_min, price_max)
SELECT fi.id, s.id, fs.price_min, fs.price_max
FROM (VALUES
  -- Marmara Arıtma (premium, İstanbul)
  ('marmara-aritma-sistemleri-istanbul',   'su-aritma-cihazi',   2800, 9500),
  ('marmara-aritma-sistemleri-istanbul',   'su-aritma-filtresi',  350,  800),
  ('marmara-aritma-sistemleri-istanbul',   'su-aritma-bakimi',    450,  950),
  ('marmara-aritma-sistemleri-istanbul',   'su-aritma-montaji',   400,  750),
  -- Şişli Su
  ('sisli-su-teknolojileri-istanbul',      'su-aritma-cihazi',   2500, 7800),
  ('sisli-su-teknolojileri-istanbul',      'musluk-filtresi',     280,  650),
  ('sisli-su-teknolojileri-istanbul',      'ro-sistemi',         3200, 8500),
  -- Pendik
  ('pendik-temiz-su-merkezi-istanbul',     'su-aritma-cihazi',   2200, 6000),
  ('pendik-temiz-su-merkezi-istanbul',     'su-aritma-servisi',   300,  700),
  -- Beylikdüzü
  ('beylikduzu-aritma-uzmanlari-istanbul', 'su-aritma-cihazi',   2400, 7200),
  ('beylikduzu-aritma-uzmanlari-istanbul', 'su-aritma-bakimi',    380,  850),
  -- Trakya Temiz Su (premium, Tekirdağ)
  ('trakya-temiz-su-sistemleri-tekirdag',  'su-aritma-cihazi',   2600, 8800),
  ('trakya-temiz-su-sistemleri-tekirdag',  'su-aritma-filtresi',  300,  750),
  ('trakya-temiz-su-sistemleri-tekirdag',  'su-aritma-bakimi',    400,  900),
  ('trakya-temiz-su-sistemleri-tekirdag',  'su-yumusatici',     1800, 4500),
  -- Çorlu
  ('corlu-su-aritma-merkezi-tekirdag',     'su-aritma-cihazi',   2400, 7000),
  ('corlu-su-aritma-merkezi-tekirdag',     'su-aritma-montaji',   350,  700),
  -- Çerkezköy
  ('cerkezkoy-aritma-muhendislik-tekirdag','su-aritma-cihazi',   2200, 6500),
  ('cerkezkoy-aritma-muhendislik-tekirdag','su-aritma-servisi',   250,  600),
  -- Ege Su (premium, İzmir)
  ('ege-su-teknolojileri-izmir',           'su-aritma-cihazi',   2900,10000),
  ('ege-su-teknolojileri-izmir',           'ro-sistemi',         3500,12000),
  ('ege-su-teknolojileri-izmir',           'su-aritma-filtresi',  320,  800),
  ('ege-su-teknolojileri-izmir',           'su-aritma-bakimi',    450,  950),
  -- Karşıyaka
  ('karsiyaka-su-aritma-izmir',            'su-aritma-cihazi',   2600, 8000),
  ('karsiyaka-su-aritma-izmir',            'su-aritma-filtresi',  290,  700),
  -- Başkent (premium, Ankara)
  ('baskent-su-aritma-merkezi-ankara',     'su-aritma-cihazi',   2700, 9200),
  ('baskent-su-aritma-merkezi-ankara',     'su-aritma-filtresi',  330,  780),
  ('baskent-su-aritma-merkezi-ankara',     'su-aritma-montaji',   420,  800),
  ('baskent-su-aritma-merkezi-ankara',     'su-yumusatici',     1900, 4800),
  -- Ankara Arıtma
  ('ankara-aritma-sistemleri-ankara',      'su-aritma-cihazi',   2300, 6800),
  ('ankara-aritma-sistemleri-ankara',      'su-aritma-servisi',   280,  650),
  -- Bursa (premium)
  ('bursa-aritma-market-bursa',            'su-aritma-cihazi',   2500, 8500),
  ('bursa-aritma-market-bursa',            'su-aritma-filtresi',  300,  720),
  ('bursa-aritma-market-bursa',            'su-aritma-bakimi',    400,  880),
  -- Akdeniz (Antalya)
  ('akdeniz-su-aritma-antalya',            'su-aritma-cihazi',   2800, 9000),
  ('akdeniz-su-aritma-antalya',            'su-aritma-montaji',   380,  750),
  -- Körfez (premium, Kocaeli)
  ('korfez-aritma-muhendislik-kocaeli',    'su-aritma-cihazi',   3000,11000),
  ('korfez-aritma-muhendislik-kocaeli',    'ro-sistemi',         4000,14000),
  ('korfez-aritma-muhendislik-kocaeli',    'su-aritma-montaji',   500,  900),
  -- Çukurova (Adana)
  ('cukurova-su-sistemleri-adana',         'su-aritma-cihazi',   2200, 7000),
  ('cukurova-su-sistemleri-adana',         'su-aritma-servisi',   250,  600)
) AS fs(firm_slug, service_slug, price_min, price_max)
JOIN firms fi ON fi.slug = fs.firm_slug
JOIN services s ON s.slug = fs.service_slug
ON CONFLICT (firm_id, service_id) DO NOTHING;

-- =====================================================
-- MÜŞTERİ YORUMLARI
-- =====================================================

INSERT INTO reviews (firm_id, author_name, rating, body, is_approved)
SELECT fi.id, r.author_name, r.rating, r.body, true
FROM (VALUES
  -- Marmara Arıtma (İstanbul)
  ('marmara-aritma-sistemleri-istanbul', 'Ahmet Y.',    5, 'Montaj çok hızlı yapıldı, teknisyen gayet nazikti. Cihaz ilk haftadan fark yarattı, suyun tadı tamamen değişti.', true),
  ('marmara-aritma-sistemleri-istanbul', 'Selin K.',    5, 'Yıllık bakım sözleşmesi aldım, düzenli aranıyorlar. Fiyat/performans olarak çok memnunum.', true),
  ('marmara-aritma-sistemleri-istanbul', 'Murat D.',    4, 'Ürün kaliteli, teslimat biraz gecikti ama sonuç tatmin edici.', true),
  -- Trakya Temiz Su (Tekirdağ)
  ('trakya-temiz-su-sistemleri-tekirdag','Fatma Ö.',    5, 'Tekirdağ suyunun kireç sorunu için özel sistem önerdiler. 6 aydır kullanıyorum, boru kireçlenmesi sıfırlandı.', true),
  ('trakya-temiz-su-sistemleri-tekirdag','Ercan B.',    5, 'Hem fiyat hem kalite hem de teknik destek mükemmel. Firmayı herkese tavsiye ederim.', true),
  ('trakya-temiz-su-sistemleri-tekirdag','Ayla T.',     4, 'Kurulum düzenli yapıldı. Filtre değişiminde biraz beklettiler ama sorun çözüldü.', true),
  -- Ege Su (İzmir)
  ('ege-su-teknolojileri-izmir',          'Deniz A.',   5, 'RO sistemi kurdurdum, su kalitesi harika. İzmir''in klorlu suyundan kurtulmanın en iyi yolu.', true),
  ('ege-su-teknolojileri-izmir',          'Sevgi M.',   5, 'Hızlı montaj, temiz işçilik. Teknisyenler profesyonel.', true),
  -- Başkent (Ankara)
  ('baskent-su-aritma-merkezi-ankara',    'Bülent S.',  5, 'Ankara''da en iyi su arıtma firması bu. Sertifikalı cihaz, garantili montaj.', true),
  ('baskent-su-aritma-merkezi-ankara',    'Hülya K.',   4, 'Fiyat biraz yüksek ama işin kalitesi fiyatı karşılıyor.', true),
  -- Bursa
  ('bursa-aritma-market-bursa',           'Kemal R.',   5, 'Çok hızlı servis. Aradığımda aynı gün geldiler, sorunu çözdüler.', true),
  ('bursa-aritma-market-bursa',           'Zühal P.',   4, 'İyi ürünler, uygun fiyat. Bakım paketleri pratik.', true),
  -- Körfez (Kocaeli)
  ('korfez-aritma-muhendislik-kocaeli',   'Taner Ç.',  5, 'Fabrikamıza endüstriyel arıtma sistemi kurdurduk. İş kalitesi ve teknik bilgi çok iyi.', true),
  ('korfez-aritma-muhendislik-kocaeli',   'Naciye Y.',  5, 'Evsel RO sistemi için başvurdum, çok profesyonel bir ekip.', true),
  -- Akdeniz (Antalya)
  ('akdeniz-su-aritma-antalya',           'Ozan M.',    5, 'Yazlığıma sistem kurdurdum, çok memnunum. Turistik bölgede güvenilir firma bulmak zordu.', true),
  ('akdeniz-su-aritma-antalya',           'Leyla T.',   4, 'Hızlı montaj ve temiz işçilik. Fiyat uygun.', true)
) AS r(firm_slug, author_name, rating, body, is_approved)
JOIN firms fi ON fi.slug = r.firm_slug
ON CONFLICT DO NOTHING;

-- =====================================================
-- YORUM SAYILARI VE ORTALAMA PUANLARI GÜNCELLE
-- =====================================================

UPDATE firms f
SET
  review_count = sub.cnt,
  rating       = ROUND(sub.avg_rating::numeric, 2)
FROM (
  SELECT firm_id, COUNT(*) AS cnt, AVG(rating) AS avg_rating
  FROM reviews
  WHERE is_approved = true
  GROUP BY firm_id
) sub
WHERE f.id = sub.firm_id;
