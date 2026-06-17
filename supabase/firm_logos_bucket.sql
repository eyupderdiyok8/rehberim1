-- ============================================================
-- firm-logos Storage Bucket ve RLS Politikaları
-- Supabase SQL Editor'dan çalıştırın
-- ============================================================

-- Bucket oluştur (public erişimli)
INSERT INTO storage.buckets (id, name, public)
VALUES ('firm-logos', 'firm-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Herkese okuma izni
CREATE POLICY "firm_logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'firm-logos');

-- Kimliği doğrulanmış kullanıcılar yükleyebilir
CREATE POLICY "firm_logos_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'firm-logos'
    AND auth.role() = 'authenticated'
  );

-- Kimliği doğrulanmış kullanıcılar güncelleyebilir
CREATE POLICY "firm_logos_auth_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'firm-logos'
    AND auth.role() = 'authenticated'
  );

-- Kimliği doğrulanmış kullanıcılar silebilir
CREATE POLICY "firm_logos_auth_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'firm-logos'
    AND auth.role() = 'authenticated'
  );
