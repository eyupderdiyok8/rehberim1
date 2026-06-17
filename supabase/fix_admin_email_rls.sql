-- =====================================================
-- FIX ADMIN EMAIL IN ALL RLS POLICIES
-- Admin uses eyupder@gmail.com, not admin@aquarehber.com
-- Run once in Supabase SQL Editor
-- =====================================================

-- Cities
DROP POLICY IF EXISTS "cities_admin_all" ON cities;
CREATE POLICY "cities_admin_all" ON cities FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Districts
DROP POLICY IF EXISTS "districts_admin_all" ON districts;
CREATE POLICY "districts_admin_all" ON districts FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Services
DROP POLICY IF EXISTS "services_admin_all" ON services;
CREATE POLICY "services_admin_all" ON services FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Firms
DROP POLICY IF EXISTS "firms_select" ON firms;
CREATE POLICY "firms_select" ON firms FOR SELECT TO anon, authenticated
  USING (is_active = true OR user_id = auth.uid() OR auth.jwt() ->> 'email' = 'eyupder@gmail.com');

DROP POLICY IF EXISTS "firms_admin_all" ON firms;
CREATE POLICY "firms_admin_all" ON firms FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Firm Services
DROP POLICY IF EXISTS "firm_services_admin_all" ON firm_services;
CREATE POLICY "firm_services_admin_all" ON firm_services FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Reviews
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT TO anon, authenticated
  USING (is_approved = true OR firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid()) OR auth.jwt() ->> 'email' = 'eyupder@gmail.com');

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Page URLs
DROP POLICY IF EXISTS "page_urls_admin_all" ON page_urls;
CREATE POLICY "page_urls_admin_all" ON page_urls FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- Banners
DROP POLICY IF EXISTS "banners_select" ON banners;
CREATE POLICY "banners_select" ON banners FOR SELECT TO anon, authenticated
  USING (is_active = true OR auth.jwt() ->> 'email' = 'eyupder@gmail.com');

DROP POLICY IF EXISTS "banners_admin_all" ON banners;
CREATE POLICY "banners_admin_all" ON banners FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');
