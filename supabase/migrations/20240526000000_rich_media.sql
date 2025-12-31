-- Add media columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT; -- 'image', 'audio', etc.

-- Create storage bucket for chat media (if not exists)
-- Note: Bucket creation is usually done via API or Dashboard in Supabase, 
-- but we can try to insert into storage.buckets if permissions allow.
-- For this migration, we'll assume the bucket 'chat-media' needs to be created manually or via client-side logic if not present.
-- However, we can set up RLS policies for objects if the bucket exists.

-- Policy to allow authenticated users to upload to 'chat-media' bucket
-- This assumes the bucket is public or we handle signed URLs. Let's assume public for MVP simplicity.
-- (SQL for storage policies depends on having the storage extension enabled and schema access)
