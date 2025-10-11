# 🎉 Paystack Webhook System - Complete Setup

## 🎯 What This Is

A complete webhook server that enables **automatic subscription management** for your Excel Meet application. When users make payments through Paystack, this system automatically:

- ✅ Records payments in your database
- ✅ Upgrades user subscriptions
- ✅ Handles renewals
- ✅ Manages cancellations
- ✅ Tracks payment failures

**No manual intervention needed!**

---

## 🚀 Quick Start (Choose Your Path)

### 🏃 Path 1: Super Quick (5 Minutes)

**Perfect for:** Getting started immediately

👉 **Open `WEBHOOK_QUICK_START.md`** and follow the 5-minute guide!

### 📚 Path 2: Detailed Setup

**Perfect for:** Understanding how everything works

👉 **Open `WEBHOOK_SETUP_GUIDE.md`** for complete documentation

### 🎨 Path 3: Visual Learner

**Perfect for:** Understanding through diagrams

👉 **Open `WEBHOOK_VISUAL_GUIDE.md`** for flowcharts and visuals

---

## 📁 What Was Created

### New Files

```
server/
├── index.js                      ← Webhook server (Express)
├── package.json                  ← Dependencies
├── ngrok-setup.js                ← Tunnel setup
├── start-webhook-server.ps1     ← Automated start
└── README.md                     ← Server docs

Documentation/
├── WEBHOOK_QUICK_START.md       ← 5-minute guide ⭐
├── WEBHOOK_SETUP_GUIDE.md       ← Complete docs
├── WEBHOOK_VISUAL_GUIDE.md      ← Diagrams
├── WEBHOOK_IMPLEMENTATION_SUMMARY.md  ← Overview
└── WEBHOOK_README.md            ← This file
```

### Updated Files

- `.env` - Added webhook configuration
- `PAYSTACK_SETUP_GUIDE.md` - Updated with webhook info

---

## ⚡ Super Quick Setup

If you just want to get it working NOW:

### 1. Get Service Role Key (1 min)
```
1. Go to https://supabase.com/dashboard
2. Settings → API
3. Copy service_role key
4. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 2. Install & Start (2 min)
```powershell
cd server
npm install
npm start
```

### 3. Create Tunnel (1 min)
```powershell
# New terminal
cd server
node ngrok-setup.js
# Copy the URL shown
```

### 4. Configure Paystack (1 min)
```
1. Go to https://dashboard.paystack.com/settings/developer
2. Paste ngrok URL in Webhook URL
3. Select events: charge.success, subscription.create, etc.
4. Save
```

### 5. Test (30 sec)
```
Click "Test Webhook" in Paystack
Check server logs ✅
```

**Done!** 🎉

---

## 🎓 How It Works

### Simple Explanation

```
User Pays → Paystack → Webhook → Your Server → Database → User Updated
```

1. User makes a payment on your website
2. Paystack processes it and sends a webhook
3. Your webhook server receives and verifies it
4. Database gets updated automatically
5. User sees their new subscription

### Technical Flow

```
┌─────────────┐
│   Paystack  │  Sends webhook event
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    ngrok    │  Public tunnel (localhost only)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Webhook   │  Verifies signature
│   Server    │  Processes event
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │  Updates database
└─────────────┘
```

---

## 🔧 Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# Supabase (you already have these)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Paystack (you already have these)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_PAYSTACK_SECRET_KEY=sk_test_...

# NEW: Webhook Configuration
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  ← Required!
NGROK_AUTH_TOKEN=your_ngrok_token                ← Optional
WEBHOOK_PORT=3001                                 ← Optional
```

### Where to Get Keys

**Supabase Service Role Key:**
```
Supabase Dashboard → Settings → API → service_role key
⚠️ Keep this secret! It bypasses Row Level Security
```

**ngrok Auth Token (Optional but Recommended):**
```
1. Sign up at https://ngrok.com/ (free)
2. Go to https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your token
```

---

## 🎮 Daily Usage

### Starting Everything

You need 3 terminal windows:

**Terminal 1: Main App**
```powershell
npm run dev
```

**Terminal 2: Webhook Server**
```powershell
cd server
npm start
```

**Terminal 3: ngrok Tunnel**
```powershell
cd server
node ngrok-setup.js
```

### Automated Start (Easier!)

```powershell
cd server
.\start-webhook-server.ps1
```

This opens webhook server and ngrok in separate windows automatically!

---

## 🧪 Testing

### Test 1: Webhook Delivery

```
1. Go to Paystack Dashboard → Settings → Developer
2. Click "Test Webhook"
3. Check webhook server logs
4. Should see: "Received Paystack webhook: ..."
```

### Test 2: Real Payment

```
1. Start all services (app, webhook, ngrok)
2. Go to profile page
3. Click "Upgrade to Basic"
4. Use test card: 4084084084084081
5. Complete payment
6. Watch webhook server logs
7. Check database for updates
8. Verify UI shows new subscription
```

---

## 📊 What Gets Automated

| Event | Automatic Action |
|-------|------------------|
| 💳 Payment Success | Records in `payment_history` |
| 🎫 Subscription Created | Upgrades user tier |
| 🔄 Monthly Renewal | Extends subscription 30 days |
| ❌ Payment Failed | Updates status to `payment_failed` |
| 🚫 User Cancels | Downgrades to free tier |
| ⚠️ Won't Renew | Sets status to `expiring` |

---

## 🐛 Common Issues

### Issue: Webhook server won't start

**Solution:**
```powershell
cd server
npm install
npm start
```

### Issue: Port already in use

**Solution:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

### Issue: ngrok error "authtoken required"

**Solution:**
```
1. Sign up at https://ngrok.com/
2. Get token from dashboard
3. Add to .env: NGROK_AUTH_TOKEN=your_token
```

### Issue: Webhook returns 400 error

**Solution:**
```
Check VITE_PAYSTACK_SECRET_KEY in .env
Must match your Paystack dashboard
```

### Issue: Database not updating

**Solution:**
```
1. Verify SUPABASE_SERVICE_ROLE_KEY in .env
2. Must be service_role key, not anon key
3. Check Supabase logs for errors
```

### Issue: Events not received

**Solution:**
```
1. Verify webhook URL in Paystack is ngrok URL (not localhost)
2. Check that webhook server is running
3. Check that ngrok tunnel is active
4. Verify events are selected in Paystack
```

---

## 🔒 Security

The webhook system includes:

✅ **Signature Verification** - Validates requests from Paystack  
✅ **Service Role Auth** - Secure database access  
✅ **CORS Protection** - Prevents unauthorized access  
✅ **Request Logging** - Audit trail of all events  
✅ **Error Handling** - Graceful failure management  

---

## 📚 Documentation Guide

| Document | Use Case |
|----------|----------|
| **WEBHOOK_README.md** (this) | Overview and quick reference |
| **WEBHOOK_QUICK_START.md** | First-time setup (5 min) |
| **WEBHOOK_SETUP_GUIDE.md** | Detailed documentation |
| **WEBHOOK_VISUAL_GUIDE.md** | Diagrams and flowcharts |
| **WEBHOOK_IMPLEMENTATION_SUMMARY.md** | What was built |
| **server/README.md** | Server-specific docs |

---

## 🚀 Production Deployment

When ready to go live:

### 1. Deploy Webhook Server

Deploy the `server/` folder to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS/Azure/GCP

### 2. Update Paystack

Change webhook URL from ngrok to production:
```
https://your-domain.com/api/webhooks/paystack
```

### 3. Switch to Live Mode

1. Complete Paystack verification
2. Create live subscription plans
3. Update plan codes in code
4. Switch to live API keys

---

## ✅ Success Checklist

Before testing payments:

- [ ] Database setup complete (ran SQL script)
- [ ] Service role key in `.env`
- [ ] Webhook server dependencies installed
- [ ] Webhook server running on port 3001
- [ ] ngrok tunnel active with public URL
- [ ] Paystack webhook URL configured
- [ ] Webhook events selected in Paystack
- [ ] Test webhook successful (200 OK)
- [ ] Main app running

---

## 🎯 Next Steps

### If You Haven't Set Up Database Yet:

1. Open `setup_paystack_subscription.sql`
2. Go to Supabase SQL Editor
3. Paste and run the script

### If Database Is Ready:

1. Follow the Quick Start above
2. Test webhook delivery
3. Make a test payment
4. Verify everything works

---

## 💡 Pro Tips

1. **Keep terminals organized** - Use 3 separate windows
2. **Monitor logs** - Watch webhook server for events
3. **Test thoroughly** - Use Paystack test cards
4. **Check database** - Verify updates after each test
5. **Use automation** - Run `start-webhook-server.ps1`

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review `WEBHOOK_SETUP_GUIDE.md` for details
3. Check webhook server logs for errors
4. Verify Paystack webhook logs in dashboard
5. Test each component individually

---

## 🎉 What You Get

With this webhook system, you now have:

✅ **Fully automated** subscription management  
✅ **Real-time** payment tracking  
✅ **Automatic** renewals and cancellations  
✅ **Complete** payment history  
✅ **Production-ready** webhook server  
✅ **Secure** signature verification  
✅ **Comprehensive** error handling  
✅ **Detailed** logging and monitoring  

**No manual work needed!** Everything happens automatically! 🎊

---

## 🚀 Ready to Start?

### For Quick Setup:
👉 Open `WEBHOOK_QUICK_START.md`

### For Detailed Guide:
👉 Open `WEBHOOK_SETUP_GUIDE.md`

### For Visual Learning:
👉 Open `WEBHOOK_VISUAL_GUIDE.md`

---

**Happy coding!** 🎉 Your webhook system is ready to handle automatic subscription management!