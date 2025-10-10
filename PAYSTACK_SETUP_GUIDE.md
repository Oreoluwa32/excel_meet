# Paystack Integration Setup Guide

This guide will help you set up Paystack for subscription payments in Excel Meet.

## Prerequisites

- Paystack account (you've already registered and signed in)
- Access to your Paystack dashboard
- Excel Meet application running

## Step 1: Get Your Paystack API Keys

1. Log in to your Paystack dashboard at https://dashboard.paystack.com
2. Navigate to **Settings** → **API Keys & Webhooks**
3. You'll see two keys:
   - **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)
   - **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for live mode)
4. Copy both keys

## Step 2: Add Keys to Environment Variables

1. Open your `.env` file in the project root
2. Add the following lines:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
VITE_PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

3. Replace the placeholder values with your actual keys
4. **Important**: Start with test keys (`pk_test_` and `sk_test_`) for development
5. Save the file and restart your development server

## Step 3: Create Subscription Plans on Paystack

You need to create subscription plans on Paystack that match the plans in your application.

### Using Paystack Dashboard:

1. Go to **Payments** → **Plans** in your Paystack dashboard
2. Click **Create Plan**
3. Create the following plans:

#### Basic Plan
- **Name**: Basic Monthly
- **Amount**: 4000 (in kobo, which is ₦40.00)
- **Interval**: Monthly
- **Currency**: NGN
- **Description**: Basic subscription plan with enhanced features
- After creation, copy the **Plan Code** (e.g., `PLN_xxxxx`)

#### Pro Plan
- **Name**: Pro Monthly
- **Amount**: 8000 (in kobo, which is ₦80.00)
- **Interval**: Monthly
- **Currency**: NGN
- **Description**: Pro subscription plan with premium features
- After creation, copy the **Plan Code**

#### Elite Plan
- **Name**: Elite Monthly
- **Amount**: 16000 (in kobo, which is ₦160.00)
- **Interval**: Monthly
- **Currency**: NGN
- **Description**: Elite subscription plan with all features
- After creation, copy the **Plan Code**

### Update Plan Codes in Application:

1. Open `src/pages/user-profile-management/components/SubscriptionSection.jsx`
2. Update the `planCode` values with your actual Paystack plan codes:

```javascript
basic: {
  // ...
  planCode: 'PLN_xxxxx', // Replace with your Basic plan code
},
pro: {
  // ...
  planCode: 'PLN_yyyyy', // Replace with your Pro plan code
},
elite: {
  // ...
  planCode: 'PLN_zzzzz', // Replace with your Elite plan code
}
```

## Step 4: Set Up Database Tables

Make sure you have the required database tables for subscriptions:

### Update user_profiles table:

```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT;
```

### Ensure payment_history table exists:

```sql
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  payment_method TEXT NOT NULL,
  payment_reference TEXT UNIQUE NOT NULL,
  payment_status TEXT NOT NULL,
  payment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_reference ON payment_history(payment_reference);
```

## Step 5: Set Up Webhooks (Optional but Recommended)

Webhooks allow Paystack to notify your application about subscription events.

1. In Paystack dashboard, go to **Settings** → **API Keys & Webhooks**
2. Scroll to **Webhook URL** section
3. Add your webhook URL: `https://yourdomain.com/api/webhooks/paystack`
4. Select the events you want to receive:
   - `subscription.create`
   - `subscription.disable`
   - `charge.success`
   - `invoice.create`
   - `invoice.payment_failed`

### Create Webhook Handler (Backend Required):

You'll need to create a backend endpoint to handle webhooks. Here's a basic example:

```javascript
// Example webhook handler (you'll need to implement this on your backend)
app.post('/api/webhooks/paystack', async (req, res) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    // Handle the event using the handleSubscriptionWebhook function
    await handleSubscriptionWebhook(event);
    
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});
```

## Step 6: Testing the Integration

### Test Mode:

1. Make sure you're using test API keys
2. Navigate to the profile page in your application
3. Click on a subscription plan to upgrade
4. Use Paystack test cards:
   - **Success**: `4084084084084081` (any CVV, any future expiry)
   - **Insufficient Funds**: `5060666666666666666`
   - **Invalid Card**: `5078000000000000`

### Test Flow:

1. Click "Upgrade to Basic" (or any plan)
2. Paystack payment modal should appear
3. Enter test card details
4. Complete the payment
5. Verify that:
   - Payment is recorded in `payment_history` table
   - User's subscription is updated in `user_profiles` table
   - UI reflects the new subscription status

## Step 7: Going Live

When you're ready to accept real payments:

1. Complete Paystack's verification process
2. Switch to live API keys in your `.env` file:
   ```env
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
   VITE_PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
   ```
3. Create live subscription plans (same as test plans)
4. Update plan codes in the application
5. Test with a small real transaction
6. Monitor the Paystack dashboard for transactions

## Troubleshooting

### Payment Modal Not Appearing:

- Check browser console for errors
- Verify Paystack script is loading (check Network tab)
- Ensure public key is correct in `.env` file

### Payment Successful but Subscription Not Updated:

- Check browser console for errors in the success callback
- Verify database permissions for updating `user_profiles`
- Check Supabase logs for any errors

### Webhook Not Receiving Events:

- Verify webhook URL is publicly accessible
- Check webhook signature validation
- Review Paystack webhook logs in dashboard

## Security Best Practices

1. **Never expose your secret key** in frontend code
2. Always verify webhook signatures
3. Use HTTPS for webhook endpoints
4. Validate all payment amounts on the backend
5. Log all payment transactions
6. Implement rate limiting on payment endpoints
7. Use test mode during development

## Support

- **Paystack Documentation**: https://paystack.com/docs
- **Paystack Support**: support@paystack.com
- **Excel Meet Issues**: Create an issue in the repository

## Additional Features to Implement

1. **Email Notifications**: Send confirmation emails after successful subscription
2. **Subscription Management**: Allow users to upgrade/downgrade plans
3. **Payment History**: Display past transactions to users
4. **Failed Payment Handling**: Retry logic for failed payments
5. **Proration**: Handle mid-cycle plan changes
6. **Cancellation Flow**: Implement proper cancellation with email confirmation

## Notes

- Paystack charges are in kobo (1 Naira = 100 kobo)
- Always multiply Naira amounts by 100 when sending to Paystack
- Divide by 100 when displaying amounts from Paystack
- Test thoroughly before going live
- Keep your secret keys secure and never commit them to version control