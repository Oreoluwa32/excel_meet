# Profile Page Update Summary

## Changes Made

### 1. Database Migration
**File Created:** `supabase/migrations/20250120000000_add_resumes_storage_and_profile_fields.sql`

This migration adds:
- A new `resume_url` field to the `user_profiles` table
- A new storage bucket called `resumes` for storing user CV/resume files
- Storage policies to ensure users can only access their own resumes
- Admin access to view all resumes

**To apply this migration:**
```bash
# Make sure your Supabase project is linked
npx supabase db push

# Or if you need to link first:
npx supabase link --project-ref your-project-ref
npx supabase db push
```

### 2. New Component Created
**File Created:** `src/pages/user-profile-management/components/SocialLinksSection.jsx`

This component replaces the `NigerianProfileSection` and provides:

#### Social Media Links
- LinkedIn
- Instagram
- Facebook
- X (Twitter)
- Website

All social links are stored in the existing `social_links` JSONB field in the database.

#### Resume/CV Upload
- Upload resume in PDF, DOC, or DOCX format (max 5MB)
- View uploaded resume
- Delete existing resume
- Replace resume with a new one

### 3. Profile Page Updated
**File Modified:** `src/pages/user-profile-management/index.jsx`

Changes:
- Removed import of `NigerianProfileSection`
- Added import of `SocialLinksSection`
- Replaced `<NigerianProfileSection />` with `<SocialLinksSection />`

## Features

### Social Links Management
- Users can add/edit their social media profiles
- All fields are optional
- URL validation through HTML5 input type
- Clean, icon-based UI for each platform
- Save button to persist changes

### Resume Management
- **Upload:** Users can upload their CV/resume
- **View:** Uploaded resumes can be viewed in a new tab
- **Delete:** Users can remove their resume
- **Replace:** Upload a new file to replace the existing one
- **File Validation:**
  - Accepted formats: PDF, DOC, DOCX
  - Maximum file size: 5MB
  - Clear error messages for invalid files

### Security
- Resumes are stored in a private bucket
- Users can only access their own resumes
- Admins have read access to all resumes
- File paths are organized by user ID

## Database Schema

### Existing Fields Used
- `social_links` (JSONB) - Stores all social media links
  ```json
  {
    "linkedin": "https://linkedin.com/in/username",
    "instagram": "https://instagram.com/username",
    "facebook": "https://facebook.com/username",
    "x": "https://x.com/username",
    "website": "https://yourwebsite.com"
  }
  ```

### New Field Added
- `resume_url` (TEXT) - Stores the URL to the uploaded resume file

## Testing Checklist

After applying the migration, test the following:

1. **Social Links:**
   - [ ] Add social media links and save
   - [ ] Edit existing links
   - [ ] Leave some fields empty (should work)
   - [ ] Verify links are saved to database
   - [ ] Refresh page and verify links persist

2. **Resume Upload:**
   - [ ] Upload a PDF file
   - [ ] Upload a DOC/DOCX file
   - [ ] Try uploading a file larger than 5MB (should fail)
   - [ ] Try uploading an invalid file type (should fail)
   - [ ] View the uploaded resume
   - [ ] Delete the resume
   - [ ] Upload a new resume to replace existing one

3. **Error Handling:**
   - [ ] Test with no internet connection
   - [ ] Test with invalid file formats
   - [ ] Test with oversized files
   - [ ] Verify error messages are clear and helpful

## Notes

- The old `NigerianProfileSection` component is still in the codebase but no longer used
- You can safely delete it if you don't need it: `src/pages/user-profile-management/components/NigerianProfileSection.jsx`
- The migration is backward compatible - existing profiles will work fine
- Social links that were previously stored will be preserved
- The resume field is optional - users don't have to upload one

## Rollback (if needed)

If you need to rollback these changes:

1. Revert the profile page changes:
   ```bash
   git checkout src/pages/user-profile-management/index.jsx
   ```

2. Remove the new component:
   ```bash
   rm src/pages/user-profile-management/components/SocialLinksSection.jsx
   ```

3. Rollback the database migration:
   ```sql
   -- Remove the resume_url column
   ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS resume_url;
   
   -- Delete storage policies
   DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
   DROP POLICY IF EXISTS "Users can view their own resumes" ON storage.objects;
   DROP POLICY IF EXISTS "Users can update their own resumes" ON storage.objects;
   DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
   DROP POLICY IF EXISTS "Admins can view all resumes" ON storage.objects;
   
   -- Delete the bucket
   DELETE FROM storage.buckets WHERE id = 'resumes';
   ```