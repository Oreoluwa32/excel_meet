import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * GoogleAd Component
 * Displays Google AdSense ads only for free plan users
 * 
 * @param {string} slot - AdSense ad slot ID
 * @param {string} format - Ad format (auto, rectangle, horizontal, vertical)
 * @param {boolean} responsive - Whether the ad should be responsive
 * @param {string} className - Additional CSS classes
 */
const GoogleAd = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = '' 
}) => {
  const { userProfile, loading } = useAuth();
  const adsenseId = import.meta.env.VITE_ADSENSE_ID;

  // Check if user should see ads (free plan or not logged in)
  const shouldShowAds = () => {
    // Don't show ads while loading
    if (loading) return false;

    // Show ads if no user profile (not logged in)
    if (!userProfile) return true;

    // Check subscription tier
    const tier = userProfile.subscription_tier || 'free';
    
    // Show ads only for free tier
    if (tier === 'free') return true;

    // For paid tiers, check if subscription is still active
    if (tier !== 'free') {
      const status = userProfile.subscription_status;
      const endDate = userProfile.subscription_end_date;

      // If subscription is cancelled or expired, show ads
      if (status === 'cancelled' && endDate) {
        const expiryDate = new Date(endDate);
        const now = new Date();
        
        // If subscription has expired, show ads
        if (now > expiryDate) {
          return true;
        }
      }

      // If subscription is inactive or expired, show ads
      if (status === 'inactive' || status === 'expired') {
        return true;
      }

      // Active paid subscription - no ads
      return false;
    }

    return true;
  };

  useEffect(() => {
    // Only load ads if they should be shown and adsense ID is configured
    if (shouldShowAds() && adsenseId && adsenseId !== 'your-adsense-id-here') {
      try {
        // Push ad to adsbygoogle array
        if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('Error loading Google Ad:', error);
      }
    }
  }, [userProfile, loading, adsenseId]);

  // Don't render if ads shouldn't be shown
  if (!shouldShowAds()) {
    return null;
  }

  // Don't render if AdSense ID is not configured
  if (!adsenseId || adsenseId === 'your-adsense-id-here') {
    // Show placeholder in development
    if (import.meta.env.DEV) {
      return (
        <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center ${className}`}>
          <p className="text-sm text-gray-500">
            📢 Ad Placeholder (Configure VITE_ADSENSE_ID)
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`google-ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAd;