-- 1. Enable RLS for Admins on app_settings
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can modify settings') THEN
    CREATE POLICY "Admins can modify settings" 
    ON public.app_settings 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    );
  END IF;
END $$;

-- 2. Seed all the other Admin settings so they exist
INSERT INTO public.app_settings (key, value)
VALUES 
  ('email_registration_enabled', 'true'),
  ('post_creation_enabled', 'true'),
  ('messaging_enabled', 'true'),
  ('google_auth_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
