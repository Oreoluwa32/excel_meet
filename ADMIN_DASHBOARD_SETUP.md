# Admin Dashboard Setup Guide

This document provides a complete overview of the admin dashboard implementation for Excel Meet.

## 🎯 What Was Created

### 1. Database Schema (Migration File)
**File**: `supabase/migrations/20250202000000_create_admin_system.sql`

Created the following tables:
- **support_tickets**: Store user complaints and support requests
- **ticket_responses**: Store conversation history for tickets
- **app_analytics**: Track application metrics and performance
- **system_logs**: Log system events and errors

Also includes:
- Custom enums for ticket status, priority, and category
- Row Level Security (RLS) policies
- Helper functions for analytics
- Database views for dashboard statistics

### 2. Admin Service
**File**: `src/utils/adminService.js`

Provides methods for:
- Dashboard statistics
- User management (view, update, delete)
- Support ticket management
- Job management
- System logs
- Analytics data

### 3. Admin Dashboard Pages
**Directory**: `src/pages/admin-dashboard/`

#### Main Dashboard (`index.jsx`)
- Tab-based navigation
- Role-based access control
- Responsive design

#### Components:
1. **DashboardOverview.jsx**
   - Quick statistics cards
   - System health monitoring
   - Quick action buttons

2. **SupportTickets.jsx**
   - View all support tickets
   - Filter by status, priority, category
   - View ticket details and conversation
   - Respond to tickets
   - Update ticket status
   - Assign tickets to admins

3. **UserManagement.jsx**
   - View all users in a table
   - Filter by role, verification, subscription
   - Search by name or email
   - Edit user profiles
   - Delete users

4. **JobManagement.jsx**
   - View all job postings
   - Filter and search jobs
   - Delete inappropriate jobs

5. **Analytics.jsx**
   - User activity over time
   - Growth metrics
   - Customizable time ranges

6. **SystemLogs.jsx**
   - View system logs
   - Filter by log level and source
   - Monitor errors and warnings

### 4. Support Ticket Form (For Users)
**File**: `src/components/SupportTicketForm.jsx`

A modal form that allows regular users to submit support tickets with:
- Category selection (bug, feature request, complaint, question, other)
- Priority level
- Subject and description
- Form validation

### 5. Route Protection
**File**: `src/Routes.jsx`

Added:
- `AdminRoute` component for role-based access control
- `/admin-dashboard` route protected by admin role
- Automatic redirect for non-admin users

### 6. Header Integration
**File**: `src/components/ui/Header.jsx`

Enhanced with:
- Support button (help icon) for all users
- Admin Dashboard link in profile dropdown (only for admins)
- Integrated SupportTicketForm modal

## 🚀 How to Use

### Step 1: Run the Database Migration

You need to run the migration to create the necessary tables:

```bash
# If using Supabase CLI
supabase db push

# Or apply the migration manually in Supabase Dashboard
# Go to SQL Editor and run the contents of:
# supabase/migrations/20250202000000_create_admin_system.sql
```

### Step 2: Create an Admin User

Update an existing user to have admin role:

```sql
-- In Supabase SQL Editor
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

Or use the test admin account created by the initial migration:
- Email: `admin@excel-meet.com`
- Password: `password123`

### Step 3: Access the Admin Dashboard

1. Log in with an admin account
2. Click on your profile in the header
3. Select "Admin Dashboard" from the dropdown
4. Or navigate directly to: `http://localhost:5173/admin-dashboard`

### Step 4: Test Support Tickets

As a regular user:
1. Click the help icon (?) in the header
2. Fill out the support ticket form
3. Submit the ticket

As an admin:
1. Go to Admin Dashboard → Support tab
2. View the submitted ticket
3. Assign it to yourself
4. Respond to the user
5. Update the status as you work on it

## 📊 Features Overview

### For Admins:
✅ View comprehensive dashboard statistics
✅ Manage all users (edit roles, verification, subscriptions)
✅ View and respond to support tickets
✅ Track ticket status and resolution
✅ Monitor job postings
✅ View analytics and growth metrics
✅ Access system logs
✅ Filter and search across all sections

### For Users:
✅ Submit support tickets from any page
✅ Choose ticket category and priority
✅ Track their own tickets (future enhancement)

## 🎨 Design Features

- **Color Scheme**: Purple/Indigo theme for admin sections
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Intuitive**: Tab-based navigation with icons
- **Real-time**: Statistics update on page load

## 🔒 Security

- **Role-Based Access**: Only admins can access the dashboard
- **Row Level Security**: Database policies enforce access control
- **Protected Routes**: Client-side route protection
- **Secure Operations**: All admin operations require authentication

## 📝 Database Enums

### Ticket Status
- `open`: New ticket, not yet addressed
- `in_progress`: Admin is working on it
- `resolved`: Issue has been resolved
- `closed`: Ticket is closed

### Ticket Priority
- `low`: Can wait
- `medium`: Normal priority
- `high`: Important
- `urgent`: Needs immediate attention

### Ticket Category
- `bug`: Bug report
- `feature_request`: Feature suggestion
- `complaint`: User complaint
- `question`: General question
- `other`: Other issues

## 🔧 Customization

### Adding New Statistics
Edit `DashboardOverview.jsx` and add new stat cards:

```jsx
{
  title: 'Your Metric',
  value: stats?.your_metric || 0,
  icon: '📊',
  color: 'blue',
}
```

### Adding New Filters
Edit the respective component and add filter options:

```jsx
<select
  value={filters.newFilter}
  onChange={(e) => setFilters({ ...filters, newFilter: e.target.value })}
>
  <option value="">All</option>
  <option value="option1">Option 1</option>
</select>
```

### Customizing Colors
The admin dashboard uses Tailwind CSS. Update colors in component files:
- Primary: `purple-600`
- Secondary: `indigo-600`
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`

## 📚 API Reference

### Admin Service Methods

```javascript
// Dashboard
await adminService.getDashboardStats()
await adminService.getUserActivityStats(daysBack)

// Users
await adminService.getUsers(filters)
await adminService.updateUser(userId, updates)
await adminService.deleteUser(userId)

// Support Tickets
await adminService.getSupportTickets(filters)
await adminService.getSupportTicket(ticketId)
await adminService.createSupportTicket(ticketData)
await adminService.updateSupportTicket(ticketId, updates)
await adminService.addTicketResponse(ticketId, userId, message, isAdminResponse)

// Jobs
await adminService.getJobs(filters)
await adminService.deleteJob(jobId)

// Logs
await adminService.getSystemLogs(filters)
await adminService.createSystemLog(logData)

// Analytics
await adminService.getAppAnalytics(metricName, daysBack)
await adminService.recordAnalytics(metricName, metricValue, metricType, metadata)
```

## 🐛 Troubleshooting

### Issue: Can't access admin dashboard
**Solution**: Verify your user has `role = 'admin'` in the database

### Issue: Statistics not loading
**Solution**: Check that the migration was run successfully and the view exists

### Issue: Can't submit support tickets
**Solution**: Verify RLS policies are enabled and user is authenticated

### Issue: Tickets not showing
**Solution**: Check the filters - try resetting all filters to "All"

## 🚀 Future Enhancements

Potential improvements:
- [ ] Real-time notifications using Pusher
- [ ] Email notifications for ticket updates
- [ ] Advanced charts using Recharts
- [ ] Export data to CSV/Excel
- [ ] Bulk operations
- [ ] Custom report generation
- [ ] User activity tracking
- [ ] Automated ticket assignment
- [ ] SLA tracking
- [ ] Performance monitoring dashboard

## 📞 Support

For issues or questions about the admin dashboard:
1. Submit a support ticket using the form
2. Check the system logs for errors
3. Review the README in `src/pages/admin-dashboard/`

---

**Created**: February 2025
**Version**: 1.0.0
**Status**: Production Ready ✅