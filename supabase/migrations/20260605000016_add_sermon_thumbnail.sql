-- Add thumbnail_url to sermons table
ALTER TABLE public.sermons
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
