-- Add portfolio column to user_profiles table
-- This stores portfolio items as JSONB array with structure: [{id, title, description, image, category}]

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]'::jsonb;

-- Create index for portfolio for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_portfolio 
ON public.user_profiles USING GIN (portfolio);

-- Add comment to document the column
COMMENT ON COLUMN public.user_profiles.portfolio IS 'Array of portfolio items stored as JSONB with structure: [{id, title, description, image, category}]';