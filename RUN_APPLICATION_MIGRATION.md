# 🚀 Quick Guide: Run Job Applications Migration

## ⚡ 3-Minute Setup

### Step 1: Copy the Migration SQL
1. Open file: `supabase/migrations/20250122000000_create_job_applications_table.sql`
2. Select all content: **Ctrl+A**
3. Copy: **Ctrl+C**

### Step 2: Run in Supabase
1. Go to [supabase.com](https://supabase.com) and login
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query** button
5. Paste the SQL: **Ctrl+V**
6. Click **Run** button (or press **Ctrl+Enter**)
7. Wait for success message ✅

### Step 3: Verify
1. Click **Table Editor** in left sidebar
2. Look for `job_applications` table
3. Click on it to see the structure
4. You should see columns:
   - id
   - job_id
   - applicant_id
   - proposal
   - status
   - created_at
   - updated_at

### Step 4: Test the Feature
1. Start dev server: `npm run dev`
2. Login as a professional user
3. Go to any job details page
4. Click "Accept Job" button
5. Enter a proposal and submit
6. Button should change to "Proposal Submitted" ✅

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ No errors in Supabase SQL Editor
- ✅ `job_applications` table appears in Table Editor
- ✅ Application submission works in the app
- ✅ Button changes to "Proposal Submitted"
- ✅ Job posters can view applications

---

## 🚨 Common Issues

### Issue: "type 'application_status' already exists"
**Solution**: The migration was already run. You're good to go! ✅

### Issue: "relation 'jobs' does not exist"
**Solution**: Run the jobs migration first:
- File: `supabase/migrations/20250116000000_create_jobs_table.sql`

### Issue: "relation 'user_profiles' does not exist"
**Solution**: Run the auth migration first:
- File: `supabase/migrations/SAFE_20250110085704_excel_meet_auth.sql`

---

## 📋 Migration Order

If you're setting up from scratch, run migrations in this order:
1. `SAFE_20250110085704_excel_meet_auth.sql` (users)
2. `SAFE_20250115093045_nigeria_localization.sql` (locations)
3. `20250115094530_enum_helpers.sql` (helpers)
4. `20250115095530_jsonb_helpers.sql` (helpers)
5. `20250116000000_create_jobs_table.sql` (jobs)
6. `20250117000000_create_saved_jobs_table.sql` (saved jobs)
7. `20250121000000_create_reviews_table.sql` (reviews)
8. **`20250122000000_create_job_applications_table.sql`** ⭐ (applications - NEW)

---

## 🎯 What This Migration Creates

### 1. Enum Type
- `application_status` with values: pending, accepted, rejected, withdrawn

### 2. Table
- `job_applications` with all necessary columns and constraints

### 3. Security Policies
- Applicants can view/manage their own applications
- Job posters can view/manage applications for their jobs
- Prevents duplicate applications
- Prevents self-applications

### 4. Helper Functions
- `get_job_applications_with_details()` - Get applications with profiles
- `has_user_applied_to_job()` - Check if user applied
- `get_job_application_count()` - Count applications

### 5. Indexes
- Fast queries on job_id, applicant_id, status, created_at

---

## 💡 Pro Tips

1. **Always backup** before running migrations in production
2. **Test in development** first
3. **Run migrations in order** (see list above)
4. **Check for errors** after each migration
5. **Verify tables** in Table Editor after running

---

## 🆘 Need Help?

1. Check [JOB_APPLICATION_SYSTEM_SUMMARY.md](./JOB_APPLICATION_SYSTEM_SUMMARY.md) for full details
2. Check [README_SUPABASE.md](./README_SUPABASE.md) for general Supabase setup
3. Check [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md) for common errors

---

**Ready?** Copy the SQL and run it in Supabase! 🚀