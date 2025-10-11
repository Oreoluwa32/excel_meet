# Paystack Webhook Setup Guide for Localhost

This guide will help you set up Paystack webhooks to work with your localhost development environment.

## 🎯 What Are Webhooks?

Webhooks allow Paystack to automatically notify your application when events occur (like successful payments, subscription renewals, failed payments, etc.). This enables automatic subscription management without manual intervention.

## 📋 Prerequisites

- Node.js installed (you already have this)
- Paystack account with test API keys
- Internet connection for ngrok tunnel

## 🚀 Quick Start (3 Steps)

### Step 1: Install Webhook Server Dependencies

```powershell
cd server
npm install
```

### Step 2: Add Service Role Key to .env

Open your `.env` file and add your Supabase service role key:

```env
# Add this line (get the key from Supabase Dashboard > Settings > API)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Add ngrok auth token for better stability
NGROK_AUTH_TOKEN=your_ngrok_token_here

# Optional: Custom webhook port (default is 3001)
WEBHOOK_PORT=3001
```

**Where to find your Supabase Service Role Key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **service_role** key (⚠️ Keep this secret!)

### Step 3: Start the Webhook Server

**Option A: Automated (Recommended)**
```powershell
cd server
.\start-webhook-server.ps1
```

**Option B: Manual**
```powershell
# Terminal 1: Start webhook server
cd server
npm start

# Terminal 2: Start ngrok tunnel
cd server
node ngrok-setup.js
```

## 🔧 Detailed Setup

### 1. Understanding the Architecture

```
Paystack → Internet → ngrok tunnel → localhost:3001 → Your Webhook Server → Supabase
```

- **Webhook Server**: Receives events from Paystack
- **ngrok**: Creates a public URL that forwards to your localhost
- **Supabase**: Database where subscriptions are updated

### 2. Get ngrok Auth Token (Optional but Recommended)

Free ngrok accounts have limitations, but getting an auth token gives you:
- Longer tunnel sessions
- Custom subdomains (paid plans)
- Better stability

**To get your token:**
1. Sign up at https://ngrok.com/
2. Go to https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your auth token
4. Add to `.env`: `NGROK_AUTH_TOKEN=your_token_here`

### 3. Configure Paystack Webhook

After starting the webhook server and ngrok, you'll see a public URL like:
```
https://abc123.ngrok.io/api/webhooks/paystack
```

**Configure in Paystack:**
1. Go to https://dashboard.paystack.com/settings/developer
2. Scroll to **Webhook URL** section
3. Paste your ngrok URL
4. Click **Save**
5. Select these events to receive:
   - ✅ `charge.success`
   - ✅ `subscription.create`
   - ✅ `subscription.disable`
   - ✅ `subscription.not_renew`
   - ✅ `invoice.create`
   - ✅ `invoice.update`
   - ✅ `invoice.payment_failed`

### 4. Test the Webhook

**Test with Paystack Dashboard:**
1. Go to https://dashboard.paystack.com/settings/developer
2. Scroll to **Webhook URL** section
3. Click **Test Webhook**
4. Check your webhook server terminal for the test event

**Test with Real Payment:**
1. Start your main app: `npm run dev` (in project root)
2. Go to profile page
3. Click "Upgrade to Basic"
4. Use test card: `4084084084084081`
5. Complete payment
6. Watch the webhook server terminal for events
7. Check your database to see subscription updated automatically!

## 📊 Webhook Events Handled

| Event | Description | Action Taken |
|-------|-------------|--------------|
| `charge.success` | Payment completed | Records payment in `payment_history` |
| `subscription.create` | New subscription | Updates user subscription tier and status |
| `subscription.disable` | Subscription cancelled | Downgrades user to free tier |
| `subscription.not_renew` | Won't auto-renew | Sets status to 'expiring' |
| `invoice.create` | New invoice generated | Logs event (can add email notification) |
| `invoice.update` | Invoice paid | Extends subscription by 30 days |
| `invoice.payment_failed` | Payment failed | Sets status to 'payment_failed' |

## 🔒 Security Features

The webhook server includes:

1. **Signature Verification**: Validates that requests actually come from Paystack
2. **CORS Protection**: Only accepts requests from allowed origins
3. **Service Role Access**: Uses Supabase service role to bypass RLS policies
4. **Error Handling**: Gracefully handles and logs errors
5. **Request Logging**: Logs all webhook events for debugging

## 🐛 Troubleshooting

### Webhook Server Won't Start

**Error: Port already in use**
```powershell
# Find and kill process on port 3001
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

**Error: Cannot find module**
```powershell
cd server
npm install
```

### ngrok Tunnel Issues

**Error: authtoken required**
- Get a free auth token from https://ngrok.com/
- Add to `.env`: `NGROK_AUTH_TOKEN=your_token`

**Tunnel keeps disconnecting**
- Free ngrok tunnels timeout after 2 hours
- Get an auth token for longer sessions
- Or restart the tunnel when needed

### Webhook Not Receiving Events

**Check 1: Is the server running?**
```powershell
# Test health endpoint
curl http://localhost:3001/health
```

**Check 2: Is ngrok tunnel active?**
- Look for the ngrok terminal window
- Check if the URL is still active

**Check 3: Is Paystack configured correctly?**
- Verify webhook URL in Paystack dashboard
- Make sure it's the ngrok URL, not localhost
- Check that events are selected

**Check 4: Test the webhook**
- Use Paystack's "Test Webhook" button
- Check webhook server logs for errors

### Subscription Not Updating

**Check 1: Service Role Key**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is in `.env`
- Make sure it's the service_role key, not anon key

**Check 2: Database Permissions**
- Ensure RLS policies allow service role access
- Check Supabase logs for permission errors

**Check 3: Webhook Signature**
- Verify `VITE_PAYSTACK_SECRET_KEY` is correct in `.env`
- Check webhook server logs for signature errors

## 📝 Development Workflow

### Daily Development

1. **Start webhook server** (keep running in background)
   ```powershell
   cd server
   npm start
   ```

2. **Start ngrok tunnel** (keep running in background)
   ```powershell
   cd server
   node ngrok-setup.js
   ```

3. **Update Paystack webhook URL** (if ngrok URL changed)
   - Copy new ngrok URL from terminal
   - Update in Paystack dashboard

4. **Start your main app**
   ```powershell
   npm run dev
   ```

### When ngrok URL Changes

Every time you restart ngrok, you get a new URL. You need to:
1. Copy the new URL from the ngrok terminal
2. Update it in Paystack dashboard
3. Save changes

**💡 TIP**: Paid ngrok plans offer custom subdomains that don't change!

## 🚀 Going to Production

When deploying to production, you won't need ngrok:

1. **Deploy webhook server** to a hosting service:
   - Heroku
   - Railway
   - Render
   - DigitalOcean
   - AWS/Azure/GCP

2. **Update Paystack webhook URL** to your production URL:
   ```
   https://your-domain.com/api/webhooks/paystack
   ```

3. **Switch to live API keys** in production `.env`

4. **Enable webhook events** in Paystack live mode

## 📚 Additional Resources

- **Paystack Webhooks Docs**: https://paystack.com/docs/payments/webhooks
- **ngrok Documentation**: https://ngrok.com/docs
- **Express.js Guide**: https://expressjs.com/

## 🎉 Success Checklist

- [ ] Webhook server installed and running
- [ ] ngrok tunnel active with public URL
- [ ] Paystack webhook URL configured
- [ ] Webhook events selected in Paystack
- [ ] Service role key added to `.env`
- [ ] Test webhook successful
- [ ] Test payment triggers webhook
- [ ] Subscription updates automatically in database
- [ ] Webhook server logs show events

## 💡 Pro Tips

1. **Keep terminals organized**: Use separate terminal windows for:
   - Main app (`npm run dev`)
   - Webhook server (`npm start`)
   - ngrok tunnel (`node ngrok-setup.js`)

2. **Monitor logs**: Watch the webhook server terminal to see events in real-time

3. **Test thoroughly**: Use Paystack test cards to simulate different scenarios

4. **Check database**: After each test, verify the database was updated correctly

5. **Use Paystack dashboard**: Monitor all transactions and webhook deliveries

## ❓ Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review webhook server logs for errors
3. Check Paystack dashboard webhook logs
4. Verify all environment variables are set correctly
5. Test each component individually (server, tunnel, Paystack)

---

**Ready to test?** Start the webhook server and make a test payment! 🎉