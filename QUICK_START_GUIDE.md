# Quick Start Guide - Profile Updates

## Step-by-Step Implementation

### Step 1: Apply Database Migrations

Run these commands in your terminal:

```powershell
# Navigate to project directory (if not already there)
Set-Location "c:\Users\oreol\Documents\Projects\excel_meet"

# Apply all migrations
supabase db push
```

**Expected Output:**
- Portfolio column added to user_profiles
- Job statistics functions created
- Storage bucket for portfolios created (if not already exists)

### Step 2: Verify Migrations

Check if migrations were successful:

```powershell
# Check Supabase status
supabase status

# Or connect to database and verify
supabase db reset --debug
```

### Step 3: Test the Application

1. **Start the development server:**
```powershell
npm run dev
```

2. **Test Portfolio Management:**
   - Navigate to Profile Management
   - Go to Professional Profile section
   - Click "Add Work" under Portfolio
   - Upload an image and fill in details
   - Verify it saves successfully

3. **Test Service Categories:**
   - In Professional Profile section
   - Select a category from dropdown
   - Click "Add Category"
   - Add multiple categories
   - Try removing a category with X button
   - Verify changes persist

4. **Test Profile View:**
   - Navigate to a professional's profile
   - Verify job statistics show in header (Jobs Posted, Completed)
   - Check portfolio section displays (should be after Skills)
   - Scroll to Job History section
   - Test all three tabs (Completed, Active, Posted)

### Step 4: Create Test Data (Optional)

To fully test job history, you'll need some test jobs:

1. **Create a Job:**
   - Go to Post Job page
   - Fill in job details
   - Submit the job

2. **Apply to a Job (as different user):**
   - Switch to a professional account
   - Find the job
   - Submit an application

3. **Accept Application (as job poster):**
   - Switch back to job poster account
   - View applications
   - Accept an application

4. **Complete a Job:**
   - Mark the job as completed
   - Verify it shows in "Completed Jobs" tab

## Troubleshooting

### Issue: Migrations Fail

**Solution:**
```powershell
# Check migration status
supabase migration list

# Try resetting database (WARNING: This will delete all data)
supabase db reset

# Or apply migrations one by one
supabase migration up --version 20250127000000
supabase migration up --version 20250128000000
```

### Issue: Portfolio Images Don't Upload

**Possible Causes:**
1. Storage bucket not created
2. Storage policies not set correctly
3. File size too large (max 5MB)
4. Invalid file type (must be image/*)

**Solution:**
```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'portfolios';

-- Check policies
SELECT * FROM storage.policies WHERE bucket_id = 'portfolios';

-- If bucket doesn't exist, run the storage migration
```

### Issue: Job Statistics Show 0

**Possible Causes:**
1. No jobs in database
2. Database functions not created
3. RLS policies blocking access

**Solution:**
```sql
-- Test function directly
SELECT public.get_user_jobs_posted_count('user-id-here');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%job%';
```

### Issue: Job History Section Empty

**Possible Causes:**
1. No jobs created yet
2. No accepted applications
3. Data fetching error

**Solution:**
- Check browser console for errors
- Verify jobs exist in database
- Check that applications are accepted (not just pending)
- Ensure job status is set correctly

## Key Features Summary

### ✅ What's New:

1. **Portfolio Management:**
   - Upload images from device
   - Add title, description, category
   - View portfolio on profile page
   - Stored in database as JSONB

2. **Multiple Service Categories:**
   - Add unlimited categories
   - Remove individual categories
   - Better UI with tags
   - Duplicate prevention

3. **Job Statistics:**
   - Jobs Posted count in header
   - Completed Jobs count in header
   - Real-time updates

4. **Job History Section:**
   - Three tabs: Completed, Active, Posted
   - Detailed job cards
   - Application counts
   - Status indicators
   - Empty states

### 🔄 What Changed:

1. **Profile Layout:**
   - Portfolio moved up (after Skills)
   - Service Categories removed from view
   - Job History added (before Reviews)

2. **Database:**
   - New portfolio column (JSONB)
   - New job statistics functions
   - Better indexing

3. **Profile Management:**
   - Enhanced category management
   - Better file upload handling
   - Improved validation

## File Locations

### Migrations:
- `supabase/migrations/20250127000000_add_portfolio_column.sql`
- `supabase/migrations/20250128000000_add_job_statistics.sql`

### Components:
- `src/pages/professional-profile/components/JobHistorySection.jsx` (new)
- `src/pages/professional-profile/components/ProfileHeader.jsx` (modified)
- `src/pages/professional-profile/index.jsx` (modified)
- `src/pages/user-profile-management/components/ProfessionalSection.jsx` (modified)

### Services:
- `src/utils/userService.js` (modified)

### Documentation:
- `MIGRATION_FIXES_SUMMARY.md`
- `PROFILE_UPDATES_SUMMARY.md`
- `QUICK_START_GUIDE.md` (this file)

## Next Steps

1. ✅ Apply migrations
2. ✅ Test all features
3. ⏳ Create test data
4. ⏳ Test on different screen sizes
5. ⏳ Test with different user roles
6. ⏳ Deploy to production

## Production Deployment

Before deploying to production:

1. **Backup Database:**
```powershell
supabase db dump -f backup.sql
```

2. **Test Migrations on Staging:**
```powershell
# Apply to staging environment first
supabase link --project-ref your-staging-project
supabase db push
```

3. **Verify Everything Works:**
   - Test all features
   - Check performance
   - Review error logs

4. **Deploy to Production:**
```powershell
# Link to production
supabase link --project-ref your-production-project

# Apply migrations
supabase db push

# Deploy frontend
npm run build
# Deploy to your hosting service
```

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **Project Documentation:** See other .md files in project root

## Checklist

- [ ] Migrations applied successfully
- [ ] Portfolio upload works
- [ ] Service categories can be added/removed
- [ ] Job statistics display correctly
- [ ] Job history tabs work
- [ ] Profile layout looks good
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Data persists after refresh
- [ ] Ready for production

---

**Last Updated:** January 28, 2025
**Version:** 1.0.0