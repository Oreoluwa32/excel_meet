# Admin Dashboard Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Apply Database Migration
Run the SQL migration to create the necessary tables:

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open the file: `supabase/migrations/20250202000000_create_admin_system.sql`
4. Copy and paste the entire content
5. Click "Run" to execute

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### Step 2: Create Admin User
In Supabase SQL Editor, run:

```sql
-- Make yourself an admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Or use the test admin account:
- Email: `admin@excel-meet.com`
- Password: `password123`

### Step 3: Start the App
```bash
npm start
```

### Step 4: Access Admin Dashboard
1. Log in with your admin account
2. Click your profile icon in the header
3. Select "Admin Dashboard"
4. You're in! 🎉

## 🧪 Testing the Features

### Test 1: View Dashboard Statistics
1. Go to Admin Dashboard
2. You should see the Overview tab with statistics cards
3. Check that numbers are displayed correctly

**Expected Result**: 
- Statistics cards show counts for users, jobs, applications, etc.
- System health shows "Operational" status
- Quick actions are clickable

### Test 2: Submit a Support Ticket (as User)
1. Log out from admin account
2. Log in as a regular user (or create a new account)
3. Click the help icon (?) in the header
4. Fill out the support ticket form:
   - Category: Complaint
   - Priority: High
   - Subject: "Test ticket"
   - Description: "This is a test support ticket"
5. Click "Submit Ticket"

**Expected Result**: 
- Success message appears
- Modal closes
- Ticket is created in database

### Test 3: Respond to Ticket (as Admin)
1. Log back in as admin
2. Go to Admin Dashboard → Support tab
3. You should see the test ticket you created
4. Click on the ticket to open details
5. Click "Assign to Me"
6. Type a response: "Thank you for your feedback. We're looking into this."
7. Click "Send Response"
8. Update status to "In Progress"

**Expected Result**: 
- Ticket is assigned to you
- Your response appears in the conversation
- Status changes to "In Progress"

### Test 4: Manage Users
1. Go to Admin Dashboard → Users tab
2. You should see a list of all users
3. Try filtering by role: Select "Professional"
4. Click "Edit" on any user
5. Change their subscription plan to "Pro"
6. Click "Save Changes"

**Expected Result**: 
- Users are displayed in a table
- Filters work correctly
- User profile is updated successfully

### Test 5: View Analytics
1. Go to Admin Dashboard → Analytics tab
2. Select different time ranges (7, 14, 30 days)
3. View the activity table

**Expected Result**: 
- Summary cards show totals
- Activity table displays daily statistics
- Growth metrics show progress bars

### Test 6: Check System Logs
1. Go to Admin Dashboard → System Logs tab
2. View the logs (may be empty if no logs exist yet)
3. Try filtering by log level

**Expected Result**: 
- Logs are displayed if any exist
- Filters work correctly
- Log statistics show counts by level

## ✅ Verification Checklist

After setup, verify these items:

- [ ] Database migration ran successfully
- [ ] Admin user has `role = 'admin'` in database
- [ ] Can access `/admin-dashboard` route
- [ ] Dashboard statistics load correctly
- [ ] Can view all users in Users tab
- [ ] Can create support tickets as regular user
- [ ] Can view and respond to tickets as admin
- [ ] Can filter tickets by status/priority/category
- [ ] Can update ticket status
- [ ] Can view analytics data
- [ ] Can view system logs
- [ ] Support button appears in header for all users
- [ ] Admin Dashboard link appears in profile menu for admins only

## 🐛 Common Issues & Solutions

### Issue: "Access Denied" when accessing admin dashboard
**Cause**: User doesn't have admin role
**Solution**: 
```sql
UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue: Statistics showing zero or not loading
**Cause**: Migration not applied or no data in database
**Solution**: 
1. Verify migration was run successfully
2. Check that tables exist in Supabase
3. Add some test data (users, jobs, etc.)

### Issue: Can't submit support tickets
**Cause**: RLS policies not applied or user not authenticated
**Solution**: 
1. Verify migration was run (includes RLS policies)
2. Ensure user is logged in
3. Check browser console for errors

### Issue: Ticket responses not showing
**Cause**: Ticket responses table not created or RLS issue
**Solution**: 
1. Verify `ticket_responses` table exists
2. Check RLS policies are enabled
3. Refresh the ticket detail modal

### Issue: "Column reference 'date' is ambiguous" error
**Cause**: Old version of migration file
**Solution**: The migration file has been updated. Re-run the migration.

## 📊 Sample Data for Testing

If you want to populate the database with test data:

```sql
-- Create test support tickets
INSERT INTO support_tickets (user_id, subject, description, category, priority, status)
VALUES 
  ((SELECT id FROM user_profiles LIMIT 1), 
   'App is slow', 
   'The application takes too long to load pages', 
   'complaint', 
   'high', 
   'open'),
  ((SELECT id FROM user_profiles LIMIT 1), 
   'Add dark mode', 
   'Please add a dark mode option to the app', 
   'feature_request', 
   'medium', 
   'open'),
  ((SELECT id FROM user_profiles LIMIT 1), 
   'Cannot upload resume', 
   'Getting an error when trying to upload my resume', 
   'bug', 
   'urgent', 
   'in_progress');

-- Create test system logs
INSERT INTO system_logs (log_level, message, source)
VALUES 
  ('info', 'User logged in successfully', 'auth-service'),
  ('warning', 'High memory usage detected', 'system-monitor'),
  ('error', 'Failed to send email notification', 'email-service'),
  ('info', 'Job posted successfully', 'job-service');
```

## 🎯 Next Steps

After verifying everything works:

1. **Customize the Dashboard**
   - Add your own statistics
   - Customize colors and branding
   - Add more filters

2. **Set Up Notifications**
   - Implement email notifications for new tickets
   - Add real-time updates using Pusher
   - Create notification preferences

3. **Enhance Analytics**
   - Add charts using Recharts or D3.js
   - Create custom reports
   - Add export functionality

4. **Improve User Experience**
   - Add pagination for large datasets
   - Implement advanced search
   - Add bulk operations

5. **Monitor Performance**
   - Set up error tracking
   - Monitor response times
   - Track user engagement

## 📚 Additional Resources

- **Full Documentation**: See `ADMIN_DASHBOARD_SETUP.md`
- **Structure Overview**: See `ADMIN_DASHBOARD_STRUCTURE.md`
- **Component Docs**: See `src/pages/admin-dashboard/README.md`
- **API Reference**: See `src/utils/adminService.js`

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs for database errors
3. Review the RLS policies in Supabase
4. Verify all migrations were applied
5. Submit a support ticket using the form (meta! 😄)

## 🎉 Success!

If you've completed all the tests successfully, your admin dashboard is ready to use!

You now have:
✅ A fully functional admin dashboard
✅ User management capabilities
✅ Support ticket system
✅ Analytics and monitoring
✅ System logs viewer

**Happy administrating!** 🚀

---

**Last Updated**: February 2025
**Version**: 1.0.0