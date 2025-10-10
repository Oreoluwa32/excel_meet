# Image Upload and Saved Jobs Feature Documentation

## Overview
This document describes the implementation of two major features:
1. **Job Image Upload** - Users can upload images when creating jobs, stored in Supabase Storage
2. **Saved Jobs** - Users can bookmark jobs to view later

## Features Implemented

### 1. Job Image Upload

#### User Flow
1. User clicks "+" button to create a job
2. Fills in job details
3. Clicks "Add Images" button
4. Selects up to 5 images (max 5MB each)
5. Previews selected images
6. Can remove images before submission
7. Submits job
8. Images are uploaded to Supabase Storage
9. Image URLs are saved to database
10. Images appear in job details page

#### Technical Implementation

**File: `src/utils/jobService.js`**
- Added `uploadJobImages()` function
- Uploads images to Supabase Storage bucket `jobs`
- Stores images in `job-images/` folder
- Returns array of public URLs
- Handles errors gracefully

**File: `src/pages/home-dashboard/index.jsx`**
- Updated `handleCreateJob()` to upload images
- Creates job first to get job ID
- Uploads images with job ID
- Updates job record with image URLs
- Shows appropriate error messages

**File: `supabase/migrations/20250117000001_create_jobs_storage_bucket.sql`**
- Creates `jobs` storage bucket
- Sets bucket to public
- Adds RLS policies for upload, view, update, delete

#### Storage Structure
```
jobs/
  └── job-images/
      ├── {jobId}_0_{timestamp}.jpg
      ├── {jobId}_1_{timestamp}.png
      ├── {jobId}_2_{timestamp}.jpg
      └── ...
```

#### Validation
- File type: Must be image/* (jpg, png, gif, etc.)
- File size: Maximum 5MB per image
- Count: Maximum 5 images per job
- Format: Validated on client side before upload

### 2. Saved Jobs Feature

#### User Flow
1. User browses jobs on home page
2. Clicks "View Details" on a job
3. Clicks bookmark icon in header
4. Job is saved to database
5. Confirmation dialog appears with option to view saved jobs
6. User can navigate to `/saved-jobs` to see all saved jobs
7. Can unsave jobs by clicking bookmark icon again

#### Technical Implementation

**File: `src/utils/jobService.js`**
Added functions:
- `saveJob(userId, jobId)` - Save a job
- `unsaveJob(userId, jobId)` - Remove saved job
- `isJobSaved(userId, jobId)` - Check if job is saved
- `fetchSavedJobs(userId)` - Get all saved jobs

**File: `src/pages/job-details/index.jsx`**
- Checks if job is saved on load
- Updates `handleSave()` to save/unsave jobs
- Shows confirmation dialog after saving
- Navigates to saved jobs if user confirms

**File: `src/pages/saved-jobs/index.jsx`**
- New page to display saved jobs
- Fetches saved jobs from database
- Displays jobs in same format as home feed
- Shows empty state if no saved jobs
- Includes loading and error states

**File: `supabase/migrations/20250117000000_create_saved_jobs_table.sql`**
- Creates `saved_jobs` table
- Adds unique constraint on (user_id, job_id)
- Creates indexes for performance
- Adds RLS policies

#### Database Schema

**saved_jobs Table:**
```sql
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);
```

**Indexes:**
- `idx_saved_jobs_user_id` - Fast lookup by user
- `idx_saved_jobs_job_id` - Fast lookup by job
- `idx_saved_jobs_created_at` - Ordered by save date

**RLS Policies:**
- Users can only view their own saved jobs
- Users can save any job
- Users can only unsave their own saved jobs

### 3. Share Functionality Enhancement

#### Changes Made
- Share button now works for all users (not just poster)
- Uses native Web Share API when available
- Falls back to clipboard copy
- Shows appropriate feedback messages

## Files Modified

### New Files Created
1. `src/pages/saved-jobs/index.jsx` - Saved jobs page
2. `supabase/migrations/20250117000000_create_saved_jobs_table.sql` - Database migration
3. `supabase/migrations/20250117000001_create_jobs_storage_bucket.sql` - Storage migration
4. `SETUP_INSTRUCTIONS.md` - Setup guide
5. `IMAGE_AND_SAVED_JOBS_FEATURE.md` - This documentation

### Files Modified
1. `src/utils/jobService.js` - Added image upload and saved jobs functions
2. `src/pages/home-dashboard/index.jsx` - Updated job creation to upload images
3. `src/pages/job-details/index.jsx` - Added save/unsave functionality
4. `src/Routes.jsx` - Added saved jobs route

### Files Not Modified (Already Working)
1. `src/pages/home-dashboard/components/CreateJobModal.jsx` - Already handles image selection
2. `src/pages/job-details/components/JobHeader.jsx` - Already has share and save buttons
3. `src/pages/job-details/components/JobGallery.jsx` - Already displays images

## User Interface

### Job Creation Modal
- "Add Images" button with camera icon
- Image preview grid (up to 5 images)
- Remove button (X) on each image
- File size and type validation messages

### Job Details Page
- Share button (top right) - Available to all users
- Bookmark button (top right) - Shows filled icon when saved
- Image gallery - Displays uploaded images
- Confirmation dialog when saving job

### Saved Jobs Page
- Header with back button
- Count of saved jobs
- Grid/list of saved jobs (same as home feed)
- Empty state with "Browse Jobs" button
- Loading skeleton while fetching
- Error state with retry button

## API Functions

### Image Upload
```javascript
uploadJobImages(images, jobId)
// Parameters:
//   images: Array<File> - Array of image files
//   jobId: string - Job ID for organizing images
// Returns:
//   { urls: Array<string>, error: Error|null }
```

### Save Job
```javascript
saveJob(userId, jobId)
// Parameters:
//   userId: string - User ID
//   jobId: string - Job ID to save
// Returns:
//   { data: Object|null, error: Error|null }
```

### Unsave Job
```javascript
unsaveJob(userId, jobId)
// Parameters:
//   userId: string - User ID
//   jobId: string - Job ID to unsave
// Returns:
//   { success: boolean, error: Error|null }
```

### Check if Saved
```javascript
isJobSaved(userId, jobId)
// Parameters:
//   userId: string - User ID
//   jobId: string - Job ID to check
// Returns:
//   { isSaved: boolean, error: Error|null }
```

### Fetch Saved Jobs
```javascript
fetchSavedJobs(userId)
// Parameters:
//   userId: string - User ID
// Returns:
//   { data: Array<Job>, error: Error|null }
```

## Error Handling

### Image Upload Errors
- **File too large**: Alert shown, file not added
- **Invalid file type**: Alert shown, file not added
- **Upload failed**: Job created but alert shows image upload failed
- **Update failed**: Images uploaded but not linked to job

### Saved Jobs Errors
- **Not authenticated**: Redirect to login
- **Already saved**: Shows "already saved" message
- **Database error**: Shows generic error message
- **Network error**: Shows retry option

## Security

### Storage Security
- Public read access for all images
- Authenticated users can upload
- Users can only modify their own images
- File type validation on client and server
- File size limits enforced

### Database Security
- RLS enabled on saved_jobs table
- Users can only view their own saved jobs
- Users can only delete their own saved jobs
- Unique constraint prevents duplicate saves
- Cascade delete when user or job is deleted

## Performance Considerations

### Image Upload
- Images uploaded after job creation (non-blocking)
- Parallel upload of multiple images
- Progress feedback to user
- Graceful degradation if upload fails

### Saved Jobs
- Indexed queries for fast lookup
- Pagination ready (not implemented yet)
- Efficient join with jobs table
- Cached save status in component state

## Future Enhancements

### Image Upload
- [ ] Image compression before upload
- [ ] Drag-and-drop upload
- [ ] Image cropping/editing
- [ ] Multiple image formats (WebP, AVIF)
- [ ] Progress bar for uploads
- [ ] Retry failed uploads
- [ ] Image optimization (thumbnails)

### Saved Jobs
- [ ] Pagination for large lists
- [ ] Search/filter saved jobs
- [ ] Sort by date saved, urgency, etc.
- [ ] Bulk unsave
- [ ] Export saved jobs list
- [ ] Email notifications for saved jobs
- [ ] Saved job recommendations
- [ ] Share saved jobs list

### General
- [ ] Toast notifications instead of alerts
- [ ] Undo save/unsave action
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Analytics tracking
- [ ] A/B testing

## Testing Checklist

### Image Upload
- [ ] Upload single image
- [ ] Upload multiple images (up to 5)
- [ ] Try to upload more than 5 images
- [ ] Upload image larger than 5MB
- [ ] Upload non-image file
- [ ] Remove image before submission
- [ ] Submit job without images
- [ ] View uploaded images in job details
- [ ] Test on mobile devices
- [ ] Test with slow network

### Saved Jobs
- [ ] Save a job
- [ ] Unsave a job
- [ ] Try to save same job twice
- [ ] View saved jobs page
- [ ] Save multiple jobs
- [ ] Unsave from saved jobs page
- [ ] Test with no saved jobs
- [ ] Test pagination (if implemented)
- [ ] Test on mobile devices
- [ ] Test with slow network

### Share Functionality
- [ ] Share on device with native share
- [ ] Share on device without native share
- [ ] Copy link to clipboard
- [ ] Share as non-poster
- [ ] Share as poster
- [ ] Test on mobile devices

## Known Issues

1. **Image Upload**: If job creation succeeds but image upload fails, images are lost
   - **Workaround**: User can edit job and add images later (when edit feature is implemented)

2. **Saved Jobs**: No pagination yet, could be slow with many saved jobs
   - **Workaround**: Limit to recent 100 saved jobs

3. **Alerts**: Using browser alerts instead of toast notifications
   - **Workaround**: Replace with proper toast component in future

## Migration Guide

### For Existing Installations

1. **Backup Database**: Always backup before running migrations
2. **Run Migrations**: Execute both SQL migration files
3. **Create Storage Bucket**: Follow setup instructions
4. **Test Features**: Verify everything works
5. **Monitor Logs**: Check for any errors

### For New Installations

1. **Clone Repository**: Get latest code
2. **Install Dependencies**: `npm install`
3. **Setup Supabase**: Create project and configure
4. **Run Migrations**: Execute all migration files
5. **Configure Environment**: Set environment variables
6. **Start Application**: `npm run dev`

## Support and Maintenance

### Monitoring
- Check Supabase Storage usage
- Monitor database query performance
- Track error rates
- Review user feedback

### Maintenance Tasks
- Clean up orphaned images
- Archive old saved jobs
- Optimize database indexes
- Update storage policies as needed

## Conclusion

These features significantly enhance the user experience by:
1. Allowing visual representation of jobs through images
2. Enabling users to curate their own job lists
3. Making job sharing easier and more accessible

The implementation follows best practices for:
- Security (RLS policies)
- Performance (indexed queries)
- User experience (loading states, error handling)
- Code organization (service layer pattern)