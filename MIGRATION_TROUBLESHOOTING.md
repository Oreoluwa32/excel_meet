# Migration Troubleshooting Guide

## 🚨 Error: "type 'user_role' already exists"

This error means you've already run part of the migration. Here are your options:

---

## ✅ Solution 1: Use the Safe Migration File (RECOMMENDED)

I've created a **safe version** of the migration that can be run multiple times without errors.

### Steps:

1. **Open Supabase Dashboard** → **SQL Editor**

2. **Copy the SAFE migration file**:
   - File: `supabase/migrations/SAFE_20250110085704_excel_meet_auth.sql`
   - This file has `IF NOT EXISTS` checks and won't fail on duplicates

3. **Paste and Run** in SQL Editor

4. **Continue with remaining migrations** (2, 3, 4) as normal

---

## ✅ Solution 2: Skip Already-Created Objects

If you want to continue with the original migration:

### Steps:

1. **Identify what's already created**:
   - Go to **Database** → **Types** in Supabase Dashboard
   - Check if these exist:
     - `user_role`
     - `verification_status`
     - `subscription_plan`

2. **Remove those lines from the migration**:
   - Open the original migration file
   - Comment out or delete lines 5-7 (the CREATE TYPE statements)
   - Run the rest of the migration

3. **Example - Modified Migration**:
   ```sql
   -- 1. Create custom types (SKIP - already exists)
   -- CREATE TYPE public.user_role AS ENUM ('admin', 'professional', 'client');
   -- CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');
   -- CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro', 'elite');

   -- 2. Create user_profiles table
   CREATE TABLE public.user_profiles (
       -- ... rest of the migration
   ```

---

## ✅ Solution 3: Start Fresh (NUCLEAR OPTION)

⚠️ **WARNING**: This will delete ALL data in your database!

Only use this if:
- You're in development
- You have no important data
- You want a clean slate

### Steps:

1. **Open Supabase Dashboard** → **SQL Editor**

2. **Run this command**:
   ```sql
   -- ⚠️ WARNING: This deletes EVERYTHING!
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
   GRANT ALL ON SCHEMA public TO postgres, service_role;
   GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
   GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
   ```

3. **Run all migrations again** from the beginning (1, 2, 3, 4)

---

## 🔍 How to Check What's Already Created

### Check Types:
```sql
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e';
```

**Expected output** (if migration 1 ran):
- `user_role`
- `verification_status`
- `subscription_plan`

### Check Tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

**Expected output** (if migration 1 ran):
- `user_profiles`

### Check Functions:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

**Expected output** (if migration 1 ran):
- `is_admin`
- `is_profile_owner`
- `handle_new_user`
- `update_updated_at_column`
- `cleanup_test_data`

### Check Triggers:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

**Expected output** (if migration 1 ran):
- `on_auth_user_created` on `auth.users`
- `update_user_profiles_updated_at` on `user_profiles`

---

## 📋 Common Migration Errors

### Error: `relation "user_profiles" already exists`
**Cause**: Table already created  
**Solution**: Use Solution 1 (Safe Migration) or skip table creation

### Error: `function "handle_new_user" already exists`
**Cause**: Function already created  
**Solution**: Use `CREATE OR REPLACE FUNCTION` instead of `CREATE FUNCTION`

### Error: `policy "users_can_view_all_profiles" already exists`
**Cause**: Policy already created  
**Solution**: Drop policy first: `DROP POLICY IF EXISTS "policy_name" ON table_name;`

### Error: `trigger "on_auth_user_created" already exists`
**Cause**: Trigger already created  
**Solution**: Drop trigger first: `DROP TRIGGER IF EXISTS trigger_name ON table_name;`

### Error: `duplicate key value violates unique constraint`
**Cause**: Test data already inserted  
**Solution**: Skip test data creation or delete existing data first

---

## 🎯 Recommended Approach

**For your current situation** (type already exists error):

1. ✅ **Use the SAFE migration file** (`SAFE_20250110085704_excel_meet_auth.sql`)
2. ✅ Run it in SQL Editor
3. ✅ Continue with migrations 2, 3, 4 as normal
4. ✅ Verify with `verifySupabaseSetup()` in browser console

This is the **safest and fastest** way to fix your issue!

---

## 🆘 Still Having Issues?

### Check Migration Status:

Run this query to see what's been created:

```sql
-- Check everything at once
SELECT 'Types' as category, typname as name FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e'
UNION ALL
SELECT 'Tables', table_name FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT 'Functions', routine_name FROM information_schema.routines WHERE routine_schema = 'public'
UNION ALL
SELECT 'Triggers', trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public'
ORDER BY category, name;
```

### Get Help:

1. Copy the error message
2. Copy the output of the query above
3. Open an issue with both pieces of information
4. Or ask in [Supabase Discord](https://discord.supabase.com)

---

## 📝 Prevention for Future Migrations

Always write migrations with:

- ✅ `CREATE TABLE IF NOT EXISTS`
- ✅ `CREATE INDEX IF NOT EXISTS`
- ✅ `CREATE OR REPLACE FUNCTION`
- ✅ `DROP POLICY IF EXISTS` before `CREATE POLICY`
- ✅ `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- ✅ `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` for types

This makes migrations **idempotent** (safe to run multiple times).

---

**Last Updated**: January 2024