-- Migration: Add urgent and priority columns to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Update existing records
UPDATE public.posts SET is_urgent = false WHERE is_urgent IS NULL;
UPDATE public.posts SET priority = 0 WHERE priority IS NULL;
