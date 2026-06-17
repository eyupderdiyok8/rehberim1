-- banners Storage Bucket ve RLS Politikaları
-- Banner görselleri için Supabase Storage bucket

-- 1) Bucket oluştur (public, max 5 MB, sadece görsel dosyaları)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('banners', 'banners', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- 2) Herkes okuyabilsin (public read)
CREATE POLICY "banners_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- 3) Authenticated kullanıcılar yükleyebilsin
CREATE POLICY "banners_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- 4) Authenticated kullanıcılar güncelleyebilsin
CREATE POLICY "banners_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banners');

-- 5) Authenticated kullanıcılar silebilsin
CREATE POLICY "banners_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banners');
