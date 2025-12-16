-- Increase file upload limit to 1GB for all storage buckets
-- This allows users to upload files up to 1GB in size

-- Update the file_size_limit for all existing buckets
UPDATE storage.buckets
SET file_size_limit = 1073741824  -- 1GB in bytes (1024 * 1024 * 1024)
WHERE file_size_limit IS NULL OR file_size_limit < 1073741824;

-- Ensure the generated-images bucket has the 1GB limit
UPDATE storage.buckets
SET file_size_limit = 1073741824
WHERE id = 'generated-images';

-- Ensure the generated-models bucket has the 1GB limit
UPDATE storage.buckets
SET file_size_limit = 1073741824
WHERE id = 'generated-models';

-- Ensure the generated-videos bucket has the 1GB limit (if it exists)
UPDATE storage.buckets
SET file_size_limit = 1073741824
WHERE id = 'generated-videos';

-- Note: Supabase also has a global upload limit that may need to be configured
-- in the Supabase dashboard under Settings > Storage
