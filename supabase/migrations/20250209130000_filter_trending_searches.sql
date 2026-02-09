-- Migration: Filter Trending Searches
-- Description: Updates the trending searches function to filter out short queries and those with no results

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
    -- Filter out queries shorter than 3 characters
    AND length(trim(search_query)) >= 3
    -- Only show queries that actually returned results
    AND results_count > 0
    GROUP BY search_query, search_type
    ORDER BY search_count DESC, search_query
    LIMIT p_limit;
$$;
