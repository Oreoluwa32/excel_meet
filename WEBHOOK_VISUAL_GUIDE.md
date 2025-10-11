# 🎯 Webhook System Visual Guide

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PAYSTACK WEBHOOK FLOW                        │
└─────────────────────────────────────────────────────────────────┘

    User Makes Payment
           │
           ▼
    ┌──────────────┐
    │   Paystack   │  Payment processed
    │   Dashboard  │  Subscription created
    └──────┬───────┘
           │
           │ Sends webhook event
           │
           ▼
    ┌──────────────┐
    │    ngrok     │  Public tunnel
    │  (Internet)  │  https://abc123.ngrok.io
    └──────┬───────┘
           │
           │ Forwards to localhost
           │
           ▼
    ┌──────────────┐
    │   Webhook    │  Express server
    │   Server     │  Port 3001
    │ (localhost)  │
    └──────┬───────┘
           │
           │ Verifies signature
           │ Processes event
           │
           ▼
    ┌──────────────┐
    │   Supabase   │  Updates database
    │   Database   │  - payment_history
    └──────────────┘  - user_profiles
           │
           │
           ▼
    User sees updated subscription! ✅
```

## 🔄 Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK EVENT TYPES                           │
└─────────────────────────────────────────────────────────────────┘

1. CHARGE SUCCESS
   ┌──────────────┐
   │ User Pays    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │ charge.success webhook           │
   │ ✅ Record in payment_history     │
   │ ✅ Amount, reference, status     │
   └──────────────────────────────────┘

2. SUBSCRIPTION CREATE
   ┌──────────────┐
   │ Subscription │
   │   Created    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │ subscription.create webhook      │
   │ ✅ Update user_profiles          │
   │ ✅ Set tier (basic/pro/elite)    │
   │ ✅ Set status to 'active'        │
   │ ✅ Set start/end dates           │
   └──────────────────────────────────┘

3. SUBSCRIPTION RENEWAL
   ┌──────────────┐
   │ Monthly      │
   │  Renewal     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │ invoice.update webhook           │
   │ ✅ Extend subscription 30 days   │
   │ ✅ Keep status 'active'          │
   └──────────────────────────────────┘

4. PAYMENT FAILED
   ┌──────────────┐
   │ Payment      │
   │  Declined    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │ invoice.payment_failed webhook   │
   │ ✅ Set status 'payment_failed'   │
   │ ✅ Notify user                   │
   └──────────────────────────────────┘

5. SUBSCRIPTION CANCELLED
   ┌──────────────┐
   │ User         │
   │  Cancels     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────────────────────────┐
   │ subscription.disable webhook     │
   │ ✅ Set tier to 'free'            │
   │ ✅ Set status 'cancelled'        │
   └──────────────────────────────────┘
```

## 🗂️ Database Updates

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE STRUCTURE                            │
└─────────────────────────────────────────────────────────────────┘

payment_history table:
┌────────────────────────────────────────────────────────────┐
│ id                  │ UUID (auto)                          │
│ user_id             │ UUID (from metadata)                 │
│ amount              │ Decimal (in Naira)                   │
│ currency            │ 'NGN'                                │
│ payment_method      │ 'paystack'                           │
│ payment_reference   │ Paystack reference                   │
│ payment_status      │ 'success'                            │
│ payment_data        │ JSONB (full webhook data)            │
│ created_at          │ Timestamp                            │
└────────────────────────────────────────────────────────────┘

user_profiles table (updated fields):
┌────────────────────────────────────────────────────────────┐
│ subscription_tier           │ 'basic'/'pro'/'elite'/'free'│
│ subscription_status         │ 'active'/'cancelled'/etc    │
│ subscription_start_date     │ Timestamp                   │
│ subscription_end_date       │ Timestamp (+30 days)        │
│ paystack_subscription_code  │ Paystack sub code           │
└────────────────────────────────────────────────────────────┘
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY VERIFICATION                         │
└─────────────────────────────────────────────────────────────────┘

Webhook Request Arrives
         │
         ▼
┌─────────────────────────┐
│ Extract signature from  │
│ x-paystack-signature    │
│ header                  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Compute HMAC SHA512     │
│ using secret key        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Compare signatures      │
└───────────┬─────────────┘
            │
            ├─── Match? ───┐
            │              │
            ▼              ▼
         ✅ YES         ❌ NO
            │              │
            ▼              ▼
    Process Event    Reject (400)
```

## 📁 File Structure

```
excel_meet/
│
├── server/                          ← NEW! Webhook server
│   ├── index.js                     ← Main webhook server
│   ├── package.json                 ← Server dependencies
│   ├── ngrok-setup.js               ← Tunnel setup script
│   ├── start-webhook-server.ps1    ← Automated start script
│   └── README.md                    ← Server documentation
│
├── .env                             ← Updated with webhook config
│   ├── SUPABASE_SERVICE_ROLE_KEY   ← NEW! Required
│   ├── NGROK_AUTH_TOKEN            ← Optional
│   └── WEBHOOK_PORT                ← Optional (default: 3001)
│
├── WEBHOOK_QUICK_START.md          ← 5-minute setup guide
├── WEBHOOK_SETUP_GUIDE.md          ← Complete documentation
├── WEBHOOK_VISUAL_GUIDE.md         ← This file!
└── PAYSTACK_SETUP_GUIDE.md         ← Updated with webhook info
```

## 🎬 Setup Process Visualization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SETUP STEPS (5 MINUTES)                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: Get Service Role Key (1 min)
┌──────────────────────────────────────┐
│ Supabase Dashboard                   │
│ → Settings → API                     │
│ → Copy service_role key              │
│ → Paste in .env                      │
└──────────────────────────────────────┘
                │
                ▼
Step 2: Install Dependencies (1 min)
┌──────────────────────────────────────┐
│ cd server                            │
│ npm install                          │
└──────────────────────────────────────┘
                │
                ▼
Step 3: Start Webhook Server (30 sec)
┌──────────────────────────────────────┐
│ npm start                            │
│ ✅ Server running on port 3001      │
└──────────────────────────────────────┘
                │
                ▼
Step 4: Start ngrok Tunnel (1 min)
┌──────────────────────────────────────┐
│ node ngrok-setup.js                  │
│ ✅ Public URL created                │
│ 📋 Copy the URL                      │
└──────────────────────────────────────┘
                │
                ▼
Step 5: Configure Paystack (1 min)
┌──────────────────────────────────────┐
│ Paystack Dashboard                   │
│ → Settings → Developer               │
│ → Paste webhook URL                  │
│ → Select events                      │
│ → Save                               │
└──────────────────────────────────────┘
                │
                ▼
Step 6: Test (30 sec)
┌──────────────────────────────────────┐
│ Click "Test Webhook" in Paystack    │
│ ✅ Check server logs                 │
│ ✅ Event received!                   │
└──────────────────────────────────────┘
                │
                ▼
           🎉 DONE!
```

## 🖥️ Terminal Windows Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT SETUP                             │
└─────────────────────────────────────────────────────────────────┘

Terminal 1: Main App
┌────────────────────────────────┐
│ C:\...\excel_meet>             │
│ npm run dev                    │
│                                │
│ ✅ Vite running on :5173       │
└────────────────────────────────┘

Terminal 2: Webhook Server
┌────────────────────────────────┐
│ C:\...\excel_meet\server>      │
│ npm start                      │
│                                │
│ ✅ Webhook server on :3001     │
│ 📡 Receiving events...         │
└────────────────────────────────┘

Terminal 3: ngrok Tunnel
┌────────────────────────────────┐
│ C:\...\excel_meet\server>      │
│ node ngrok-setup.js            │
│                                │
│ ✅ Tunnel active               │
│ 🌐 https://abc123.ngrok.io     │
└────────────────────────────────┘
```

## 🔄 Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              END-TO-END PAYMENT FLOW                             │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Upgrade to Pro"
   │
   ▼
2. Paystack modal opens
   │
   ▼
3. User enters card details
   │
   ▼
4. Payment processed by Paystack
   │
   ├─────────────────────────────┐
   │                             │
   ▼                             ▼
5a. Success callback         5b. Webhook sent
    (Frontend)                   (Backend)
   │                             │
   │ Updates UI                  │ Verifies signature
   │ Shows success               │ Updates database
   │                             │
   └──────────┬──────────────────┘
              │
              ▼
6. Database updated
   ├─ payment_history: New record
   └─ user_profiles: Subscription active
              │
              ▼
7. User sees "Pro" badge ✅
```

## 📊 Monitoring & Logs

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT TO MONITOR                               │
└─────────────────────────────────────────────────────────────────┘

Webhook Server Logs:
┌────────────────────────────────────────────────────────────┐
│ [2025-01-29T10:30:45.123Z] POST /api/webhooks/paystack    │
│ Received Paystack webhook: charge.success                 │
│ Event data: { reference: "abc123", amount: 400000 }       │
│ Payment recorded successfully for user xyz                │
└────────────────────────────────────────────────────────────┘

Paystack Dashboard:
┌────────────────────────────────────────────────────────────┐
│ Settings → Developer → Webhook Logs                       │
│ ✅ 200 OK - Event delivered successfully                  │
│ ❌ 400 Bad Request - Signature mismatch                   │
│ ⏱️ 500ms - Response time                                  │
└────────────────────────────────────────────────────────────┘

Supabase Dashboard:
┌────────────────────────────────────────────────────────────┐
│ Table Editor → payment_history                            │
│ ✅ New payment records appearing                          │
│                                                            │
│ Table Editor → user_profiles                              │
│ ✅ Subscription fields updated                            │
└────────────────────────────────────────────────────────────┘
```

## 🎯 Success Indicators

```
✅ Webhook server running on port 3001
✅ ngrok tunnel active with public URL
✅ Paystack webhook URL configured
✅ Test webhook returns 200 OK
✅ Payment creates database record
✅ Subscription updates automatically
✅ User sees updated tier in UI
```

## 🚨 Common Issues & Solutions

```
┌─────────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING                               │
└─────────────────────────────────────────────────────────────────┘

Issue: Webhook returns 400
┌────────────────────────────────────────────────────────────┐
│ Cause: Invalid signature                                   │
│ Fix: Check VITE_PAYSTACK_SECRET_KEY in .env              │
└────────────────────────────────────────────────────────────┘

Issue: Database not updating
┌────────────────────────────────────────────────────────────┐
│ Cause: Missing service role key                           │
│ Fix: Add SUPABASE_SERVICE_ROLE_KEY to .env               │
└────────────────────────────────────────────────────────────┘

Issue: ngrok tunnel disconnected
┌────────────────────────────────────────────────────────────┐
│ Cause: Free tunnels timeout after 2 hours                 │
│ Fix: Restart ngrok, update URL in Paystack               │
└────────────────────────────────────────────────────────────┘

Issue: Events not received
┌────────────────────────────────────────────────────────────┐
│ Cause: Wrong URL in Paystack                              │
│ Fix: Use ngrok URL, not localhost                        │
└────────────────────────────────────────────────────────────┘
```

---

## 📚 Quick Reference

| Document | Purpose |
|----------|---------|
| `WEBHOOK_QUICK_START.md` | 5-minute setup guide |
| `WEBHOOK_SETUP_GUIDE.md` | Complete documentation |
| `WEBHOOK_VISUAL_GUIDE.md` | This visual guide |
| `server/README.md` | Server-specific docs |
| `PAYSTACK_SETUP_GUIDE.md` | Full Paystack integration |

---

**Ready to start?** Open `WEBHOOK_QUICK_START.md` and follow the 5-minute guide! 🚀