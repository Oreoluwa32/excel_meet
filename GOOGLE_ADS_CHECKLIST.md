# Google Ads Setup Checklist

Use this checklist to ensure your Google Ads integration is properly configured.

## 📋 Pre-Setup (Before AdSense Approval)

- [ ] **Read AdSense Policies**
  - Review [Google AdSense Program Policies](https://support.google.com/adsense/answer/48182)
  - Ensure your site complies with all requirements
  - Understand prohibited content guidelines

- [ ] **Prepare Your Website**
  - Ensure site has sufficient content
  - Add privacy policy page
  - Add terms of service page
  - Ensure site is accessible and functional

- [ ] **Create Google Account**
  - Use a Google account for AdSense
  - Enable 2-factor authentication
  - Keep credentials secure

## 🎯 AdSense Account Setup

- [ ] **Apply for AdSense**
  - Go to https://www.google.com/adsense/
  - Click "Get Started"
  - Fill in website URL and email
  - Submit application

- [ ] **Add AdSense Code to Site**
  - Copy AdSense verification code
  - Add to `<head>` section of your site
  - Wait for verification (can take 24-48 hours)

- [ ] **Wait for Approval**
  - Check email for approval notification
  - Approval typically takes 1-2 weeks
  - Address any issues if rejected

## ⚙️ Configuration (After Approval)

### Step 1: Get Your Publisher ID

- [ ] Log in to AdSense dashboard
- [ ] Go to **Account** → **Settings** → **Account information**
- [ ] Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
- [ ] Save it securely

### Step 2: Update Environment Variables

- [ ] Open `.env` file in project root
- [ ] Find line: `VITE_ADSENSE_ID=your-adsense-id-here`
- [ ] Replace with: `VITE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX`
- [ ] Save the file

**Example:**
```env
VITE_ADSENSE_ID=ca-pub-1234567890123456
```

### Step 3: Update HTML File

- [ ] Open `index.html` in project root
- [ ] Find the AdSense script tag (around line 43)
- [ ] Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual Publisher ID
- [ ] Save the file

**Before:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
   crossorigin="anonymous"></script>
```

**After:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
   crossorigin="anonymous"></script>
```

### Step 4: Create Ad Units

- [ ] Log in to AdSense dashboard
- [ ] Go to **Ads** → **Overview** → **By ad unit**
- [ ] Click **+ New ad unit**

Create these ad units:

#### Ad Unit 1: Horizontal Banner
- [ ] Name: `excel-meet-horizontal`
- [ ] Type: Display ad
- [ ] Size: Responsive
- [ ] Copy the Ad slot ID

#### Ad Unit 2: Vertical Banner
- [ ] Name: `excel-meet-vertical`
- [ ] Type: Display ad
- [ ] Size: 160x600 or Responsive
- [ ] Copy the Ad slot ID

#### Ad Unit 3: Square Banner
- [ ] Name: `excel-meet-square`
- [ ] Type: Display ad
- [ ] Size: 300x250 or Responsive
- [ ] Copy the Ad slot ID

#### Ad Unit 4: Leaderboard
- [ ] Name: `excel-meet-leaderboard`
- [ ] Type: Display ad
- [ ] Size: 728x90 or Responsive
- [ ] Copy the Ad slot ID

#### Ad Unit 5: Mobile Banner
- [ ] Name: `excel-meet-mobile`
- [ ] Type: Display ad
- [ ] Size: 320x50 or Responsive
- [ ] Copy the Ad slot ID

### Step 5: Update Ad Slot IDs

- [ ] Open `src/components/AdBanner.jsx`
- [ ] Find the `defaultSlots` object (around line 23)
- [ ] Replace each placeholder with your actual ad slot IDs
- [ ] Save the file

**Before:**
```javascript
const defaultSlots = {
  horizontal: '1234567890',
  vertical: '1234567891',
  square: '1234567892',
  leaderboard: '1234567893',
  mobile: '1234567894',
};
```

**After:**
```javascript
const defaultSlots = {
  horizontal: 'YOUR_ACTUAL_SLOT_ID_1',
  vertical: 'YOUR_ACTUAL_SLOT_ID_2',
  square: 'YOUR_ACTUAL_SLOT_ID_3',
  leaderboard: 'YOUR_ACTUAL_SLOT_ID_4',
  mobile: 'YOUR_ACTUAL_SLOT_ID_5',
};
```

## 🧪 Testing

### Test in Development

- [ ] Run `npm start` to start development server
- [ ] Check if ad placeholders appear (if AdSense ID not configured)
- [ ] Check browser console for errors
- [ ] Verify no JavaScript errors

### Test Ad Visibility Logic

#### Test 1: Not Logged In
- [ ] Open site in incognito/private window
- [ ] Browse without logging in
- [ ] **Expected:** Ad placeholders visible
- [ ] **Actual:** ___________

#### Test 2: Free Plan User
- [ ] Log in with a free plan account
- [ ] Navigate to different pages
- [ ] **Expected:** Ad placeholders visible
- [ ] **Actual:** ___________

#### Test 3: Paid Plan User (Active)
- [ ] Log in with active paid subscription
- [ ] Navigate to different pages
- [ ] **Expected:** No ads visible
- [ ] **Actual:** ___________

#### Test 4: Expired Subscription
- [ ] Log in with expired subscription
- [ ] Navigate to different pages
- [ ] **Expected:** Ad placeholders visible
- [ ] **Actual:** ___________

#### Test 5: Cancelled Subscription (Still Active)
- [ ] Log in with cancelled but active subscription
- [ ] Check subscription end date is in future
- [ ] Navigate to different pages
- [ ] **Expected:** No ads visible (grace period)
- [ ] **Actual:** ___________

### Test on Different Devices

- [ ] **Desktop** - Chrome
- [ ] **Desktop** - Firefox
- [ ] **Desktop** - Safari
- [ ] **Desktop** - Edge
- [ ] **Mobile** - iOS Safari
- [ ] **Mobile** - Android Chrome
- [ ] **Tablet** - iPad
- [ ] **Tablet** - Android

### Test Ad Placements

- [ ] **Home Dashboard**
  - [ ] Top horizontal banner visible
  - [ ] Bottom square banner visible
  - [ ] Proper spacing and alignment

- [ ] **Search & Discovery**
  - [ ] Top horizontal banner visible
  - [ ] In-feed banners after every 4 results
  - [ ] Proper grid layout maintained

- [ ] **Job Details**
  - [ ] Horizontal banner between sections
  - [ ] Vertical banner in sidebar (desktop)
  - [ ] No layout shifts

## 🚀 Deployment

### Pre-Deployment

- [ ] All tests passed
- [ ] No console errors
- [ ] Ad placements look good
- [ ] Mobile responsive
- [ ] Performance acceptable

### Build for Production

- [ ] Run `npm run build`
- [ ] Check for build errors
- [ ] Verify build output
- [ ] Test production build locally

### Deploy

- [ ] Deploy to production server
- [ ] Verify environment variables are set
- [ ] Check site is accessible
- [ ] Test ad visibility on live site

### Post-Deployment

- [ ] Wait 24-48 hours for ads to appear
- [ ] Check AdSense dashboard for impressions
- [ ] Monitor for policy violations
- [ ] Check revenue reports

## 📊 Monitoring (First Week)

### Daily Checks

- [ ] **Day 1:** Check if ads are showing
- [ ] **Day 2:** Verify ad impressions in AdSense
- [ ] **Day 3:** Check for policy violations
- [ ] **Day 4:** Monitor click-through rate
- [ ] **Day 5:** Review ad performance
- [ ] **Day 6:** Check revenue reports
- [ ] **Day 7:** Analyze first week data

### Metrics to Monitor

- [ ] **Impressions** - Number of times ads shown
- [ ] **Clicks** - Number of ad clicks
- [ ] **CTR** - Click-through rate
- [ ] **CPC** - Cost per click
- [ ] **Revenue** - Total earnings
- [ ] **Page RPM** - Revenue per 1000 impressions

## 🔧 Optimization (After First Week)

### Performance Review

- [ ] Review ad performance data
- [ ] Identify best-performing placements
- [ ] Identify underperforming placements
- [ ] Check user feedback

### Adjustments

- [ ] Remove or relocate underperforming ads
- [ ] Test different ad formats
- [ ] Adjust ad density if needed
- [ ] A/B test ad placements

### User Experience

- [ ] Check page load times
- [ ] Monitor Core Web Vitals
- [ ] Review user complaints
- [ ] Adjust if ads are too intrusive

## ⚠️ Compliance

### AdSense Policies

- [ ] No clicking own ads
- [ ] No encouraging clicks
- [ ] No misleading labels
- [ ] No ads on error pages
- [ ] Proper ad-to-content ratio
- [ ] No prohibited content

### Privacy & Legal

- [ ] Privacy policy updated
- [ ] Cookie consent implemented
- [ ] GDPR compliance (if applicable)
- [ ] Terms of service updated

## 📝 Documentation

- [ ] Document ad slot IDs
- [ ] Document Publisher ID (securely)
- [ ] Note any custom configurations
- [ ] Update team documentation
- [ ] Train team on ad policies

## 🆘 Troubleshooting

If ads are not showing:

- [ ] Check AdSense account status
- [ ] Verify Publisher ID is correct
- [ ] Verify ad slot IDs are correct
- [ ] Check browser console for errors
- [ ] Disable ad blocker
- [ ] Wait 24-48 hours after setup
- [ ] Check AdSense dashboard for issues

If ads showing to paid users:

- [ ] Check user subscription status in database
- [ ] Verify `subscription_tier` field
- [ ] Verify `subscription_status` field
- [ ] Check `subscription_end_date`
- [ ] Review `useAdVisibility.js` logic
- [ ] Check browser console for debug info

## 📞 Support Resources

- [ ] Bookmark [AdSense Help Center](https://support.google.com/adsense/)
- [ ] Join [AdSense Community](https://support.google.com/adsense/community)
- [ ] Save AdSense support contact
- [ ] Review `GOOGLE_ADS_SETUP.md`
- [ ] Review `src/components/README_ADS.md`

## ✅ Final Verification

- [ ] All configuration steps completed
- [ ] All tests passed
- [ ] Deployed to production
- [ ] Ads showing correctly
- [ ] No policy violations
- [ ] Revenue tracking working
- [ ] Team trained
- [ ] Documentation complete

## 🎉 Success Criteria

Your Google Ads integration is successful when:

- ✅ Ads show to free plan users
- ✅ Ads hidden for paid subscribers
- ✅ No console errors
- ✅ Good user experience
- ✅ Generating revenue
- ✅ No policy violations
- ✅ Mobile responsive
- ✅ Fast page load times

---

**Setup Date:** _______________  
**Completed By:** _______________  
**AdSense Account:** _______________  
**Publisher ID:** ca-pub-_______________  

---

**Notes:**
_Use this space for any additional notes or observations_

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

Good luck with your Google Ads integration! 🚀