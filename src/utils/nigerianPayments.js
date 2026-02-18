/**
 * Nigerian payment processing utility for Excel Meet
 * Provides functions for processing payments using Nigerian payment gateways
 */
import { supabase } from './supabase';

/**
 * Initialize Paystack payment
 * @param {object} paymentData - Payment data including amount, email, etc.
 * @returns {Promise<object>} Result of payment initialization
 */
export const initializePaystackPayment = async (paymentData) => {
  try {
    const { amount, email, callbackUrl, reference, metadata = {} } = paymentData;
    
    // In a real application, this would call the Paystack API
    // For this example, we'll simulate the API call
    
    const { data: { user } } = await supabase.auth.getUser();

    // First, record the payment attempt in our database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_method: 'paystack',
        payment_reference: reference || `PS_${Date.now()}`,
        payment_status: 'pending',
        payment_data: {
          email,
          metadata,
          initiated_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error recording payment attempt:', paymentError);
      return { success: false, error: paymentError.message };
    }
    
    // Simulate Paystack API response
    const paystackResponse = {
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: `https://checkout.paystack.com/${paymentRecord.payment_reference}`,
        access_code: 'ACCESS_CODE',
        reference: paymentRecord.payment_reference
      }
    };
    
    return { 
      success: true, 
      data: {
        ...paystackResponse.data,
        paymentId: paymentRecord.id
      }
    };
  } catch (error) {
    console.error('Error initializing Paystack payment:', error);
    return { success: false, error: 'Failed to initialize payment' };
  }
};

/**
 * Initialize Flutterwave payment
 * @param {object} paymentData - Payment data including amount, email, etc.
 * @returns {Promise<object>} Result of payment initialization
 */
export const initializeFlutterwavePayment = async (paymentData) => {
  try {
    const { amount, email, name, phone, callbackUrl, reference, metadata = {} } = paymentData;
    
    // In a real application, this would call the Flutterwave API
    // For this example, we'll simulate the API call
    
    const { data: { user } } = await supabase.auth.getUser();

    // First, record the payment attempt in our database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_method: 'flutterwave',
        payment_reference: reference || `FW_${Date.now()}`,
        payment_status: 'pending',
        payment_data: {
          email,
          name,
          phone,
          metadata,
          initiated_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error recording payment attempt:', paymentError);
      return { success: false, error: paymentError.message };
    }
    
    // Simulate Flutterwave API response
    const flutterwaveResponse = {
      status: 'success',
      message: 'Hosted Link created',
      data: {
        link: `https://checkout.flutterwave.com/${paymentRecord.payment_reference}`
      }
    };
    
    return { 
      success: true, 
      data: {
        ...flutterwaveResponse.data,
        paymentId: paymentRecord.id,
        reference: paymentRecord.payment_reference
      }
    };
  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error);
    return { success: false, error: 'Failed to initialize payment' };
  }
};

/**
 * Process USSD payment
 * @param {object} paymentData - Payment data including amount, bank code, etc.
 * @returns {Promise<object>} Result with USSD code to dial
 */
export const processUSSDPayment = async (paymentData) => {
  try {
    const { amount, bankCode, reference, metadata = {} } = paymentData;
    
    // In a real application, this would call a payment API
    // For this example, we'll simulate the API call
    
    const { data: { user } } = await supabase.auth.getUser();

    // First, record the payment attempt in our database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_method: 'ussd',
        payment_reference: reference || `USSD_${Date.now()}`,
        payment_status: 'pending',
        payment_data: {
          bankCode,
          metadata,
          initiated_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error recording USSD payment attempt:', paymentError);
      return { success: false, error: paymentError.message };
    }
    
    // Generate USSD code based on bank code
    let ussdCode;
    switch (bankCode) {
      case '057': // Zenith Bank
        ussdCode = `*966*${amount}*${paymentRecord.payment_reference}#`;
        break;
      case '058': // GTBank
        ussdCode = `*737*${amount}*${paymentRecord.payment_reference}#`;
        break;
      case '011': // First Bank
        ussdCode = `*894*${amount}*${paymentRecord.payment_reference}#`;
        break;
      default:
        ussdCode = `*${bankCode}*${amount}*${paymentRecord.payment_reference}#`;
    }
    
    return { 
      success: true, 
      data: {
        ussdCode,
        paymentId: paymentRecord.id,
        reference: paymentRecord.payment_reference,
        instructions: 'Dial the USSD code on your phone to complete payment'
      }
    };
  } catch (error) {
    console.error('Error processing USSD payment:', error);
    return { success: false, error: 'Failed to process USSD payment' };
  }
};

/**
 * Process bank transfer payment
 * @param {object} paymentData - Payment data including amount, etc.
 * @returns {Promise<object>} Result with bank account details
 */
export const processBankTransferPayment = async (paymentData) => {
  try {
    const { amount, reference, metadata = {} } = paymentData;
    
    // In a real application, this would call a payment API to generate virtual account
    // For this example, we'll simulate the API call
    
    const { data: { user } } = await supabase.auth.getUser();

    // First, record the payment attempt in our database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: user?.id,
        amount,
        currency: 'NGN',
        payment_method: 'bank_transfer',
        payment_reference: reference || `BT_${Date.now()}`,
        payment_status: 'pending',
        payment_data: {
          metadata,
          initiated_at: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (paymentError) {
      console.error('Error recording bank transfer payment attempt:', paymentError);
      return { success: false, error: paymentError.message };
    }
    
    // Simulate bank account details
    const bankDetails = {
      bank_name: 'Excel Meet Bank',
      account_number: '0123456789',
      account_name: 'Excel Meet Nigeria Ltd',
      reference: paymentRecord.payment_reference
    };
    
    return { 
      success: true, 
      data: {
        ...bankDetails,
        paymentId: paymentRecord.id,
        instructions: 'Please use the reference code when making the transfer'
      }
    };
  } catch (error) {
    console.error('Error processing bank transfer payment:', error);
    return { success: false, error: 'Failed to process bank transfer payment' };
  }
};

/**
 * Verify payment status
 * @param {string} reference - Payment reference
 * @returns {Promise<object>} Payment verification result
 */
export const verifyPayment = async (reference) => {
  try {
    // In a real application, this would call the payment gateway's verification API
    // For this example, we'll check our database
    
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('payment_reference', reference)
      .single();
    
    if (error) {
      console.error('Error verifying payment:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: false, error: 'Payment not found' };
    }
    
    return { 
      success: true, 
      data: {
        verified: data.payment_status === 'successful',
        status: data.payment_status,
        amount: data.amount,
        currency: data.currency,
        paymentMethod: data.payment_method,
        reference: data.payment_reference,
        paymentData: data.payment_data
      }
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, error: 'Failed to verify payment' };
  }
};

/**
 * Update payment status
 * @param {string} reference - Payment reference
 * @param {string} status - New payment status
 * @param {object} paymentData - Additional payment data
 * @returns {Promise<object>} Result of the update
 */
export const updatePaymentStatus = async (reference, status, paymentData = {}) => {
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .update({
        payment_status: status,
        payment_data: supabase.rpc('jsonb_merge', {
          a: supabase.raw('payment_data'),
          b: {
            ...paymentData,
            updated_at: new Date().toISOString()
          }
        })
      })
      .eq('payment_reference', reference)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating payment status:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error: 'Failed to update payment status' };
  }
};

export default {
  initializePaystackPayment,
  initializeFlutterwavePayment,
  processUSSDPayment,
  processBankTransferPayment,
  verifyPayment,
  updatePaymentStatus
};