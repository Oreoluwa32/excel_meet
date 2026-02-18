-- Migration: Add RPC for checking email existence
-- Description: Allows anonymous users to check if an email is already registered without exposing user data

CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE email = email_to_check
    );
END;
$$;

-- Grant access to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;
