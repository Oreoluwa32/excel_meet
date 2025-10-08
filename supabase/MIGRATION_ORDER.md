# Migration Execution Order

Execute these migrations in the Supabase SQL Editor in this exact order:

## 1️⃣ First Migration: Authentication Schema
**File**: `20250110085704_excel_meet_auth.sql`

**What it does**:
- Creates core tables (profiles, connections, jobs, events, messages, etc.)
- Sets up authentication triggers
- Configures Row Level Security (RLS) policies
- Creates indexes for performance

**Run this first!**

---

## 2️⃣ Second Migration: Nigeria Localization
**File**: `20250115093045_nigeria_localization.sql`

**What it does**:
- Adds Nigerian states and LGAs
- Adds Nigerian phone number validation
- Adds Nigerian currency formatting
- Adds location-based features

**Depends on**: Migration 1

---

## 3️⃣ Third Migration: Enum Helpers
**File**: `20250115094530_enum_helpers.sql`

**What it does**:
- Creates helper functions for enum types
- Adds validation functions
- Adds utility functions for status management

**Depends on**: Migration 1, 2

---

## 4️⃣ Fourth Migration: JSONB Helpers
**File**: `20250115095530_jsonb_helpers.sql`

**What it does**:
- Creates helper functions for JSONB operations
- Adds search and filter utilities
- Adds data transformation functions

**Depends on**: Migration 1, 2, 3

---

## ✅ Verification Queries

After running all migrations, execute these queries to verify:

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables**:
- connections
- events
- event_attendees
- jobs
- job_applications
- messages
- notifications
- profiles
- posts
- comments
- reactions

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**All tables should have** `rowsecurity = true`

### Check Functions Exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

**Expected functions**:
- handle_new_user
- validate_nigerian_phone
- format_nigerian_currency
- And many more...

### Check Triggers Exist
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

**Expected triggers**:
- on_auth_user_created (on auth.users)
- update_updated_at (on various tables)

---

## 🚨 Troubleshooting

### If a migration fails:

1. **Read the error message carefully**
2. **Check if previous migrations ran successfully**
3. **Don't skip migrations** - they must run in order
4. **If you need to start over**:
   - Go to SQL Editor
   - Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
   - Then run all migrations again from the beginning

### Common Errors:

**Error**: `relation "profiles" already exists`
**Solution**: Migration already ran. Skip to next migration.

**Error**: `function "handle_new_user" does not exist`
**Solution**: Migration 1 didn't run completely. Re-run it.

**Error**: `column "nigerian_state" does not exist`
**Solution**: Migration 2 didn't run. Run it now.

---

## 📝 Migration Checklist

- [ ] Migration 1: Authentication Schema ✅
- [ ] Migration 2: Nigeria Localization ✅
- [ ] Migration 3: Enum Helpers ✅
- [ ] Migration 4: JSONB Helpers ✅
- [ ] Verification queries run successfully ✅
- [ ] All tables visible in Table Editor ✅
- [ ] RLS enabled on all tables ✅

---

**Ready to proceed?** Go to [SUPABASE_SETUP_GUIDE.md](../SUPABASE_SETUP_GUIDE.md) for complete setup instructions.