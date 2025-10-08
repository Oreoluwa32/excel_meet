# 🔧 Quick Fix: "type 'user_role' already exists" Error

## The Problem
You got this error when running the migration:
```
ERROR: 42710: type "user_role" already exists
```

This means you already ran part of the migration before.

---

## ✅ The Solution (2 Minutes)

### Step 1: Use the Safe Migration File

Instead of using:
- ❌ `20250110085704_excel_meet_auth.sql`

Use this file:
- ✅ `SAFE_20250110085704_excel_meet_auth.sql`

### Step 2: Run It

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file: `supabase/migrations/SAFE_20250110085704_excel_meet_auth.sql`
3. Copy **ALL** contents (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for success message ✅

### Step 3: Continue with Other Migrations

Now run the remaining migrations in order:
1. `20250115093045_nigeria_localization.sql`
2. `20250115094530_enum_helpers.sql`
3. `20250115095530_jsonb_helpers.sql`

---

## Why This Works

The **SAFE** version has special checks:
- ✅ Won't fail if types already exist
- ✅ Won't fail if tables already exist
- ✅ Won't fail if functions already exist
- ✅ Won't create duplicate test data
- ✅ Can be run multiple times safely

---

## What If I Still Get Errors?

See the full troubleshooting guide:
📖 [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)

---

## Done!

Once all 4 migrations run successfully:
1. Go to **Table Editor** in Supabase
2. You should see tables like `user_profiles`, `connections`, `jobs`, etc.
3. Continue with the rest of the setup

---

**Need more help?** Check [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)