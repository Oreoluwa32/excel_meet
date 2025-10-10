-- Add job statistics functions for user profiles
-- This provides counts for jobs posted, active jobs, and completed jobs

-- Function to get count of jobs posted by a user
CREATE OR REPLACE FUNCTION public.get_user_jobs_posted_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.jobs
    WHERE user_id = p_user_id;
$$;

-- Function to get count of active jobs (open or in_progress) posted by a user
CREATE OR REPLACE FUNCTION public.get_user_active_jobs_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.jobs
    WHERE user_id = p_user_id
    AND status IN ('open'::public.job_status, 'in_progress'::public.job_status);
$$;

-- Function to get count of completed jobs posted by a user
CREATE OR REPLACE FUNCTION public.get_user_completed_jobs_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.jobs
    WHERE user_id = p_user_id
    AND status = 'completed'::public.job_status;
$$;

-- Function to get jobs posted by a user with details
CREATE OR REPLACE FUNCTION public.get_user_posted_jobs(p_user_id UUID)
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
    address TEXT,
    start_date DATE,
    duration INTEGER,
    duration_unit TEXT,
    skills_required TEXT[],
    requirements TEXT,
    status public.job_status,
    images TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    application_count INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        j.id,
        j.user_id,
        j.title,
        j.category,
        j.description,
        j.budget_min,
        j.budget_max,
        j.budget_type,
        j.urgency,
        j.state,
        j.city,
        j.address,
        j.start_date,
        j.duration,
        j.duration_unit,
        j.skills_required,
        j.requirements,
        j.status,
        j.images,
        j.created_at,
        j.updated_at,
        (SELECT COUNT(*)::INTEGER FROM public.job_applications WHERE job_id = j.id) as application_count
    FROM public.jobs j
    WHERE j.user_id = p_user_id
    ORDER BY j.created_at DESC;
$$;

-- Function to get active jobs (accepted applications) for a professional
CREATE OR REPLACE FUNCTION public.get_professional_active_jobs(p_user_id UUID)
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
    address TEXT,
    start_date DATE,
    duration INTEGER,
    duration_unit TEXT,
    skills_required TEXT[],
    requirements TEXT,
    status public.job_status,
    images TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    poster_name TEXT,
    poster_avatar TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        j.id,
        j.user_id,
        j.title,
        j.category,
        j.description,
        j.budget_min,
        j.budget_max,
        j.budget_type,
        j.urgency,
        j.state,
        j.city,
        j.address,
        j.start_date,
        j.duration,
        j.duration_unit,
        j.skills_required,
        j.requirements,
        j.status,
        j.images,
        j.created_at,
        j.updated_at,
        up.full_name as poster_name,
        up.avatar_url as poster_avatar
    FROM public.jobs j
    INNER JOIN public.job_applications ja ON j.id = ja.job_id
    LEFT JOIN public.user_profiles up ON j.user_id = up.id
    WHERE ja.applicant_id = p_user_id
    AND ja.status = 'accepted'::public.application_status
    AND j.status IN ('open'::public.job_status, 'in_progress'::public.job_status)
    ORDER BY j.created_at DESC;
$$;

-- Function to get completed jobs for a professional
CREATE OR REPLACE FUNCTION public.get_professional_completed_jobs(p_user_id UUID)
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
    address TEXT,
    start_date DATE,
    duration INTEGER,
    duration_unit TEXT,
    skills_required TEXT[],
    requirements TEXT,
    status public.job_status,
    images TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    poster_name TEXT,
    poster_avatar TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        j.id,
        j.user_id,
        j.title,
        j.category,
        j.description,
        j.budget_min,
        j.budget_max,
        j.budget_type,
        j.urgency,
        j.state,
        j.city,
        j.address,
        j.start_date,
        j.duration,
        j.duration_unit,
        j.skills_required,
        j.requirements,
        j.status,
        j.images,
        j.created_at,
        j.updated_at,
        up.full_name as poster_name,
        up.avatar_url as poster_avatar
    FROM public.jobs j
    INNER JOIN public.job_applications ja ON j.id = ja.job_id
    LEFT JOIN public.user_profiles up ON j.user_id = up.id
    WHERE ja.applicant_id = p_user_id
    AND ja.status = 'accepted'::public.application_status
    AND j.status = 'completed'::public.job_status
    ORDER BY j.updated_at DESC;
$$;

-- Function to get count of completed jobs as a professional
CREATE OR REPLACE FUNCTION public.get_professional_completed_jobs_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.jobs j
    INNER JOIN public.job_applications ja ON j.id = ja.job_id
    WHERE ja.applicant_id = p_user_id
    AND ja.status = 'accepted'::public.application_status
    AND j.status = 'completed'::public.job_status;
$$;

-- Add comments to document the functions
COMMENT ON FUNCTION public.get_user_jobs_posted_count IS 'Returns the total count of jobs posted by a user';
COMMENT ON FUNCTION public.get_user_active_jobs_count IS 'Returns the count of active (open or in_progress) jobs posted by a user';
COMMENT ON FUNCTION public.get_user_completed_jobs_count IS 'Returns the count of completed jobs posted by a user';
COMMENT ON FUNCTION public.get_user_posted_jobs IS 'Returns all jobs posted by a user with application counts';
COMMENT ON FUNCTION public.get_professional_active_jobs IS 'Returns active jobs where the user has an accepted application';
COMMENT ON FUNCTION public.get_professional_completed_jobs IS 'Returns completed jobs where the user has an accepted application';
COMMENT ON FUNCTION public.get_professional_completed_jobs_count IS 'Returns the count of completed jobs as a professional';