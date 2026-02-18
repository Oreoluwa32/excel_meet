-- Migration: Security Hardening
-- Description: Implement maximum security measures to prevent exploitation and data leakage
-- Date: 2026-02-18

-- 1. Ensure all public functions have a secure search_path
-- This prevents search_path injection attacks

-- Fix get_recent_searches (Security Vulnerability: was SECURITY DEFINER without check)
CREATE OR REPLACE FUNCTION public.get_recent_searches(
    p_user_id UUID,
    p_search_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    search_query TEXT,
    search_type TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER -- Changed to INVOKER to respect RLS
SET search_path = public
AS $$
    SELECT DISTINCT ON (search_query, search_type)
        search_query,
        search_type,
        created_at
    FROM public.search_history
    WHERE user_id = p_user_id
    AND (p_search_type IS NULL OR search_type = p_search_type)
    ORDER BY search_query, search_type, created_at DESC
    LIMIT p_limit;
$$;

-- Fix other search functions
ALTER FUNCTION public.get_trending_searches(TEXT, INTEGER) SET search_path = public;
ALTER FUNCTION public.get_popular_categories(INTEGER) SET search_path = public;
ALTER FUNCTION public.cleanup_old_search_history() SET search_path = public;

-- Fix admin functions
ALTER FUNCTION public.get_user_activity_stats(INTEGER) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_profile_owner(UUID) SET search_path = public;

-- 2. Restrict and Consolidate user_profiles SELECT policies
-- Performance Fix: Use (SELECT auth.uid()) and consolidate overlapping policies

DROP POLICY IF EXISTS "users_can_view_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "anyone_can_view_professional_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "view_professional_profiles_discovery" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "authenticated_view_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "anonymous_view_professional_profiles" ON public.user_profiles;

-- Consolidated SELECT policy for authenticated users
CREATE POLICY "authenticated_view_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) = id 
    OR role = 'professional'::public.user_role 
    OR public.is_admin()
);

-- Separate policy for anonymous users (discovery only)
CREATE POLICY "anonymous_view_professional_profiles"
ON public.user_profiles
FOR SELECT
TO anon
USING (role = 'professional'::public.user_role);

-- 3. Harden search_history
-- Performance Fix: Wrap auth.uid() in (SELECT auth.uid()) and consolidate policies
DROP POLICY IF EXISTS "users_can_view_own_search_history" ON public.search_history;
DROP POLICY IF EXISTS "admins_can_view_all_search_history" ON public.search_history;
DROP POLICY IF EXISTS "users_can_view_search_history" ON public.search_history;
DROP POLICY IF EXISTS "authenticated_view_search_history" ON public.search_history;

CREATE POLICY "authenticated_view_search_history"
ON public.search_history
FOR SELECT
TO authenticated
USING (
    (SELECT auth.uid()) = user_id 
    OR public.is_admin()
);

DROP POLICY IF EXISTS "users_can_insert_own_search_history" ON public.search_history;
CREATE POLICY "users_can_insert_own_search_history"
ON public.search_history
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "users_can_delete_own_search_history" ON public.search_history;
CREATE POLICY "users_can_delete_own_search_history"
ON public.search_history
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- 4. Harden Messaging System
-- Ensure all messaging functions have secure search_path
ALTER FUNCTION public.get_or_create_conversation(UUID, UUID, UUID) SET search_path = public;
ALTER FUNCTION public.update_conversation_last_message() SET search_path = public;

-- 5. Consolidate system_logs policies
-- Performance Fix: Remove overlap for authenticated SELECT
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_can_view_logs" ON public.system_logs;
DROP POLICY IF EXISTS "admins_manage_logs" ON public.system_logs;
DROP POLICY IF EXISTS "system_logs_write_policy" ON public.system_logs;

CREATE POLICY "admins_manage_logs"
ON public.system_logs
FOR ALL
TO authenticated
USING (public.is_admin());

-- 6. Fix get_job_applications_with_details (Security Vulnerability: leaked applicant emails)
CREATE OR REPLACE FUNCTION public.get_job_applications_with_details(p_job_id UUID)
RETURNS TABLE (
    id UUID,
    job_id UUID,
    applicant_id UUID,
    proposal TEXT,
    status public.application_status,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    applicant_name TEXT,
    applicant_email TEXT,
    applicant_avatar TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow job poster or admin to see these details
    IF NOT public.is_admin() AND NOT EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = p_job_id
        AND jobs.user_id = (SELECT auth.uid())
    ) THEN
        RAISE EXCEPTION 'Access denied. Only job posters or admins can view application details.';
    END IF;

    RETURN QUERY
    SELECT 
        ja.id,
        ja.job_id,
        ja.applicant_id,
        ja.proposal,
        ja.status,
        ja.created_at,
        ja.updated_at,
        up.full_name as applicant_name,
        up.email as applicant_email,
        up.avatar_url as applicant_avatar
    FROM public.job_applications ja
    LEFT JOIN public.user_profiles up ON ja.applicant_id = up.id
    WHERE ja.job_id = p_job_id
    ORDER BY ja.created_at DESC;
END;
$$;

-- 7. Fix other functions lacking search_path or proper security
ALTER FUNCTION public.has_user_applied_to_job(UUID, UUID) SET search_path = public;
ALTER FUNCTION public.get_job_application_count(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_reviews_count(UUID) SET search_path = public;
ALTER FUNCTION public.get_user_average_rating(UUID) SET search_path = public;

-- 8. Final check on all tables for RLS
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;
