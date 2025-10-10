-- Create jobs table for Excel-meet
-- Location: supabase/migrations/20250116000000_create_jobs_table.sql

-- 1. Create job status enum
CREATE TYPE public.job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');

-- 2. Create job urgency enum
CREATE TYPE public.job_urgency AS ENUM ('urgent', 'high', 'normal', 'low');

-- 3. Create budget type enum
CREATE TYPE public.budget_type AS ENUM ('fixed', 'hourly');

-- 4. Create jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL NOT NULL,
    budget_max DECIMAL,
    budget_type public.budget_type NOT NULL DEFAULT 'fixed'::public.budget_type,
    urgency public.job_urgency NOT NULL DEFAULT 'normal'::public.job_urgency,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT,
    start_date DATE NOT NULL,
    duration INTEGER,
    duration_unit TEXT,
    skills_required TEXT[] DEFAULT ARRAY[]::TEXT[],
    requirements TEXT,
    status public.job_status DEFAULT 'open'::public.job_status,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes for better query performance
CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_urgency ON public.jobs(urgency);
CREATE INDEX idx_jobs_state ON public.jobs(state);
CREATE INDEX idx_jobs_city ON public.jobs(city);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_start_date ON public.jobs(start_date);

-- 6. Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies

-- Anyone can view open jobs
CREATE POLICY "anyone_can_view_open_jobs"
ON public.jobs
FOR SELECT
USING (status = 'open'::public.job_status OR auth.uid() = user_id);

-- Authenticated users can create jobs
CREATE POLICY "authenticated_users_can_create_jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "users_can_update_own_jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own jobs
CREATE POLICY "users_can_delete_own_jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all jobs
CREATE POLICY "admins_can_manage_all_jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. Create trigger for updated_at
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create function to get nearby jobs (for future use)
CREATE OR REPLACE FUNCTION public.get_jobs_by_location(
    p_state TEXT,
    p_city TEXT DEFAULT NULL
)
RETURNS SETOF public.jobs
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM public.jobs
    WHERE state = p_state
    AND (p_city IS NULL OR city = p_city)
    AND status = 'open'::public.job_status
    ORDER BY created_at DESC;
$$;

-- 10. Create function to get user's jobs
CREATE OR REPLACE FUNCTION public.get_user_jobs(p_user_id UUID)
RETURNS SETOF public.jobs
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT *
    FROM public.jobs
    WHERE user_id = p_user_id
    ORDER BY created_at DESC;
$$;