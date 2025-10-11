# 🎉 START HERE: Webhook Setup

## 👋 Welcome!

You asked for webhook integration, and it's ready! This guide will get you started in **5 minutes**.

---

## 🎯 What You're Setting Up

**Automatic subscription management** - When users pay, everything updates automatically:
- ✅ Payment recorded
- ✅ Subscription upgraded
- ✅ Renewals handled
- ✅ Cancellations processed

**No manual work needed!**

---

## ⚡ 5-Minute Setup

### Step 1: Get Your Service Role Key (1 minute)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **API**
4. Scroll down and copy the **service_role** key (the long one)
5. Open your `.env` file
6. Add this line:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=paste_your_key_here
   ```
7. Save the file

### Step 2: Install Webhook Server (1 minute)

Open PowerShell and run:

```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet\server
npm install
```

Wait for installation to complete...

### Step 3: Start Webhook Server (30 seconds)

In the same terminal:

```powershell
npm start
```

You should see:
```
🚀 Webhook server running on http://localhost:3001
📡 Webhook endpoint: http://localhost:3001/api/webhooks/paystack
💚 Health check: http://localhost:3001/health
```

✅ **Keep this terminal open!**

### Step 4: Start ngrok Tunnel (1 minute)

**Open a NEW PowerShell window** and run:

```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet\server
node ngrok-setup.js
```

You'll see something like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 PUBLIC WEBHOOK URL:
   https://abc123.ngrok.io/api/webhooks/paystack
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**📋 Copy that URL!** (the one that starts with `https://`)

✅ **Keep this terminal open too!**

### Step 5: Configure Paystack (1 minute)

1. Go to https://dashboard.paystack.com/settings/developer
2. Scroll to **Webhook URL** section
3. Paste your ngrok URL (the one you copied)
4. Click **Save**
5. Select these events (check the boxes):
   - ✅ `charge.success`
   - ✅ `subscription.create`
   - ✅ `subscription.disable`
   - ✅ `subscription.not_renew`
   - ✅ `invoice.create`
   - ✅ `invoice.update`
   - ✅ `invoice.payment_failed`
6. Click **Save** again

### Step 6: Test It! (30 seconds)

Still on the Paystack page:

1. Click the **Test Webhook** button
2. Go back to your webhook server terminal (the first one)
3. You should see something like:
   ```
   [2025-01-29T...] POST /api/webhooks/paystack
   Received Paystack webhook: ...
   ```

✅ **If you see that, it's working!**

---

## 🎉 You're Done!

Your webhook system is now active! Here's what happens automatically:

| When This Happens | System Does This |
|-------------------|------------------|
| User pays for subscription | ✅ Records payment in database |
| Subscription created | ✅ Upgrades user to paid tier |
| Monthly renewal | ✅ Extends subscription 30 days |
| Payment fails | ✅ Updates status, notifies user |
| User cancels | ✅ Downgrades to free tier |

---

## 🎮 Daily Usage

Every time you develop, you need **3 terminal windows**:

### Terminal 1: Your Main App
```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet
npm run dev
```

### Terminal 2: Webhook Server
```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet\server
npm start
```

### Terminal 3: ngrok Tunnel
```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet\server
node ngrok-setup.js
```

### 💡 Easier Way: Use the Automated Script!

```powershell
cd c:\Users\oreol\Documents\Projects\excel_meet\server
.\start-webhook-server.ps1
```

This opens both webhook server and ngrok in separate windows automatically!

---

## 🧪 Test With Real Payment

1. Make sure all 3 terminals are running (app, webhook, ngrok)
2. Go to http://localhost:5173 (your app)
3. Log in and go to your profile
4. Click **"Upgrade to Basic"**
5. Use test card: `4084084084084081`
6. Expiry: `12/25`, CVV: `123`, PIN: `1234`
7. Complete the payment
8. Watch your webhook server terminal - you'll see events!
9. Check your database - subscription updated!
10. Refresh your profile - you're now on Basic plan! ✅

---

## ⚠️ Important Note About ngrok

Every time you restart ngrok, you get a **new URL**. When this happens:

1. Copy the new URL from the ngrok terminal
2. Go to Paystack Dashboard → Settings → Developer
3. Update the Webhook URL
4. Save

**💡 TIP:** Get a free ngrok account at https://ngrok.com/ for longer sessions!

---

## 🐛 Something Not Working?

### Webhook server won't start?
```powershell
cd server
npm install
npm start
```

### ngrok error?
```
Sign up at https://ngrok.com/ (free)
Get auth token from dashboard
Add to .env: NGROK_AUTH_TOKEN=your_token
```

### Webhook not receiving events?
- Make sure both terminals are running (webhook + ngrok)
- Check you pasted the ngrok URL (not localhost) in Paystack
- Verify events are selected in Paystack

### Database not updating?
- Check SUPABASE_SERVICE_ROLE_KEY is in .env
- Make sure it's the service_role key, not anon key

---

## 📚 Want More Details?

I've created comprehensive documentation:

| Document | What It's For |
|----------|---------------|
| **WEBHOOK_README.md** | Overview and quick reference |
| **WEBHOOK_QUICK_START.md** | Detailed 5-minute guide |
| **WEBHOOK_SETUP_GUIDE.md** | Complete documentation |
| **WEBHOOK_VISUAL_GUIDE.md** | Diagrams and flowcharts |
| **server/README.md** | Server-specific info |

---

## ✅ Quick Checklist

Before testing payments:

- [ ] Service role key added to `.env`
- [ ] Webhook server installed (`npm install`)
- [ ] Webhook server running (Terminal 1)
- [ ] ngrok tunnel running (Terminal 2)
- [ ] ngrok URL copied
- [ ] Paystack webhook URL configured
- [ ] Webhook events selected
- [ ] Test webhook successful
- [ ] Main app running (Terminal 3)

---

## 🎯 What's Next?

1. **If you haven't run the database setup yet:**
   - Open `setup_paystack_subscription.sql`
   - Go to Supabase SQL Editor
   - Paste and run the script

2. **Test the complete flow:**
   - Make a test payment
   - Watch webhook server logs
   - Check database updates
   - Verify UI updates

3. **Start building:**
   - Everything is automated now!
   - Focus on your features
   - Subscriptions handle themselves

---

## 🎉 Congratulations!

You now have a **production-ready webhook system** that automatically manages subscriptions!

**No manual work needed** - everything happens automatically when users pay! 🚀

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review `WEBHOOK_SETUP_GUIDE.md` for detailed help
3. Check webhook server logs for errors
4. Verify Paystack webhook logs in dashboard

---

**Ready to test?** Start all three terminals and make a test payment! 🎊