-- Add service_categories field to user_profiles table
-- This allows users to specify their service categories

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS service_categories TEXT[] DEFAULT '{}';

-- Create index for service_categories for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_service_categories 
ON public.user_profiles USING GIN (service_categories);

-- Add comment to document the column
COMMENT ON COLUMN public.user_profiles.service_categories IS 'Array of service categories that the user offers';