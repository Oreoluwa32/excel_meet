/**
 * Subscription Expiry Checker
 * 
 * This script checks for expired subscriptions and downgrades users to the free tier.
 * It should be run periodically (e.g., daily) via a cron job or scheduled task.
 * 
 * Usage:
 *   node scripts/check-expired-subscriptions.js
 *   OR
 *   npm run check-subscriptions
 * 
 * Setup as a cron job (Linux/Mac):
 *   # Run daily at 2 AM
 *   0 2 * * * cd /path/to/excel_meet && npm run check-subscriptions
 * 
 * Setup as a scheduled task (Windows):
 *   1. Open Task Scheduler
 *   2. Create Basic Task
 *   3. Set trigger to Daily at 2:00 AM
 *   4. Action: Start a program
 *   5. Program: npm
 *   6. Arguments: run check-subscriptions
 *   7. Start in: C:\Users\oreol\Documents\Projects\excel_meet
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env file');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function handleExpiredSubscriptions() {
  console.log('='.repeat(60));
  console.log('Checking for expired subscriptions...');
  console.log('Timestamp:', new Date().toISOString());
  console.log('='.repeat(60));

  try {
    const now = new Date().toISOString();
    
    // Find all subscriptions that have expired
    const { data: expiredSubscriptions, error } = await supabase
      .from('user_profiles')
      .select('id, email, subscription_tier, subscription_end_date, subscription_status')
      .neq('subscription_tier', 'free')
      .lt('subscription_end_date', now);

    if (error) {
      console.error('❌ Error fetching expired subscriptions:', error);
      return { success: false, error: error.message };
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('✅ No expired subscriptions found');
      return { success: true, count: 0 };
    }

    console.log(`📋 Found ${expiredSubscriptions.length} expired subscription(s)`);
    console.log('');

    // Downgrade each expired subscription to free
    const results = [];
    for (const profile of expiredSubscriptions) {
      console.log(`Processing user: ${profile.email || profile.id}`);
      console.log(`  Current tier: ${profile.subscription_tier}`);
      console.log(`  Expired on: ${profile.subscription_end_date}`);
      console.log(`  Status: ${profile.subscription_status}`);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'expired',
          subscription_start_date: null,
          subscription_end_date: null,
          paystack_subscription_code: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`  ❌ Error updating user: ${updateError.message}`);
        results.push({ success: false, userId: profile.id, error: updateError.message });
      } else {
        console.log(`  ✅ Successfully downgraded to free tier`);
        results.push({ success: true, userId: profile.id });
      }
      console.log('');
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('='.repeat(60));
    console.log('Summary:');
    console.log(`  Total processed: ${expiredSubscriptions.length}`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ❌ Failed: ${failureCount}`);
    console.log('='.repeat(60));

    return {
      success: true,
      total: expiredSubscriptions.length,
      successful: successCount,
      failed: failureCount,
      results
    };
  } catch (error) {
    console.error('❌ Error handling expired subscriptions:', error);
    return { success: false, error: error.message };
  }
}

// Run the script
handleExpiredSubscriptions()
  .then((result) => {
    if (result.success) {
      console.log('✅ Script completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Script completed with errors');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });