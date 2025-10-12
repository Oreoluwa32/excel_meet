import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook to determine if ads should be visible to the current user
 * Ads are only shown to free plan users or users with expired subscriptions
 * 
 * @returns {Object} { shouldShowAds: boolean, reason: string }
 */
export const useAdVisibility = () => {
  const { userProfile, loading, user } = useAuth();

  const adVisibility = useMemo(() => {
    // Don't show ads while loading
    if (loading) {
      return { shouldShowAds: false, reason: 'loading' };
    }

    // Show ads if no user is logged in
    if (!user) {
      return { shouldShowAds: true, reason: 'not_logged_in' };
    }

    // Show ads if no user profile exists
    if (!userProfile) {
      return { shouldShowAds: true, reason: 'no_profile' };
    }

    // Check subscription tier
    const tier = userProfile.subscription_tier || 'free';
    
    // Show ads for free tier
    if (tier === 'free') {
      return { shouldShowAds: true, reason: 'free_tier' };
    }

    // For paid tiers, check subscription status and expiry
    const status = userProfile.subscription_status;
    const endDate = userProfile.subscription_end_date;

    // If subscription is cancelled, check if it has expired
    if (status === 'cancelled' && endDate) {
      const expiryDate = new Date(endDate);
      const now = new Date();
      
      if (now > expiryDate) {
        return { shouldShowAds: true, reason: 'subscription_expired' };
      }
      
      // Still within grace period
      return { shouldShowAds: false, reason: 'cancelled_but_active' };
    }

    // Show ads if subscription is inactive or expired
    if (status === 'inactive' || status === 'expired') {
      return { shouldShowAds: true, reason: 'subscription_inactive' };
    }

    // Active paid subscription - no ads
    if (status === 'active' && tier !== 'free') {
      return { shouldShowAds: false, reason: 'active_subscription' };
    }

    // Default to showing ads if status is unclear
    return { shouldShowAds: true, reason: 'default' };
  }, [userProfile, loading, user]);

  return adVisibility;
};

export default useAdVisibility;