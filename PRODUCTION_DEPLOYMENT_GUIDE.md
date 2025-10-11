# 🚀 Production Deployment Guide (Test Mode Payments)

This guide will help you deploy your entire app to production while keeping Paystack in **test mode** for safe testing.

---

## 🎯 Deployment Strategy

### What We're Deploying

1. **Frontend App** → Vercel/Netlify (Free tier)
2. **Webhook Server** → Render/Railway (Free tier)
3. **Database** → Supabase (Already set up)
4. **Payments** → Paystack (Test mode)

### Benefits

✅ **No more ngrok** - Real production URLs  
✅ **Always accessible** - 24/7 uptime  
✅ **Real webhook testing** - Stable URLs  
✅ **Safe testing** - Test mode payments only  
✅ **Free hosting** - All on free tiers  

---

## 📋 Prerequisites

- [ ] GitHub account
- [ ] Vercel or Netlify account (free)
- [ ] Render or Railway account (free)
- [ ] Your Supabase project (already set up)
- [ ] Paystack test API keys (already have)

---

## 🎬 Part 1: Deploy Frontend App

### Option A: Deploy to Vercel (Recommended)

#### 1. Push Code to GitHub

```powershell
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for production deployment"

# Create GitHub repo and push
# (Create repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/excel-meet.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to https://vercel.com/
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### 3. Add Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```env
VITE_SUPABASE_URL=https://izxjmcfbhktnmtqbdjkm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eGptY2ZiaGt0bm10cWJkamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzQ2MTAsImV4cCI6MjA2NzcxMDYxMH0.tUKY6vWWnlN_Iy5fiu6AZ6byVAhu5ClI8ijRnFQA4Qo
VITE_PAYSTACK_PUBLIC_KEY=pk_test_3cd655e2ecedc880a2b5d8e0bea632454ac3f637
```

> **Note:** We're using TEST keys for Paystack - safe for production testing!

#### 4. Deploy

Click **"Deploy"** and wait for build to complete.

Your app will be live at: `https://your-app-name.vercel.app`

---

### Option B: Deploy to Netlify

#### 1. Push to GitHub (same as above)

#### 2. Deploy to Netlify

1. Go to https://netlify.com/
2. Click **"Add new site" → "Import an existing project"**
3. Connect to GitHub and select your repo
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

#### 3. Add Environment Variables

In Netlify dashboard, go to **Site settings → Environment variables** and add the same variables as Vercel.

#### 4. Deploy

Click **"Deploy site"** and wait for build to complete.

Your app will be live at: `https://your-app-name.netlify.app`

---

## 🎬 Part 2: Deploy Webhook Server

### Option A: Deploy to Render (Recommended)

#### 1. Prepare Webhook Server

First, let's create a production-ready webhook server configuration:

```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet\server
```

Create a `render.yaml` file:

```yaml
services:
  - type: web
    name: excel-meet-webhooks
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: VITE_SUPABASE_URL
        value: https://izxjmcfbhktnmtqbdjkm.supabase.co
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: VITE_PAYSTACK_SECRET_KEY
        sync: false
      - key: WEBHOOK_PORT
        value: 3001
```

#### 2. Deploy to Render

1. Go to https://render.com/
2. Click **"New +" → "Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** excel-meet-webhooks
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `server`

#### 3. Add Environment Variables

In Render dashboard, add:

```env
VITE_SUPABASE_URL=https://izxjmcfbhktnmtqbdjkm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eGptY2ZiaGt0bm10cWJkamttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzNDYxMCwiZXhwIjoyMDY3NzEwNjEwfQ.NHldCgZQQlx8N43jzmUbGH9UH1_tUL3IGRishGRHX2M
VITE_PAYSTACK_SECRET_KEY=sk_test_ba2e9c1a6af491e903f48c5aad4ae08e3313ebf9
WEBHOOK_PORT=3001
```

#### 4. Deploy

Click **"Create Web Service"** and wait for deployment.

Your webhook server will be live at: `https://excel-meet-webhooks.onrender.com`

---

### Option B: Deploy to Railway

#### 1. Deploy to Railway

1. Go to https://railway.app/
2. Click **"New Project" → "Deploy from GitHub repo"**
3. Select your repository
4. Configure:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`

#### 2. Add Environment Variables

Add the same environment variables as Render.

#### 3. Deploy

Railway will automatically deploy.

Your webhook server will be live at: `https://your-app.railway.app`

---

## 🎬 Part 3: Configure Paystack Webhook

Now that you have a stable webhook URL, configure Paystack:

### 1. Get Your Webhook URL

Your webhook URL will be:
```
https://your-webhook-server.onrender.com/api/webhooks/paystack
```

Or if using Railway:
```
https://your-app.railway.app/api/webhooks/paystack
```

### 2. Configure in Paystack

1. Go to https://dashboard.paystack.com/settings/developer
2. Scroll to **"Webhook URL"** section
3. Paste your webhook URL
4. Click **"Save"**
5. Select these events:
   - ✅ `charge.success`
   - ✅ `subscription.create`
   - ✅ `subscription.disable`
   - ✅ `subscription.not_renew`
   - ✅ `invoice.create`
   - ✅ `invoice.update`
   - ✅ `invoice.payment_failed`
6. Click **"Save"** again

### 3. Test Webhook

1. Click **"Test Webhook"** button in Paystack
2. Check your webhook server logs in Render/Railway dashboard
3. You should see: `Received Paystack webhook: ...`

✅ **Success!** Your webhook is now working in production!

---

## 🎬 Part 4: Update Frontend with Webhook URL (Optional)

If your frontend needs to know the webhook URL, update your environment variables:

In Vercel/Netlify, add:
```env
VITE_WEBHOOK_URL=https://your-webhook-server.onrender.com
```

---

## 🧪 Testing Your Production Deployment

### 1. Test Frontend

1. Visit your Vercel/Netlify URL
2. Sign up / Log in
3. Navigate through the app
4. Check that everything loads correctly

### 2. Test Payment Flow (Test Mode)

1. Go to your profile/subscription page
2. Click **"Upgrade to Basic"** (or any plan)
3. Use Paystack test card:
   - **Card:** `4084084084084081`
   - **Expiry:** `12/25`
   - **CVV:** `123`
   - **PIN:** `1234`
4. Complete payment
5. Check webhook server logs - should see payment event
6. Check database - subscription should be updated
7. Refresh page - should see new subscription tier

✅ **If all steps work, you're fully deployed!**

---

## 📊 Monitoring Your Production App

### Frontend Monitoring (Vercel/Netlify)

- **Vercel:** Dashboard → Analytics
- **Netlify:** Dashboard → Analytics

Monitor:
- Page views
- Load times
- Error rates
- Build status

### Webhook Server Monitoring (Render/Railway)

- **Render:** Dashboard → Logs
- **Railway:** Dashboard → Deployments → Logs

Monitor:
- Webhook events received
- Database updates
- Error logs
- Response times

### Database Monitoring (Supabase)

- Go to Supabase Dashboard
- Check **Table Editor** for data
- Check **Logs** for queries
- Monitor **Database** usage

---

## 🔧 Troubleshooting

### Frontend Issues

**Issue: Build fails**
```
Solution:
1. Check build logs in Vercel/Netlify
2. Verify all environment variables are set
3. Test build locally: npm run build
```

**Issue: App loads but features don't work**
```
Solution:
1. Check browser console for errors
2. Verify environment variables are correct
3. Check Supabase connection
```

### Webhook Server Issues

**Issue: Webhook server not responding**
```
Solution:
1. Check server logs in Render/Railway
2. Verify environment variables are set
3. Check health endpoint: https://your-server.com/health
```

**Issue: Webhooks not received**
```
Solution:
1. Verify webhook URL in Paystack is correct
2. Check webhook server logs
3. Test webhook in Paystack dashboard
4. Verify events are selected in Paystack
```

**Issue: Database not updating**
```
Solution:
1. Check SUPABASE_SERVICE_ROLE_KEY is correct
2. Verify Supabase URL is correct
3. Check server logs for database errors
4. Test database connection manually
```

---

## 🔄 Updating Your Production App

### Update Frontend

**Automatic (Recommended):**
```powershell
# Just push to GitHub
git add .
git commit -m "Update feature"
git push

# Vercel/Netlify will auto-deploy
```

**Manual:**
```
1. Go to Vercel/Netlify dashboard
2. Click "Redeploy"
```

### Update Webhook Server

**Automatic:**
```powershell
# Push to GitHub
git add .
git commit -m "Update webhook server"
git push

# Render/Railway will auto-deploy
```

---

## 💰 Cost Breakdown (All Free!)

| Service | Plan | Cost | What You Get |
|---------|------|------|--------------|
| **Vercel** | Hobby | Free | Unlimited deployments, 100GB bandwidth |
| **Netlify** | Starter | Free | 100GB bandwidth, 300 build minutes |
| **Render** | Free | Free | 750 hours/month, auto-sleep after 15min |
| **Railway** | Free | Free | $5 credit/month, ~500 hours |
| **Supabase** | Free | Free | 500MB database, 1GB file storage |
| **Paystack** | Test Mode | Free | Unlimited test transactions |

**Total: $0/month** 🎉

---

## 🚀 Going Live with Real Payments (Future)

When you're ready to accept real payments:

### 1. Switch Paystack to Live Mode

1. Go to Paystack Dashboard
2. Switch to **Live Mode** (toggle in top right)
3. Get your **Live API Keys**
4. Create **Live Subscription Plans**

### 2. Update Environment Variables

In Vercel/Netlify:
```env
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
```

In Render/Railway:
```env
VITE_PAYSTACK_SECRET_KEY=sk_live_your_live_key
```

### 3. Update Webhook URL

1. In Paystack **Live Mode**, go to Settings → Developer
2. Update webhook URL to your production server
3. Select the same events
4. Test with a small real transaction

### 4. Test Thoroughly

- Make a small real payment (₦100)
- Verify webhook is received
- Check database updates
- Verify subscription activates
- Test cancellation flow

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database migrations run
- [ ] Test payments working locally

### Frontend Deployment
- [ ] Vercel/Netlify account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] App accessible via URL
- [ ] All pages load correctly
- [ ] Authentication works

### Webhook Server Deployment
- [ ] Render/Railway account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Server deployed successfully
- [ ] Health endpoint responds
- [ ] Logs show server running

### Paystack Configuration
- [ ] Webhook URL updated in Paystack
- [ ] Events selected
- [ ] Test webhook successful
- [ ] Webhook logs show 200 OK

### Testing
- [ ] Frontend loads correctly
- [ ] User can sign up/login
- [ ] Payment flow works
- [ ] Webhook receives events
- [ ] Database updates correctly
- [ ] Subscription activates
- [ ] UI shows updated subscription

### Monitoring
- [ ] Frontend analytics set up
- [ ] Webhook server logs accessible
- [ ] Database monitoring enabled
- [ ] Error tracking configured

---

## 🎉 Success!

Your app is now fully deployed to production with:

✅ **Stable URLs** - No more ngrok restarts  
✅ **24/7 Uptime** - Always accessible  
✅ **Real Webhooks** - Reliable payment processing  
✅ **Test Mode** - Safe testing environment  
✅ **Free Hosting** - $0/month cost  
✅ **Auto-Deploy** - Push to deploy  

---

## 📚 Next Steps

1. **Test thoroughly** - Make test payments and verify everything works
2. **Monitor logs** - Watch for any errors or issues
3. **Optimize performance** - Check load times and optimize as needed
4. **Add monitoring** - Set up error tracking (Sentry, etc.)
5. **Plan for scale** - When ready, upgrade to paid tiers for more resources

---

## 🆘 Need Help?

### Resources
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com/
- **Render Docs:** https://render.com/docs
- **Railway Docs:** https://docs.railway.app/
- **Paystack Docs:** https://paystack.com/docs

### Common Issues
- Check deployment logs first
- Verify environment variables
- Test locally before deploying
- Check webhook server health endpoint
- Review Paystack webhook logs

---

**Ready to deploy? Let's go! 🚀**