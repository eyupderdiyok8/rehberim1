-- =====================
-- COĞRAFYA
-- =====================

CREATE TABLE cities (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,        -- 'Tekirdağ'
  slug          text UNIQUE NOT NULL, -- 'tekirdag'
  has_districts boolean DEFAULT false,
  priority      int DEFAULT 2         -- 1=Tier1, 2=Tier2
);

CREATE TABLE districts (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name    text NOT NULL,              -- 'Süleymanpaşa'
  slug    text UNIQUE NOT NULL,       -- 'tekirdag-suleymanpasa'
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE
);

-- =====================
-- HİZMETLER
-- =====================

CREATE TABLE services (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,          -- 'Su Arıtma Filtresi'
  slug        text UNIQUE NOT NULL,   -- 'su-aritma-filtresi'
  description text,
  sort_order  int DEFAULT 0
);

-- =====================
-- FİRMALAR
-- =====================

CREATE TABLE firms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,              -- 'Veyra Su Arıtma'
  slug          text UNIQUE NOT NULL,       -- 'veyra-su-aritma-tekirdag'
  phone         text,
  whatsapp      text,
  email         text,
  website       text,
  address       text,
  city_id       uuid REFERENCES cities(id),
  district_id   uuid REFERENCES districts(id),
  description   text,
  logo_url      text,
  is_verified   boolean DEFAULT false,
  is_premium    boolean DEFAULT false,
  is_active     boolean DEFAULT true,
  rating        numeric(3,2) DEFAULT 0,
  review_count  int DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Firma hangi hizmetleri veriyor + fiyat aralığı
CREATE TABLE firm_services (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id    uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price_min  numeric(10,2),
  price_max  numeric(10,2),
  UNIQUE(firm_id, service_id)
);

-- =====================
-- YORUMLAR
-- =====================

CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id     uuid NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        text,
  is_approved boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- =====================
-- PROGRAMATIK SAYFA KAYITLARI
-- =====================

-- Her URL kombinasyonunu sakla — parse karmaşıklığını önler
CREATE TABLE page_urls (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  page_type   text NOT NULL,
  -- 'city_firms'      → /tekirdag-su-aritma-firmalari
  -- 'district_firms'  → /tekirdag-suleymanpasa-su-aritma-firmalari
  -- 'city_price'      → /tekirdag-su-aritma-filtresi-fiyatlari
  -- 'district_price'  → /tekirdag-suleymanpasa-su-aritma-filtresi-fiyatlari
  city_id     uuid REFERENCES cities(id),
  district_id uuid REFERENCES districts(id),
  service_id  uuid REFERENCES services(id),
  meta_title  text,
  meta_desc   text,
  updated_at  timestamptz DEFAULT now()
);

-- =====================
-- BANNERLAR (toptancı reklamı)
-- =====================

CREATE TABLE banners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  image_url  text NOT NULL,
  target_url text NOT NULL,
  placement  text NOT NULL,
  -- 'firms_list_top' | 'firms_list_mid' | 'price_sidebar'
  city_id    uuid REFERENCES cities(id),    -- null = tüm şehirler
  service_id uuid REFERENCES services(id),  -- null = tüm hizmetler
  is_active  boolean DEFAULT true,
  starts_at  timestamptz,
  ends_at    timestamptz
);

-- =====================
-- INDEX'LER
-- =====================

CREATE INDEX idx_firms_city     ON firms(city_id);
CREATE INDEX idx_firms_district ON firms(district_id);
CREATE INDEX idx_firms_premium  ON firms(is_premium, is_active);
CREATE INDEX idx_reviews_firm   ON reviews(firm_id, is_approved);
CREATE INDEX idx_page_urls_slug ON page_urls(slug);
CREATE INDEX idx_page_urls_type ON page_urls(page_type);
