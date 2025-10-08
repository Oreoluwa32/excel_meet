# Supabase Setup Guide for Excel Meet

This guide will walk you through setting up Supabase for the Excel Meet application.

## 📋 Table of Contents

1. [Create Supabase Project](#1-create-supabase-project)
2. [Run Database Migrations](#2-run-database-migrations)
3. [Configure Environment Variables](#3-configure-environment-variables)
4. [Enable Authentication Providers](#4-enable-authentication-providers)
5. [Configure Storage Buckets](#5-configure-storage-buckets)
6. [Set Up Row Level Security (RLS)](#6-set-up-row-level-security-rls)
7. [Verify Setup](#7-verify-setup)

---

## 1. Create Supabase Project

### Steps:

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com](https://supabase.com)
   - Sign in or create an account

2. **Create New Project**
   - Click "New Project"
   - Fill in the details:
     - **Name**: `excel-meet` (or your preferred name)
     - **Database Password**: Create a strong password (save this!)
     - **Region**: Choose closest to Nigeria (e.g., `eu-west-1` or `ap-south-1`)
     - **Pricing Plan**: Start with Free tier

3. **Wait for Project Setup**
   - This takes 2-3 minutes
   - You'll see a progress indicator

4. **Get Your API Credentials**
   - Once ready, go to **Settings** → **API**
   - Copy these values:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon/public key** (starts with `eyJ...`)

---

## 2. Run Database Migrations

You have **4 migration files** that need to be executed in order. You must run these **manually** in the Supabase dashboard.

### Option A: Using SQL Editor (Recommended)

1. **Open SQL Editor**
   - In your Supabase dashboard, go to **SQL Editor**
   - Click **New Query**

2. **Run Migrations in Order**

   Execute each migration file in this exact order:

   #### Migration 1: Authentication Schema ⭐ **IMPORTANT**
   
   **Use the SAFE version to avoid errors:**
   ```
   File: supabase/migrations/SAFE_20250110085704_excel_meet_auth.sql
   ```
   
   > 💡 **Why the SAFE version?** This version can be run multiple times without errors. If you accidentally run it twice or if some objects already exist, it won't fail.
   
   - Copy the entire contents of this file
   - Paste into SQL Editor
   - Click **Run** (or press Ctrl+Enter)
   - Wait for "Success" message
   
   ⚠️ **If you get errors** like "type already exists", see [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)

   #### Migration 2: Nigeria Localization
   ```
   File: supabase/migrations/20250115093045_nigeria_localization.sql
   ```
   - Copy the entire contents of this file
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success" message

   #### Migration 3: Enum Helpers
   ```
   File: supabase/migrations/20250115094530_enum_helpers.sql
   ```
   - Copy the entire contents of this file
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success" message

   #### Migration 4: JSONB Helpers
   ```
   File: supabase/migrations/20250115095530_jsonb_helpers.sql
   ```
   - Copy the entire contents of this file
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success" message

3. **Verify Migrations**
   - Go to **Table Editor** in the sidebar
   - You should see tables like: `profiles`, `connections`, `jobs`, `events`, etc.

### Option B: Using Supabase CLI (Advanced)

If you prefer using the CLI:

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in Settings → General)

4. **Run Migrations**
   ```bash
   supabase db push
   ```

---

## 3. Configure Environment Variables

1. **Update `.env` file**
   
   Open `C:\Users\oreol\Documents\Projects\excel_meet\.env` and update:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   
   # App Configuration
   VITE_APP_NAME=Excel Meet
   VITE_APP_URL=http://localhost:5173
   
   # Analytics (Optional for now)
   VITE_ENABLE_ANALYTICS=false
   VITE_GOOGLE_ANALYTICS_ID=
   
   # Environment
   VITE_ENVIRONMENT=development
   ```

2. **Update Production Environment Files**
   
   Also update `.env.production` and `.env.staging` with the same Supabase credentials.

---

## 4. Enable Authentication Providers

### Email/Password Authentication (Already Enabled)

This is enabled by default. No action needed.

### Optional: Enable Social Login

If you want to add Google, LinkedIn, or other providers:

1. **Go to Authentication → Providers**
2. **Enable desired providers**:
   - **Google**: Requires Google OAuth Client ID & Secret
   - **LinkedIn**: Requires LinkedIn App credentials
   - **GitHub**: Requires GitHub OAuth App

3. **Configure Redirect URLs**:
   - Development: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.com/auth/callback`

---

## 5. Configure Storage Buckets

The app needs storage buckets for user uploads (profile pictures, documents, etc.).

### Create Buckets:

1. **Go to Storage** in the sidebar
2. **Create the following buckets**:

   #### Bucket 1: `avatars`
   - Click **New Bucket**
   - Name: `avatars`
   - Public: ✅ **Yes** (so profile pictures are publicly accessible)
   - File size limit: 2 MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

   #### Bucket 2: `documents`
   - Click **New Bucket**
   - Name: `documents`
   - Public: ❌ **No** (private documents like resumes)
   - File size limit: 10 MB
   - Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

   #### Bucket 3: `company-logos`
   - Click **New Bucket**
   - Name: `company-logos`
   - Public: ✅ **Yes**
   - File size limit: 1 MB
   - Allowed MIME types: `image/jpeg, image/png, image/svg+xml`

### Set Storage Policies:

For each bucket, you need to set up policies:

1. **Click on the bucket** → **Policies**
2. **Add policies** using the templates below:

#### For `avatars` bucket:

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Authenticated Update**
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Authenticated Delete**
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For `documents` bucket:

**Policy 1: Private Read Access**
```sql
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 6. Set Up Row Level Security (RLS)

RLS policies are already included in your migration files, but verify they're enabled:

1. **Go to Table Editor**
2. **For each table**, click the table name → **RLS is enabled** should show ✅

### Key Tables to Verify:

- ✅ `profiles` - RLS enabled
- ✅ `connections` - RLS enabled
- ✅ `jobs` - RLS enabled
- ✅ `events` - RLS enabled
- ✅ `messages` - RLS enabled
- ✅ `notifications` - RLS enabled

If any table shows RLS disabled:
1. Click the table
2. Click **Enable RLS**

---

## 7. Verify Setup

### Test Database Connection:

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)
3. **Check for errors** related to Supabase

### Test Authentication:

1. **Go to** `http://localhost:5173`
2. **Try to register** a new account
3. **Check Supabase Dashboard** → **Authentication** → **Users**
4. You should see your new user

### Test Database Queries:

Open browser console and run:

```javascript
import { supabase } from './src/utils/supabase';

// Test query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

---

## 🎯 Quick Checklist

Use this checklist to ensure everything is set up:

- [ ] Supabase project created
- [ ] Project URL and anon key copied
- [ ] All 4 migrations executed successfully
- [ ] Tables visible in Table Editor
- [ ] `.env` file updated with Supabase credentials
- [ ] Email authentication enabled
- [ ] Storage buckets created (`avatars`, `documents`, `company-logos`)
- [ ] Storage policies configured
- [ ] RLS enabled on all tables
- [ ] Development server starts without errors
- [ ] Can register a new user
- [ ] User appears in Authentication dashboard

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid API key"
**Solution**: Double-check you copied the **anon/public** key, not the service role key.

### Issue 2: "relation does not exist"
**Solution**: You haven't run the migrations. Go back to Step 2.

### Issue 3: "Row Level Security policy violation"
**Solution**: RLS policies might not be set up correctly. Check Step 6.

### Issue 4: "Storage bucket not found"
**Solution**: Create the storage buckets as described in Step 5.

### Issue 5: Migration fails with syntax error
**Solution**: Make sure you're copying the entire file contents, including all SQL statements.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review the [GitHub Discussions](https://github.com/supabase/supabase/discussions)
3. Open an issue in this repository

---

## 🎉 Next Steps

Once Supabase is set up:

1. ✅ Test user registration and login
2. ✅ Test profile creation
3. ✅ Test file uploads
4. ✅ Deploy to staging environment
5. ✅ Configure production Supabase project (separate from development)

---

**Last Updated**: January 2024