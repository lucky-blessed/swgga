-- Rename youtube_url to video_url to support multiple video platforms
ALTER TABLE public.sermons RENAME COLUMN youtube_url TO video_url;
