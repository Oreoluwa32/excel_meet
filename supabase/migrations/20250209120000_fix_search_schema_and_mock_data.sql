-- Migration: Fix Search Schema and Add Mock Data
-- Description: Updates foreign keys to point to user_profiles and adds mock jobs for testing

-- 1. Update foreign keys in public.jobs
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_user_id_fkey,
ADD CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 2. Update foreign keys in public.reviews
ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey,
ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_reviewee_id_fkey,
ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 3. Update foreign keys in public.job_applications
ALTER TABLE public.job_applications
DROP CONSTRAINT IF EXISTS job_applications_applicant_id_fkey,
ADD CONSTRAINT job_applications_applicant_id_fkey FOREIGN KEY (applicant_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 4. Add mock data for jobs
DO $$
DECLARE
    professional_uuid UUID;
    client_uuid UUID;
BEGIN
    -- Get existing user IDs
    SELECT id INTO professional_uuid FROM public.user_profiles WHERE email = 'john.doe@excel-meet.com' LIMIT 1;
    SELECT id INTO client_uuid FROM public.user_profiles WHERE email = 'hilton@excel-meet.com' LIMIT 1;

    -- If users don't exist (e.g. clean DB), skip mock data
    IF client_uuid IS NOT NULL THEN
        INSERT INTO public.jobs (
            user_id, title, category, description, budget_min, budget_max, 
            urgency, state, city, start_date, status
        ) VALUES 
        (client_uuid, 'Fix Kitchen Sink', 'Plumbing', 'My kitchen sink is leaking and I need someone to fix it ASAP.', 50, 150, 'urgent', 'Lagos', 'Ikeja', CURRENT_DATE + 1, 'open'),
        (client_uuid, 'Install Bathroom Tiles', 'Renovation', 'Need a professional to install new tiles in the master bathroom.', 500, 1200, 'normal', 'Abuja', 'Garki', CURRENT_DATE + 5, 'open'),
        (client_uuid, 'Clogged Drain Repair', 'Plumbing', 'Main drain is clogged. Requires immediate attention.', 100, 200, 'high', 'Rivers', 'Port Harcourt', CURRENT_DATE, 'open'),
        (client_uuid, 'General Home Maintenance', 'Maintenance', 'Looking for someone to handle various small repairs around the house.', 200, 500, 'low', 'Lagos', 'Lekki', CURRENT_DATE + 10, 'open');
    END IF;
END $$;
