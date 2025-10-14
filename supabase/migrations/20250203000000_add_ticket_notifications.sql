-- Migration: Add Support Ticket Notification System
-- Description: Automatically create notifications when admins respond to support tickets
-- Created: 2025-02-03

-- 1. Create function to notify user when admin responds to their ticket
CREATE OR REPLACE FUNCTION public.notify_user_on_ticket_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    ticket_record RECORD;
    responder_name TEXT;
BEGIN
    -- Get ticket details and responder info
    SELECT 
        st.user_id,
        st.subject,
        st.id as ticket_id,
        up.full_name as responder_name,
        up.role as responder_role
    INTO ticket_record
    FROM public.support_tickets st
    LEFT JOIN public.user_profiles up ON up.id = NEW.user_id
    WHERE st.id = NEW.ticket_id;

    -- Only create notification if response is from admin (not user themselves)
    IF NEW.is_admin_response = true AND NEW.user_id != ticket_record.user_id THEN
        -- Create notification for the ticket owner
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            link,
            metadata
        ) VALUES (
            ticket_record.user_id,
            'support_response',
            'Admin Response to Your Ticket',
            CONCAT(
                COALESCE(ticket_record.responder_name, 'An admin'),
                ' responded to your ticket: "',
                LEFT(ticket_record.subject, 50),
                CASE WHEN LENGTH(ticket_record.subject) > 50 THEN '..."' ELSE '"' END
            ),
            '/my-tickets?ticket=' || ticket_record.ticket_id,
            jsonb_build_object(
                'ticket_id', ticket_record.ticket_id,
                'response_id', NEW.id,
                'responder_id', NEW.user_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Create trigger for ticket responses
DROP TRIGGER IF EXISTS trigger_notify_ticket_response ON public.ticket_responses;
CREATE TRIGGER trigger_notify_ticket_response
    AFTER INSERT ON public.ticket_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_user_on_ticket_response();

-- 3. Create function to notify user when ticket status changes
CREATE OR REPLACE FUNCTION public.notify_user_on_ticket_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    status_message TEXT;
BEGIN
    -- Only notify if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Create appropriate message based on new status
        status_message := CASE NEW.status
            WHEN 'in_progress' THEN 'Your support ticket is now being worked on.'
            WHEN 'resolved' THEN 'Your support ticket has been resolved.'
            WHEN 'closed' THEN 'Your support ticket has been closed.'
            ELSE 'Your support ticket status has been updated.'
        END;

        -- Create notification
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            link,
            metadata
        ) VALUES (
            NEW.user_id,
            'support_status_update',
            'Ticket Status Updated',
            CONCAT(
                status_message,
                ' Subject: "',
                LEFT(NEW.subject, 50),
                CASE WHEN LENGTH(NEW.subject) > 50 THEN '..."' ELSE '"' END
            ),
            '/my-tickets?ticket=' || NEW.id,
            jsonb_build_object(
                'ticket_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 4. Create trigger for ticket status changes
DROP TRIGGER IF EXISTS trigger_notify_ticket_status ON public.support_tickets;
CREATE TRIGGER trigger_notify_ticket_status
    AFTER UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_user_on_ticket_status_change();

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.notify_user_on_ticket_response() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_user_on_ticket_status_change() TO authenticated;

-- 6. Add comment
COMMENT ON FUNCTION public.notify_user_on_ticket_response() IS 'Automatically creates notifications when admins respond to support tickets';
COMMENT ON FUNCTION public.notify_user_on_ticket_status_change() IS 'Automatically creates notifications when ticket status changes';