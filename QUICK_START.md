# Quick Start Guide

## 🎯 What's New?

Three major features have been added to Excel Meet:

1. **📸 Image Upload** - Upload up to 5 images when creating a job
2. **🔖 Save Jobs** - Bookmark jobs to view later
3. **🔗 Share Jobs** - Share job links with anyone

## ⚡ Quick Setup (5 minutes)

### Option 1: Automated Setup (If you have Supabase CLI)

```powershell
# Run the setup script
.\setup-features.ps1

# Verify everything works
node verify-setup.js
```

### Option 2: Manual Setup (No CLI needed)

1. **Go to your Supabase Dashboard** (https://supabase.com/dashboard)

2. **Create saved_jobs table:**
   - Click on your project
   - Go to **SQL Editor** (left sidebar)
   - Click **New Query**
   - Open `supabase/migrations/20250117000000_create_saved_jobs_table.sql`
   - Copy all the SQL code
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

3. **Create storage bucket:**
   - Go to **Storage** (left sidebar)
   - Click **New bucket**
   - Name: `jobs`
   - **Important**: Toggle **Public bucket** to ON ✅
   - Click **Create bucket**

4. **Set up storage policies:**
   - Go back to **SQL Editor**
   - Click **New Query**
   - Open `supabase/migrations/20250117000001_create_jobs_storage_bucket.sql`
   - Copy all the SQL code
   - Paste into the SQL Editor
   - Click **Run**
   - You should see "Success. No rows returned"

5. **Verify setup:**
   ```powershell
   node verify-setup.js
   ```
   
   You should see all green checkmarks ✅

## 🎮 How to Use

### Upload Images to a Job

1. Login to the app
2. Click the **+** button (bottom right)
3. Fill in job details
4. Click **Add Images** button
5. Select 1-5 images (max 5MB each)
6. You'll see image previews
7. Click **Post Job**
8. Images will be uploaded automatically

### Save a Job

1. Browse jobs on the home page
2. Click **View Details** on any job
3. Click the **bookmark icon** (top right)
4. Job is saved!
5. Click **Yes** to view all saved jobs
6. Or navigate to the menu and select **Saved Jobs**

### View Saved Jobs

1. Go to the app menu
2. Click **Saved Jobs**
3. See all your bookmarked jobs
4. Click any job to view details
5. Click bookmark icon again to unsave

### Share a Job

1. Open any job details
2. Click the **share icon** (top right)
3. On mobile: Native share menu opens
4. On desktop: Link copied to clipboard
5. Share with anyone!

## ✅ Testing Checklist

After setup, test these features:

- [ ] Create a job with images
- [ ] View the job details - images should appear
- [ ] Save a job (bookmark icon)
- [ ] Go to Saved Jobs page
- [ ] Unsave the job
- [ ] Share a job link
- [ ] Open shared link in another browser

## 🐛 Common Issues

### "Bucket not found" error
**Solution**: Make sure you created the `jobs` bucket and made it **public**

### Images not showing
**Solution**: 
1. Check if bucket is public (Storage → jobs → Settings → Public)
2. Verify storage policies were created (SQL Editor → check for policies)

### Can't save jobs
**Solution**: 
1. Make sure you're logged in
2. Check if saved_jobs table exists (Database → Tables)
3. Verify RLS policies are enabled

### "Permission denied" error
**Solution**: Run the storage policies SQL again from the migration file

## 📚 Documentation

- **FEATURE_SUMMARY.md** - Complete overview of all features
- **SETUP_INSTRUCTIONS.md** - Detailed setup guide
- **IMAGE_AND_SAVED_JOBS_FEATURE.md** - Technical documentation

## 🆘 Need Help?

1. Run `node verify-setup.js` to check what's wrong
2. Check browser console (F12) for errors
3. Check Supabase logs in dashboard
4. Review the documentation files above

## 🎉 You're Done!

Once you see all green checkmarks from `verify-setup.js`, you're ready to go!

Start your app and enjoy the new features:
```powershell
npm run dev
```

Happy job posting! 🚀