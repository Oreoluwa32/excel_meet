# Support Ticket Notification System

## Overview

This document describes the complete support ticket notification system that allows users to receive real-time notifications when admins respond to their support tickets.

## Features

### ✅ **What's Included**

1. **Automatic Notifications**
   - Users receive notifications when admins respond to their tickets
   - Users receive notifications when ticket status changes
   - Notifications appear in the notification bell
   - Notifications link directly to the ticket details

2. **My Tickets Page**
   - Users can view all their support tickets
   - Filter by status and category
   - View full conversation history
   - See ticket details and admin responses

3. **Real-time Updates**
   - Database triggers automatically create notifications
   - No manual notification creation needed
   - Works seamlessly with existing notification system

## User Flow

### **Submitting a Ticket**

1. User clicks the **Help icon (❓)** in the header
2. Fills out the support form
3. Submits the ticket
4. Gets confirmation with option to view tickets

### **Receiving Notifications**

1. Admin responds to the ticket
2. **Database trigger automatically creates notification**
3. User sees notification in the bell icon
4. User clicks notification → redirected to My Tickets page
5. User views the admin's response

### **Viewing Tickets**

1. User clicks **"My Tickets"** in profile menu
2. Sees list of all their tickets
3. Clicks **"View Details"** on any ticket
4. Sees full conversation history
5. Can track ticket status

## Technical Implementation

### **Database Triggers**

Two PostgreSQL triggers automatically create notifications:

#### 1. **Response Notification Trigger**
```sql
CREATE TRIGGER trigger_notify_ticket_response
    AFTER INSERT ON public.ticket_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_user_on_ticket_response();
```

**When it fires:**
- When a new response is added to `ticket_responses` table
- Only if `is_admin_response = true`
- Only if responder is not the ticket owner

**What it creates:**
- Notification type: `support_response`
- Title: "Admin Response to Your Ticket"
- Message: "[Admin Name] responded to your ticket: [Subject]"
- Link: `/my-tickets?ticket=[ticket_id]`

#### 2. **Status Change Notification Trigger**
```sql
CREATE TRIGGER trigger_notify_ticket_status
    AFTER UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_user_on_ticket_status_change();
```

**When it fires:**
- When ticket status is updated
- Only if status actually changed

**What it creates:**
- Notification type: `support_status_update`
- Title: "Ticket Status Updated"
- Message: Status-specific message + ticket subject
- Link: `/my-tickets?ticket=[ticket_id]`

### **Files Created**

1. **Migration File**
   - `supabase/migrations/20250203000000_add_ticket_notifications.sql`
   - Creates notification triggers and functions

2. **My Tickets Page**
   - `src/pages/my-tickets/index.jsx`
   - Full-featured ticket viewing interface

3. **Updated Files**
   - `src/Routes.jsx` - Added `/my-tickets` route
   - `src/components/ui/Header.jsx` - Added "My Tickets" link
   - `src/components/NotificationBell.jsx` - Added support notification types
   - `src/utils/adminService.js` - Added `getTicketResponses()` method

### **API Methods**

#### **Get User's Tickets**
```javascript
const result = await adminService.getSupportTickets({
  userId: user.id,
  status: 'open', // optional
  category: 'bug' // optional
});
```

#### **Get Ticket Responses**
```javascript
const result = await adminService.getTicketResponses(ticketId);
```

#### **Add Response (Admin)**
```javascript
const result = await adminService.addTicketResponse(
  ticketId,
  adminUserId,
  message,
  true // isAdminResponse
);
```

## Notification Types

### **support_response**
- **Icon:** 💬
- **Color:** Blue
- **Triggered by:** Admin responding to ticket
- **Link:** `/my-tickets?ticket=[id]`

### **support_status_update**
- **Icon:** 🎫
- **Color:** Indigo
- **Triggered by:** Ticket status change
- **Link:** `/my-tickets?ticket=[id]`

## User Interface

### **My Tickets Page Features**

1. **Filters**
   - Status: All, Open, In Progress, Resolved, Closed
   - Category: All, Bug, Feature Request, Complaint, Question, Other

2. **Ticket List**
   - Shows all user's tickets in a table
   - Displays: Subject, Category, Priority, Status, Created Date
   - Click "View Details" to see full ticket

3. **Ticket Details Modal**
   - Full ticket information
   - Status and priority badges
   - Complete conversation history
   - Admin responses highlighted in blue
   - User messages in gray
   - Timestamps for all messages

4. **Status Indicators**
   - Resolved tickets show green success message
   - Closed tickets show gray closed message

### **Navigation**

Users can access My Tickets from:
1. **Profile dropdown menu** → "My Tickets"
2. **Notification bell** → Click support notification
3. **After submitting ticket** → Confirmation dialog

## Testing

### **Test the Complete Flow**

1. **As User:**
   ```
   1. Log in as regular user
   2. Click Help icon (❓) in header
   3. Submit a support ticket
   4. Click "Yes" to view tickets
   5. See your ticket in the list
   ```

2. **As Admin:**
   ```
   1. Log in as admin
   2. Go to Admin Dashboard
   3. Click "Support" tab
   4. Find the user's ticket
   5. Click "View"
   6. Type a response
   7. Click "Send Response"
   ```

3. **Back as User:**
   ```
   1. See notification bell has new notification (red badge)
   2. Click notification bell
   3. See "Admin Response to Your Ticket"
   4. Click the notification
   5. Redirected to My Tickets page
   6. See the admin's response
   ```

### **Test Status Changes**

1. **As Admin:**
   ```
   1. Open a ticket
   2. Change status to "In Progress"
   3. Click "Update Status"
   ```

2. **As User:**
   ```
   1. See new notification
   2. "Your support ticket is now being worked on"
   3. Click to view ticket
   4. See updated status
   ```

## Database Schema

### **Notifications Table**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  type TEXT, -- 'support_response', 'support_status_update'
  title TEXT,
  message TEXT,
  link TEXT, -- '/my-tickets?ticket=[id]'
  metadata JSONB, -- { ticket_id, response_id, etc. }
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Support Tickets Table**
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  subject TEXT,
  description TEXT,
  category TEXT, -- 'bug', 'feature_request', 'complaint', 'question', 'other'
  priority TEXT, -- 'low', 'medium', 'high', 'urgent'
  status TEXT, -- 'open', 'in_progress', 'resolved', 'closed'
  assigned_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Ticket Responses Table**
```sql
CREATE TABLE ticket_responses (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id),
  user_id UUID REFERENCES user_profiles(id),
  message TEXT,
  is_admin_response BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security

### **Row Level Security (RLS)**

1. **Support Tickets**
   - Users can only view their own tickets
   - Admins can view all tickets

2. **Ticket Responses**
   - Users can only view responses for their tickets
   - Admins can view all responses

3. **Notifications**
   - Users can only view their own notifications
   - Automatic via existing RLS policies

## Future Enhancements

### **Potential Additions**

1. **Email Notifications**
   - Send email when admin responds
   - Use Supabase Edge Functions + SendGrid/Resend

2. **Push Notifications**
   - Browser push notifications
   - Mobile app notifications

3. **User Replies**
   - Allow users to reply to admin responses
   - Two-way conversation

4. **Ticket Attachments**
   - Allow users to upload screenshots
   - Store in Supabase Storage

5. **Ticket Priority Auto-escalation**
   - Automatically increase priority if no response in X days

6. **Admin Assignment Notifications**
   - Notify admins when assigned to a ticket

7. **Satisfaction Ratings**
   - Allow users to rate support experience
   - Track admin performance

## Troubleshooting

### **Notifications Not Appearing**

1. **Check database triggers:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%ticket%';
   ```

2. **Check notification creation:**
   ```sql
   SELECT * FROM notifications 
   WHERE type IN ('support_response', 'support_status_update')
   ORDER BY created_at DESC;
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

### **Tickets Not Showing**

1. **Check user_id filter:**
   - Ensure `userId` parameter is passed correctly
   - Verify user is logged in

2. **Check RLS policies:**
   - Ensure user can read their own tickets

### **Responses Not Loading**

1. **Check foreign key:**
   - Verify `ticket_id` exists in `support_tickets`

2. **Check query:**
   - Ensure `getTicketResponses()` is called with correct ticket ID

## Summary

The support ticket notification system provides a complete, automated solution for keeping users informed about their support requests. Key benefits:

✅ **Automatic** - No manual notification creation needed
✅ **Real-time** - Users notified immediately when admins respond
✅ **Integrated** - Works with existing notification system
✅ **User-friendly** - Easy to view tickets and responses
✅ **Secure** - RLS policies protect user data
✅ **Scalable** - Database triggers handle all notifications

Users can now:
- Submit support tickets easily
- Receive notifications when admins respond
- View all their tickets in one place
- Track ticket status and conversation history
- Stay informed about their support requests

Admins can:
- Respond to tickets from admin dashboard
- Update ticket status
- Assign tickets to other admins
- Know that users are automatically notified