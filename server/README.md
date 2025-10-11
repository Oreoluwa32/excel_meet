# Excel Meet Webhook Server

Express.js server for handling Paystack webhook events.

## 🎯 Purpose

This server receives webhook events from Paystack and automatically:
- Records payments in the database
- Updates user subscriptions
- Handles subscription renewals
- Manages failed payments
- Processes cancellations

## 🚀 Quick Start

### Local Development

```powershell
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (development)
npm run dev
```

### Production Deployment

This server is ready to deploy to:
- **Render** (recommended) - https://render.com/
- **Railway** - https://railway.app/
- **Heroku** - https://heroku.com/
- Any Node.js hosting platform

See `../PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📡 Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/webhooks/paystack` | POST | Paystack webhook handler |

## 🔧 Configuration

Required environment variables (in parent `.env` file):

```env
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_PAYSTACK_SECRET_KEY=your_paystack_secret_key
WEBHOOK_PORT=3001  # Optional, defaults to 3001
```

## 🌐 Exposing to Internet (for localhost)

Use ngrok to create a public URL:

```powershell
# Start ngrok tunnel
node ngrok-setup.js

# Or use npm script
npm run tunnel
```

Copy the ngrok URL and configure it in Paystack dashboard.

## 📋 Webhook Events Handled

- `charge.success` - Payment completed
- `subscription.create` - New subscription
- `subscription.disable` - Subscription cancelled
- `subscription.not_renew` - Won't auto-renew
- `invoice.create` - New invoice
- `invoice.update` - Invoice paid/updated
- `invoice.payment_failed` - Payment failed

## 🔒 Security

- ✅ Webhook signature verification
- ✅ CORS protection
- ✅ Request logging
- ✅ Error handling
- ✅ Service role authentication

## 📝 Logs

The server logs all webhook events to console:
- Incoming requests
- Event types
- Processing results
- Errors

## 🐛 Troubleshooting

**Port already in use:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
```

**Module not found:**
```powershell
npm install
```

**Webhook signature invalid:**
- Verify `VITE_PAYSTACK_SECRET_KEY` in `.env`
- Check that it matches your Paystack dashboard

## 📚 Documentation

- See `WEBHOOK_QUICK_START.md` for setup guide
- See `WEBHOOK_SETUP_GUIDE.md` for detailed documentation

## 🚀 Production Deployment

For production, deploy this server to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS/Azure/GCP

Then update Paystack webhook URL to your production domain.