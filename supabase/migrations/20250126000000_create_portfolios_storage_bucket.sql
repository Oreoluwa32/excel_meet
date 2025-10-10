-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolios bucket

-- Allow authenticated users to upload portfolio images
CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = 'portfolio-images');

-- Allow public read access to portfolio images
CREATE POLICY "Public can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolios');

-- Allow users to update their own portfolio images
CREATE POLICY "Users can update their own portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = 'portfolio-images');

-- Allow users to delete their own portfolio images
CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = 'portfolio-images');