-- Storage RLS policies for post-photos bucket
-- Run this in Supabase SQL Editor

-- Allow authenticated users to upload files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Authenticated users can upload post photos',
  'post-photos',
  'INSERT',
  'auth.role() = ''authenticated'''
) ON CONFLICT DO NOTHING;

-- Allow anyone to read/view photos (public bucket)
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Anyone can view post photos',
  'post-photos',
  'SELECT',
  'true'
) ON CONFLICT DO NOTHING;

-- Allow users to delete their own photos
INSERT INTO storage.policies (name, bucket_id, operation, definition)
VALUES (
  'Users can delete own photos',
  'post-photos',
  'DELETE',
  'auth.uid()::text = (storage.foldername(name))[1]'
) ON CONFLICT DO NOTHING;
