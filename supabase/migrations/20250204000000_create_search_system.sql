-- Migration: Create Search System
-- Description: Add search history tracking and trending searches functionality
-- Created: 2025-02-04

-- 1. Create search_history table to track user searches
CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_type TEXT NOT NULL CHECK (search_type IN ('jobs', 'professionals')),
    filters JSONB DEFAULT '{}'::jsonb,
    results_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_search_type ON public.search_history(search_type);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history USING gin(to_tsvector('english', search_query));

-- 3. Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can view their own search history
CREATE POLICY "users_can_view_own_search_history"
ON public.search_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own search history
CREATE POLICY "users_can_insert_own_search_history"
ON public.search_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own search history
CREATE POLICY "users_can_delete_own_search_history"
ON public.search_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all search history (for analytics)
CREATE POLICY "admins_can_view_all_search_history"
ON public.search_history
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 5. Create function to get user's recent searches
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
SECURITY DEFINER
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

-- 6. Create function to get trending searches (most popular in last 7 days)
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
AS $$
    SELECT 
        search_query,
        COUNT(*) as search_count,
        search_type
    FROM public.search_history
    WHERE created_at >= NOW() - INTERVAL '7 days'
    AND (p_search_type IS NULL OR search_type = p_search_type)
    AND search_query != ''
    GROUP BY search_query, search_type
    ORDER BY search_count DESC, search_query
    LIMIT p_limit;
$$;

-- 7. Create function to get popular categories from jobs
CREATE OR REPLACE FUNCTION public.get_popular_categories(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    category TEXT,
    job_count BIGINT,
    professional_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
    WITH job_categories AS (
        SELECT 
            category,
            COUNT(*) as job_count
        FROM public.jobs
        WHERE status = 'open'
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY category
    ),
    professional_categories AS (
        SELECT 
            UNNEST(service_categories) as category,
            COUNT(*) as professional_count
        FROM public.user_profiles
        WHERE role = 'professional'
        AND service_categories IS NOT NULL
        AND array_length(service_categories, 1) > 0
        GROUP BY category
    )
    SELECT 
        COALESCE(jc.category, pc.category) as category,
        COALESCE(jc.job_count, 0) as job_count,
        COALESCE(pc.professional_count, 0) as professional_count
    FROM job_categories jc
    FULL OUTER JOIN professional_categories pc ON jc.category = pc.category
    ORDER BY (COALESCE(jc.job_count, 0) + COALESCE(pc.professional_count, 0)) DESC
    LIMIT p_limit;
$$;

-- 8. Create function to clean old search history (keep last 100 per user)
CREATE OR REPLACE FUNCTION public.cleanup_old_search_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.search_history
    WHERE id IN (
        SELECT id
        FROM (
            SELECT 
                id,
                ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
            FROM public.search_history
        ) sub
        WHERE rn > 100
    );
END;
$$;

-- 9. Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.search_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_searches(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trending_searches(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_categories(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_search_history() TO authenticated;

-- 10. Add comments
COMMENT ON TABLE public.search_history IS 'Stores user search history for personalization and analytics';
COMMENT ON FUNCTION public.get_recent_searches(UUID, TEXT, INTEGER) IS 'Get user recent searches with optional type filter';
COMMENT ON FUNCTION public.get_trending_searches(TEXT, INTEGER) IS 'Get trending searches from last 7 days';
COMMENT ON FUNCTION public.get_popular_categories(INTEGER) IS 'Get popular categories based on jobs and professionals';
COMMENT ON FUNCTION public.cleanup_old_search_history() IS 'Clean up old search history, keeping last 100 per user';