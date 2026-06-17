-- ============================================================
-- Review Images — Yorumlara fotoğraf ekleme özelliği
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- 1. review_images tablosu
CREATE TABLE IF NOT EXISTS review_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id  uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url  text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_images_review ON review_images(review_id);

-- 2. RLS
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

-- Herkese approved yorumların fotoğraflarını okuma izni
CREATE POLICY "review_images_select" ON review_images
  FOR SELECT TO anon, authenticated
  USING (
    review_id IN (SELECT id FROM reviews WHERE is_approved = true)
    OR auth.role() = 'authenticated'
  );

-- Herkes fotoğraf ekleyebilir (yorum yazan ziyaretçi)
CREATE POLICY "review_images_insert" ON review_images
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Sadece admin silebilir
CREATE POLICY "review_images_delete" ON review_images
  FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'eyupder@gmail.com');

-- 3. Storage bucket: review-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('review-images', 'review-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Herkese okuma
CREATE POLICY "review_images_bucket_select" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'review-images');

-- Herkes upload yapabilir (yorum yazan ziyaretçi)
CREATE POLICY "review_images_bucket_insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'review-images');

-- Admin silebilir
CREATE POLICY "review_images_bucket_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'review-images' AND auth.jwt() ->> 'email' = 'eyupder@gmail.com');
