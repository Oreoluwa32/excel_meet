-- Create reviews table for Excel-meet
-- Location: supabase/migrations/20250121000000_create_reviews_table.sql

-- 1. Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    service_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Ensure a user can only review another user once per job
    CONSTRAINT unique_review_per_job UNIQUE (reviewer_id, reviewee_id, job_id)
);

-- 2. Create indexes for better query performance
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX idx_reviews_job_id ON public.reviews(job_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- 3. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies

-- Anyone can view reviews
CREATE POLICY "anyone_can_view_reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Authenticated users can create reviews
CREATE POLICY "authenticated_users_can_create_reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "users_can_update_own_reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id)
WITH CHECK (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "users_can_delete_own_reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = reviewer_id);

-- Admins can manage all reviews
CREATE POLICY "admins_can_manage_all_reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create function to get user's average rating
CREATE OR REPLACE FUNCTION public.get_user_average_rating(p_user_id UUID)
RETURNS DECIMAL
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(AVG(rating), 0)
    FROM public.reviews
    WHERE reviewee_id = p_user_id;
$$;

-- 7. Create function to get user's total reviews count
CREATE OR REPLACE FUNCTION public.get_user_reviews_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.reviews
    WHERE reviewee_id = p_user_id;
$$;

-- 8. Create function to get reviews for a user with reviewer details
CREATE OR REPLACE FUNCTION public.get_user_reviews_with_details(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    reviewer_id UUID,
    reviewer_name TEXT,
    reviewer_avatar TEXT,
    rating INTEGER,
    comment TEXT,
    service_date DATE,
    created_at TIMESTAMPTZ,
    job_id UUID,
    job_title TEXT
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        r.id,
        r.reviewer_id,
        up.full_name as reviewer_name,
        up.avatar_url as reviewer_avatar,
        r.rating,
        r.comment,
        r.service_date,
        r.created_at,
        r.job_id,
        j.title as job_title
    FROM public.reviews r
    LEFT JOIN public.user_profiles up ON r.reviewer_id = up.id
    LEFT JOIN public.jobs j ON r.job_id = j.id
    WHERE r.reviewee_id = p_user_id
    ORDER BY r.created_at DESC
    LIMIT p_limit;
$$;

-- 9. Add computed fields to user_profiles view (optional - for easier querying)
COMMENT ON TABLE public.reviews IS 'Stores user reviews and ratings for completed jobs';
COMMENT ON COLUMN public.reviews.reviewer_id IS 'User who wrote the review';
COMMENT ON COLUMN public.reviews.reviewee_id IS 'User being reviewed';
COMMENT ON COLUMN public.reviews.job_id IS 'Related job (optional)';
COMMENT ON COLUMN public.reviews.rating IS 'Rating from 1 to 5 stars';