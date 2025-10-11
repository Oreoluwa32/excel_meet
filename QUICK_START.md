# Quick Start - Paystack Integration

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Setup (2 minutes)

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the entire content from `setup_paystack_subscription.sql`
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 2: Start Your App (1 minute)

```powershell
npm run dev
```

### Step 3: Test Payment (2 minutes)

1. Open your app and go to your profile page
2. Click **"Upgrade to Basic"** (or any plan)
3. In the Paystack modal, use these test details:
   - **Card**: `4084084084084081`
   - **Expiry**: `12/25`
   - **CVV**: `123`
   - **PIN**: `1234`
4. Complete payment
5. Page will refresh with your new subscription!

## ✅ What's Already Done

- ✅ Paystack API keys configured
- ✅ Plan codes updated:
  - Basic: `PLN_c8ju4nnjje9jwg9`
  - Pro: `PLN_i6ijfhscu3l8v3k`
  - Elite: `PLN_vg7iryponce5mbt`
- ✅ Payment service created
- ✅ Subscription UI ready
- ✅ Job history fixed (no more hardcoded data)

## 🎯 What You Need to Do

**ONLY ONE THING:** Run the database setup SQL script (Step 1 above)

That's it! Everything else is ready to go.

## 🧪 Test Cards

| Card Number | Result |
|-------------|--------|
| `4084084084084081` | ✅ Success |
| `5060666666666666666` | ❌ Insufficient Funds |
| `5078000000000000` | ❌ Invalid Card |

## 📱 What Happens After Payment

1. ✅ Payment recorded in `payment_history` table
2. ✅ Your subscription tier updates
3. ✅ Subscription status set to "active"
4. ✅ End date set to 1 month from now
5. ✅ UI updates to show new plan
6. ✅ Billing info displays next payment date

## 🔍 Quick Verification

After test payment, check:
- Profile page shows new subscription tier
- Billing section shows next billing date
- Can see "Cancel Subscription" button

## 💡 Pro Tips

- Use test mode keys for development (already configured)
- Test all three plans to ensure they work
- Check Supabase Table Editor to see payment records
- Monitor browser console for any errors

## 📚 Full Documentation

- `PAYSTACK_SETUP_CHECKLIST.md` - Complete setup guide
- `PAYSTACK_SETUP_GUIDE.md` - Detailed documentation
- `setup_paystack_subscription.sql` - Database setup script

## 🆘 Need Help?

If payment modal doesn't appear:
1. Check browser console for errors
2. Verify `.env` has Paystack keys
3. Restart dev server

If subscription doesn't update:
1. Ensure database setup completed (Step 1)
2. Check Supabase logs for errors
3. Verify RLS policies are active

---

**Ready?** Just run the SQL script and start testing! 🎉