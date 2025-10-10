# 🔔 Notification System - Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────────┐         │
│  │ NotificationBell │         │  Notifications Page  │         │
│  │   (Header)       │         │   (/notifications)   │         │
│  │                  │         │                      │         │
│  │  • Bell Icon     │         │  • Filter Tabs       │         │
│  │  • Badge Count   │         │  • Bulk Actions      │         │
│  │  • Dropdown      │         │  • Full List         │         │
│  └────────┬─────────┘         └──────────┬───────────┘         │
│           │                              │                      │
└───────────┼──────────────────────────────┼──────────────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT HOOK LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│                   useNotifications()                             │
│                                                                   │
│  • State Management (notifications, unreadCount)                │
│  • Real-time Subscription Setup                                 │
│  • Browser Notification Integration                             │
│  • Methods (markAsRead, delete, etc.)                           │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│              notificationService.js                              │
│                                                                   │
│  • fetchNotifications()    • markAsRead()                       │
│  • getUnreadCount()        • markAllAsRead()                    │
│  • deleteNotification()    • deleteAllRead()                    │
│  • createNotification()    • subscribeToNotifications()         │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLIENT                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  • REST API (CRUD operations)                                   │
│  • Realtime WebSocket (subscriptions)                           │
│  • Authentication (RLS enforcement)                             │
│                                                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │         notifications TABLE                          │       │
│  │                                                       │       │
│  │  • id, user_id, type, title, message                │       │
│  │  • link, read, metadata, created_at, read_at        │       │
│  │  • RLS Policies (security)                          │       │
│  │  • Indexes (performance)                            │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────┐       │
│  │         DATABASE TRIGGERS                            │       │
│  │                                                       │       │
│  │  • trigger_notify_application_status                │       │
│  │  • trigger_notify_job_updates                       │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Notification Creation Flow

### Scenario: User Applies to Job

```
┌──────────────┐
│   User B     │
│ (Applicant)  │
└──────┬───────┘
       │
       │ 1. Clicks "Accept Job"
       ▼
┌──────────────────────────┐
│  Job Details Page        │
│  handleAcceptJob()       │
└──────┬───────────────────┘
       │
       │ 2. Calls submitApplication()
       ▼
┌──────────────────────────┐
│  applicationService.js   │
│  submitApplication()     │
└──────┬───────────────────┘
       │
       │ 3. INSERT into job_applications
       ▼
┌──────────────────────────────────────────────────────┐
│              SUPABASE DATABASE                        │
│                                                        │
│  job_applications table                               │
│  ┌─────────────────────────────────────────┐         │
│  │ INSERT new row                           │         │
│  │ (job_id, applicant_id, proposal, status)│         │
│  └─────────────┬───────────────────────────┘         │
│                │                                       │
│                │ 4. TRIGGER FIRES                     │
│                ▼                                       │
│  ┌─────────────────────────────────────────┐         │
│  │ trigger_notify_application_status        │         │
│  │                                          │         │
│  │ • Detects INSERT event                  │         │
│  │ • Gets job details (title, poster_id)   │         │
│  │ • Gets applicant name                   │         │
│  │ • Calls create_notification()           │         │
│  └─────────────┬───────────────────────────┘         │
│                │                                       │
│                │ 5. INSERT into notifications         │
│                ▼                                       │
│  ┌─────────────────────────────────────────┐         │
│  │ notifications table                      │         │
│  │                                          │         │
│  │ user_id: job_poster_id                  │         │
│  │ type: 'application_submitted'           │         │
│  │ title: 'New Application Received! 📝'   │         │
│  │ message: 'John has applied for...'      │         │
│  │ link: '/job-applications?jobId=...'     │         │
│  │ read: false                             │         │
│  └─────────────┬───────────────────────────┘         │
│                │                                       │
└────────────────┼───────────────────────────────────────┘
                 │
                 │ 6. REALTIME BROADCAST
                 ▼
┌──────────────────────────────────────────────────────┐
│         SUPABASE REALTIME                             │
│                                                        │
│  • Detects INSERT on notifications table             │
│  • Filters by user_id = job_poster_id                │
│  • Broadcasts to subscribed clients                  │
│                                                        │
└────────────────┬───────────────────────────────────────┘
                 │
                 │ 7. WebSocket message
                 ▼
┌──────────────────────────────────────────────────────┐
│         USER A's BROWSER                              │
│         (Job Poster)                                  │
│                                                        │
│  useNotifications hook receives event                │
│  ┌────────────────────────────────────────┐          │
│  │ 1. Add notification to state           │          │
│  │ 2. Increment unreadCount               │          │
│  │ 3. Show browser notification           │          │
│  │ 4. Update UI (bell badge)              │          │
│  └────────────────────────────────────────┘          │
│                                                        │
│  ┌────────────────────────────────────────┐          │
│  │  NotificationBell Component            │          │
│  │                                         │          │
│  │  🔔 [1]  ← Badge appears               │          │
│  │                                         │          │
│  │  Dropdown shows:                       │          │
│  │  📝 New Application Received!          │          │
│  │     John has applied for your job...   │          │
│  │     2 seconds ago                      │          │
│  └────────────────────────────────────────┘          │
│                                                        │
│  ┌────────────────────────────────────────┐          │
│  │  Browser Notification                  │          │
│  │  (if permission granted)               │          │
│  │                                         │          │
│  │  📝 New Application Received!          │          │
│  │  John has applied for your job...      │          │
│  └────────────────────────────────────────┘          │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## 3. Real-time Subscription Flow

```
┌──────────────────────────────────────────────────────┐
│         USER OPENS APP                                │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 1. Component mounts
                 ▼
┌──────────────────────────────────────────────────────┐
│    useNotifications() hook                            │
│                                                        │
│    useEffect(() => {                                  │
│      setupRealtimeSubscription()                     │
│    }, [])                                             │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 2. Get current user
                 ▼
┌──────────────────────────────────────────────────────┐
│    supabase.auth.getUser()                           │
│    → user.id = "abc-123"                             │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 3. Create channel
                 ▼
┌──────────────────────────────────────────────────────┐
│    supabase.channel('notifications-realtime')       │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 4. Subscribe to INSERT events
                 ▼
┌──────────────────────────────────────────────────────┐
│    .on('postgres_changes', {                         │
│      event: 'INSERT',                                │
│      schema: 'public',                               │
│      table: 'notifications',                         │
│      filter: 'user_id=eq.abc-123'                   │
│    }, callback)                                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 5. Subscribe to UPDATE events
                 ▼
┌──────────────────────────────────────────────────────┐
│    .on('postgres_changes', {                         │
│      event: 'UPDATE',                                │
│      schema: 'public',                               │
│      table: 'notifications',                         │
│      filter: 'user_id=eq.abc-123'                   │
│    }, callback)                                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 6. Subscribe to DELETE events
                 ▼
┌──────────────────────────────────────────────────────┐
│    .on('postgres_changes', {                         │
│      event: 'DELETE',                                │
│      schema: 'public',                               │
│      table: 'notifications',                         │
│      filter: 'user_id=eq.abc-123'                   │
│    }, callback)                                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 7. Activate subscription
                 ▼
┌──────────────────────────────────────────────────────┐
│    .subscribe()                                      │
│                                                        │
│    ✅ WebSocket connection established               │
│    ✅ Listening for changes                          │
└──────────────────────────────────────────────────────┘

                 ⏰ WAITING FOR EVENTS...

┌──────────────────────────────────────────────────────┐
│    NEW NOTIFICATION CREATED IN DATABASE              │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 8. Supabase broadcasts event
                 ▼
┌──────────────────────────────────────────────────────┐
│    INSERT event received                             │
│    payload.new = { id, user_id, type, title, ... }  │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 9. Callback executes
                 ▼
┌──────────────────────────────────────────────────────┐
│    setNotifications(prev => [payload.new, ...prev]) │
│    setUnreadCount(prev => prev + 1)                  │
│    showBrowserNotification(payload.new)             │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 10. UI updates
                 ▼
┌──────────────────────────────────────────────────────┐
│    ✅ Notification appears in list                   │
│    ✅ Badge count increases                          │
│    ✅ Browser notification shown                     │
│    ✅ No page refresh needed!                        │
└──────────────────────────────────────────────────────┘
```

---

## 4. User Interaction Flow

### Scenario: User Clicks Notification

```
┌──────────────────────────────────────────────────────┐
│    USER CLICKS NOTIFICATION                          │
│    (in dropdown or notifications page)               │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 1. handleNotificationClick()
                 ▼
┌──────────────────────────────────────────────────────┐
│    Check if notification is unread                   │
│    if (!notification.read) {                         │
│      markAsRead(notification.id)                     │
│    }                                                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 2. Call markAsRead()
                 ▼
┌──────────────────────────────────────────────────────┐
│    notificationService.markAsRead()                  │
│                                                        │
│    supabase                                          │
│      .from('notifications')                          │
│      .update({ read: true, read_at: now })          │
│      .eq('id', notificationId)                       │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 3. Database UPDATE
                 ▼
┌──────────────────────────────────────────────────────┐
│    SUPABASE DATABASE                                 │
│                                                        │
│    UPDATE notifications                              │
│    SET read = true, read_at = '2025-01-23...'       │
│    WHERE id = 'notification-id'                      │
│    AND user_id = 'current-user-id'  ← RLS check     │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 4. UPDATE successful
                 ▼
┌──────────────────────────────────────────────────────┐
│    Update local state                                │
│                                                        │
│    setNotifications(prev =>                          │
│      prev.map(n =>                                   │
│        n.id === notificationId                       │
│          ? { ...n, read: true, read_at: now }       │
│          : n                                         │
│      )                                               │
│    )                                                 │
│    setUnreadCount(prev => prev - 1)                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 5. Navigate to link
                 ▼
┌──────────────────────────────────────────────────────┐
│    if (notification.link) {                          │
│      navigate(notification.link)                     │
│    }                                                  │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 6. User navigates
                 ▼
┌──────────────────────────────────────────────────────┐
│    ✅ Notification marked as read                    │
│    ✅ Badge count decreased                          │
│    ✅ User navigated to relevant page                │
│    ✅ Visual feedback (blue → gray)                  │
└──────────────────────────────────────────────────────┘
```

---

## 5. Security Flow (RLS)

```
┌──────────────────────────────────────────────────────┐
│    USER TRIES TO ACCESS NOTIFICATION                 │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 1. Request sent
                 ▼
┌──────────────────────────────────────────────────────┐
│    SELECT * FROM notifications                       │
│    WHERE id = 'notification-id'                      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ 2. Supabase checks authentication
                 ▼
┌──────────────────────────────────────────────────────┐
│    Is user authenticated?                            │
│    auth.uid() = ?                                    │
└────────────────┬─────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
    ❌ NO           ✅ YES
         │               │
         ▼               ▼
┌─────────────┐   ┌──────────────────────────────────┐
│   REJECT    │   │   Check RLS Policy               │
│   401       │   │                                  │
└─────────────┘   │   USING (auth.uid() = user_id)  │
                  └────────────┬─────────────────────┘
                               │
                       ┌───────┴───────┐
                       │               │
                  ❌ FALSE        ✅ TRUE
                       │               │
                       ▼               ▼
              ┌─────────────┐   ┌──────────────┐
              │   REJECT    │   │   ALLOW      │
              │   403       │   │   Return row │
              └─────────────┘   └──────────────┘

┌──────────────────────────────────────────────────────┐
│    RLS POLICIES APPLIED:                             │
│                                                        │
│    SELECT: auth.uid() = user_id                      │
│    UPDATE: auth.uid() = user_id                      │
│    DELETE: auth.uid() = user_id                      │
│    INSERT: true (system can create)                  │
│                                                        │
│    ✅ Users can only see their own notifications     │
│    ✅ Users can only modify their own notifications  │
│    ✅ System can create for any user                 │
│    ✅ Admins have full access                        │
└──────────────────────────────────────────────────────┘
```

---

## 6. Complete End-to-End Flow

```
USER A                    DATABASE                    USER B
(Job Poster)              (Supabase)                  (Applicant)
    │                         │                           │
    │ 1. Posts job           │                           │
    ├────────────────────────>│                           │
    │                         │                           │
    │                         │  2. Sees job listing      │
    │                         │<──────────────────────────┤
    │                         │                           │
    │                         │  3. Applies to job        │
    │                         │<──────────────────────────┤
    │                         │                           │
    │                         │ 4. Trigger fires          │
    │                         │    create_notification()  │
    │                         │                           │
    │ 5. Receives notification│                           │
    │    (real-time)          │                           │
    │<────────────────────────┤                           │
    │                         │                           │
    │ 🔔 [1]                 │                           │
    │                         │                           │
    │ 6. Clicks notification │                           │
    │    Views application    │                           │
    │                         │                           │
    │ 7. Accepts application │                           │
    ├────────────────────────>│                           │
    │                         │                           │
    │                         │ 8. Trigger fires          │
    │                         │    create_notification()  │
    │                         │                           │
    │                         │ 9. Receives notification  │
    │                         │    (real-time)            │
    │                         ├──────────────────────────>│
    │                         │                           │
    │                         │                      🔔 [1]
    │                         │                           │
    │                         │ 10. Clicks notification   │
    │                         │     Sees acceptance       │
    │                         │                           │
    │                         │ 11. Both users happy! 🎉  │
    │                         │                           │
```

---

## 7. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

1. CREATION
   ┌──────────────┐
   │ User Action  │ → Application submitted, status changed, etc.
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ DB Trigger   │ → Automatically fires on INSERT/UPDATE
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Notification │ → Created in notifications table
   │   Created    │    { user_id, type, title, message, read: false }
   └──────┬───────┘
          │
          ▼

2. DELIVERY
   ┌──────────────┐
   │   Realtime   │ → WebSocket broadcasts to subscribed clients
   │  Broadcast   │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │  Hook State  │ → useNotifications receives and updates state
   │   Updated    │
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ UI Updates   │ → Bell badge, dropdown, notifications page
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │   Browser    │ → Native notification (if permitted)
   │ Notification │
   └──────────────┘
          │
          ▼

3. INTERACTION
   ┌──────────────┐
   │ User Clicks  │ → Clicks notification in UI
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ Mark as Read │ → UPDATE notifications SET read = true
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │  Navigate    │ → Router navigates to notification.link
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ UI Updates   │ → Badge decreases, visual changes
   └──────────────┘
          │
          ▼

4. CLEANUP (Optional)
   ┌──────────────┐
   │ User Deletes │ → Clicks delete button
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ DELETE Query │ → DELETE FROM notifications WHERE id = ...
   └──────┬───────┘
          ▼
   ┌──────────────┐
   │ UI Updates   │ → Notification removed from list
   └──────────────┘
```

---

## 8. Component Hierarchy

```
App
└── Routes
    └── ProtectedRoute
        ├── Header
        │   └── NotificationBell ← Bell icon with dropdown
        │       ├── useNotifications() ← Hook for state/methods
        │       ├── Bell Icon + Badge
        │       └── Dropdown
        │           ├── Header (title, close)
        │           ├── Actions (mark all, clear)
        │           └── Notification List
        │               └── NotificationItem (x N)
        │                   ├── Icon
        │                   ├── Title + Message
        │                   ├── Timestamp
        │                   └── Actions (mark read, delete)
        │
        └── NotificationsPage ← Full page view
            ├── useNotifications() ← Same hook
            ├── Filter Tabs (All/Unread/Read)
            ├── Bulk Actions
            └── Notification Cards
                └── NotificationCard (x N)
                    ├── Large Icon
                    ├── Title + Message
                    ├── Timestamp
                    └── Actions (mark read, delete)
```

---

These diagrams show the complete flow of the notification system from creation to delivery to user interaction! 🎉