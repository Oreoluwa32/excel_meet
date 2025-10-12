# 🚀 Quick Start: Google Ads Integration

Your Google Ads integration is **fully implemented and ready to go!** Follow these simple steps to make it live.

## ✅ What's Already Done

- ✅ Ad visibility logic implemented (shows ads only to free users)
- ✅ Ad components created and integrated
- ✅ Ad placements added to Home, Search, and Job Details pages
- ✅ Subscription-based ad control working
- ✅ Responsive design for all devices
- ✅ Build tested and successful

## 🎯 What You Need To Do (3 Simple Steps)

### Step 1: Get Google AdSense Approval (1-2 weeks)

1. Go to https://www.google.com/adsense/
2. Click "Get Started"
3. Enter your website URL and email
4. Add the verification code to your site
5. Wait for approval email

**Note:** Google typically takes 1-2 weeks to review and approve new sites.

---

### Step 2: Configure Your Publisher ID (5 minutes)

Once approved, you'll receive a Publisher ID like: `ca-pub-1234567890123456`

#### Update `.env` file:
```env
# Replace this line:
VITE_ADSENSE_ID=your-adsense-id-here

# With your actual ID:
VITE_ADSENSE_ID=ca-pub-1234567890123456
```

#### Update `index.html` file (line 43):
```html
<!-- Replace this: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
   crossorigin="anonymous"></script>

<!-- With your actual ID: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
   crossorigin="anonymous"></script>
```

---

### Step 3: Create Ad Units & Update Slot IDs (10 minutes)

1. **Log in to AdSense Dashboard**
2. **Go to:** Ads → Overview → By ad unit
3. **Click:** + New ad unit

**Create these 5 ad units:**

| Ad Unit Name | Type | Size | Purpose |
|--------------|------|------|---------|
| `excel-meet-horizontal` | Display | Responsive | Top banners |
| `excel-meet-vertical` | Display | 160x600 | Sidebar ads |
| `excel-meet-square` | Display | 300x250 | In-content ads |
| `excel-meet-leaderboard` | Display | 728x90 | Header/footer |
| `excel-meet-mobile` | Display | 320x50 | Mobile banners |

4. **Copy each Ad Slot ID** (looks like: `1234567890`)

5. **Update `src/components/AdBanner.jsx`** (line 23):

```javascript
// Replace this:
const defaultSlots = {
  horizontal: '1234567890',
  vertical: '1234567891',
  square: '1234567892',
  leaderboard: '1234567893',
  mobile: '1234567894',
};

// With your actual slot IDs:
const defaultSlots = {
  horizontal: 'YOUR_HORIZONTAL_SLOT_ID',
  vertical: 'YOUR_VERTICAL_SLOT_ID',
  square: 'YOUR_SQUARE_SLOT_ID',
  leaderboard: 'YOUR_LEADERBOARD_SLOT_ID',
  mobile: 'YOUR_MOBILE_SLOT_ID',
};
```

---

## 🧪 Test It Out

### Before Deployment (Development)

```powershell
npm start
```

**Test these scenarios:**

1. **Not logged in** → Should see ad placeholders
2. **Free plan user** → Should see ad placeholders
3. **Paid plan user** → Should NOT see any ads
4. **Expired subscription** → Should see ad placeholders

### After Deployment (Production)

```powershell
npm run build
```

Deploy and wait 24-48 hours for real ads to appear.

---

## 📍 Where Ads Will Appear

### Home Dashboard
- Horizontal banner below subscription section
- Square banner after job feed

### Search & Discovery
- Horizontal banner above search results
- In-feed banners after every 4 results

### Job Details
- Horizontal banner between sections
- Vertical banner in sidebar (desktop only)

---

## 🎯 Ad Visibility Rules (Already Implemented)

| User Type | Subscription Status | Ads Visible? |
|-----------|-------------------|--------------|
| Not logged in | N/A | ✅ Yes |
| Free plan | Active | ✅ Yes |
| Basic plan | Active | ❌ No |
| Pro plan | Active | ❌ No |
| Elite plan | Active | ❌ No |
| Any paid plan | Cancelled (within billing period) | ❌ No |
| Any paid plan | Expired | ✅ Yes |

**Grace Period:** Users who cancel their subscription keep their ad-free experience until the end of their billing period.

---

## 📊 Monitor Performance

After deployment, check your AdSense dashboard:

- **Impressions:** How many times ads were shown
- **Clicks:** How many times ads were clicked
- **CTR:** Click-through rate
- **Revenue:** Your earnings

---

## 🆘 Troubleshooting

### Ads not showing?

1. **Wait 24-48 hours** after setup (Google needs time to serve ads)
2. **Check AdSense account status** (must be approved)
3. **Verify Publisher ID** in `.env` and `index.html`
4. **Verify Ad Slot IDs** in `AdBanner.jsx`
5. **Disable ad blocker** in your browser
6. **Check browser console** for errors

### Ads showing to paid users?

1. Check user's subscription status in database
2. Verify `subscription_tier` is set correctly
3. Verify `subscription_status` is 'active'
4. Check `subscription_end_date` hasn't expired
5. Open browser console and look for debug messages

---

## 📚 Full Documentation

For detailed information, see:

- **`GOOGLE_ADS_SETUP.md`** - Complete setup guide with troubleshooting
- **`GOOGLE_ADS_CHECKLIST.md`** - Step-by-step checklist
- **`src/components/README_ADS.md`** - Developer guide for ad components
- **`GOOGLE_ADS_IMPLEMENTATION_SUMMARY.md`** - Technical implementation details

---

## 🎉 That's It!

Your Google Ads integration is **complete and ready**. Just follow the 3 steps above to make it live:

1. ✅ Get AdSense approval
2. ✅ Configure Publisher ID
3. ✅ Create ad units and update slot IDs

**Questions?** Check the full documentation files listed above.

---

**Good luck with your ad revenue! 💰**