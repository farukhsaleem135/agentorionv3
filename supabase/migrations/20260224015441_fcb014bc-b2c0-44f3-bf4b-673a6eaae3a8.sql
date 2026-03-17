
-- Add unique constraint on keyword_set for upsert operations
ALTER TABLE public.unsplash_cache ADD CONSTRAINT unsplash_cache_keyword_set_key UNIQUE (keyword_set);
