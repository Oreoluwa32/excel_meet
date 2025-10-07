-- Excel-meet Database Schema - JSONB Helpers
-- Location: supabase/migrations/20250115095530_jsonb_helpers.sql

-- Create a function to merge JSONB objects
CREATE OR REPLACE FUNCTION public.jsonb_merge(a JSONB, b JSONB)
RETURNS JSONB
LANGUAGE SQL
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$
    SELECT a || b
$$;

-- Create RLS policy for the function
GRANT EXECUTE ON FUNCTION public.jsonb_merge TO authenticated, anon;