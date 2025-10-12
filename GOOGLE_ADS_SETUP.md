# Google Ads Setup Guide for Excel Meet

This guide will help you set up Google AdSense for your Excel Meet application. Ads are automatically shown only to free plan users and hidden for paid subscribers.

## 🎯 Overview

The Google Ads integration has been implemented with the following features:

- **Smart Ad Visibility**: Ads are only shown to:
  - Users on the free plan
  - Users not logged in
  - Users with expired/cancelled subscriptions
  
- **Automatic Ad Hiding**: Ads are automatically hidden for:
  - Users with active paid subscriptions (Basic, Pro, Elite)
  - Users within their billing period (even if subscription is cancelled)

## 📋 Prerequisites

1. A Google AdSense account
2. Your website approved by Google AdSense
3. AdSense ad units created

## 🚀 Setup Instructions

### Step 1: Create Google AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Submit your website for review
4. Wait for approval (usually takes 1-2 weeks)

### Step 2: Get Your AdSense Publisher ID

1. Log in to your AdSense account
2. Go to **Account** → **Settings** → **Account information**
3. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 3: Configure Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder with your actual AdSense ID:

```env
VITE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

**Example:**
```env
VITE_ADSENSE_ID=ca-pub-1234567890123456
```

### Step 4: Update AdSense Script in HTML

1. Open `index.html` in the project root
2. Find the AdSense script tag (around line 43):

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
   crossorigin="anonymous"></script>
```

3. Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID

### Step 5: Create Ad Units in AdSense

1. Log in to your AdSense account
2. Go to **Ads** → **Overview** → **By ad unit**
3. Click **+ New ad unit**
4. Create the following ad units:

#### Recommended Ad Units:

| Ad Type | Size | Placement | Recommended Name |
|---------|------|-----------|------------------|
| Display ad | Responsive | Homepage top | `excel-meet-home-top` |
| Display ad | 300x250 (Medium Rectangle) | Homepage bottom | `excel-meet-home-square` |
| Display ad | Responsive | Search results | `excel-meet-search-horizontal` |
| Display ad | 160x600 (Wide Skyscraper) | Job details sidebar | `excel-meet-sidebar-vertical` |
| Display ad | Responsive | Between content | `excel-meet-content-horizontal` |

5. For each ad unit, copy the **Ad slot ID** (format: `1234567890`)

### Step 6: Configure Ad Slots in Code

1. Open `src/components/AdBanner.jsx`
2. Find the `defaultSlots` object (around line 23):

```javascript
const defaultSlots = {
  horizontal: '1234567890',    // Replace with your horizontal ad slot ID
  vertical: '1234567891',      // Replace with your vertical ad slot ID
  square: '1234567892',        // Replace with your square ad slot ID
  leaderboard: '1234567893',   // Replace with your leaderboard ad slot ID
  mobile: '1234567894',        // Replace with your mobile ad slot ID
};
```

3. Replace each placeholder with your actual ad slot IDs from AdSense

## 📁 Files Created

The following files have been created for the Google Ads integration:

### 1. `src/components/GoogleAd.jsx`
Core component that renders Google AdSense ads with subscription-aware visibility.

**Features:**
- Checks user subscription status
- Automatically hides ads for paid users
- Shows placeholder in development mode
- Handles ad loading and errors

### 2. `src/hooks/useAdVisibility.js`
Custom React hook that determines if ads should be shown to the current user.

**Returns:**
```javascript
{
  shouldShowAds: boolean,  // Whether ads should be displayed
  reason: string          // Reason for the decision (for debugging)
}
```

**Reasons:**
- `loading` - Still loading user data
- `not_logged_in` - User is not logged in (show ads)
- `no_profile` - No user profile found (show ads)
- `free_tier` - User is on free plan (show ads)
- `subscription_expired` - Subscription has expired (show ads)
- `cancelled_but_active` - Subscription cancelled but still active (no ads)
- `subscription_inactive` - Subscription is inactive (show ads)
- `active_subscription` - Active paid subscription (no ads)

### 3. `src/components/AdBanner.jsx`
Pre-configured ad banner component for common placements.

**Usage:**
```jsx
import AdBanner from '../../components/AdBanner';

// Horizontal banner (728x90 or responsive)
<AdBanner type="horizontal" />

// Vertical banner (160x600 or 300x600)
<AdBanner type="vertical" />

// Square banner (250x250 or 300x250)
<AdBanner type="square" />

// Leaderboard banner (728x90)
<AdBanner type="leaderboard" />

// Mobile banner (320x50 or 320x100)
<AdBanner type="mobile" />

// With custom slot ID
<AdBanner type="horizontal" slot="your-custom-slot-id" />

// With custom className
<AdBanner type="square" className="my-4" />
```

## 🎨 Ad Placements

Ads have been integrated into the following pages:

### 1. Home Dashboard (`src/pages/home-dashboard/index.jsx`)
- **Top horizontal banner** - Below subscription banner
- **Bottom square banner** - After job feed

### 2. Search & Discovery (`src/pages/search-discovery/index.jsx`)
- **Top horizontal banner** - Above search results
- **In-feed banners** - After every 4 search results

### 3. Job Details (`src/pages/job-details/index.jsx`)
- **Horizontal banner** - Between poster info and reviews
- **Vertical banner** - In desktop sidebar (above related jobs)

## 🧪 Testing

### Development Mode
In development mode, if AdSense ID is not configured, you'll see placeholder ads:
```
📢 Ad Placeholder (Configure VITE_ADSENSE_ID)
```

### Testing Ad Visibility

1. **Test as Free User:**
   - Log in with a free plan account
   - Ads should be visible on all pages

2. **Test as Paid User:**
   - Log in with a paid subscription (Basic/Pro/Elite)
   - Ads should NOT be visible

3. **Test Subscription Expiry:**
   - Log in with an expired subscription
   - Ads should be visible

4. **Test Not Logged In:**
   - Browse without logging in
   - Ads should be visible

### Debugging

Use the `useAdVisibility` hook to debug ad visibility:

```jsx
import { useAdVisibility } from '../hooks/useAdVisibility';

function MyComponent() {
  const { shouldShowAds, reason } = useAdVisibility();
  
  console.log('Should show ads:', shouldShowAds);
  console.log('Reason:', reason);
  
  return <div>...</div>;
}
```

## 🔧 Customization

### Adding Ads to New Pages

1. Import the `AdBanner` component:
```jsx
import AdBanner from '../../components/AdBanner';
```

2. Add the ad banner where you want it:
```jsx
<AdBanner type="horizontal" className="my-4" />
```

### Creating Custom Ad Placements

Use the `GoogleAd` component directly for more control:

```jsx
import GoogleAd from '../../components/GoogleAd';

function MyComponent() {
  return (
    <GoogleAd
      slot="your-ad-slot-id"
      format="auto"
      responsive={true}
      className="my-custom-class"
    />
  );
}
```

### Modifying Ad Visibility Logic

Edit `src/hooks/useAdVisibility.js` to change when ads are shown:

```javascript
// Example: Show ads to Basic plan users too
if (tier === 'free' || tier === 'basic') {
  return { shouldShowAds: true, reason: 'free_or_basic_tier' };
}
```

## 📊 AdSense Policies

**Important:** Make sure your implementation complies with [Google AdSense Program Policies](https://support.google.com/adsense/answer/48182):

✅ **Do:**
- Place ads in natural positions
- Clearly label ads as "Advertisement"
- Ensure ads don't interfere with navigation
- Keep ad-to-content ratio reasonable

❌ **Don't:**
- Click your own ads
- Encourage users to click ads
- Place ads on error pages
- Use misleading ad labels

## 🚨 Troubleshooting

### Ads Not Showing

1. **Check AdSense ID:**
   - Verify `VITE_ADSENSE_ID` in `.env` is correct
   - Verify AdSense script in `index.html` has correct ID

2. **Check Ad Slot IDs:**
   - Verify slot IDs in `AdBanner.jsx` are correct
   - Make sure ad units are active in AdSense dashboard

3. **Check User Subscription:**
   - Use `useAdVisibility` hook to debug
   - Check console for ad visibility reason

4. **Check Browser Console:**
   - Look for AdSense errors
   - Check if ad blocker is enabled

5. **Wait for AdSense Approval:**
   - New sites need approval before ads show
   - Test ads may take 24-48 hours to appear

### Ads Showing to Paid Users

1. **Check Subscription Status:**
   - Verify user's `subscription_tier` in database
   - Verify `subscription_status` is 'active'
   - Check `subscription_end_date` hasn't expired

2. **Check Logic:**
   - Review `useAdVisibility.js` logic
   - Check `GoogleAd.jsx` `shouldShowAds()` function

### Performance Issues

1. **Lazy Load Ads:**
   - Ads are already loaded asynchronously
   - Consider implementing intersection observer for below-fold ads

2. **Limit Ad Density:**
   - Don't place too many ads on one page
   - Follow AdSense ad density guidelines

## 📈 Monitoring

### AdSense Dashboard

Monitor your ad performance in the [AdSense Dashboard](https://www.google.com/adsense/):

- **Earnings:** Track daily/monthly revenue
- **Performance:** View impressions, clicks, CTR
- **Optimization:** Get suggestions to improve earnings
- **Policy:** Check for policy violations

### Analytics Integration

The app already has Google Analytics configured. You can:

1. Track ad impressions as custom events
2. Monitor user engagement with ads
3. Analyze conversion rates

## 🔐 Security

- AdSense IDs are public and safe to expose in client-side code
- Never share your AdSense account credentials
- Use environment variables for configuration
- Keep your AdSense account secure with 2FA

## 📞 Support

### Google AdSense Support
- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community](https://support.google.com/adsense/community)

### Excel Meet Support
- Check the code comments in the ad components
- Review the `useAdVisibility` hook for logic
- Test in development mode with placeholders

## ✅ Checklist

Before going live, make sure:

- [ ] AdSense account is approved
- [ ] Publisher ID is configured in `.env`
- [ ] AdSense script is updated in `index.html`
- [ ] Ad slot IDs are configured in `AdBanner.jsx`
- [ ] Tested ad visibility for free users
- [ ] Tested ad hiding for paid users
- [ ] Tested subscription expiry scenarios
- [ ] Verified ads comply with AdSense policies
- [ ] Checked ad placements on mobile devices
- [ ] Monitored initial ad performance

## 🎉 You're All Set!

Once configured, ads will automatically:
- Show to free plan users
- Hide for paid subscribers
- Respect subscription billing periods
- Handle subscription cancellations and expirations

Your users will enjoy an ad-free experience when they upgrade to a paid plan! 🚀