-- Create storage bucket for job images
INSERT INTO storage.buckets (id, name, public)
VALUES ('jobs', 'jobs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for jobs bucket

-- Allow authenticated users to upload job images
CREATE POLICY "Authenticated users can upload job images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jobs' AND (storage.foldername(name))[1] = 'job-images');

-- Allow public read access to job images
CREATE POLICY "Public can view job images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'jobs');

-- Allow users to update their own job images
CREATE POLICY "Users can update their own job images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'jobs' AND (storage.foldername(name))[1] = 'job-images');

-- Allow users to delete their own job images
CREATE POLICY "Users can delete their own job images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'jobs' AND (storage.foldername(name))[1] = 'job-images');