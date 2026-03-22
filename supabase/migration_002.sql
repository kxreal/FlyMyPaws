-- Create a settings table so Admin can toggle features
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow anyone to READ settings (so the login page can check the toggle)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable"
  ON public.app_settings FOR SELECT
  USING (true);

-- Only service role (admin) can modify — we'll handle this via a special admin RLS policy
-- For simplicity, we allow authenticated users with role='admin' to update
CREATE POLICY "Admins can update settings"
  ON public.app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON public.app_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed default settings
INSERT INTO public.app_settings (key, value)
VALUES ('email_registration_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
