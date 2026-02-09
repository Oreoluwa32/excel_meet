-- Migration: Allow anonymous users to view professional profiles
-- Description: Enables discovery search for non-logged in users

-- Add policy for anonymous users to view profiles
-- We specifically allow viewing professional profiles for discovery
CREATE POLICY "anyone_can_view_professional_profiles"
ON public.user_profiles
FOR SELECT
USING (role = 'professional'::public.user_role);

-- Ensure reviews are also visible to anonymous users
DROP POLICY IF EXISTS "anyone_can_view_reviews" ON public.reviews;
CREATE POLICY "anyone_can_view_reviews"
ON public.reviews
FOR SELECT
USING (true);
