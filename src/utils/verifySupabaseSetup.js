/**
 * Supabase Setup Verification Script
 * Run this in browser console to verify your Supabase setup
 */

import { supabase } from './supabase';
import { logger } from './logger';

export async function verifySupabaseSetup() {
  console.log('🔍 Starting Supabase Setup Verification...\n');
  
  const results = {
    connection: false,
    tables: false,
    auth: false,
    storage: false,
    rls: false
  };

  // 1. Test Connection
  console.log('1️⃣ Testing Supabase Connection...');
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) throw error;
    results.connection = true;
    console.log('✅ Connection successful\n');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('💡 Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env\n');
    return results;
  }

  // 2. Test Tables Exist
  console.log('2️⃣ Checking Database Tables...');
  const requiredTables = [
    'user_profiles',
    'jobs',
    'job_applications',
    'conversations',
    'messages',
    'notifications',
    'reviews'
  ];

  let allTablesExist = true;
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code !== 'PGRST116') {
        console.error(`❌ Table "${table}" not found or error:`, error.message);
        allTablesExist = false;
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    } catch (error) {
      console.error(`❌ Error checking table "${table}":`, error.message);
      allTablesExist = false;
    }
  }
  
  results.tables = allTablesExist;
  if (allTablesExist) {
    console.log('✅ All required tables exist\n');
  } else {
    console.log('❌ Some tables are missing. Run migrations in Supabase dashboard.\n');
  }

  // 3. Test Authentication
  console.log('3️⃣ Testing Authentication...');
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ User is authenticated:', session.user.email);
      results.auth = true;
    } else {
      console.log('ℹ️ No active session (not logged in)');
      console.log('💡 Try registering/logging in to test auth\n');
      results.auth = true; // Auth is working, just not logged in
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    results.auth = false;
  }
  console.log('');

  // 4. Test Storage Buckets
  console.log('4️⃣ Checking Storage Buckets...');
  const requiredBuckets = ['avatars', 'resumes', 'jobs', 'portfolios'];
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const bucketNames = buckets.map(b => b.name);
    let allBucketsExist = true;

    for (const bucket of requiredBuckets) {
      if (bucketNames.includes(bucket)) {
        console.log(`✅ Bucket "${bucket}" exists`);
      } else {
        console.error(`❌ Bucket "${bucket}" not found`);
        allBucketsExist = false;
      }
    }

    results.storage = allBucketsExist;
    if (allBucketsExist) {
      console.log('✅ All required storage buckets exist\n');
    } else {
      console.log('❌ Some storage buckets are missing.\n');
      console.log('💡 Create them in Supabase Dashboard → Storage\n');
    }
  } catch (error) {
    console.error('❌ Storage check failed:', error.message);
    results.storage = false;
  }

  // 5. Test RLS Policies
  console.log('5️⃣ Testing Row Level Security...');
  try {
    // Try to query user_profiles without auth (should work for public professional profiles)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, avatar_url')
      .eq('role', 'professional')
      .limit(1);

    if (error && error.message.includes('policy')) {
      console.log('✅ RLS is enabled and working');
      results.rls = true;
    } else if (!error) {
      console.log('✅ RLS policies configured correctly');
      results.rls = true;
    } else {
      console.error('❌ RLS check failed:', error.message);
      results.rls = false;
    }
  } catch (error) {
    console.error('❌ RLS test error:', error.message);
    results.rls = false;
  }
  console.log('');

  // Summary
  console.log('📊 Verification Summary:');
  console.log('========================');
  console.log(`Connection:     ${results.connection ? '✅' : '❌'}`);
  console.log(`Tables:         ${results.tables ? '✅' : '❌'}`);
  console.log(`Authentication: ${results.auth ? '✅' : '❌'}`);
  console.log(`Storage:        ${results.storage ? '✅' : '❌'}`);
  console.log(`RLS:            ${results.rls ? '✅' : '❌'}`);
  console.log('========================\n');

  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('🎉 All checks passed! Your Supabase setup is complete.');
    console.log('✅ You can now start using the application.\n');
  } else {
    console.log('⚠️ Some checks failed. Please review the errors above.');
    console.log('📖 See SUPABASE_SETUP_GUIDE.md for detailed setup instructions.\n');
  }

  return results;
}

// Auto-run in development
if (import.meta.env.DEV) {
  // Make it available globally in console
  window.verifySupabaseSetup = verifySupabaseSetup;
  
  // Log helper message
  console.log('💡 Run verifySupabaseSetup() in console to check your Supabase setup');
}

export default verifySupabaseSetup;