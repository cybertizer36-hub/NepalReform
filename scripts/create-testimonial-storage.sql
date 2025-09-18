-- Create storage bucket for testimonial images
-- Run this in the Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('testimonial-images', 'testimonial-images', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for testimonial-images bucket
CREATE POLICY "Public Access" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'testimonial-images');

CREATE POLICY "Authenticated users can upload testimonial images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'testimonial-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update testimonial images" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'testimonial-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete testimonial images" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'testimonial-images' 
    AND auth.role() = 'authenticated'
  );
