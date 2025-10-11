import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // We'll add this to .env
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Excel Meet Webhook Server'
  });
});

// Paystack webhook endpoint
app.post('/api/webhooks/paystack', async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.VITE_PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Received Paystack webhook:', event.event);
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;
      
      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;
      
      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event.data);
        break;
      
      case 'invoice.create':
        await handleInvoiceCreate(event.data);
        break;
      
      case 'invoice.update':
        await handleInvoiceUpdate(event.data);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handler for successful charge
async function handleChargeSuccess(data) {
  console.log('Processing charge.success event');
  
  const { reference, amount, customer, metadata, paid_at } = data;
  
  if (!metadata || !metadata.user_id) {
    console.error('No user_id in metadata');
    return;
  }

  try {
    // Record payment in payment_history
    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: metadata.user_id,
        amount: amount / 100, // Convert from kobo to naira
        currency: 'NGN',
        payment_method: 'paystack',
        payment_reference: reference,
        payment_status: 'success',
        payment_data: {
          customer_email: customer.email,
          customer_code: customer.customer_code,
          paid_at,
          metadata
        }
      });

    if (paymentError) {
      console.error('Error recording payment:', paymentError);
      return;
    }

    console.log(`Payment recorded successfully for user ${metadata.user_id}`);
  } catch (error) {
    console.error('Error in handleChargeSuccess:', error);
  }
}

// Handler for subscription creation
async function handleSubscriptionCreate(data) {
  console.log('Processing subscription.create event');
  
  const { customer, plan, subscription_code, email_token } = data;
  
  if (!customer || !customer.email) {
    console.error('No customer email in subscription data');
    return;
  }

  try {
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', customer.email)
      .single();

    if (userError || !userData) {
      console.error('User not found:', customer.email);
      return;
    }

    // Determine subscription tier from plan code
    const tier = getTierFromPlanCode(plan.plan_code);
    
    // Update user subscription
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        paystack_subscription_code: subscription_code
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }

    console.log(`Subscription created for user ${userData.id}: ${tier}`);
  } catch (error) {
    console.error('Error in handleSubscriptionCreate:', error);
  }
}

// Handler for subscription disable
async function handleSubscriptionDisable(data) {
  console.log('Processing subscription.disable event');
  
  const { customer, subscription_code } = data;

  try {
    // Find user by subscription code
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('paystack_subscription_code', subscription_code)
      .single();

    if (userError || !userData) {
      console.error('User not found for subscription:', subscription_code);
      return;
    }

    // Update subscription status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_tier: 'free'
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error disabling subscription:', updateError);
      return;
    }

    console.log(`Subscription disabled for user ${userData.id}`);
  } catch (error) {
    console.error('Error in handleSubscriptionDisable:', error);
  }
}

// Handler for subscription not renewing
async function handleSubscriptionNotRenew(data) {
  console.log('Processing subscription.not_renew event');
  
  const { subscription_code } = data;

  try {
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('paystack_subscription_code', subscription_code)
      .single();

    if (userError || !userData) {
      console.error('User not found for subscription:', subscription_code);
      return;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'expiring'
      })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return;
    }

    console.log(`Subscription set to not renew for user ${userData.id}`);
  } catch (error) {
    console.error('Error in handleSubscriptionNotRenew:', error);
  }
}

// Handler for invoice creation
async function handleInvoiceCreate(data) {
  console.log('Processing invoice.create event');
  // You can add email notifications here
}

// Handler for invoice update
async function handleInvoiceUpdate(data) {
  console.log('Processing invoice.update event');
  
  if (data.paid) {
    // Invoice was paid, extend subscription
    const { subscription } = data;
    
    if (subscription && subscription.subscription_code) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('id, subscription_end_date')
          .eq('paystack_subscription_code', subscription.subscription_code)
          .single();

        if (userError || !userData) {
          console.error('User not found for subscription:', subscription.subscription_code);
          return;
        }

        // Extend subscription by 30 days
        const currentEndDate = new Date(userData.subscription_end_date || Date.now());
        const newEndDate = new Date(currentEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: newEndDate.toISOString()
          })
          .eq('id', userData.id);

        if (updateError) {
          console.error('Error extending subscription:', updateError);
          return;
        }

        console.log(`Subscription extended for user ${userData.id} until ${newEndDate}`);
      } catch (error) {
        console.error('Error in handleInvoiceUpdate:', error);
      }
    }
  }
}

// Handler for failed invoice payment
async function handleInvoicePaymentFailed(data) {
  console.log('Processing invoice.payment_failed event');
  
  const { subscription } = data;
  
  if (subscription && subscription.subscription_code) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('paystack_subscription_code', subscription.subscription_code)
        .single();

      if (userError || !userData) {
        console.error('User not found for subscription:', subscription.subscription_code);
        return;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'payment_failed'
        })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
        return;
      }

      console.log(`Payment failed for user ${userData.id}`);
      // You can add email notification here
    } catch (error) {
      console.error('Error in handleInvoicePaymentFailed:', error);
    }
  }
}

// Helper function to determine tier from plan code
function getTierFromPlanCode(planCode) {
  const planCodes = {
    'PLN_c8ju4nnjje9jwg9': 'basic',
    'PLN_i6ijfhscu3l8v3k': 'pro',
    'PLN_vg7iryponce5mbt': 'elite'
  };
  
  return planCodes[planCode] || 'free';
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Webhook server running on http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: http://localhost:${PORT}/api/webhooks/paystack`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});

export default app;