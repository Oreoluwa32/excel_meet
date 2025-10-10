import { supabase } from './supabase';

/**
 * Paystack Service
 * Handles Paystack payment integration for subscriptions and one-time payments
 */

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Load Paystack inline script
 * @returns {Promise<boolean>} True if script loaded successfully
 */
export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

/**
 * Initialize Paystack payment (one-time)
 * @param {Object} paymentData - Payment configuration
 * @param {number} paymentData.amount - Amount in kobo (multiply naira by 100)
 * @param {string} paymentData.email - Customer email
 * @param {string} paymentData.reference - Unique payment reference
 * @param {Object} paymentData.metadata - Additional metadata
 * @param {Function} onSuccess - Success callback
 * @param {Function} onClose - Close callback
 * @returns {Promise<void>}
 */
export const initializePayment = async ({ amount, email, reference, metadata = {} }, onSuccess, onClose) => {
  try {
    await loadPaystackScript();

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference || `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: 'Payment Type',
            variable_name: 'payment_type',
            value: metadata.payment_type || 'one_time'
          }
        ]
      },
      callback: (response) => {
        console.log('Payment successful:', response);
        if (onSuccess) onSuccess(response);
      },
      onClose: () => {
        console.log('Payment window closed');
        if (onClose) onClose();
      }
    });

    handler.openIframe();
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    throw error;
  }
};

/**
 * Initialize subscription payment with Paystack
 * @param {Object} subscriptionData - Subscription configuration
 * @param {string} subscriptionData.planCode - Paystack plan code
 * @param {string} subscriptionData.email - Customer email
 * @param {string} subscriptionData.reference - Unique subscription reference
 * @param {Object} subscriptionData.metadata - Additional metadata
 * @param {Function} onSuccess - Success callback
 * @param {Function} onClose - Close callback
 * @returns {Promise<void>}
 */
export const initializeSubscription = async ({ planCode, email, reference, metadata = {} }, onSuccess, onClose) => {
  try {
    await loadPaystackScript();

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      plan: planCode,
      ref: reference || `SUB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: 'Subscription Type',
            variable_name: 'subscription_type',
            value: metadata.subscription_type || 'premium'
          }
        ]
      },
      callback: (response) => {
        console.log('Subscription successful:', response);
        if (onSuccess) onSuccess(response);
      },
      onClose: () => {
        console.log('Subscription window closed');
        if (onClose) onClose();
      }
    });

    handler.openIframe();
  } catch (error) {
    console.error('Error initializing Paystack subscription:', error);
    throw error;
  }
};

/**
 * Verify payment with Paystack
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} Verification result
 */
export const verifyPayment = async (reference) => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Payment verification failed');
    }

    return {
      success: result.status,
      data: result.data
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a subscription plan on Paystack
 * @param {Object} planData - Plan configuration
 * @param {string} planData.name - Plan name
 * @param {number} planData.amount - Amount in kobo
 * @param {string} planData.interval - Billing interval (daily, weekly, monthly, annually)
 * @param {string} planData.description - Plan description
 * @returns {Promise<Object>} Created plan data
 */
export const createSubscriptionPlan = async ({ name, amount, interval, description }) => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        amount: amount * 100, // Convert to kobo
        interval,
        description,
        currency: 'NGN'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create plan');
    }

    return {
      success: result.status,
      data: result.data
    };
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get subscription details
 * @param {string} subscriptionCode - Subscription code
 * @returns {Promise<Object>} Subscription details
 */
export const getSubscription = async (subscriptionCode) => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/${subscriptionCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to get subscription');
    }

    return {
      success: result.status,
      data: result.data
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel a subscription
 * @param {string} subscriptionCode - Subscription code
 * @param {string} emailToken - Email token for cancellation
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelSubscription = async (subscriptionCode, emailToken) => {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription/disable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to cancel subscription');
    }

    return {
      success: result.status,
      data: result.data
    };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Record payment in database
 * @param {Object} paymentData - Payment data to record
 * @returns {Promise<Object>} Database record
 */
export const recordPayment = async (paymentData) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('payment_history')
      .insert({
        user_id: user?.user?.id,
        amount: paymentData.amount / 100, // Convert from kobo to naira
        currency: 'NGN',
        payment_method: 'paystack',
        payment_reference: paymentData.reference,
        payment_status: paymentData.status || 'pending',
        payment_data: {
          ...paymentData,
          recorded_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording payment:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user subscription status
 * @param {string} userId - User ID
 * @param {Object} subscriptionData - Subscription data
 * @returns {Promise<Object>} Update result
 */
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: subscriptionData.tier,
        subscription_status: subscriptionData.status,
        subscription_start_date: subscriptionData.start_date,
        subscription_end_date: subscriptionData.end_date,
        paystack_subscription_code: subscriptionData.subscription_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle subscription webhook from Paystack
 * @param {Object} webhookData - Webhook payload
 * @returns {Promise<Object>} Processing result
 */
export const handleSubscriptionWebhook = async (webhookData) => {
  try {
    const { event, data } = webhookData;

    switch (event) {
      case 'subscription.create':
        // Handle new subscription
        await updateUserSubscription(data.customer.metadata.user_id, {
          tier: data.plan.name,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: data.next_payment_date,
          subscription_code: data.subscription_code
        });
        break;

      case 'subscription.disable':
        // Handle subscription cancellation
        await updateUserSubscription(data.customer.metadata.user_id, {
          tier: 'free',
          status: 'cancelled',
          start_date: null,
          end_date: null,
          subscription_code: null
        });
        break;

      case 'charge.success':
        // Handle successful payment
        await recordPayment({
          reference: data.reference,
          amount: data.amount,
          status: 'successful'
        });
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling subscription webhook:', error);
    return { success: false, error: error.message };
  }
};

export default {
  loadPaystackScript,
  initializePayment,
  initializeSubscription,
  verifyPayment,
  createSubscriptionPlan,
  getSubscription,
  cancelSubscription,
  recordPayment,
  updateUserSubscription,
  handleSubscriptionWebhook
};