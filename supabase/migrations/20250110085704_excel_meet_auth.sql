-- Excel-meet Database Schema - Authentication and User Management
-- Location: supabase/migrations/20250110085704_excel_meet_auth.sql

-- 1. Create custom types
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'professional', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro', 'elite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_profiles table (intermediary for auth relationships)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role public.user_role DEFAULT 'client'::public.user_role,
    verification_status public.verification_status DEFAULT 'pending'::public.verification_status,
    subscription_plan public.subscription_plan DEFAULT 'free'::public.subscription_plan,
    location TEXT,
    bio TEXT,
    skills TEXT[],
    social_links JSONB DEFAULT '{}'::jsonb,
    verification_documents JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create essential indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON public.user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON public.user_profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON public.user_profiles(location);

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create helper functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = (SELECT auth.uid()) AND up.role = 'admin'::public.user_role
)
$$;

CREATE OR REPLACE FUNCTION public.is_profile_owner(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = profile_id AND up.id = (SELECT auth.uid())
)
$$;

-- 6. Create RLS policies
-- Cleanup old policies to avoid multiple permissive policies warnings
DROP POLICY IF EXISTS "admins_can_manage_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_view_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_create_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_update_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_delete_profiles" ON public.user_profiles;

DROP POLICY IF EXISTS "users_can_view_all_profiles" ON public.user_profiles;
CREATE POLICY "users_can_view_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.user_profiles;
-- Consolidate policies by separating actions to avoid multiple permissive policies for SELECT
CREATE POLICY "users_can_manage_own_profile_insert"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_profile_owner(id) OR public.is_admin());

CREATE POLICY "users_can_manage_own_profile_update"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_profile_owner(id) OR public.is_admin())
WITH CHECK (public.is_profile_owner(id) OR public.is_admin());

CREATE POLICY "users_can_manage_own_profile_delete"
ON public.user_profiles
FOR DELETE
TO authenticated
USING (public.is_profile_owner(id) OR public.is_admin());

-- 7. Create function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client')::public.user_role
    );
    RETURN NEW;
END;
$$;

-- 8. Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 10. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Create mock data for testing
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    professional_uuid UUID := gen_random_uuid();
    client_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@excel-meet.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (professional_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'john.doe@excel-meet.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "John Doe", "role": "professional"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (client_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'hilton@excel-meet.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Mr. Hilton", "role": "client"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Update user profiles with additional data
    UPDATE public.user_profiles SET
        phone = '+1234567890',
        bio = 'Experienced plumber with 10+ years in residential and commercial plumbing.',
        skills = ARRAY['Plumbing', 'Pipe Installation', 'Leak Repair', 'Bathroom Renovation'],
        location = 'New York, NY',
        verification_status = 'verified'::public.verification_status,
        subscription_plan = 'pro'::public.subscription_plan,
        social_links = '{"linkedin": "https://linkedin.com/in/johndoe", "website": "https://johndoeplumbing.com"}'::jsonb
    WHERE id = professional_uuid;

    UPDATE public.user_profiles SET
        phone = '+1987654321',
        bio = 'Looking for reliable professionals for home improvement projects.',
        location = 'New York, NY',
        verification_status = 'verified'::public.verification_status,
        subscription_plan = 'basic'::public.subscription_plan
    WHERE id = client_uuid;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 12. Create cleanup function for testing
CREATE OR REPLACE FUNCTION public.cleanup_test_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs to delete
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@excel-meet.com';

    -- Delete user profiles first
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth users last
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;