-- Seed mock data for FlightFurward
-- Run this in Supabase SQL Editor to populate demo pet and volunteer cards

-- First, insert a demo user into auth.users (as a placeholder author)
-- Since we can't directly insert into auth.users easily, we use a workaround:
-- We'll insert posts with a placeholder UUID that doesn't need to exist
-- (You may need to disable foreign key check or use a real user ID)

-- OPTION: Replace 'YOUR_USER_ID_HERE' with your own real user ID from
-- Authentication > Users in the Supabase dashboard, then run this.

DO $$
DECLARE
  uid UUID;
BEGIN
  -- Try to get an existing user, fall back to a dummy UUID
  SELECT id INTO uid FROM auth.users LIMIT 1;
  IF uid IS NULL THEN
    uid := gen_random_uuid();
  END IF;

  -- Pet requests
  INSERT INTO public.posts (author_id, post_type, status, origin, destination, flight_date, description, pet_name, pet_emoji, breed, weight_kg)
  VALUES
    (uid, 'need_help', 'still_needed', 'Hong Kong', 'London', '2026-04-15',
     'Luna is a calm and well-trained 2-year-old British Shorthair. She has all vaccinations and travel documents ready. Looking for a caring buddy on Cathay Pacific or British Airways.',
     'Luna', '🐱', 'British Shorthair', 4.0),

    (uid, 'need_help', 'on_hold', 'Taipei', 'Vancouver', '2026-05-01',
     'Max is a friendly Corgi relocating with our family. He''s cabin-ready and has all paperwork. Currently in discussion with a volunteer.',
     'Max', '🐶', 'Corgi', 12.0),

    (uid, 'need_help', 'still_needed', 'Singapore', 'Toronto', '2026-05-20',
     'Mochi is a tiny, gentle rabbit. She fits in a small carrier and is very quiet. Vaccinations and CITES docs all prepared. Owner will cover airline pet fee.',
     'Mochi', '🐰', 'Holland Lop Rabbit', 1.8),

    (uid, 'need_help', 'still_needed', 'Seoul', 'Sydney', '2026-06-10',
     'Coco is a healthy 3-year-old Toy Poodle. Fully vaccinated, microchipped, and vet-certified for travel. Looking for a kind volunteer on any major carrier.',
     'Coco', '🐶', 'Toy Poodle', 3.5),

    (uid, 'need_help', 'still_needed', 'Bangkok', 'Amsterdam', '2026-04-28',
     'Nemo is a young rescue cat in need of transport to his forever home in the Netherlands. Very friendly and used to being in a carrier. All EU import docs ready.',
     'Nemo', '🐱', 'Domestic Shorthair', 3.2);

  -- Volunteer offers
  INSERT INTO public.posts (author_id, post_type, status, origin, destination, flight_date, description, airline)
  VALUES
    (uid, 'volunteer', 'still_needed', 'Hong Kong', 'London', '2026-04-15',
     'I travel HKG→LHR frequently for work. Happy to accompany a small cabin pet. I''ve helped transport animals before and am comfortable with cats and small dogs.',
     'Cathay Pacific · CX251'),

    (uid, 'volunteer', 'still_needed', 'Taipei', 'Los Angeles', '2026-05-08',
     'Flying TPE→LAX on Eva Air. Willing to help with a small dog or cat in-cabin. Please message me at least 2 weeks in advance so we can coordinate with the airline.',
     'Eva Air · BR12'),

    (uid, 'volunteer', 'still_needed', 'Singapore', 'Melbourne', '2026-05-25',
     'Relocating to Melbourne and happy to help a pet travel with me. I can take a cat or a dog under 7kg. Already checked Singapore Airlines pet policy — they allow it.',
     'Singapore Airlines · SQ221'),

    (uid, 'volunteer', 'still_needed', 'Seoul', 'Frankfurt', '2026-06-03',
     'Business trip ICN→FRA on Korean Air. I love animals and would be glad to help transport a small pet. Korean Air allows one pet in cabin per passenger.',
     'Korean Air · KE907');

END $$;
