-- Add resume_url field to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resumes bucket

-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all resumes
CREATE POLICY "Admins can view all resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' 
  AND public.is_admin()
);