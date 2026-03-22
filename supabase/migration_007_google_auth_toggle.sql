-- Seed Google Auth Toggle setting
INSERT INTO public.app_settings (key, value)
VALUES ('google_auth_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
