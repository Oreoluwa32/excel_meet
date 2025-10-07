/**
 * Nigerian verification utility for Excel Meet
 * Provides functions for validating Nigerian-specific IDs (NIN, BVN)
 * and handling verification processes
 */
import { supabase } from './supabase';

/**
 * Validate a Nigerian National Identification Number (NIN)
 * @param {string} nin - The NIN to validate
 * @returns {boolean} Whether the NIN is valid
 */
export const validateNIN = (nin) => {
  if (!nin) return false;
  
  // NIN is 11 digits
  const ninRegex = /^\d{11}$/;
  return ninRegex.test(nin);
};

/**
 * Validate a Bank Verification Number (BVN)
 * @param {string} bvn - The BVN to validate
 * @returns {boolean} Whether the BVN is valid
 */
export const validateBVN = (bvn) => {
  if (!bvn) return false;
  
  // BVN is 11 digits
  const bvnRegex = /^\d{11}$/;
  return bvnRegex.test(bvn);
};

/**
 * Submit NIN for verification
 * @param {string} nin - The NIN to verify
 * @param {object} userData - Additional user data for verification
 * @returns {Promise<object>} Result of the verification request
 */
export const submitNINVerification = async (nin, userData = {}) => {
  try {
    if (!validateNIN(nin)) {
      return { success: false, error: 'Invalid NIN format' };
    }
    
    // In a real application, this would call an external verification API
    // For this example, we'll just store the verification request
    
    const { data, error } = await supabase
      .from('nigeria_verification')
      .insert({
        user_id: supabase.auth.user()?.id,
        verification_type: 'NIN',
        verification_id: nin,
        verification_data: {
          ...userData,
          submitted_at: new Date().toISOString()
        },
        is_verified: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting NIN verification:', error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data,
      message: 'NIN verification submitted successfully. We will notify you once verified.' 
    };
  } catch (error) {
    console.error('Error in NIN verification process:', error);
    return { success: false, error: 'An unexpected error occurred during verification' };
  }
};

/**
 * Submit BVN for verification
 * @param {string} bvn - The BVN to verify
 * @param {object} userData - Additional user data for verification
 * @returns {Promise<object>} Result of the verification request
 */
export const submitBVNVerification = async (bvn, userData = {}) => {
  try {
    if (!validateBVN(bvn)) {
      return { success: false, error: 'Invalid BVN format' };
    }
    
    // In a real application, this would call an external verification API
    // For this example, we'll just store the verification request
    
    const { data, error } = await supabase
      .from('nigeria_verification')
      .insert({
        user_id: supabase.auth.user()?.id,
        verification_type: 'BVN',
        verification_id: bvn,
        verification_data: {
          ...userData,
          submitted_at: new Date().toISOString()
        },
        is_verified: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting BVN verification:', error);
      return { success: false, error: error.message };
    }
    
    return { 
      success: true, 
      data,
      message: 'BVN verification submitted successfully. We will notify you once verified.' 
    };
  } catch (error) {
    console.error('Error in BVN verification process:', error);
    return { success: false, error: 'An unexpected error occurred during verification' };
  }
};

/**
 * Check verification status
 * @param {string} verificationType - Type of verification (NIN, BVN)
 * @returns {Promise<object>} Verification status
 */
export const checkVerificationStatus = async (verificationType) => {
  try {
    const { data, error } = await supabase
      .from('nigeria_verification')
      .select('*')
      .eq('user_id', supabase.auth.user()?.id)
      .eq('verification_type', verificationType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error(`Error checking ${verificationType} verification status:`, error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      return { success: true, verified: false, status: 'not_submitted' };
    }
    
    return { 
      success: true, 
      verified: data.is_verified,
      status: data.is_verified ? 'verified' : 'pending',
      data
    };
  } catch (error) {
    console.error(`Error checking ${verificationType} verification status:`, error);
    return { success: false, error: 'Failed to check verification status' };
  }
};

export default {
  validateNIN,
  validateBVN,
  submitNINVerification,
  submitBVNVerification,
  checkVerificationStatus
};