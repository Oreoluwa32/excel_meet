# 🚀 Supabase Setup - Quick Reference

## 📌 TL;DR - What You Need to Know

### ❌ Migrations DO NOT Run Automatically
You must **manually** copy and paste each migration file into the Supabase SQL Editor.

### ✅ What You Must Do

1. **Create Supabase project** at [supabase.com](https://supabase.com)
2. **Run 4 migration files** in SQL Editor (copy/paste each one)
3. **Create 3 storage buckets** in Supabase Dashboard
4. **Update .env file** with your credentials

**Total Time**: ~20 minutes

---

## 📂 Migration Files (Run in This Order)

### 1️⃣ First Migration - Authentication Schema
**File**: `supabase/migrations/SAFE_20250110085704_excel_meet_auth.sql` ⭐

**What it creates**:
- ✅ User profiles table
- ✅ Custom types (user_role, verification_status, subscription_plan)
- ✅ Authentication triggers
- ✅ Row Level Security policies
- ✅ Helper functions
- ✅ Test data (3 demo users)

**How to run**:
1. Open file in your code editor
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Go to Supabase Dashboard → SQL Editor
4. Paste and click "Run"

---

### 2️⃣ Second Migration - Nigeria Localization
**File**: `supabase/migrations/SAFE_20250115093045_nigeria_localization.sql` ⭐

**What it creates**:
- ✅ Nigerian states (37 states + FCT)
- ✅ Payment currencies (NGN, USD, EUR, GBP)
- ✅ Nigerian payment methods (Paystack, Flutterwave, etc.)
- ✅ Nigerian pricing table with Naira plans
- ✅ NIN/BVN verification support
- ✅ Payment history tracking
- ✅ Currency formatting function

**How to run**: Same as above (copy, paste, run)

---

### 3️⃣ Third Migration - Enum Helpers
**File**: `supabase/migrations/20250115094530_enum_helpers.sql`

**What it creates**:
- ✅ Helper functions for enums
- ✅ Validation functions
- ✅ Status management utilities

**How to run**: Same as above (copy, paste, run)

---

### 4️⃣ Fourth Migration - JSONB Helpers
**File**: `supabase/migrations/20250115095530_jsonb_helpers.sql`

**What it creates**:
- ✅ JSONB operation helpers
- ✅ Search and filter utilities
- ✅ Data transformation functions

**How to run**: Same as above (copy, paste, run)

---

## 🗄️ Storage Buckets (Create Manually)

After running migrations, create these buckets:

### 1. `avatars` Bucket
- **Public**: ✅ Yes
- **Size limit**: 2 MB
- **File types**: JPG, PNG, WebP
- **Used for**: User profile pictures

### 2. `documents` Bucket
- **Public**: ❌ No (private)
- **Size limit**: 10 MB
- **File types**: PDF, DOC, DOCX
- **Used for**: Resumes, certificates

### 3. `company-logos` Bucket
- **Public**: ✅ Yes
- **Size limit**: 1 MB
- **File types**: JPG, PNG, SVG
- **Used for**: Company/business logos

**How to create**:
1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Fill in name and settings
4. Click **Create**

---

## 🔐 Environment Variables

Update your `.env` file:

```env
# Get these from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App settings
VITE_APP_NAME=Excel Meet
VITE_APP_URL=http://localhost:5173
VITE_ENVIRONMENT=development
VITE_ENABLE_ANALYTICS=false
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] All 4 migrations ran successfully
- [ ] Tables visible in Table Editor (user_profiles, connections, jobs, etc.)
- [ ] 3 storage buckets created
- [ ] .env file updated
- [ ] Dev server starts: `npm run dev`
- [ ] No console errors in browser (F12)
- [ ] Run `verifySupabaseSetup()` in browser console - all checks pass ✅

---

## 🚨 Common Errors & Quick Fixes

### Error: "type 'user_role' already exists"
**Fix**: You already ran part of the migration. Use the SAFE version.
📖 See: [FIX_TYPE_EXISTS_ERROR.md](./FIX_TYPE_EXISTS_ERROR.md)

### Error: "relation does not exist"
**Fix**: Migrations didn't run. Go back and run all 4 migrations.

### Error: "Invalid API key"
**Fix**: You copied the wrong key. Use the **anon/public** key, not service role key.

### Error: "Storage bucket not found"
**Fix**: Create the storage buckets manually in Supabase Dashboard.

---

## 📚 Detailed Guides

- 📖 **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)** - Complete step-by-step guide
- 📖 **[QUICK_START_CHECKLIST.md](./QUICK_START_CHECKLIST.md)** - Checkbox checklist
- 📖 **[MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)** - Fix migration errors
- 📖 **[FIX_TYPE_EXISTS_ERROR.md](./FIX_TYPE_EXISTS_ERROR.md)** - Fix "type already exists" error

---

## 🎯 Quick Start Command

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env and add your Supabase credentials
# (Get them from Supabase Dashboard → Settings → API)

# 4. Run migrations in Supabase SQL Editor
# (Copy/paste each file from supabase/migrations/)

# 5. Create storage buckets in Supabase Dashboard
# (avatars, documents, company-logos)

# 6. Start development server
npm run dev

# 7. Verify setup in browser console
# Open http://localhost:5173
# Press F12 → Console
# Run: verifySupabaseSetup()
```

---

## 🆘 Need Help?

1. **Check the guides** listed above
2. **Search for your error** in [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)
3. **Ask in Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
4. **Open an issue** on GitHub

---

## 🎉 Success!

Once all checks pass, you're ready to:
- ✅ Create user accounts
- ✅ Build features
- ✅ Test the application
- ✅ Deploy to production

**Happy coding!** 🚀

---

**Last Updated**: January 2024