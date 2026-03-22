-- =============================================================================
-- 003: Fix imm_handle_new_user trigger + create documents storage bucket
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Update imm_handle_new_user() to extract signup metadata and create profile
--    Signup sends: first_name, last_name, role via raw_user_meta_data
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION imm_handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role TEXT;
  _first_name TEXT;
  _last_name TEXT;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'applicant');
  _first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  _last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  IF _role NOT IN ('applicant', 'consultant', 'admin') THEN
    _role := 'applicant';
  END IF;

  INSERT INTO public.imm_users (id, email, role)
  VALUES (NEW.id, NEW.email, _role)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.imm_profiles (user_id, first_name, last_name)
  VALUES (NEW.id, _first_name, _last_name)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- 2. Create storage bucket for documents
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  FALSE,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Storage RLS policies for documents bucket
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
