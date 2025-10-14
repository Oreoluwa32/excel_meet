# Support Ticket Notification Flow

## 📊 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SUBMITS TICKET                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User clicks Help (❓)  │
                    │  in Header              │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Modal opens with form  │
                    │  - Category             │
                    │  - Priority             │
                    │  - Subject              │
                    │  - Description          │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User clicks Submit     │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Ticket saved to DB     │
                    │  (support_tickets)      │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Success message        │
                    │  "View tickets?"        │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User goes to           │
                    │  My Tickets page        │
                    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN RESPONDS                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Admin logs in          │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Admin Dashboard →      │
                    │  Support tab            │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Admin sees ticket list │
                    │  Clicks "View"          │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Modal shows ticket     │
                    │  details                │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Admin types response   │
                    │  Clicks "Send Response" │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Response saved to DB   │
                    │  (ticket_responses)     │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  🔥 DATABASE TRIGGER    │
                    │  FIRES AUTOMATICALLY    │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Notification created   │
                    │  in notifications table │
                    └─────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         USER GETS NOTIFIED                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User sees red badge    │
                    │  on notification bell   │
                    │  🔔 (1)                 │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User clicks bell       │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Dropdown shows:        │
                    │  💬 "Admin Response     │
                    │  to Your Ticket"        │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User clicks            │
                    │  notification           │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Redirected to          │
                    │  /my-tickets?ticket=ID  │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Ticket auto-opens      │
                    │  Shows conversation     │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User sees admin's      │
                    │  response! 🎉           │
                    └─────────────────────────┘
```

## 🔄 Status Change Notification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN CHANGES TICKET STATUS                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Admin opens ticket     │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Changes status:        │
                    │  Open → In Progress     │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Clicks "Update Status" │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Status updated in DB   │
                    │  (support_tickets)      │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  🔥 DATABASE TRIGGER    │
                    │  FIRES AUTOMATICALLY    │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  Notification created:  │
                    │  🎫 "Ticket Status      │
                    │  Updated"               │
                    └─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  User sees notification │
                    │  in bell                │
                    └─────────────────────────┘
```

## 🗄️ Database Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE TABLES                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  support_tickets     │
│  ─────────────────   │
│  id                  │
│  user_id             │
│  subject             │
│  description         │
│  category            │
│  priority            │
│  status ◄────────────┼─── UPDATE triggers notification
│  assigned_to         │
│  created_at          │
│  updated_at          │
└──────────────────────┘
          │
          │ ticket_id (FK)
          ▼
┌──────────────────────┐
│  ticket_responses    │
│  ─────────────────   │
│  id                  │
│  ticket_id           │
│  user_id             │
│  message             │
│  is_admin_response ◄─┼─── INSERT triggers notification
│  attachments         │
│  created_at          │
└──────────────────────┘
          │
          │ (trigger creates)
          ▼
┌──────────────────────┐
│  notifications       │
│  ─────────────────   │
│  id                  │
│  user_id             │
│  type                │
│  title               │
│  message             │
│  link                │
│  metadata            │
│  read                │
│  created_at          │
└──────────────────────┘
```

## 🎯 Trigger Logic

### **Response Notification Trigger**

```sql
WHEN: New row inserted into ticket_responses
IF: is_admin_response = true
AND: user_id != ticket_owner_id
THEN: Create notification
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TRIGGER DECISION TREE                            │
└─────────────────────────────────────────────────────────────────────┘

New response added
        │
        ▼
    Is admin response?
    (is_admin_response = true)
        │
        ├─── NO ──► Don't create notification
        │
        ▼ YES
        │
    Is responder the ticket owner?
    (user_id == ticket.user_id)
        │
        ├─── YES ──► Don't create notification
        │
        ▼ NO
        │
    Create notification ✅
        │
        ├─► Type: 'support_response'
        ├─► Title: 'Admin Response to Your Ticket'
        ├─► Message: '[Admin] responded to: [Subject]'
        ├─► Link: '/my-tickets?ticket=[id]'
        └─► Metadata: { ticket_id, response_id, responder_id }
```

### **Status Change Notification Trigger**

```sql
WHEN: Ticket status updated
IF: status changed (OLD.status != NEW.status)
THEN: Create notification
```

```
┌─────────────────────────────────────────────────────────────────────┐
│                    STATUS CHANGE FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

Ticket updated
        │
        ▼
    Did status change?
    (OLD.status != NEW.status)
        │
        ├─── NO ──► Don't create notification
        │
        ▼ YES
        │
    What's the new status?
        │
        ├─► in_progress ──► "Your ticket is being worked on"
        ├─► resolved ────► "Your ticket has been resolved"
        ├─► closed ──────► "Your ticket has been closed"
        └─► other ───────► "Your ticket status updated"
        │
        ▼
    Create notification ✅
        │
        ├─► Type: 'support_status_update'
        ├─► Title: 'Ticket Status Updated'
        ├─► Message: [Status message] + [Subject]
        ├─► Link: '/my-tickets?ticket=[id]'
        └─► Metadata: { ticket_id, old_status, new_status }
```

## 🎨 UI Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HEADER COMPONENT                            │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  Excel-meet          [💬] [🔔] [❓] [👤 Profile ▼]                │
│                                    │                                │
│                                    └─► Help Icon (opens form)       │
└────────────────────────────────────────────────────────────────────┘

Profile Dropdown:
┌────────────────────────┐
│ John Doe               │
│ client                 │
├────────────────────────┤
│ 🎫 My Tickets ◄─ NEW!  │
│ ⚙️  Settings           │
│ 🚪 Sign Out            │
└────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION BELL DROPDOWN                       │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  Notifications (2 unread)                                      [X] │
├────────────────────────────────────────────────────────────────────┤
│  ✓ Mark all read  |  🗑️ Clear read                                │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 💬  Admin Response to Your Ticket                      •     │ │
│  │     John Admin responded to your ticket: "Login bug"         │ │
│  │     2 minutes ago                                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🎫  Ticket Status Updated                               •     │ │
│  │     Your ticket is now being worked on                       │ │
│  │     5 minutes ago                                            │ │
│  └──────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│                    View all notifications                          │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       MY TICKETS PAGE                               │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  ← My Support Tickets                                              │
├────────────────────────────────────────────────────────────────────┤
│  View and track your support requests                              │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Status: [All ▼]    Category: [All ▼]                         │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ Ticket          │ Category │ Priority │ Status │ Created     │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 🐛 Login bug    │ Bug      │ High     │ Open   │ 2 min ago   │ │
│  │ #abc123         │          │          │        │ [View]      │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ ✨ Dark mode    │ Feature  │ Medium   │ Closed │ 2 days ago  │ │
│  │ #def456         │          │          │        │ [View]      │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TICKET DETAILS MODAL                             │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  Ticket #abc123                                                [X] │
├────────────────────────────────────────────────────────────────────┤
│  Status: [Open]  Priority: [High]  Category: 🐛 Bug               │
│  Created: Jan 15, 2025, 10:30 AM                                  │
│                                                                    │
│  Subject: Login bug                                                │
│  Description: Can't login with Google...                           │
│                                                                    │
│  💬 Conversation History                                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🛡️ John Admin                              2 minutes ago     │ │
│  │ We're looking into this issue. Can you provide more details? │ │
│  └──────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 👤 You                                     5 minutes ago      │ │
│  │ I'm getting an error when clicking Google login button       │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY (RLS)                         │
└─────────────────────────────────────────────────────────────────────┘

User requests tickets
        │
        ▼
    Is user authenticated?
        │
        ├─── NO ──► Access denied
        │
        ▼ YES
        │
    RLS Policy checks:
        │
        ├─► Is user admin? ──► YES ──► Show all tickets
        │
        └─► Is user owner? ──► YES ──► Show user's tickets only
                            │
                            └─► NO ──► Access denied

Notification access
        │
        ▼
    RLS Policy: user_id = auth.uid()
        │
        ├─► Match ──► Show notification
        │
        └─► No match ──► Hide notification
```

## 📊 Summary

This notification system provides:

✅ **Automatic notifications** via database triggers
✅ **Real-time updates** for users
✅ **Complete ticket tracking** in My Tickets page
✅ **Secure access** via RLS policies
✅ **Seamless integration** with existing notification system

**No manual work needed** - everything is automatic! 🎉