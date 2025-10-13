-- Add accepting_applications field to jobs table
-- Location: supabase/migrations/20250201000000_add_accepting_applications_to_jobs.sql

-- Add accepting_applications column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN accepting_applications BOOLEAN DEFAULT true NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_jobs_accepting_applications ON public.jobs(accepting_applications);

-- Add comment to explain the column
COMMENT ON COLUMN public.jobs.accepting_applications IS 'Whether the job is currently accepting new applications. Job poster can toggle this.';