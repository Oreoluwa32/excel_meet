import { supabase } from './supabase';

/**
 * Check and handle expired subscriptions
 * This function should be called periodically (e.g., daily via a cron job or scheduled task)
 * to downgrade users whose subscription has expired
 */
export const handleExpiredSubscriptions = async () => {
  try {
    const now = new Date().toISOString();
    
    // Find all subscriptions that have expired
    const { data: expiredSubscriptions, error } = await supabase
      .from('user_profiles')
      .select('id, subscription_tier, subscription_end_date, subscription_status')
      .neq('subscription_tier', 'free')
      .lt('subscription_end_date', now);

    if (error) {
      console.error('Error fetching expired subscriptions:', error);
      return { success: false, error: error.message };
    }

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      console.log('No expired subscriptions found');
      return { success: true, count: 0 };
    }

    console.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

    // Downgrade each expired subscription to free
    const updates = expiredSubscriptions.map(async (profile) => {
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
        console.error(`Error updating user ${profile.id}:`, updateError);
        return { success: false, userId: profile.id, error: updateError.message };
      }

      console.log(`Downgraded user ${profile.id} from ${profile.subscription_tier} to free`);
      return { success: true, userId: profile.id };
    });

    const results = await Promise.all(updates);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return {
      success: true,
      total: expiredSubscriptions.length,
      successful: successCount,
      failed: failureCount,
      results
    };
  } catch (error) {
    console.error('Error handling expired subscriptions:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if a specific user's subscription has expired
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} True if subscription has expired
 */
export const isSubscriptionExpired = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_end_date')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile:', error);
      return false;
    }

    // Free tier never expires
    if (profile.subscription_tier === 'free') {
      return false;
    }

    // Check if end date has passed
    if (profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date);
      const now = new Date();
      return now > endDate;
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription expiry:', error);
    return false;
  }
};

/**
 * Get days remaining until subscription expires
 * @param {string} userId - User ID to check
 * @returns {Promise<number|null>} Days remaining, or null if no active subscription
 */
export const getDaysUntilExpiry = async (userId) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_end_date')
      .eq('id', userId)
      .single();

    if (error || !profile || profile.subscription_tier === 'free' || !profile.subscription_end_date) {
      return null;
    }

    const endDate = new Date(profile.subscription_end_date);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Error calculating days until expiry:', error);
    return null;
  }
};

export default {
  handleExpiredSubscriptions,
  isSubscriptionExpired,
  getDaysUntilExpiry
};