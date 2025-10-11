# 🚀 Webhook Quick Start (5 Minutes)

Get Paystack webhooks working with your localhost in 5 minutes!

## ⚡ Super Quick Setup

### 1️⃣ Get Your Supabase Service Role Key (1 minute)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **API**
4. Copy the **service_role** key (the long one at the bottom)
5. Open `.env` file and paste it:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2️⃣ Install & Start Webhook Server (2 minutes)

```powershell
# Install dependencies
cd server
npm install

# Start the webhook server (keep this running)
npm start
```

You should see:
```
🚀 Webhook server running on http://localhost:3001
📡 Webhook endpoint: http://localhost:3001/api/webhooks/paystack
💚 Health check: http://localhost:3001/health
```

### 3️⃣ Create Public Tunnel with ngrok (2 minutes)

**Open a NEW terminal window:**

```powershell
cd server
node ngrok-setup.js
```

You'll see something like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 PUBLIC WEBHOOK URL:
   https://abc123.ngrok.io/api/webhooks/paystack
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy that URL!** ☝️

### 4️⃣ Configure Paystack (1 minute)

1. Go to https://dashboard.paystack.com/settings/developer
2. Scroll to **Webhook URL**
3. Paste your ngrok URL
4. Click **Save**
5. Select these events:
   - ✅ charge.success
   - ✅ subscription.create
   - ✅ subscription.disable
   - ✅ invoice.update
   - ✅ invoice.payment_failed

### 5️⃣ Test It! (30 seconds)

1. Click **Test Webhook** button in Paystack dashboard
2. Check your webhook server terminal - you should see the test event!

## ✅ You're Done!

Now when users make payments:
1. Payment completes on Paystack ✅
2. Paystack sends webhook to your server ✅
3. Server updates subscription in database ✅
4. User sees updated subscription instantly ✅

## 🎯 What Happens Automatically Now?

| Event | What Happens |
|-------|--------------|
| User pays for subscription | ✅ Payment recorded in database |
| Subscription created | ✅ User upgraded to paid tier |
| Subscription renewed | ✅ Subscription extended 30 days |
| Payment fails | ✅ User notified, status updated |
| User cancels | ✅ Downgraded to free tier |

## 🐛 Quick Troubleshooting

**Webhook server won't start?**
```powershell
# Make sure you're in the server directory
cd server
npm install
```

**ngrok error?**
- Sign up at https://ngrok.com/ (free)
- Get auth token from https://dashboard.ngrok.com/get-started/your-authtoken
- Add to `.env`: `NGROK_AUTH_TOKEN=your_token`

**Webhook not receiving events?**
- Make sure both terminals are still running (webhook server + ngrok)
- Check that you pasted the ngrok URL (not localhost) in Paystack
- Verify the URL ends with `/api/webhooks/paystack`

## 📝 Daily Workflow

Every time you develop:

1. **Terminal 1**: Start webhook server
   ```powershell
   cd server
   npm start
   ```

2. **Terminal 2**: Start ngrok tunnel
   ```powershell
   cd server
   node ngrok-setup.js
   ```

3. **Terminal 3**: Start your main app
   ```powershell
   npm run dev
   ```

4. **If ngrok URL changed**: Update it in Paystack dashboard

## 💡 Pro Tip

Use the automated script to start everything:
```powershell
cd server
.\start-webhook-server.ps1
```

This opens both webhook server and ngrok in separate windows!

## 📚 Need More Details?

Check out `WEBHOOK_SETUP_GUIDE.md` for:
- Detailed explanations
- Advanced configuration
- Production deployment
- Complete troubleshooting guide

---

**Questions?** Everything is working if:
- ✅ Webhook server shows "running on http://localhost:3001"
- ✅ ngrok shows a public URL
- ✅ Paystack webhook test succeeds
- ✅ Test payment updates database automatically

Happy coding! 🎉