# Google Ads Components - Quick Reference

## 📦 Components Overview

### 1. GoogleAd Component
**File:** `src/components/GoogleAd.jsx`

The core component that renders individual Google AdSense ads.

**Props:**
- `slot` (string, required): AdSense ad slot ID
- `format` (string, default: 'auto'): Ad format ('auto', 'rectangle', 'horizontal', 'vertical')
- `responsive` (boolean, default: true): Whether the ad should be responsive
- `className` (string, default: ''): Additional CSS classes

**Example:**
```jsx
<GoogleAd 
  slot="1234567890" 
  format="horizontal" 
  responsive={true}
  className="my-4"
/>
```

**Features:**
- ✅ Automatically checks user subscription status
- ✅ Hides ads for paid subscribers
- ✅ Shows placeholder in development mode
- ✅ Handles ad loading errors gracefully

---

### 2. AdBanner Component
**File:** `src/components/AdBanner.jsx`

Pre-configured ad banner for common placements.

**Props:**
- `type` (string, default: 'horizontal'): Banner type
  - `'horizontal'` - 728x90 or responsive
  - `'vertical'` - 160x600 or 300x600
  - `'square'` - 250x250 or 300x250
  - `'leaderboard'` - 728x90
  - `'mobile'` - 320x50 or 320x100
- `slot` (string, optional): Custom ad slot ID (uses default if not provided)
- `className` (string, default: ''): Additional CSS classes

**Example:**
```jsx
// Basic usage
<AdBanner type="horizontal" />

// With custom slot
<AdBanner type="square" slot="9876543210" />

// With custom styling
<AdBanner type="vertical" className="my-6 shadow-lg" />
```

---

### 3. useAdVisibility Hook
**File:** `src/hooks/useAdVisibility.js`

Custom hook to determine if ads should be visible.

**Returns:**
```javascript
{
  shouldShowAds: boolean,  // Whether to show ads
  reason: string          // Reason for the decision
}
```

**Example:**
```jsx
import { useAdVisibility } from '../hooks/useAdVisibility';

function MyComponent() {
  const { shouldShowAds, reason } = useAdVisibility();
  
  if (shouldShowAds) {
    return <AdBanner type="horizontal" />;
  }
  
  return <div>Premium content - no ads!</div>;
}
```

**Possible Reasons:**
- `loading` - User data is loading
- `not_logged_in` - User not logged in (show ads)
- `no_profile` - No user profile (show ads)
- `free_tier` - Free plan user (show ads)
- `subscription_expired` - Subscription expired (show ads)
- `cancelled_but_active` - Cancelled but still active (no ads)
- `subscription_inactive` - Inactive subscription (show ads)
- `active_subscription` - Active paid plan (no ads)

---

## 🎯 Ad Visibility Logic

Ads are shown when:
- ✅ User is not logged in
- ✅ User is on free plan
- ✅ User's subscription has expired
- ✅ User's subscription is inactive

Ads are hidden when:
- ❌ User has active paid subscription (Basic, Pro, Elite)
- ❌ User's cancelled subscription is still within billing period

---

## 🚀 Quick Start

### Step 1: Configure AdSense ID
```env
# .env file
VITE_ADSENSE_ID=ca-pub-1234567890123456
```

### Step 2: Update Ad Slot IDs
```javascript
// src/components/AdBanner.jsx
const defaultSlots = {
  horizontal: 'YOUR_HORIZONTAL_SLOT_ID',
  vertical: 'YOUR_VERTICAL_SLOT_ID',
  square: 'YOUR_SQUARE_SLOT_ID',
  leaderboard: 'YOUR_LEADERBOARD_SLOT_ID',
  mobile: 'YOUR_MOBILE_SLOT_ID',
};
```

### Step 3: Add Ads to Your Page
```jsx
import AdBanner from '../../components/AdBanner';

function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      
      {/* Top banner */}
      <AdBanner type="horizontal" className="my-4" />
      
      {/* Your content */}
      <div>...</div>
      
      {/* Bottom banner */}
      <AdBanner type="square" className="my-6" />
    </div>
  );
}
```

---

## 📍 Current Ad Placements

### Home Dashboard
```jsx
// Top horizontal banner
<AdBanner type="horizontal" className="mt-4" />

// Bottom square banner
<AdBanner type="square" className="mt-6" />
```

### Search & Discovery
```jsx
// Top of results
<AdBanner type="horizontal" />

// In-feed (every 4 results)
{(index + 1) % 4 === 0 && (
  <div className="lg:col-span-2">
    <AdBanner type="horizontal" />
  </div>
)}
```

### Job Details
```jsx
// Between sections
<AdBanner type="horizontal" className="my-6" />

// Sidebar (desktop only)
<AdBanner type="vertical" />
```

---

## 🎨 Styling

### Default Styles
All ad banners include:
- "Advertisement" label above the ad
- Responsive container
- Proper spacing

### Custom Styling
```jsx
// Add custom classes
<AdBanner 
  type="horizontal" 
  className="my-8 shadow-lg rounded-lg" 
/>

// Wrap in custom container
<div className="bg-gray-50 p-4 rounded-lg">
  <AdBanner type="square" />
</div>
```

---

## 🧪 Testing

### Development Mode
When `VITE_ADSENSE_ID` is not configured, you'll see:
```
📢 Ad Placeholder (Configure VITE_ADSENSE_ID)
```

### Test Different User States
```javascript
// Check ad visibility
const { shouldShowAds, reason } = useAdVisibility();
console.log('Show ads:', shouldShowAds, 'Reason:', reason);
```

---

## 🔧 Advanced Usage

### Conditional Ad Placement
```jsx
import { useAdVisibility } from '../hooks/useAdVisibility';

function MyComponent() {
  const { shouldShowAds } = useAdVisibility();
  
  return (
    <div>
      {shouldShowAds ? (
        <AdBanner type="horizontal" />
      ) : (
        <div className="premium-content">
          Thanks for being a premium member!
        </div>
      )}
    </div>
  );
}
```

### Custom Ad Component
```jsx
import GoogleAd from '../../components/GoogleAd';

function CustomAd() {
  return (
    <div className="custom-ad-container">
      <h3>Sponsored Content</h3>
      <GoogleAd
        slot="custom-slot-id"
        format="rectangle"
        responsive={false}
        className="border-2 border-gray-200"
      />
    </div>
  );
}
```

### Multiple Ads on Same Page
```jsx
function MyPage() {
  return (
    <div>
      {/* Top leaderboard */}
      <AdBanner type="leaderboard" slot="slot-1" />
      
      {/* Content */}
      <div>...</div>
      
      {/* Middle horizontal */}
      <AdBanner type="horizontal" slot="slot-2" />
      
      {/* More content */}
      <div>...</div>
      
      {/* Bottom square */}
      <AdBanner type="square" slot="slot-3" />
    </div>
  );
}
```

---

## ⚠️ Important Notes

1. **Ad Slot IDs Must Be Unique**
   - Each ad placement needs its own slot ID from AdSense
   - Don't reuse the same slot ID on the same page

2. **Respect Ad Density**
   - Don't place too many ads on one page
   - Follow Google AdSense policies

3. **Mobile Considerations**
   - Use responsive ad formats
   - Test on different screen sizes
   - Consider using mobile-specific ad units

4. **Performance**
   - Ads load asynchronously
   - Don't block page rendering
   - Monitor Core Web Vitals

---

## 📚 Related Files

- `src/components/GoogleAd.jsx` - Core ad component
- `src/components/AdBanner.jsx` - Pre-configured banners
- `src/hooks/useAdVisibility.js` - Visibility logic
- `index.html` - AdSense script
- `.env` - Configuration
- `GOOGLE_ADS_SETUP.md` - Full setup guide

---

## 🆘 Troubleshooting

**Ads not showing?**
1. Check `VITE_ADSENSE_ID` in `.env`
2. Verify ad slot IDs in `AdBanner.jsx`
3. Check user subscription status
4. Look for errors in browser console

**Ads showing to paid users?**
1. Check `subscription_tier` in database
2. Verify `subscription_status` is 'active'
3. Check `subscription_end_date`
4. Review `useAdVisibility.js` logic

**Need help?**
- See `GOOGLE_ADS_SETUP.md` for detailed guide
- Check Google AdSense Help Center
- Review component code comments

---

Made with ❤️ for Excel Meet