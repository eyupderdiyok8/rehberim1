-- Nearby service search without PostGIS.
-- Uses Haversine distance and keeps user coordinates out of persisted storage.

ALTER TABLE firms ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE firms ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE INDEX IF NOT EXISTS idx_firms_coordinates_active
  ON firms(latitude, longitude)
  WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE OR REPLACE FUNCTION get_nearby_firms(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 20,
  service_slug text DEFAULT 'su-aritma-servisi'
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  phone text,
  whatsapp text,
  address text,
  rating numeric,
  review_count int,
  is_premium boolean,
  is_verified boolean,
  logo_url text,
  description text,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  city jsonb,
  district jsonb,
  firm_services jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH firm_distances AS (
    SELECT
      f.*,
      (
        6371 * 2 * asin(
          sqrt(
            power(sin(radians((f.latitude - user_lat) / 2)), 2) +
            cos(radians(user_lat)) *
            cos(radians(f.latitude)) *
            power(sin(radians((f.longitude - user_lng) / 2)), 2)
          )
        )
      ) AS distance_km
    FROM firms f
    WHERE
      f.is_active = true
      AND f.latitude IS NOT NULL
      AND f.longitude IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM firm_services fs
        JOIN services s ON s.id = fs.service_id
        WHERE fs.firm_id = f.id AND s.slug = service_slug
      )
  )
  SELECT
    fd.id,
    fd.name,
    fd.slug,
    fd.phone,
    fd.whatsapp,
    fd.address,
    fd.rating,
    fd.review_count,
    fd.is_premium,
    fd.is_verified,
    fd.logo_url,
    fd.description,
    fd.latitude,
    fd.longitude,
    fd.distance_km,
    jsonb_build_object('name', c.name, 'slug', c.slug) AS city,
    jsonb_build_object('name', d.name, 'slug', d.slug) AS district,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'price_min', fs.price_min,
            'price_max', fs.price_max,
            'service', jsonb_build_object('name', s.name, 'slug', s.slug)
          )
          ORDER BY s.sort_order, s.name
        )
        FROM firm_services fs
        JOIN services s ON s.id = fs.service_id
        WHERE fs.firm_id = fd.id
      ),
      '[]'::jsonb
    ) AS firm_services
  FROM firm_distances fd
  LEFT JOIN cities c ON c.id = fd.city_id
  LEFT JOIN districts d ON d.id = fd.district_id
  WHERE fd.distance_km <= radius_km
  ORDER BY
    CASE
      WHEN fd.distance_km <= 5 THEN 1
      WHEN fd.distance_km <= 10 THEN 2
      WHEN fd.distance_km <= 20 THEN 3
      ELSE 4
    END,
    fd.is_premium DESC,
    fd.rating DESC,
    fd.review_count DESC,
    fd.distance_km ASC
  LIMIT 30;
$$;
