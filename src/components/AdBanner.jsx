import React from 'react';
import GoogleAd from './GoogleAd';
import { useAdVisibility } from '../hooks/useAdVisibility';

/**
 * AdBanner Component
 * Pre-configured ad banner for common placements
 * 
 * @param {string} type - Banner type: 'horizontal', 'vertical', 'square', 'leaderboard'
 * @param {string} slot - AdSense ad slot ID (optional, uses default if not provided)
 * @param {string} className - Additional CSS classes
 */
const AdBanner = ({ type = 'horizontal', slot, className = '' }) => {
  const { shouldShowAds } = useAdVisibility();

  // Don't render if ads shouldn't be shown
  if (!shouldShowAds) {
    return null;
  }

  // Default ad slots for different banner types
  // Replace these with your actual AdSense ad slot IDs
  const defaultSlots = {
    horizontal: '1234567890', // 728x90 or responsive
    vertical: '1234567891',   // 160x600 or 300x600
    square: '1234567892',     // 250x250 or 300x250
    leaderboard: '1234567893', // 728x90
    mobile: '1234567894',     // 320x50 or 320x100
  };

  const adSlot = slot || defaultSlots[type] || defaultSlots.horizontal;

  // Ad format configurations
  const formatConfig = {
    horizontal: {
      format: 'horizontal',
      responsive: true,
      containerClass: 'w-full max-w-4xl mx-auto my-4',
    },
    vertical: {
      format: 'vertical',
      responsive: true,
      containerClass: 'w-full max-w-xs my-4',
    },
    square: {
      format: 'rectangle',
      responsive: true,
      containerClass: 'w-full max-w-sm mx-auto my-4',
    },
    leaderboard: {
      format: 'horizontal',
      responsive: true,
      containerClass: 'w-full max-w-6xl mx-auto my-4',
    },
    mobile: {
      format: 'horizontal',
      responsive: true,
      containerClass: 'w-full mx-auto my-4 md:hidden',
    },
  };

  const config = formatConfig[type] || formatConfig.horizontal;

  return (
    <div className={`ad-banner ${config.containerClass} ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-1">Advertisement</div>
      <GoogleAd
        slot={adSlot}
        format={config.format}
        responsive={config.responsive}
        className="shadow-sm"
      />
    </div>
  );
};

export default AdBanner;