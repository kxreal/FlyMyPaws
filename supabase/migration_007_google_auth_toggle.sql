-- Ensure app_settings exists
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add basic policies if they don't exist
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Settings are publicly readable') THEN
    CREATE POLICY "Settings are publicly readable" ON public.app_settings FOR SELECT USING (true);
  END IF;
END $$;

-- Seed Google Auth Toggle setting
INSERT INTO public.app_settings (key, value)
VALUES ('google_auth_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
