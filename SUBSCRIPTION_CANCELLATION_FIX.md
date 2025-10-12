# Subscription Cancellation Fix

## Problem
When users cancelled their subscription, they were immediately downgraded to the free plan instead of retaining access until the end of their billing period.

## Solution
The subscription cancellation logic has been updated to follow industry-standard practices:

1. **When a user cancels**: Their subscription status changes to 'cancelled', but they retain their current plan tier and access until the `subscription_end_date`
2. **After the subscription expires**: A scheduled task automatically downgrades them to the free tier

## Changes Made

### 1. Frontend Changes

#### `src/pages/user-profile-management/components/SubscriptionSection.jsx`

**Updated `handleCancelSubscription` function:**
- Now keeps the current tier, start date, and end date when cancelling
- Only changes the status to 'cancelled'
- Shows a message informing users they'll retain access until the expiry date

**Updated UI:**
- Added a yellow banner when subscription is cancelled showing expiry information
- Changed "Next billing date" to "Access expires on" for cancelled subscriptions
- Updated status display to show "Cancelled (Active until expiry)" for cancelled subscriptions
- Hide the "Cancel Subscription" button for already-cancelled subscriptions

### 2. Backend Changes

#### `src/utils/paystackService.js`

**Updated `handleSubscriptionWebhook` function:**
- Modified the `subscription.disable` event handler
- Now fetches the current subscription details before updating
- Keeps the tier, dates, and subscription code when marking as cancelled
- Only changes the status to 'cancelled'

### 3. New Utilities

#### `src/utils/subscriptionExpiry.js`
Created utility functions for handling subscription expiry:
- `handleExpiredSubscriptions()`: Checks and downgrades all expired subscriptions
- `isSubscriptionExpired(userId)`: Checks if a specific user's subscription has expired
- `getDaysUntilExpiry(userId)`: Calculates days remaining until expiry

#### `scripts/check-expired-subscriptions.js`
Created a standalone script that:
- Queries the database for expired subscriptions
- Downgrades users to the free tier when their subscription period ends
- Provides detailed logging and error handling
- Can be run manually or scheduled as a cron job

### 4. Documentation

#### `scripts/README.md`
Comprehensive documentation covering:
- How the expiry checker works
- Setup instructions for different platforms (Windows, Linux, Mac)
- Options for automated execution (Task Scheduler, Cron, Cloud Functions)
- Testing and troubleshooting guides

## How It Works Now

### User Cancellation Flow

1. User clicks "Cancel Subscription"
2. Confirmation dialog: "You will retain access until the end of your billing period"
3. System updates subscription status to 'cancelled' but keeps:
   - Current tier (basic/pro/elite)
   - Start date
   - End date
   - Subscription code
4. User sees a yellow banner: "Subscription Cancelled: You will retain access to [Plan] features until your subscription expires"
5. User continues to have full access to their plan features

### Automatic Expiry Flow

1. Daily scheduled task runs (via cron job or Task Scheduler)
2. Script queries for subscriptions where `subscription_end_date < current_date`
3. For each expired subscription:
   - Updates tier to 'free'
   - Updates status to 'expired'
   - Clears subscription dates and codes
4. User is now on the free plan

## Setup Required

### Immediate (Manual Testing)
You can test the cancellation flow immediately - it will work correctly in the UI.

### For Production (Automated Expiry)
You need to set up the scheduled task to automatically downgrade expired subscriptions:

#### Option 1: Windows Task Scheduler (Recommended for your setup)
```
1. Open Task Scheduler
2. Create Basic Task: "Excel Meet - Check Expired Subscriptions"
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
   - Program: npm
   - Arguments: run check-subscriptions
   - Start in: C:\Users\oreol\Documents\Projects\excel_meet
```

#### Option 2: Manual Execution
Run this command daily:
```bash
npm run check-subscriptions
```

#### Option 3: Cloud Function (Best for production)
Deploy the logic as a Supabase Edge Function or AWS Lambda with a scheduled trigger.

## Testing

### Test Cancellation
1. Subscribe to a paid plan
2. Click "Cancel Subscription"
3. Verify:
   - Status shows "Cancelled (Active until expiry)"
   - Yellow banner appears
   - You still have access to plan features
   - "Cancel Subscription" button is hidden

### Test Expiry
1. Manually set a subscription's `subscription_end_date` to yesterday in the database
2. Run: `npm run check-subscriptions`
3. Verify the user is downgraded to free tier

## Database Schema Requirements

The solution assumes the following columns exist in `user_profiles` table:
- `subscription_tier` (text): 'free', 'basic', 'pro', or 'elite'
- `subscription_status` (text): 'active', 'cancelled', or 'expired'
- `subscription_start_date` (timestamp)
- `subscription_end_date` (timestamp)
- `paystack_subscription_code` (text)

## Future Enhancements

Consider implementing:
1. **Email notifications**: Warn users 7, 3, and 1 day before expiry
2. **Grace period**: Allow a few extra days before downgrading
3. **Reactivation flow**: Easy way for users to resubscribe
4. **Analytics**: Track cancellation reasons and patterns
5. **Prorated refunds**: If offering refunds for early cancellations

## Support

If users have issues:
1. Check the subscription status in the database
2. Verify the `subscription_end_date` is set correctly
3. Check if the scheduled task is running (look for logs)
4. Manually run `npm run check-subscriptions` to force an expiry check