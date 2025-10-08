# Quick Start Checklist

Use this checklist to get Excel Meet up and running quickly.

## ✅ Pre-Setup

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm or yarn installed (`npm --version`)
- [ ] Git installed (optional, for cloning)
- [ ] Code editor installed (VS Code recommended)
- [ ] Modern browser (Chrome, Firefox, Edge, Safari)

## ✅ Project Setup

- [ ] Clone or download the repository
- [ ] Navigate to project directory: `cd excel-meet`
- [ ] Install dependencies: `npm install`
- [ ] Copy `.env.example` to `.env`

## ✅ Supabase Setup (REQUIRED)

### Create Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up or log in
- [ ] Click "New Project"
- [ ] Fill in project details:
  - [ ] Name: `excel-meet`
  - [ ] Database password (save this!)
  - [ ] Region: Choose closest to Nigeria
- [ ] Wait for project to be ready (2-3 minutes)

### Get Credentials
- [ ] Go to Settings → API
- [ ] Copy **Project URL**
- [ ] Copy **anon/public key**
- [ ] Paste both into `.env` file

### Run Migrations (CRITICAL)
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Run Migration 1: `SAFE_20250110085704_excel_meet_auth.sql` ⭐ **USE THIS ONE**
  - [ ] Copy entire file contents
  - [ ] Paste in SQL Editor
  - [ ] Click "Run"
  - [ ] Wait for "Success" ✅
  - [ ] ⚠️ If you get errors, see [MIGRATION_TROUBLESHOOTING.md](./MIGRATION_TROUBLESHOOTING.md)
- [ ] Run Migration 2: `20250115093045_nigeria_localization.sql`
  - [ ] Copy, paste, run
  - [ ] Wait for "Success" ✅
- [ ] Run Migration 3: `20250115094530_enum_helpers.sql`
  - [ ] Copy, paste, run
  - [ ] Wait for "Success" ✅
- [ ] Run Migration 4: `20250115095530_jsonb_helpers.sql`
  - [ ] Copy, paste, run
  - [ ] Wait for "Success" ✅

### Verify Tables
- [ ] Go to Table Editor
- [ ] Confirm these tables exist:
  - [ ] profiles
  - [ ] connections
  - [ ] jobs
  - [ ] job_applications
  - [ ] events
  - [ ] event_attendees
  - [ ] messages
  - [ ] notifications
  - [ ] posts
  - [ ] comments
  - [ ] reactions

### Create Storage Buckets
- [ ] Go to Storage
- [ ] Create bucket: `avatars`
  - [ ] Public: Yes ✅
  - [ ] File size limit: 2 MB
  - [ ] MIME types: image/jpeg, image/png, image/webp
- [ ] Create bucket: `documents`
  - [ ] Public: No ❌
  - [ ] File size limit: 10 MB
  - [ ] MIME types: PDF, DOC, DOCX
- [ ] Create bucket: `company-logos`
  - [ ] Public: Yes ✅
  - [ ] File size limit: 1 MB
  - [ ] MIME types: image/jpeg, image/png, image/svg+xml

### Configure Storage Policies
- [ ] For `avatars` bucket:
  - [ ] Add "Public Read" policy
  - [ ] Add "Authenticated Upload" policy
  - [ ] Add "Authenticated Update" policy
  - [ ] Add "Authenticated Delete" policy
- [ ] For `documents` bucket:
  - [ ] Add "Private Read" policy
  - [ ] Add "Authenticated Upload" policy

### Enable Authentication
- [ ] Go to Authentication → Providers
- [ ] Confirm Email is enabled (should be by default)
- [ ] (Optional) Enable Google, LinkedIn, etc.

## ✅ Environment Configuration

Edit your `.env` file:

- [ ] `VITE_SUPABASE_URL` = Your project URL
- [ ] `VITE_SUPABASE_ANON_KEY` = Your anon key
- [ ] `VITE_APP_NAME` = "Excel Meet"
- [ ] `VITE_APP_URL` = "http://localhost:5173"
- [ ] `VITE_ENVIRONMENT` = "development"
- [ ] `VITE_ENABLE_ANALYTICS` = "false" (for now)

## ✅ First Run

- [ ] Start dev server: `npm run dev`
- [ ] Server starts without errors
- [ ] Open browser to `http://localhost:5173`
- [ ] Page loads successfully
- [ ] No console errors (F12 to check)

## ✅ Verification

- [ ] Open browser console (F12)
- [ ] Run: `verifySupabaseSetup()`
- [ ] All checks pass:
  - [ ] Connection ✅
  - [ ] Tables ✅
  - [ ] Authentication ✅
  - [ ] Storage ✅
  - [ ] RLS ✅

## ✅ Test Features

- [ ] Click "Register" or "Sign Up"
- [ ] Create a test account
- [ ] Receive confirmation email (check spam)
- [ ] Log in successfully
- [ ] See dashboard/home page
- [ ] Check Supabase Dashboard → Authentication → Users
- [ ] Your test user appears in the list

## ✅ Optional: Advanced Setup

- [ ] Set up Google Analytics (if needed)
- [ ] Configure social login providers
- [ ] Set up custom domain
- [ ] Configure email templates in Supabase
- [ ] Set up staging environment

## 🎉 You're Done!

If all checkboxes are checked, you're ready to start developing!

## 🚨 Troubleshooting

### If something doesn't work:

1. **Check console for errors** (F12 → Console tab)
2. **Verify .env file** has correct credentials
3. **Confirm all migrations ran** (check Table Editor)
4. **Check Supabase project status** (should be "Active")
5. **Clear browser cache** and reload
6. **Restart dev server** (`Ctrl+C` then `npm run dev`)

### Common Issues:

**"Invalid API key"**
→ Double-check you copied the anon key, not service role key

**"relation does not exist"**
→ Migrations didn't run. Go back to "Run Migrations" section

**"Row Level Security policy violation"**
→ RLS policies not set up. Check migration 1 ran successfully

**"Storage bucket not found"**
→ Create storage buckets as described above

**Page is blank**
→ Check browser console for errors

## 📚 Next Steps

Once everything works:

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
3. Check [PRODUCTION_READY_CHECKLIST.md](./PRODUCTION_READY_CHECKLIST.md) before launch
4. Explore the codebase and start building!

## 🆘 Need Help?

- 📖 [Full Supabase Setup Guide](./SUPABASE_SETUP_GUIDE.md)
- 📖 [Detailed Setup Guide](./SETUP.md)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Open an Issue](https://github.com/yourusername/excel-meet/issues)

---

**Estimated Time**: 15-30 minutes for complete setup

**Last Updated**: January 2024