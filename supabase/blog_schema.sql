-- ============================================================
-- Blog Sistemi — Tablo ve RLS Politikaları
-- Supabase SQL Editor'dan çalıştırın
-- ============================================================

-- 1. Blog yazıları tablosu
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

-- Otomatik updated_at trigger
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

-- RLS (Admin: eyupder@gmail.com — Supabase Auth ile giriş yapmış)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_posts_select" ON blog_posts
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR auth.role() = 'authenticated');

CREATE POLICY "blog_posts_insert" ON blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

CREATE POLICY "blog_posts_update" ON blog_posts
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

CREATE POLICY "blog_posts_delete" ON blog_posts
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- ============================================================
-- 2. Blog yorumları tablosu
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name  text NOT NULL,
  author_email text,
  body         text NOT NULL,
  is_approved  boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_comments_select" ON blog_comments
  FOR SELECT TO anon, authenticated
  USING (is_approved = true OR auth.role() = 'authenticated');

CREATE POLICY "blog_comments_insert" ON blog_comments
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "blog_comments_update" ON blog_comments
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

CREATE POLICY "blog_comments_delete" ON blog_comments
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- ============================================================
-- 3. Storage bucket: blog-images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "blog_images_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'blog-images');

CREATE POLICY "blog_images_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');

CREATE POLICY "blog_images_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com')
  WITH CHECK (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');

CREATE POLICY "blog_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');
