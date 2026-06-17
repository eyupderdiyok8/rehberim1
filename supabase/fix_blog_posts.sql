-- ============================================================
-- Blog Tamiri — Tek seferde tüm schema + RLS düzeltmesi
-- Supabase SQL Editor'da çalıştırın (tek seferde, sırayla)
-- Admin: eyupder@gmail.com
-- ============================================================

-- ===== 1. BLOG_POSTS TABLOSU =====
CREATE TABLE IF NOT EXISTS blog_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text NOT NULL UNIQUE,
  excerpt          text,
  content          text NOT NULL DEFAULT '',
  cover_image_url  text,
  cover_image_alt  text,
  author_name      text NOT NULL DEFAULT 'Admin',
  is_published     boolean NOT NULL DEFAULT false,
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- cover_image_alt eksikse ekle (tablo zaten varsa)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS cover_image_alt text;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_blog_post_updated_at();

-- ===== 2. BLOG_COMMENTS TABLOSU =====
CREATE TABLE IF NOT EXISTS blog_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name  text NOT NULL,
  author_email text,
  body         text NOT NULL,
  is_approved  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ===== 3. STORAGE BUCKET =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- ===== 4. RLS — ESKI POLİTİKALARI TEMİZLE =====
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- blog_posts eski politikalar
DROP POLICY IF EXISTS "blog_public_read" ON blog_posts;
DROP POLICY IF EXISTS "blog_admin_all" ON blog_posts;
DROP POLICY IF EXISTS "blog_anon_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_anon_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_anon_delete" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_select" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_insert" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_update" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_delete" ON blog_posts;

-- blog_comments eski politikalar
DROP POLICY IF EXISTS "comments_public_read" ON blog_comments;
DROP POLICY IF EXISTS "comments_public_insert" ON blog_comments;
DROP POLICY IF EXISTS "comments_admin_all" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_select" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_insert" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_update" ON blog_comments;
DROP POLICY IF EXISTS "blog_comments_delete" ON blog_comments;

-- storage eski politikalar
DROP POLICY IF EXISTS "blog_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_write" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_select" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_update" ON storage.objects;
DROP POLICY IF EXISTS "blog_images_delete" ON storage.objects;

-- ===== 5. RLS — YENİ POLİTİKALAR =====

-- blog_posts: Herkes published okur, authenticated tümünü okur
CREATE POLICY "blog_posts_select" ON blog_posts
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');

-- blog_posts: Sadece admin ekler
CREATE POLICY "blog_posts_insert" ON blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- blog_posts: Sadece admin günceller
CREATE POLICY "blog_posts_update" ON blog_posts
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- blog_posts: Sadece admin siler
CREATE POLICY "blog_posts_delete" ON blog_posts
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- blog_comments: Herkes approved okur, authenticated tümünü okur
CREATE POLICY "blog_comments_select" ON blog_comments
  FOR SELECT TO anon, authenticated
  USING (is_approved = true OR auth.role() = 'authenticated');

-- blog_comments: Herkes yorum yazabilir
CREATE POLICY "blog_comments_insert" ON blog_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- blog_comments: Sadece admin günceller
CREATE POLICY "blog_comments_update" ON blog_comments
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- blog_comments: Sadece admin siler
CREATE POLICY "blog_comments_delete" ON blog_comments
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- storage: Herkes blog-images okur
CREATE POLICY "blog_images_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'blog-images');

-- storage: Admin upload yapar
CREATE POLICY "blog_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- storage: Admin günceller
CREATE POLICY "blog_images_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- storage: Admin siler
CREATE POLICY "blog_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');
