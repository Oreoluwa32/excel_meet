# 🚀 Production Deployment Checklist

Use this checklist to deploy your app to production with test mode payments.

---

## ✅ Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] Test payments working locally
- [ ] Database schema up to date
- [ ] `.gitignore` includes `.env` files
- [ ] No sensitive data in code

### Environment Variables Ready
- [ ] `VITE_SUPABASE_URL` - Your Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` - Test public key (pk_test_...)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- [ ] `VITE_PAYSTACK_SECRET_KEY` - Test secret key (sk_test_...)

### Accounts Created
- [ ] GitHub account
- [ ] Vercel or Netlify account
- [ ] Render or Railway account
- [ ] Paystack account (test mode)

---

## 📦 Part 1: Deploy Frontend

### Push to GitHub
```powershell
# Initialize git (if not done)
git init
git add .
git commit -m "Initial production deployment"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/excel-meet.git
git branch -M main
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] Repository is public or connected to hosting

### Deploy to Vercel/Netlify

**Vercel:**
- [ ] Go to https://vercel.com/
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Add environment variables (see below)
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Test URL: `https://your-app.vercel.app`

**Netlify:**
- [ ] Go to https://netlify.com/
- [ ] Click "Add new site"
- [ ] Import GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variables (see below)
- [ ] Click "Deploy site"
- [ ] Wait for deployment to complete
- [ ] Test URL: `https://your-app.netlify.app`

### Frontend Environment Variables

Add these in Vercel/Netlify dashboard:

```env
VITE_SUPABASE_URL=https://izxjmcfbhktnmtqbdjkm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eGptY2ZiaGt0bm10cWJkamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMzQ2MTAsImV4cCI6MjA2NzcxMDYxMH0.tUKY6vWWnlN_Iy5fiu6AZ6byVAhu5ClI8ijRnFQA4Qo
VITE_PAYSTACK_PUBLIC_KEY=pk_test_3cd655e2ecedc880a2b5d8e0bea632454ac3f637
```

- [ ] All environment variables added
- [ ] Variables saved
- [ ] Site redeployed if needed

### Test Frontend
- [ ] Visit your production URL
- [ ] Homepage loads correctly
- [ ] Can navigate to all pages
- [ ] Can sign up / log in
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔧 Part 2: Deploy Webhook Server

### Deploy to Render/Railway

**Render:**
- [ ] Go to https://render.com/
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Set name: `excel-meet-webhooks`
- [ ] Set root directory: `server`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add environment variables (see below)
- [ ] Click "Create Web Service"
- [ ] Wait for deployment
- [ ] Note your URL: `https://excel-meet-webhooks.onrender.com`

**Railway:**
- [ ] Go to https://railway.app/
- [ ] Click "New Project" → "Deploy from GitHub"
- [ ] Select your repository
- [ ] Set root directory: `server`
- [ ] Set start command: `npm start`
- [ ] Add environment variables (see below)
- [ ] Deploy
- [ ] Note your URL: `https://your-app.railway.app`

### Webhook Server Environment Variables

Add these in Render/Railway dashboard:

```env
VITE_SUPABASE_URL=https://izxjmcfbhktnmtqbdjkm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6eGptY2ZiaGt0bm10cWJkamttIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEzNDYxMCwiZXhwIjoyMDY3NzEwNjEwfQ.NHldCgZQQlx8N43jzmUbGH9UH1_tUL3IGRishGRHX2M
VITE_PAYSTACK_SECRET_KEY=sk_test_ba2e9c1a6af491e903f48c5aad4ae08e3313ebf9
WEBHOOK_PORT=3001
```

- [ ] All environment variables added
- [ ] Variables saved
- [ ] Service deployed successfully

### Test Webhook Server
- [ ] Visit health endpoint: `https://your-server.com/health`
- [ ] Should return: `{"status":"ok",...}`
- [ ] Check logs for any errors
- [ ] Server is running

---

## 🔗 Part 3: Configure Paystack

### Update Webhook URL

Your webhook URL format:
```
https://your-webhook-server.onrender.com/api/webhooks/paystack
```

Or if using Railway:
```
https://your-app.railway.app/api/webhooks/paystack
```

- [ ] Copy your webhook server URL
- [ ] Add `/api/webhooks/paystack` to the end
- [ ] Go to https://dashboard.paystack.com/settings/developer
- [ ] Scroll to "Webhook URL" section
- [ ] Paste your webhook URL
- [ ] Click "Save"

### Select Webhook Events

In Paystack dashboard, select these events:
- [ ] `charge.success`
- [ ] `subscription.create`
- [ ] `subscription.disable`
- [ ] `subscription.not_renew`
- [ ] `invoice.create`
- [ ] `invoice.update`
- [ ] `invoice.payment_failed`

- [ ] All events selected
- [ ] Click "Save" again

### Test Webhook

- [ ] Click "Test Webhook" button in Paystack
- [ ] Check webhook server logs in Render/Railway
- [ ] Should see: `Received Paystack webhook: ...`
- [ ] Paystack shows 200 OK response

---

## 🧪 Part 4: End-to-End Testing

### Test Complete Payment Flow

1. **Visit Your Production App**
   - [ ] Go to your Vercel/Netlify URL
   - [ ] Sign up or log in

2. **Initiate Payment**
   - [ ] Go to profile/subscription page
   - [ ] Click "Upgrade to Basic" (or any plan)
   - [ ] Payment modal opens

3. **Complete Test Payment**
   - [ ] Use test card: `4084084084084081`
   - [ ] Expiry: `12/25`
   - [ ] CVV: `123`
   - [ ] PIN: `1234`
   - [ ] Complete payment

4. **Verify Webhook**
   - [ ] Check webhook server logs
   - [ ] Should see `charge.success` event
   - [ ] Should see `subscription.create` event
   - [ ] No errors in logs

5. **Verify Database**
   - [ ] Go to Supabase dashboard
   - [ ] Check `payment_history` table
   - [ ] New payment record exists
   - [ ] Check `user_profiles` table
   - [ ] Subscription tier updated
   - [ ] Subscription status is "active"

6. **Verify UI**
   - [ ] Refresh your profile page
   - [ ] Subscription tier shows correctly
   - [ ] Subscription status shows "Active"
   - [ ] Features unlocked

---

## 📊 Part 5: Monitoring Setup

### Frontend Monitoring
- [ ] Check Vercel/Netlify analytics
- [ ] Set up error tracking (optional)
- [ ] Monitor build status

### Webhook Server Monitoring
- [ ] Check Render/Railway logs
- [ ] Monitor webhook events
- [ ] Watch for errors
- [ ] Check response times

### Database Monitoring
- [ ] Check Supabase dashboard
- [ ] Monitor table sizes
- [ ] Check query performance
- [ ] Review logs

---

## 🎉 Deployment Complete!

### Your Production URLs

**Frontend:**
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`

**Webhook Server:**
- Render: `https://excel-meet-webhooks.onrender.com`
- Railway: `https://your-app.railway.app`

**Webhook Endpoint:**
```
https://your-webhook-server.com/api/webhooks/paystack
```

### What's Working

✅ Frontend deployed and accessible  
✅ Webhook server running 24/7  
✅ Paystack webhooks configured  
✅ Test payments working  
✅ Database updating automatically  
✅ No more ngrok needed!  

---

## 🔄 Making Updates

### Update Frontend
```powershell
# Make changes, then:
git add .
git commit -m "Update feature"
git push

# Vercel/Netlify auto-deploys
```

### Update Webhook Server
```powershell
# Make changes, then:
git add .
git commit -m "Update webhook server"
git push

# Render/Railway auto-deploys
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Build fails:**
- [ ] Check build logs in Vercel/Netlify
- [ ] Verify environment variables
- [ ] Test build locally: `npm run build`

**App loads but broken:**
- [ ] Check browser console
- [ ] Verify environment variables
- [ ] Check Supabase connection

### Webhook Issues

**Server not responding:**
- [ ] Check server logs
- [ ] Verify environment variables
- [ ] Test health endpoint

**Webhooks not received:**
- [ ] Verify webhook URL in Paystack
- [ ] Check server logs
- [ ] Test webhook in Paystack dashboard
- [ ] Verify events selected

**Database not updating:**
- [ ] Check service role key
- [ ] Verify Supabase URL
- [ ] Check server logs for errors

---

## 📚 Next Steps

- [ ] Monitor logs for first few days
- [ ] Test all features thoroughly
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add custom domain (optional)
- [ ] Plan for scaling
- [ ] Document any issues

---

## 🚀 Going Live (Future)

When ready for real payments:

- [ ] Switch Paystack to Live mode
- [ ] Get Live API keys
- [ ] Update environment variables
- [ ] Create Live subscription plans
- [ ] Update webhook URL in Live mode
- [ ] Test with small real payment
- [ ] Monitor closely

---

**Congratulations! Your app is now in production! 🎊**

**Test Mode Active:** You can safely test payments without real money.

**Need Help?** Check `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed instructions.