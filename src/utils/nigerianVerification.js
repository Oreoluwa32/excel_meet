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
 * Check verification status
 * @param {string} verificationType - Type of verification (NIN, BVN)
 * @returns {Promise<object>} Verification status
 */
export const checkVerificationStatus = async (verificationType) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('nigerian_verification')
      .select('*')
      .eq('user_id', user.id)
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
      status: data.is_verified ? 'verified' : (data.failure_reason ? 'rejected' : 'pending'),
      failure_reason: data.failure_reason,
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
  checkVerificationStatus
};
