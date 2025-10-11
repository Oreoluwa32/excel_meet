# ⚡ Quick Deploy to Production

**Goal:** Deploy your entire app to production in ~30 minutes with test mode payments.

---

## 🎯 What You'll Get

✅ Frontend live at: `https://your-app.vercel.app`  
✅ Webhook server live at: `https://your-webhooks.onrender.com`  
✅ Real webhook URLs (no more ngrok!)  
✅ Test mode payments (safe testing)  
✅ 24/7 uptime  
✅ $0/month cost  

---

## 📋 What You Need

- GitHub account
- 30 minutes
- Your current `.env` file values

---

## 🚀 Step 1: Push to GitHub (5 min)

```powershell
# In your project root
cd c:\Users\oreol\Documents\Projects\excel_meet

# Initialize git (if not done)
git init
git add .
git commit -m "Initial production deployment"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/excel-meet.git
git branch -M main
git push -u origin main
```

✅ **Done!** Your code is on GitHub.

---

## 🚀 Step 2: Deploy Frontend to Vercel (10 min)

### 2.1 Sign Up & Import

1. Go to https://vercel.com/
2. Click **"Sign Up"** (use GitHub)
3. Click **"Add New Project"**
4. Click **"Import"** next to your `excel-meet` repo

### 2.2 Configure Build

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

Click **"Deploy"** (don't add env vars yet)

### 2.3 Add Environment Variables

After first deploy, go to **Settings → Environment Variables** and add:

```env
VITE_SUPABASE_URL=https://izxjmcfbhktnmtqbdjkm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eGptY2ZiaGt0bm10cWJkamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzQ2MTAsImV4cCI6MjA2NzcxMDYxMH0.tUKY6vWWnlN_Iy5fiu6AZ6byVAhu5ClI8ijRnFQA4Qo
VITE_PAYSTACK_PUBLIC_KEY=pk_test_3cd655e2ecedc880a2b5d8e0bea632454ac3f637
```

Click **"Save"** then **"Redeploy"**

### 2.4 Test

Visit your URL: `https://your-app.vercel.app`

✅ **Done!** Your frontend is live.

---

## 🚀 Step 3: Deploy Webhook Server to Render (10 min)

### 3.1 Sign Up & Create Service

1. Go to https://render.com/
2. Click **"Sign Up"** (use GitHub)
3. Click **"New +" → "Web Service"**
4. Click **"Connect"** next to your `excel-meet` repo

### 3.2 Configure Service

- **Name:** `excel-meet-webhooks`
- **Root Directory:** `server`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

### 3.3 Add Environment Variables

Click **"Advanced"** and add:

```env
VITE_SUPABASE_URL=https://izxjmcfbhktnmtqbdjkm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eGptY2ZiaGt0bm10cWJkamttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzNDYxMCwiZXhwIjoyMDY3NzEwNjEwfQ.NHldCgZQQlx8N43jzmUbGH9UH1_tUL3IGRishGRHX2M
VITE_PAYSTACK_SECRET_KEY=sk_test_ba2e9c1a6af491e903f48c5aad4ae08e3313ebf9
WEBHOOK_PORT=3001
```

Click **"Create Web Service"**

### 3.4 Wait for Deploy

Wait ~5 minutes for deployment to complete.

### 3.5 Test

Visit: `https://excel-meet-webhooks.onrender.com/health`

Should see: `{"status":"ok",...}`

✅ **Done!** Your webhook server is live.

---

## 🚀 Step 4: Configure Paystack (5 min)

### 4.1 Get Your Webhook URL

Your webhook URL is:
```
https://excel-meet-webhooks.onrender.com/api/webhooks/paystack
```

**Copy this URL!**

### 4.2 Update Paystack

1. Go to https://dashboard.paystack.com/settings/developer
2. Scroll to **"Webhook URL"**
3. Paste your webhook URL
4. Click **"Save"**

### 4.3 Select Events

Check these boxes:
- ✅ `charge.success`
- ✅ `subscription.create`
- ✅ `subscription.disable`
- ✅ `subscription.not_renew`
- ✅ `invoice.create`
- ✅ `invoice.update`
- ✅ `invoice.payment_failed`

Click **"Save"** again

### 4.4 Test Webhook

1. Click **"Test Webhook"** button
2. Go to Render dashboard → Logs
3. Should see: `Received Paystack webhook: ...`

✅ **Done!** Webhooks are configured.

---

## 🧪 Step 5: Test Everything (5 min)

### 5.1 Test Payment Flow

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. Sign up or log in
3. Go to profile/subscription page
4. Click **"Upgrade to Basic"**
5. Use test card:
   - Card: `4084084084084081`
   - Expiry: `12/25`
   - CVV: `123`
   - PIN: `1234`
6. Complete payment

### 5.2 Verify Webhook

1. Go to Render dashboard → Logs
2. Should see:
   ```
   Received Paystack webhook: charge.success
   Payment recorded successfully
   Received Paystack webhook: subscription.create
   Subscription created for user
   ```

### 5.3 Verify Database

1. Go to Supabase dashboard
2. Check `payment_history` table → New record
3. Check `user_profiles` table → Subscription updated

### 5.4 Verify UI

1. Refresh your profile page
2. Should show new subscription tier
3. Should show "Active" status

✅ **Success!** Everything is working!

---

## 🎉 You're Live!

### Your Production URLs

**Frontend:** `https://your-app.vercel.app`  
**Webhook Server:** `https://excel-meet-webhooks.onrender.com`  
**Webhook Endpoint:** `https://excel-meet-webhooks.onrender.com/api/webhooks/paystack`  

### What's Working

✅ Frontend deployed and accessible  
✅ Webhook server running 24/7  
✅ Paystack webhooks configured  
✅ Test payments working  
✅ Database updating automatically  
✅ No more ngrok needed!  

### Cost

**$0/month** - Everything on free tiers!

---

## 🔄 Making Updates

Just push to GitHub:

```powershell
git add .
git commit -m "Update feature"
git push
```

Vercel and Render will auto-deploy! 🚀

---

## 📊 Monitoring

### Check Logs

**Frontend:** Vercel Dashboard → Logs  
**Webhook Server:** Render Dashboard → Logs  
**Database:** Supabase Dashboard → Logs  

### Check Webhooks

**Paystack:** Dashboard → Settings → Developer → Webhook Logs

---

## 🐛 Troubleshooting

### Frontend not loading?
- Check Vercel logs
- Verify environment variables
- Test build locally: `npm run build`

### Webhooks not working?
- Check Render logs
- Verify webhook URL in Paystack
- Test health endpoint: `https://your-server.onrender.com/health`

### Database not updating?
- Check service role key in Render
- Verify Supabase URL
- Check Render logs for errors

---

## 📚 More Help

- **Detailed Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Server Docs:** `server/README.md`

---

## 🚀 Next Steps

1. **Test thoroughly** - Try all features
2. **Monitor logs** - Watch for errors
3. **Share your app** - It's live!
4. **Plan for scale** - When ready, upgrade tiers

---

**Congratulations! Your app is in production! 🎊**

**Test Mode Active:** Safe to test payments without real money.

**Questions?** Check the detailed guides or deployment logs.