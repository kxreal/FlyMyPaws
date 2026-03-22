-- Run this in Supabase SQL Editor to add the extra columns for the new post cards
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS pet_name TEXT,
  ADD COLUMN IF NOT EXISTS pet_emoji TEXT DEFAULT '🐾',
  ADD COLUMN IF NOT EXISTS breed TEXT,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2);
