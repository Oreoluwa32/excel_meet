-- Add failure_reason column to nigeria_verification table
ALTER TABLE public.nigeria_verification
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-documents', 'verification-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification-documents bucket

-- Allow authenticated users to upload their own verification documents
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all verification documents
CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND public.is_admin()
);
