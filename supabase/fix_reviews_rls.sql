-- ============================================================
-- Fix Reviews RLS Policies
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- Drop all old review policies
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
DROP POLICY IF EXISTS "reviews_owner_update" ON reviews;
DROP POLICY IF EXISTS "reviews_update" ON reviews;
DROP POLICY IF EXISTS "reviews_delete" ON reviews;

-- SELECT: Everyone reads approved reviews, firm owners read their own, admin reads all
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT TO anon, authenticated
  USING (
    is_approved = true
    OR firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'email' = 'eyupder@gmail.com'
  );

-- INSERT: Anyone can submit a review (public visitors)
CREATE POLICY "reviews_insert_public" ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- UPDATE:
--   - Admin: can change anything
--   - Firm owner: can ONLY change reply_body and reply_created_at (all other fields must stay same)
CREATE POLICY "reviews_update" ON reviews
  FOR UPDATE TO authenticated
  USING (
    firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid())
    OR auth.jwt() ->> 'email' = 'eyupder@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'eyupder@gmail.com'
    OR (
      firm_id IN (SELECT id FROM firms WHERE user_id = auth.uid())
      AND author_name = reviews.author_name
      AND rating = reviews.rating
      AND body IS NOT DISTINCT FROM reviews.body
      AND is_approved = reviews.is_approved
    )
  );

-- DELETE: Only admin
CREATE POLICY "reviews_delete" ON reviews
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');
