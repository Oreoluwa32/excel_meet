/**
 * Verification script to check if all features are properly set up
 * Run this with: node verify-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying Excel Meet Setup...\n');

  let allPassed = true;

  // 1. Check saved_jobs table
  console.log('1️⃣ Checking saved_jobs table...');
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('   ❌ saved_jobs table not found or not accessible');
      console.error('   Error:', error.message);
      allPassed = false;
    } else {
      console.log('   ✅ saved_jobs table exists and is accessible');
    }
  } catch (err) {
    console.error('   ❌ Error checking saved_jobs table:', err.message);
    allPassed = false;
  }

  // 2. Check jobs storage bucket
  console.log('\n2️⃣ Checking jobs storage bucket...');
  try {
    const { data, error } = await supabase
      .storage
      .getBucket('jobs');
    
    if (error) {
      console.error('   ❌ jobs storage bucket not found');
      console.error('   Error:', error.message);
      allPassed = false;
    } else {
      console.log('   ✅ jobs storage bucket exists');
      console.log('   Public:', data.public ? 'Yes' : 'No');
    }
  } catch (err) {
    console.error('   ❌ Error checking storage bucket:', err.message);
    allPassed = false;
  }

  // 3. Check jobs table
  console.log('\n3️⃣ Checking jobs table...');
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, images')
      .limit(1);
    
    if (error) {
      console.error('   ❌ jobs table not found or not accessible');
      console.error('   Error:', error.message);
      allPassed = false;
    } else {
      console.log('   ✅ jobs table exists and is accessible');
    }
  } catch (err) {
    console.error('   ❌ Error checking jobs table:', err.message);
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ All checks passed! Setup is complete.');
    console.log('\nYou can now:');
    console.log('  • Upload images when creating jobs');
    console.log('  • Save/bookmark jobs');
    console.log('  • View saved jobs at /saved-jobs');
    console.log('  • Share jobs with others');
  } else {
    console.log('❌ Some checks failed. Please review the errors above.');
    console.log('\nTo fix issues:');
    console.log('  1. Run database migrations:');
    console.log('     supabase migration up');
    console.log('  2. Or manually run SQL from:');
    console.log('     - supabase/migrations/20250117000000_create_saved_jobs_table.sql');
    console.log('     - supabase/migrations/20250117000001_create_jobs_storage_bucket.sql');
    console.log('  3. See SETUP_INSTRUCTIONS.md for detailed steps');
  }
  console.log('='.repeat(50));
}

verifySetup().catch(console.error);