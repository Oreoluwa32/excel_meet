-- Admin System - Support Tickets and Analytics
-- Location: supabase/migrations/20250202000000_create_admin_system.sql

-- 1. Create ticket status and priority enums
CREATE TYPE public.ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE public.ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.ticket_category AS ENUM ('bug', 'feature_request', 'complaint', 'question', 'other');

-- 2. Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category public.ticket_category DEFAULT 'other'::public.ticket_category,
    priority public.ticket_priority DEFAULT 'medium'::public.ticket_priority,
    status public.ticket_status DEFAULT 'open'::public.ticket_status,
    assigned_to UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 3. Create ticket_responses table
CREATE TABLE public.ticket_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_response BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create app_analytics table for tracking metrics
CREATE TABLE public.app_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_type TEXT NOT NULL, -- 'count', 'duration', 'percentage', etc.
    metadata JSONB DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create system_logs table
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level TEXT NOT NULL, -- 'info', 'warning', 'error', 'critical'
    message TEXT NOT NULL,
    source TEXT, -- component or service name
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

CREATE INDEX idx_ticket_responses_ticket_id ON public.ticket_responses(ticket_id);
CREATE INDEX idx_ticket_responses_user_id ON public.ticket_responses(user_id);
CREATE INDEX idx_ticket_responses_created_at ON public.ticket_responses(created_at DESC);

CREATE INDEX idx_app_analytics_metric_name ON public.app_analytics(metric_name);
CREATE INDEX idx_app_analytics_recorded_at ON public.app_analytics(recorded_at DESC);

CREATE INDEX idx_system_logs_log_level ON public.system_logs(log_level);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_user_id ON public.system_logs(user_id);

-- 7. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for support_tickets
CREATE POLICY "users_can_view_own_tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "users_can_create_tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_update_own_tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_can_manage_all_tickets"
ON public.support_tickets
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Create RLS policies for ticket_responses
CREATE POLICY "users_can_view_responses_for_their_tickets"
ON public.ticket_responses
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_id AND (st.user_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "users_can_create_responses_for_their_tickets"
ON public.ticket_responses
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.support_tickets st
        WHERE st.id = ticket_id AND st.user_id = auth.uid()
    ) OR public.is_admin()
);

CREATE POLICY "admins_can_manage_all_responses"
ON public.ticket_responses
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 10. Create RLS policies for app_analytics (admin only)
CREATE POLICY "admins_can_view_analytics"
ON public.app_analytics
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "admins_can_manage_analytics"
ON public.app_analytics
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 11. Create RLS policies for system_logs (admin only)
CREATE POLICY "admins_can_view_logs"
ON public.system_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "admins_can_manage_logs"
ON public.system_logs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 12. Create triggers for updated_at
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Create function to auto-update resolved_at and closed_at
CREATE OR REPLACE FUNCTION public.update_ticket_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = CURRENT_TIMESTAMP;
    END IF;
    
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_ticket_status_timestamps
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_ticket_timestamps();

-- 14. Create view for admin dashboard statistics
CREATE OR REPLACE VIEW public.admin_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.user_profiles) as total_users,
    (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'professional') as total_professionals,
    (SELECT COUNT(*) FROM public.user_profiles WHERE role = 'client') as total_clients,
    (SELECT COUNT(*) FROM public.user_profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM public.jobs) as total_jobs,
    (SELECT COUNT(*) FROM public.jobs WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_jobs_30d,
    (SELECT COUNT(*) FROM public.job_applications) as total_applications,
    (SELECT COUNT(*) FROM public.job_applications WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_applications_30d,
    (SELECT COUNT(*) FROM public.support_tickets) as total_tickets,
    (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'open') as open_tickets,
    (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'in_progress') as in_progress_tickets,
    (SELECT COUNT(*) FROM public.support_tickets WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_tickets_7d,
    (SELECT COUNT(*) FROM public.reviews) as total_reviews,
    (SELECT AVG(rating) FROM public.reviews) as average_rating;

-- 15. Grant permissions on the view
GRANT SELECT ON public.admin_dashboard_stats TO authenticated;

-- 16. Create function to get user activity
CREATE OR REPLACE FUNCTION public.get_user_activity_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    activity_date DATE,
    new_users BIGINT,
    new_jobs BIGINT,
    new_applications BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT
        d.date_series::DATE as activity_date,
        COALESCE(u.count, 0) as new_users,
        COALESCE(j.count, 0) as new_jobs,
        COALESCE(a.count, 0) as new_applications
    FROM generate_series(
        CURRENT_DATE - (days_back || ' days')::INTERVAL,
        CURRENT_DATE,
        '1 day'::INTERVAL
    ) AS d(date_series)
    LEFT JOIN (
        SELECT DATE(created_at) as user_date, COUNT(*) as count
        FROM public.user_profiles
        WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
        GROUP BY DATE(created_at)
    ) u ON d.date_series::DATE = u.user_date
    LEFT JOIN (
        SELECT DATE(created_at) as job_date, COUNT(*) as count
        FROM public.jobs
        WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
        GROUP BY DATE(created_at)
    ) j ON d.date_series::DATE = j.job_date
    LEFT JOIN (
        SELECT DATE(created_at) as app_date, COUNT(*) as count
        FROM public.job_applications
        WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
        GROUP BY DATE(created_at)
    ) a ON d.date_series::DATE = a.app_date
    ORDER BY d.date_series;
$$;