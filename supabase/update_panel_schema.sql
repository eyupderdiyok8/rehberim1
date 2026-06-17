-- =====================================================
-- DATABASE SCHEMA UPDATE FOR ADMIN & FIRM PANELS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. ADD COLUMNS
-- Link firms to Supabase auth.users
ALTER TABLE firms ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add reply features to reviews (Premium firms can answer reviews)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_body text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_created_at timestamptz;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE cities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE firms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_urls    ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners      ENABLE ROW LEVEL SECURITY;

-- 3. CLEAN UP OLD RLS POLICIES
DROP POLICY IF EXISTS "public_read_cities" ON cities;
DROP POLICY IF EXISTS "public_read_districts" ON districts;
DROP POLICY IF EXISTS "public_read_services" ON services;
DROP POLICY IF EXISTS "public_read_firms" ON firms;
DROP POLICY IF EXISTS "public_read_firm_services" ON firm_services;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
DROP POLICY IF EXISTS "public_read_page_urls" ON page_urls;
DROP POLICY IF EXISTS "public_read_banners" ON banners;

DROP POLICY IF EXISTS "cities_select" ON cities;
DROP POLICY IF EXISTS "cities_admin_all" ON cities;
DROP POLICY IF EXISTS "districts_select" ON districts;
DROP POLICY IF EXISTS "districts_admin_all" ON districts;
DROP POLICY IF EXISTS "services_select" ON services;
DROP POLICY IF EXISTS "services_admin_all" ON services;
DROP POLICY IF EXISTS "firms_select" ON firms;
DROP POLICY IF EXISTS "firms_admin_all" ON firms;
DROP POLICY IF EXISTS "firms_owner_update" ON firms;
DROP POLICY IF EXISTS "firms_owner_insert" ON firms;
DROP POLICY IF EXISTS "firm_services_select" ON firm_services;
DROP POLICY IF EXISTS "firm_services_admin_all" ON firm_services;
DROP POLICY IF EXISTS "firm_services_owner_all" ON firm_services;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
DROP POLICY IF EXISTS "reviews_owner_update" ON reviews;
DROP POLICY IF EXISTS "page_urls_select" ON page_urls;
DROP POLICY IF EXISTS "page_urls_admin_all" ON page_urls;
DROP POLICY IF EXISTS "banners_select" ON banners;
DROP POLICY IF EXISTS "banners_admin_all" ON banners;

-- 4. CREATE NEW GRANULAR RLS POLICIES

-- Cities Policies
CREATE POLICY "cities_select" ON cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cities_admin_all" ON cities FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');

-- Districts Policies
CREATE POLICY "districts_select" ON districts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "districts_admin_all" ON districts FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');

-- Services Policies
CREATE POLICY "services_select" ON services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "services_admin_all" ON services FOR ALL TO authenticated USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');

-- Firms Policies
CREATE POLICY "firms_select" ON firms FOR SELECT TO anon, authenticated 
  USING (is_active = true OR user_id = auth.uid() OR auth.jwt() ->> 'email' = 'admin@aquarehber.com');
CREATE POLICY "firms_admin_all" ON firms FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');
CREATE POLICY "firms_owner_update" ON firms FOR UPDATE TO authenticated 
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "firms_owner_insert" ON firms FOR INSERT TO anon, authenticated 
  WITH CHECK (is_active = false AND is_premium = false AND is_verified = false);

-- Firm Services Policies
CREATE POLICY "firm_services_select" ON firm_services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "firm_services_admin_all" ON firm_services FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');
CREATE POLICY "firm_services_owner_all" ON firm_services FOR ALL TO authenticated 
  USING (firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid()));

-- Reviews Policies
CREATE POLICY "reviews_select" ON reviews FOR SELECT TO anon, authenticated 
  USING (is_approved = true OR firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid()) OR auth.jwt() ->> 'email' = 'admin@aquarehber.com');
CREATE POLICY "reviews_insert_public" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');
CREATE POLICY "reviews_owner_update" ON reviews FOR UPDATE TO authenticated 
  USING (firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid())) 
  WITH CHECK (firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid()));

-- Page URLs Policies
CREATE POLICY "page_urls_select" ON page_urls FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "page_urls_admin_all" ON page_urls FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');

-- Banners Policies
CREATE POLICY "banners_select" ON banners FOR SELECT TO anon, authenticated USING (is_active = true OR auth.jwt() ->> 'email' = 'admin@aquarehber.com');
CREATE POLICY "banners_admin_all" ON banners FOR ALL TO authenticated 
  USING (auth.jwt() ->> 'email' = 'admin@aquarehber.com');
