-- Migration: Fix Multiple Permissive Policies
-- Description: Consolidates overlapping RLS policies to improve performance and resolve linter warnings
-- Date: 2026-02-11

-- 1. Fix public.reviews SELECT policies
-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "anyone_can_view_reviews" ON public.reviews;
DROP POLICY IF EXISTS "users_can_view_reviews" ON public.reviews;

-- Create a single consolidated policy for viewing reviews
-- This applies to both anonymous and authenticated users
CREATE POLICY "anyone_can_view_reviews"
ON public.reviews
FOR SELECT
USING (true);

-- 2. Fix public.user_profiles SELECT policies
-- Drop conflicting policies
DROP POLICY IF EXISTS "anyone_can_view_professional_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_view_all_profiles" ON public.user_profiles;

-- Allow anonymous users to view ONLY professional profiles (for discovery)
CREATE POLICY "anyone_can_view_professional_profiles"
ON public.user_profiles
FOR SELECT
TO anon
USING (role = 'professional'::public.user_role);

-- Allow authenticated users to view ALL profiles
CREATE POLICY "users_can_view_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- 3. Fix security vulnerability in get_trending_searches (mutable search_path)
CREATE OR REPLACE FUNCTION public.get_trending_searches(
    p_search_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    search_query TEXT,
    search_count BIGINT,
    search_type TEXT
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT 
        search_query,
        COUNT(*) as search_count,
        search_type
    FROM public.search_history
    WHERE created_at >= NOW() - INTERVAL '7 days'
    AND (p_search_type IS NULL OR search_type = p_search_type)
    -- Filter out queries shorter than 3 characters
    AND length(trim(search_query)) >= 3
    -- Only show queries that actually returned results
    AND results_count > 0
    GROUP BY search_query, search_type
    ORDER BY search_count DESC, search_query
    LIMIT p_limit;
$$;
