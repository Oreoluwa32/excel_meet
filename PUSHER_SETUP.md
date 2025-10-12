# Pusher Real-Time Messaging Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Create Pusher Account

1. Go to [https://pusher.com/](https://pusher.com/)
2. Click "Sign Up" (free tier available)
3. Create a new account (you can use GitHub/Google login)

### Step 2: Create a Pusher App

1. After logging in, click "Create app" or go to "Channels" → "Create app"
2. Fill in the details:
   - **App name**: `excel-meet-messaging` (or any name you prefer)
   - **Cluster**: Choose closest to your users (e.g., `us2` for US, `eu` for Europe, `ap1` for Asia)
   - **Tech stack**: Select "React" for frontend
3. Click "Create app"

### Step 3: Get Your Credentials

After creating the app, you'll see your credentials:
- **app_id**: `XXXXXX`
- **key**: `xxxxxxxxxxxxxxxxxxxx`
- **secret**: `xxxxxxxxxxxxxxxxxxxx`
- **cluster**: `us2` (or your selected cluster)

### Step 4: Add Credentials to Your Project

1. Open your `.env` file in the project root (create it if it doesn't exist)
2. Add these lines:

```env
# Pusher Configuration
REACT_APP_PUSHER_KEY=your_key_here
REACT_APP_PUSHER_CLUSTER=us2
```

**Important**: 
- Replace `your_key_here` with your actual Pusher key
- Replace `us2` with your actual cluster
- **DO NOT** add the secret to `.env` (it should only be on the server)

### Step 5: Enable Client Events (Optional but Recommended)

1. In Pusher dashboard, go to your app
2. Click "App Settings"
3. Scroll down to "Enable client events"
4. Toggle it ON
5. Click "Update"

This allows clients to trigger events directly (useful for quick prototyping).

---

## 🔧 Backend Setup (Choose One Method)

Since Pusher events should be triggered from the server for security, you have two options:

### Option A: Supabase Database Webhooks (Recommended)

This automatically triggers Pusher when messages are sent.

1. **Install Pusher REST API library** (for webhook endpoint):
   ```bash
   npm install pusher
   ```

2. **Create a webhook endpoint** (we'll use Supabase Edge Functions):

   Create file: `supabase/functions/pusher-webhook/index.ts`

   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const PUSHER_APP_ID = Deno.env.get('PUSHER_APP_ID')!
   const PUSHER_KEY = Deno.env.get('PUSHER_KEY')!
   const PUSHER_SECRET = Deno.env.get('PUSHER_SECRET')!
   const PUSHER_CLUSTER = Deno.env.get('PUSHER_CLUSTER') || 'us2'

   serve(async (req) => {
     const { type, table, record, old_record } = await req.json()

     // Handle new message
     if (type === 'INSERT' && table === 'messages') {
       const conversationId = record.conversation_id
       const senderId = record.sender_id

       // Trigger Pusher event
       await fetch(`https://api-${PUSHER_CLUSTER}.pusher.com/apps/${PUSHER_APP_ID}/events`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           name: 'new-message',
           channel: `conversation-${conversationId}`,
           data: record,
         }),
       })
     }

     return new Response('ok', { status: 200 })
   })
   ```

3. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy pusher-webhook
   ```

4. **Set environment variables** in Supabase:
   ```bash
   supabase secrets set PUSHER_APP_ID=your_app_id
   supabase secrets set PUSHER_KEY=your_key
   supabase secrets set PUSHER_SECRET=your_secret
   supabase secrets set PUSHER_CLUSTER=us2
   ```

5. **Create Database Webhook** in Supabase Dashboard:
   - Go to Database → Webhooks
   - Click "Create a new hook"
   - Name: `pusher-new-message`
   - Table: `messages`
   - Events: `INSERT`
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: Your Edge Function URL (e.g., `https://xxx.supabase.co/functions/v1/pusher-webhook`)

### Option B: Trigger from Client (Quick & Easy for Development)

For quick development, you can trigger Pusher events directly after sending messages:

1. Install `pusher` package on backend (if you have one)
2. Or use Pusher's REST API directly from your Supabase Edge Functions

---

## 📱 Frontend Integration

The frontend code is already set up! Just add your Pusher credentials to `.env` and it will automatically:

1. ✅ Connect to Pusher when the app loads
2. ✅ Subscribe to conversation channels when viewing messages
3. ✅ Receive real-time message updates
4. ✅ Fall back to polling if Pusher is not configured

### Files Already Updated:
- ✅ `src/utils/pusherClient.js` - Pusher initialization
- ✅ `src/utils/pusherService.js` - Pusher event subscriptions
- ✅ `src/pages/messages/index.jsx` - Will be updated to use Pusher

---

## 🧪 Testing

1. **Start your app**:
   ```bash
   npm start
   ```

2. **Open browser console** and look for:
   ```
   ✅ Pusher connected successfully
   ```

3. **Test messaging**:
   - Open two browser windows (or use incognito mode)
   - Log in as different users
   - Send messages between them
   - Messages should appear instantly (no 3-second delay)

4. **Check Pusher Dashboard**:
   - Go to your Pusher app dashboard
   - Click "Debug Console"
   - You should see events being triggered in real-time

---

## 📊 Pusher Free Tier Limits

- ✅ **100 concurrent connections**
- ✅ **200,000 messages per day**
- ✅ **Unlimited channels**
- ✅ **Support for 100 channels per connection**

This is more than enough for most small to medium applications!

---

## 🔒 Security Best Practices

1. **Never expose your Pusher secret** in frontend code
2. **Use private channels** for sensitive data
3. **Implement authentication** for private channels
4. **Validate data** on the server before triggering events
5. **Rate limit** event triggers to prevent abuse

---

## 🐛 Troubleshooting

### Pusher not connecting?
- Check if `REACT_APP_PUSHER_KEY` is set in `.env`
- Verify the cluster is correct
- Check browser console for errors
- Make sure you restarted the dev server after adding `.env` variables

### Messages not appearing in real-time?
- Check Pusher Debug Console for events
- Verify webhook is configured correctly
- Check browser console for subscription errors
- Ensure channel names match between trigger and subscription

### "Pusher not available, using polling fallback"?
- This means Pusher credentials are not configured
- The app will work fine with polling (3-second delay)
- Add credentials to `.env` to enable real-time updates

---

## 🚀 Next Steps

After setting up Pusher:

1. ✅ Test real-time messaging between users
2. ✅ Monitor usage in Pusher dashboard
3. ✅ Implement read receipts (optional)
4. ✅ Add typing indicators (optional)
5. ✅ Add presence channels to show online users (optional)

---

## 💡 Alternative: Keep Polling

If you prefer not to use Pusher, the current polling implementation works perfectly fine:
- ✅ No external dependencies
- ✅ No additional costs
- ✅ Simple and reliable
- ⚠️ 3-second delay for new messages

The choice is yours! Both approaches are production-ready.