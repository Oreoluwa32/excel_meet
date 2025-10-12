# Subscription Management Scripts

This directory contains scripts for managing subscriptions in Excel Meet.

## check-expired-subscriptions.js

This script checks for expired subscriptions and automatically downgrades users to the free tier when their subscription period ends.

### How It Works

1. Queries the database for all users with non-free subscription tiers
2. Checks if their `subscription_end_date` has passed
3. Downgrades expired subscriptions to the free tier
4. Updates the subscription status to 'expired'

### Setup

#### Prerequisites

Make sure you have the following in your `.env` file:
```
VITE_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Manual Execution

To run the script manually:

```bash
node scripts/check-expired-subscriptions.js
```

#### Automated Execution (Recommended)

For production, you should set up this script to run automatically every day.

##### Option 1: Windows Task Scheduler

1. Open **Task Scheduler** (search for it in Windows)
2. Click **Create Basic Task**
3. Name: "Excel Meet - Check Expired Subscriptions"
4. Trigger: **Daily** at **2:00 AM** (or your preferred time)
5. Action: **Start a program**
   - Program/script: `node`
   - Add arguments: `scripts/check-expired-subscriptions.js`
   - Start in: `C:\Users\oreol\Documents\Projects\excel_meet`
6. Click **Finish**

##### Option 2: Linux/Mac Cron Job

1. Open your crontab:
   ```bash
   crontab -e
   ```

2. Add this line (runs daily at 2 AM):
   ```
   0 2 * * * cd /path/to/excel_meet && node scripts/check-expired-subscriptions.js >> /var/log/subscription-expiry.log 2>&1
   ```

##### Option 3: Supabase Edge Function (Recommended for Production)

For a more robust solution, you can deploy this as a Supabase Edge Function with a scheduled trigger:

1. Create a new Edge Function in your Supabase project
2. Copy the logic from `check-expired-subscriptions.js`
3. Set up a cron trigger in Supabase to run it daily

##### Option 4: Cloud Scheduler (AWS, GCP, Azure)

You can also use cloud-based schedulers:
- **AWS**: CloudWatch Events + Lambda
- **GCP**: Cloud Scheduler + Cloud Functions
- **Azure**: Azure Functions with Timer Trigger

### Testing

To test the script without waiting for subscriptions to expire:

1. Manually set a subscription's `subscription_end_date` to a past date in your database
2. Run the script
3. Verify the subscription was downgraded to free

### Monitoring

The script outputs detailed logs including:
- Number of expired subscriptions found
- Each user being processed
- Success/failure status for each update
- Summary statistics

Consider setting up log monitoring or email notifications for production use.

### Troubleshooting

**Error: Missing Supabase credentials**
- Make sure your `.env` file contains `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Error: Cannot find module**
- Run `npm install` to ensure all dependencies are installed

**Script runs but doesn't update subscriptions**
- Check that the service role key has proper permissions
- Verify the database schema matches the expected structure
- Check Supabase logs for any RLS policy issues

## Future Enhancements

Consider adding:
- Email notifications to users before their subscription expires (7 days, 3 days, 1 day)
- Webhook notifications to admin when subscriptions expire
- Metrics tracking (number of cancellations, expirations, etc.)
- Grace period handling (allow a few extra days before downgrading)