# Paystack Integration Setup Checklist

## ✅ Completed Steps

### 1. Plan Codes Updated ✓
- **Basic Plan**: `PLN_c8ju4nnjje9jwg9` 
- **Pro Plan**: `PLN_i6ijfhscu3l8v3k`
- **Elite Plan**: `PLN_vg7iryponce5mbt`

These have been added to `src/pages/user-profile-management/components/SubscriptionSection.jsx`

### 2. Environment Variables ✓
Your `.env` file already contains:
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_3cd655e2ecedc880a2b5d8e0bea632454ac3f637
VITE_PAYSTACK_SECRET_KEY=sk_test_ba2e9c1a6af491e903f48c5aad4ae08e3313ebf9
```

### 3. Code Files Created ✓
- ✅ `src/utils/paystackService.js` - Payment processing service
- ✅ `src/pages/user-profile-management/components/SubscriptionSection.jsx` - Updated with plan codes
- ✅ `src/pages/user-profile-management/components/JobHistorySection.jsx` - Fixed hardcoded data
- ✅ `src/utils/jobService.js` - Extended with job statistics functions

## 🔄 Remaining Steps

### Step 1: Set Up Database Tables (REQUIRED)

You need to run the SQL script to create the necessary database tables and columns.

**Option A: Using Supabase Dashboard (RECOMMENDED)**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `setup_paystack_subscription.sql`
6. Paste it into the SQL editor
7. Click **Run** or press `Ctrl+Enter`
8. You should see a success message

**Option B: Using Supabase CLI**
```powershell
npx supabase db push
```

**What this creates:**
- ✅ `payment_history` table for storing transactions
- ✅ Subscription columns in `user_profiles` table
- ✅ Database functions for subscription management
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance

### Step 2: Verify Database Setup

After running the SQL script, verify the setup:

1. Go to **Table Editor** in Supabase dashboard
2. Check that `payment_history` table exists
3. Check that `user_profiles` table has these new columns:
   - `subscription_tier`
   - `subscription_status`
   - `subscription_start_date`
   - `subscription_end_date`
   - `paystack_subscription_code`

### Step 3: Test the Integration

1. **Start your development server:**
   ```powershell
   npm run dev
   ```

2. **Navigate to your profile page**

3. **Test with Paystack test card:**
   - Card Number: `4084084084084081`
   - CVV: Any 3 digits (e.g., `123`)
   - Expiry: Any future date (e.g., `12/25`)
   - PIN: `1234`

4. **Click "Upgrade to Basic"** (or any plan)

5. **Complete the payment in the Paystack modal**

6. **Verify the following:**
   - Payment modal appears
   - Payment completes successfully
   - Page refreshes automatically
   - Your subscription tier updates
   - Billing information shows correct end date

### Step 4: Check Database Records

After a test payment:

1. Go to **Table Editor** in Supabase
2. Check `payment_history` table - should have a new record
3. Check `user_profiles` table - your user should have:
   - `subscription_tier` = 'basic' (or whichever you chose)
   - `subscription_status` = 'active'
   - `subscription_start_date` = current date
   - `subscription_end_date` = one month from now
   - `paystack_subscription_code` = the payment reference

## 🔍 Troubleshooting

### Issue: Payment modal doesn't appear
**Solution:**
- Check browser console for errors
- Verify `VITE_PAYSTACK_PUBLIC_KEY` is in `.env`
- Restart dev server after adding env variables
- Check that Paystack script loads (Network tab)

### Issue: Payment succeeds but subscription doesn't update
**Solution:**
- Check browser console for errors
- Verify database tables were created (Step 1)
- Check Supabase logs for permission errors
- Verify RLS policies are set up correctly

### Issue: "Plan code not found" error
**Solution:**
- Verify plan codes in Paystack dashboard match the codes in `SubscriptionSection.jsx`
- Ensure plans are active in Paystack dashboard
- Check that plan amounts match (₦4,000, ₦8,000, ₦16,000)

### Issue: Database migration fails
**Solution:**
- Run the SQL script directly in Supabase SQL Editor (Option A above)
- Check for any existing tables/columns that might conflict
- Review error messages in Supabase logs

## 📋 Verification Checklist

Before going live, verify:

- [ ] Database tables created successfully
- [ ] Test payment completes successfully
- [ ] Subscription updates in database
- [ ] UI reflects new subscription status
- [ ] Payment history records correctly
- [ ] Cancellation works (if implemented)
- [ ] All plan codes are correct
- [ ] Amounts match between app and Paystack

## 🚀 Going Live

When ready for production:

1. **Complete Paystack verification:**
   - Submit business documents
   - Verify bank account
   - Complete KYC process

2. **Switch to live keys:**
   - Get live API keys from Paystack dashboard
   - Update `.env` with live keys:
     ```
     VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
     VITE_PAYSTACK_SECRET_KEY=sk_live_your_live_key
     ```

3. **Create live subscription plans:**
   - Create same plans in live mode
   - Update plan codes in `SubscriptionSection.jsx`

4. **Test with small real payment**

5. **Monitor transactions in Paystack dashboard**

## 📞 Support

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Supabase Docs**: https://supabase.com/docs

## 📝 Important Notes

- Always test with test keys before going live
- Keep secret keys secure and never commit to version control
- Paystack amounts are in kobo (multiply Naira by 100)
- Test mode cards won't charge real money
- Monitor failed payments and handle them appropriately
- Set up webhooks for automated subscription management (optional but recommended)

## ✨ Next Steps After Setup

1. Implement email notifications for successful subscriptions
2. Add payment history page for users
3. Set up Paystack webhooks for automated updates
4. Implement subscription upgrade/downgrade logic
5. Add proration for mid-cycle changes
6. Create admin dashboard for subscription management