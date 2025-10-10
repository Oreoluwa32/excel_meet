-- Create saved_jobs table for bookmarking jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a user can only save a job once
    UNIQUE(user_id, job_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_created_at ON saved_jobs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_jobs

-- Users can view their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
    ON saved_jobs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can save jobs
CREATE POLICY "Users can save jobs"
    ON saved_jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can unsave their own saved jobs
CREATE POLICY "Users can unsave their own saved jobs"
    ON saved_jobs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE saved_jobs IS 'Stores user bookmarked/saved jobs for later viewing';