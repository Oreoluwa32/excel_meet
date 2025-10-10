# Setup Instructions for Image Upload and Saved Jobs Features

## Overview
This document provides instructions for setting up the new features:
1. **Image Upload** - Upload job images to Supabase Storage
2. **Saved Jobs** - Bookmark/save jobs for later viewing

## Database Migrations

### 1. Create Saved Jobs Table
Run the following migration to create the `saved_jobs` table:

```bash
# Using Supabase CLI
supabase migration up --file supabase/migrations/20250117000000_create_saved_jobs_table.sql
```

Or manually execute the SQL in your Supabase dashboard:
- Go to SQL Editor in Supabase Dashboard
- Copy and paste the content from `supabase/migrations/20250117000000_create_saved_jobs_table.sql`
- Click "Run"

### 2. Create Storage Bucket for Job Images
Run the following migration to create the storage bucket:

```bash
# Using Supabase CLI
supabase migration up --file supabase/migrations/20250117000001_create_jobs_storage_bucket.sql
```

Or manually in Supabase Dashboard:
1. Go to Storage section
2. Create a new bucket named `jobs`
3. Make it public
4. Go to SQL Editor and run the policies from `supabase/migrations/20250117000001_create_jobs_storage_bucket.sql`

## Manual Setup (If migrations don't work)

### Create Saved Jobs Table Manually

```sql
-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

-- Create indexes
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX idx_saved_jobs_created_at ON saved_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own saved jobs"
    ON saved_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save jobs"
    ON saved_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own saved jobs"
    ON saved_jobs FOR DELETE
    USING (auth.uid() = user_id);
```

### Create Storage Bucket Manually

1. **Create Bucket:**
   - Go to Supabase Dashboard → Storage
   - Click "New bucket"
   - Name: `jobs`
   - Public: Yes
   - Click "Create bucket"

2. **Set up Storage Policies:**
   Go to SQL Editor and run:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload job images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'jobs' AND (storage.foldername(name))[1] = 'job-images');

-- Allow public read access
CREATE POLICY "Public can view job images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'jobs');

-- Allow users to update their images
CREATE POLICY "Users can update their own job images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'jobs' AND (storage.foldername(name))[1] = 'job-images');

-- Allow users to delete their images
CREATE POLICY "Users can delete their own job images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'jobs' AND (storage.foldername(name))[1] = 'job-images');
```

## Testing the Features

### Test Image Upload
1. Login to the application
2. Click the "+" button to create a new job
3. Fill in the job details
4. Click "Add Images" and select 1-5 images (max 5MB each)
5. Submit the job
6. View the job details - images should be displayed in the gallery

### Test Saved Jobs
1. Login to the application
2. Browse jobs on the home page
3. Click "View Details" on any job
4. Click the bookmark icon in the top right
5. Confirm to view saved jobs or navigate to `/saved-jobs`
6. Verify the job appears in your saved jobs list
7. Click the bookmark icon again to unsave

## Troubleshooting

### Images Not Uploading
- Check that the `jobs` storage bucket exists and is public
- Verify storage policies are correctly set
- Check browser console for errors
- Ensure images are under 5MB and are valid image files

### Saved Jobs Not Working
- Verify `saved_jobs` table exists
- Check RLS policies are enabled
- Ensure user is authenticated
- Check browser console for errors

### Storage Bucket Not Found Error
If you see "Bucket not found" error:
1. Go to Supabase Dashboard → Storage
2. Verify `jobs` bucket exists
3. If not, create it manually (see instructions above)
4. Ensure it's set to public

### RLS Policy Errors
If you see "permission denied" errors:
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify policies exist for `saved_jobs` table
3. Check that policies match the SQL above
4. Ensure user is properly authenticated

## Features Implemented

### Image Upload
- ✅ Upload up to 5 images per job
- ✅ Images stored in Supabase Storage
- ✅ Image URLs saved to jobs table
- ✅ Images displayed in job details gallery
- ✅ File type and size validation (max 5MB)
- ✅ Preview images before upload

### Saved Jobs
- ✅ Save/bookmark jobs for later
- ✅ Unsave jobs
- ✅ View all saved jobs in dedicated page
- ✅ Saved jobs persist across sessions
- ✅ Real-time save status indicator
- ✅ Navigate to saved jobs from job details

### Share Functionality
- ✅ Share job via native share API
- ✅ Copy link to clipboard as fallback
- ✅ Available to all users (not just poster)

## API Endpoints Used

### Job Service Functions
- `uploadJobImages(images, jobId)` - Upload images to storage
- `saveJob(userId, jobId)` - Save a job
- `unsaveJob(userId, jobId)` - Unsave a job
- `isJobSaved(userId, jobId)` - Check if job is saved
- `fetchSavedJobs(userId)` - Get all saved jobs for user

## Database Schema

### saved_jobs Table
```
id: UUID (Primary Key)
user_id: UUID (Foreign Key → auth.users)
job_id: UUID (Foreign Key → jobs)
created_at: TIMESTAMP
UNIQUE(user_id, job_id)
```

### Storage Structure
```
jobs/
  └── job-images/
      ├── {jobId}_0_{timestamp}.jpg
      ├── {jobId}_1_{timestamp}.png
      └── ...
```

## Next Steps

1. Run the database migrations
2. Test image upload functionality
3. Test saved jobs functionality
4. Monitor for any errors in production
5. Consider adding:
   - Image compression before upload
   - Multiple image formats support
   - Drag-and-drop image upload
   - Image cropping/editing
   - Saved jobs notifications
   - Export saved jobs list

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all migrations ran successfully
4. Ensure environment variables are set correctly
5. Check that Supabase project is active and not paused