-- Migration: Performance Optimization for 1M+ Users
-- Description: Implement Full-Text Search, Denormalization, and High-Performance RPCs
-- Date: 2026-02-19

-- 1. ADD FULL-TEXT SEARCH COLUMNS AND INDEXES
-- For Jobs (using trigger instead of generated column due to immutability constraint)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS fts tsvector;

CREATE INDEX IF NOT EXISTS idx_jobs_fts ON public.jobs USING gin(fts);

-- For User Profiles (using trigger instead of generated column)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS fts tsvector;

CREATE INDEX IF NOT EXISTS idx_user_profiles_fts ON public.user_profiles USING gin(fts);

-- Trigger function to update jobs FTS column
CREATE OR REPLACE FUNCTION public.update_jobs_fts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.fts := to_tsvector('english', 
        coalesce(NEW.title, '') || ' ' || 
        coalesce(NEW.description, '') || ' ' || 
        coalesce(NEW.category, '') || ' ' || 
        coalesce(NEW.city, '') || ' ' || 
        coalesce(NEW.state, '')
    );
    RETURN NEW;
END;
$$;

-- Trigger function to update user_profiles FTS column
CREATE OR REPLACE FUNCTION public.update_profiles_fts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.fts := to_tsvector('english', 
        coalesce(NEW.full_name, '') || ' ' || 
        coalesce(NEW.bio, '') || ' ' || 
        coalesce(NEW.location, '') || ' ' || 
        array_to_string(coalesce(NEW.skills, ARRAY[]::text[]), ' ') || ' ' ||
        array_to_string(coalesce(NEW.service_categories, ARRAY[]::text[]), ' ')
    );
    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS tr_update_jobs_fts ON public.jobs;
CREATE TRIGGER tr_update_jobs_fts
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_jobs_fts();

DROP TRIGGER IF EXISTS tr_update_profiles_fts ON public.user_profiles;
CREATE TRIGGER tr_update_profiles_fts
BEFORE INSERT OR UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_profiles_fts();

-- Populate existing FTS columns for jobs
UPDATE public.jobs SET fts = to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(description, '') || ' ' || 
    coalesce(category, '') || ' ' || 
    coalesce(city, '') || ' ' || 
    coalesce(state, '')
) WHERE fts IS NULL;

-- Populate existing FTS columns for user_profiles
UPDATE public.user_profiles SET fts = to_tsvector('english', 
    coalesce(full_name, '') || ' ' || 
    coalesce(bio, '') || ' ' || 
    coalesce(location, '') || ' ' || 
    array_to_string(coalesce(skills, ARRAY[]::text[]), ' ') || ' ' ||
    array_to_string(coalesce(service_categories, ARRAY[]::text[]), ' ')
) WHERE fts IS NULL;

-- 2. DENORMALIZE AGGREGATE DATA ON USER_PROFILES
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jobs_posted_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jobs_completed_count INTEGER DEFAULT 0;

-- 3. CREATE REFRESH FUNCTIONS AND TRIGGERS
-- Function to update profile stats from reviews
CREATE OR REPLACE FUNCTION public.sync_profile_review_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE public.user_profiles
        SET 
            avg_rating = (SELECT coalesce(avg(rating), 0) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id),
            review_count = (SELECT count(*) FROM public.reviews WHERE reviewee_id = NEW.reviewee_id)
        WHERE id = NEW.reviewee_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.user_profiles
        SET 
            avg_rating = (SELECT coalesce(avg(rating), 0) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id),
            review_count = (SELECT count(*) FROM public.reviews WHERE reviewee_id = OLD.reviewee_id)
        WHERE id = OLD.reviewee_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to update profile stats from jobs
CREATE OR REPLACE FUNCTION public.sync_profile_job_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        UPDATE public.user_profiles
        SET 
            jobs_posted_count = (SELECT count(*) FROM public.jobs WHERE user_id = NEW.user_id),
            jobs_completed_count = (SELECT count(*) FROM public.jobs WHERE user_id = NEW.user_id AND status = 'completed'::public.job_status)
        WHERE id = NEW.user_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.user_profiles
        SET 
            jobs_posted_count = (SELECT count(*) FROM public.jobs WHERE user_id = OLD.user_id),
            jobs_completed_count = (SELECT count(*) FROM public.jobs WHERE user_id = OLD.user_id AND status = 'completed'::public.job_status)
        WHERE id = OLD.user_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS tr_sync_review_stats ON public.reviews;
CREATE TRIGGER tr_sync_review_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_review_stats();

DROP TRIGGER IF EXISTS tr_sync_job_stats ON public.jobs;
CREATE TRIGGER tr_sync_job_stats
AFTER INSERT OR UPDATE OR DELETE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_job_stats();

-- 4. HIGH-PERFORMANCE SEARCH RPCs
-- Search Jobs RPC
CREATE OR REPLACE FUNCTION public.search_jobs_optimized(
    p_query TEXT DEFAULT '',
    p_category TEXT DEFAULT NULL,
    p_urgency public.job_urgency DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_min_budget DECIMAL DEFAULT NULL,
    p_max_budget DECIMAL DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    title TEXT,
    category TEXT,
    description TEXT,
    budget_min DECIMAL,
    budget_max DECIMAL,
    budget_type public.budget_type,
    urgency public.job_urgency,
    state TEXT,
    city TEXT,
    created_at TIMESTAMPTZ,
    poster_name TEXT,
    poster_avatar TEXT,
    total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_limit;
BEGIN
    RETURN QUERY
    WITH filtered_jobs AS (
        SELECT 
            j.*,
            up.full_name as v_poster_name,
            up.avatar_url as v_poster_avatar,
            COUNT(*) OVER() as v_total_count
        FROM public.jobs j
        LEFT JOIN public.user_profiles up ON j.user_id = up.id
        WHERE j.status = 'open'::public.job_status
        AND (p_query = '' OR j.fts @@ websearch_to_tsquery('english', p_query))
        AND (p_category IS NULL OR j.category = p_category)
        AND (p_urgency IS NULL OR j.urgency = p_urgency)
        AND (p_state IS NULL OR j.state = p_state)
        AND (p_city IS NULL OR j.city = p_city)
        AND (p_min_budget IS NULL OR j.budget_min >= p_min_budget)
        AND (p_max_budget IS NULL OR (j.budget_max IS NOT NULL AND j.budget_max <= p_max_budget))
    )
    SELECT 
        fj.id, fj.user_id, fj.title, fj.category, fj.description, 
        fj.budget_min, fj.budget_max, fj.budget_type, fj.urgency, 
        fj.state, fj.city, fj.created_at, 
        fj.v_poster_name, fj.v_poster_avatar, fj.v_total_count
    FROM filtered_jobs fj
    ORDER BY 
        CASE WHEN p_query != '' THEN ts_rank(fj.fts, websearch_to_tsquery('english', p_query)) ELSE 0 END DESC,
        fj.created_at DESC
    LIMIT p_limit
    OFFSET v_offset;
END;
$$;

-- Search Professionals RPC
CREATE OR REPLACE FUNCTION public.search_professionals_optimized(
    p_query TEXT DEFAULT '',
    p_skills TEXT[] DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_min_rating DECIMAL DEFAULT NULL,
    p_verified_only BOOLEAN DEFAULT FALSE,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    avg_rating DECIMAL,
    review_count INTEGER,
    verification_status public.verification_status,
    skills TEXT[],
    total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_offset INTEGER := (p_page - 1) * p_limit;
BEGIN
    RETURN QUERY
    WITH filtered_profs AS (
        SELECT 
            up.*,
            COUNT(*) OVER() as v_total_count
        FROM public.user_profiles up
        WHERE up.role = 'professional'::public.user_role
        AND (p_query = '' OR up.fts @@ websearch_to_tsquery('english', p_query))
        AND (p_skills IS NULL OR up.skills @> p_skills OR up.service_categories && p_skills)
        AND (p_location IS NULL OR up.location ILIKE '%' || p_location || '%')
        AND (p_min_rating IS NULL OR up.avg_rating >= p_min_rating)
        AND (NOT p_verified_only OR up.verification_status = 'verified'::public.verification_status)
    )
    SELECT 
        fp.id, fp.full_name, fp.avatar_url, fp.bio, fp.location, 
        fp.avg_rating, fp.review_count, fp.verification_status, fp.skills,
        fp.v_total_count
    FROM filtered_profs fp
    ORDER BY 
        CASE WHEN p_query != '' THEN ts_rank(fp.fts, websearch_to_tsquery('english', p_query)) ELSE 0 END DESC,
        fp.avg_rating DESC,
        fp.review_count DESC
    LIMIT p_limit
    OFFSET v_offset;
END;
$$;

-- 5. UNIQUE VALUES RPCs
CREATE OR REPLACE FUNCTION public.get_unique_job_categories()
RETURNS TABLE (category TEXT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT DISTINCT category FROM public.jobs WHERE status = 'open'::public.job_status ORDER BY category;
$$;

CREATE OR REPLACE FUNCTION public.get_unique_professional_skills()
RETURNS TABLE (skill TEXT)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT DISTINCT unnest(skills) FROM public.user_profiles WHERE role = 'professional'::public.user_role AND skills IS NOT NULL ORDER BY 1;
$$;

-- 6. INITIAL DATA SEEDING (Refresh current stats)
UPDATE public.user_profiles up
SET 
    avg_rating = (SELECT coalesce(avg(rating), 0) FROM public.reviews WHERE reviewee_id = up.id),
    review_count = (SELECT count(*) FROM public.reviews WHERE reviewee_id = up.id),
    jobs_posted_count = (SELECT count(*) FROM public.jobs WHERE user_id = up.id),
    jobs_completed_count = (SELECT count(*) FROM public.jobs WHERE user_id = up.id AND status = 'completed'::public.job_status);
