-- Create job_applications table for Excel-meet
-- Location: supabase/migrations/20250122000000_create_job_applications_table.sql

-- 1. Create application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- 2. Create job_applications table
CREATE TABLE public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    status public.application_status DEFAULT 'pending'::public.application_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Ensure one application per user per job
    UNIQUE(job_id, applicant_id)
);

-- 3. Create indexes for better query performance
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);
CREATE INDEX idx_job_applications_created_at ON public.job_applications(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Applicants can view their own applications
CREATE POLICY "applicants_can_view_own_applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (auth.uid() = applicant_id);

-- Job posters can view applications for their jobs
CREATE POLICY "job_posters_can_view_applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.user_id = auth.uid()
    )
);

-- Authenticated users can create applications
CREATE POLICY "authenticated_users_can_create_applications"
ON public.job_applications
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = applicant_id
    AND NOT EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.user_id = auth.uid()
    )
);

-- Applicants can update their own pending applications
CREATE POLICY "applicants_can_update_own_applications"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (auth.uid() = applicant_id AND status = 'pending'::public.application_status)
WITH CHECK (auth.uid() = applicant_id);

-- Job posters can update application status
CREATE POLICY "job_posters_can_update_application_status"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.user_id = auth.uid()
    )
);

-- Applicants can delete their own pending applications
CREATE POLICY "applicants_can_delete_own_applications"
ON public.job_applications
FOR DELETE
TO authenticated
USING (auth.uid() = applicant_id AND status = 'pending'::public.application_status);

-- Admins can manage all applications
CREATE POLICY "admins_can_manage_all_applications"
ON public.job_applications
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Create trigger for updated_at
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Create function to get job applications with applicant details
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
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
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
$$;

-- 8. Create function to check if user has applied to a job
CREATE OR REPLACE FUNCTION public.has_user_applied_to_job(
    p_user_id UUID,
    p_job_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.job_applications
        WHERE applicant_id = p_user_id
        AND job_id = p_job_id
    );
$$;

-- 9. Create function to get application count for a job
CREATE OR REPLACE FUNCTION public.get_job_application_count(p_job_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.job_applications
    WHERE job_id = p_job_id;
$$;