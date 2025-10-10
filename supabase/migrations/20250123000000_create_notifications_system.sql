-- Create notifications system for Excel-meet
-- Location: supabase/migrations/20250123000000_create_notifications_system.sql

-- 1. Create notification type enum
CREATE TYPE public.notification_type AS ENUM (
    'application_submitted',
    'application_accepted',
    'application_rejected',
    'application_withdrawn',
    'job_posted',
    'job_updated',
    'job_deleted',
    'review_received',
    'message_received',
    'system_announcement'
);

-- 2. Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ
);

-- 3. Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- 4. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Users can view their own notifications
CREATE POLICY "users_can_view_own_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "users_can_update_own_notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "users_can_delete_own_notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- System can create notifications (via service role)
CREATE POLICY "system_can_create_notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admins can manage all notifications
CREATE POLICY "admins_can_manage_all_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Create function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type public.notification_type,
    p_title TEXT,
    p_message TEXT,
    p_link TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        link,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_link,
        p_metadata
    )
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;

-- 7. Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.notifications
    SET read = true, read_at = CURRENT_TIMESTAMP
    WHERE id = p_notification_id
    AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$;

-- 8. Create function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.notifications
    SET read = true, read_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid()
    AND read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- 9. Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = p_user_id
    AND read = false;
$$;

-- 10. Create function to delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete read notifications older than 30 days
    DELETE FROM public.notifications
    WHERE read = true
    AND read_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 11. Create trigger function for application status changes
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    job_title TEXT;
    job_poster_id UUID;
    applicant_name TEXT;
BEGIN
    -- Get job details
    SELECT title, user_id INTO job_title, job_poster_id
    FROM public.jobs
    WHERE id = NEW.job_id;
    
    -- Get applicant name
    SELECT full_name INTO applicant_name
    FROM public.user_profiles
    WHERE id = NEW.applicant_id;
    
    -- Notify applicant of status change (if status changed)
    IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        CASE NEW.status
            WHEN 'accepted' THEN
                PERFORM public.create_notification(
                    NEW.applicant_id,
                    'application_accepted'::public.notification_type,
                    'Application Accepted! 🎉',
                    'Your application for "' || job_title || '" has been accepted!',
                    '/job-details/' || NEW.job_id,
                    jsonb_build_object(
                        'job_id', NEW.job_id,
                        'application_id', NEW.id,
                        'job_title', job_title
                    )
                );
            WHEN 'rejected' THEN
                PERFORM public.create_notification(
                    NEW.applicant_id,
                    'application_rejected'::public.notification_type,
                    'Application Update',
                    'Your application for "' || job_title || '" was not selected this time.',
                    '/job-details/' || NEW.job_id,
                    jsonb_build_object(
                        'job_id', NEW.job_id,
                        'application_id', NEW.id,
                        'job_title', job_title
                    )
                );
            WHEN 'withdrawn' THEN
                -- Notify job poster that applicant withdrew
                PERFORM public.create_notification(
                    job_poster_id,
                    'application_withdrawn'::public.notification_type,
                    'Application Withdrawn',
                    applicant_name || ' has withdrawn their application for "' || job_title || '".',
                    '/job-applications?jobId=' || NEW.job_id,
                    jsonb_build_object(
                        'job_id', NEW.job_id,
                        'application_id', NEW.id,
                        'applicant_id', NEW.applicant_id
                    )
                );
        END CASE;
    END IF;
    
    -- Notify job poster of new application (on insert)
    IF (TG_OP = 'INSERT') THEN
        PERFORM public.create_notification(
            job_poster_id,
            'application_submitted'::public.notification_type,
            'New Application Received! 📝',
            applicant_name || ' has applied for your job "' || job_title || '".',
            '/job-applications?jobId=' || NEW.job_id,
            jsonb_build_object(
                'job_id', NEW.job_id,
                'application_id', NEW.id,
                'applicant_id', NEW.applicant_id,
                'applicant_name', applicant_name
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 12. Create trigger for application notifications
DROP TRIGGER IF EXISTS trigger_notify_application_status ON public.job_applications;
CREATE TRIGGER trigger_notify_application_status
    AFTER INSERT OR UPDATE OF status ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_application_status_change();

-- 13. Create trigger function for job updates
CREATE OR REPLACE FUNCTION public.notify_job_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Notify applicants when job is deleted
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        SELECT 
            applicant_id,
            'job_deleted'::public.notification_type,
            'Job Posting Removed',
            'The job "' || OLD.title || '" you applied to has been removed by the poster.',
            jsonb_build_object('job_id', OLD.id, 'job_title', OLD.title)
        FROM public.job_applications
        WHERE job_id = OLD.id;
        
        RETURN OLD;
    END IF;
    
    -- Notify applicants when job is updated significantly
    IF (TG_OP = 'UPDATE' AND (OLD.status != NEW.status OR OLD.title != NEW.title)) THEN
        INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
        SELECT 
            applicant_id,
            'job_updated'::public.notification_type,
            'Job Updated',
            'The job "' || NEW.title || '" you applied to has been updated.',
            '/job-details/' || NEW.id,
            jsonb_build_object('job_id', NEW.id, 'job_title', NEW.title)
        FROM public.job_applications
        WHERE job_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 14. Create trigger for job notifications
DROP TRIGGER IF EXISTS trigger_notify_job_updates ON public.jobs;
CREATE TRIGGER trigger_notify_job_updates
    AFTER UPDATE OR DELETE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_job_updates();

-- 15. Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Notifications system created successfully!';
    RAISE NOTICE '📢 Real-time notifications enabled';
    RAISE NOTICE '🔔 Automatic notifications configured for:';
    RAISE NOTICE '   - New applications';
    RAISE NOTICE '   - Application status changes';
    RAISE NOTICE '   - Job updates and deletions';
END $$;