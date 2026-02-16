/**
 * Nigerian verification utility for Excel Meet
 * Provides functions for validating Nigerian-specific IDs (NIN, BVN)
 * and handling verification processes
 */
import { supabase } from './supabase';
import axios from 'axios';

/**
 * Upload verification document to storage
 * @param {File} file - The file to upload
 * @param {string} userId - The user ID
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadVerificationDocument = async (file, userId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;
    const filePath = `nin-verifications/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading verification document:', error);
    throw error;
  }
};

/**
 * Call MetaMap API for NIN verification
 * Note: This is a robust implementation template. Replace with actual MetaMap SDK or API calls.
 */
const verifyWithMetaMap = async (nin, documentUrl, userData) => {
  // MetaMap Credentials from environment variables
  const clientId = import.meta.env.VITE_METAMAP_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_METAMAP_CLIENT_SECRET;
  const flowId = import.meta.env.VITE_METAMAP_FLOW_ID;

  if (!clientId || !clientSecret) {
    console.warn('MetaMap credentials missing, using mock verification');
    // Mock successful verification for 11111111111
    if (nin === '11111111111') {
      return { success: true, verified: true };
    }
    // Mock failure for others
    return { 
      success: true, 
      verified: false, 
      reason: 'NIN records do not match the provided document or information.' 
    };
  }

  try {
    // 1. Get Access Token
    const authResponse = await axios.post('https://api.metamap.com/oauth', {
      grant_type: 'client_credentials'
    }, {
      headers: {
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const accessToken = authResponse.data.access_token;

    // 2. Create Verification
    const verificationResponse = await axios.post('https://api.metamap.com/v2/verifications', {
      flowId,
      metadata: {
        userId: userData.userId,
        nin: nin
      },
      inputs: [
        {
          inputType: 'document-photo',
          data: {
            type: 'national-id',
            country: 'NG',
            page: 'front',
            url: documentUrl
          }
        },
        {
          inputType: 'gov-check',
          data: {
            type: 'nin',
            number: nin
          }
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return {
      success: true,
      verified: verificationResponse.data.status === 'verified',
      reason: verificationResponse.data.failureReason || null
    };
  } catch (error) {
    console.error('MetaMap API error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to communicate with verification provider' 
    };
  }
};

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
 * @param {File} documentFile - The NIN document image
 * @param {object} userData - Additional user data for verification
 * @returns {Promise<object>} Result of the verification request
 */
export const submitNINVerification = async (nin, documentFile, userData = {}) => {
  try {
    if (!validateNIN(nin)) {
      return { success: false, error: 'Invalid NIN format. Must be 11 digits.' };
    }

    if (!documentFile) {
      return { success: false, error: 'NIN document image is required.' };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // 1. Upload document to Supabase Storage
    const documentUrl = await uploadVerificationDocument(documentFile, user.id);
    
    // 2. Call MetaMap API
    const verificationResult = await verifyWithMetaMap(nin, documentUrl, { ...userData, userId: user.id });

    if (!verificationResult.success) {
      return { success: false, error: verificationResult.error };
    }
    
    // 3. Store the verification result in the database
    const { data, error } = await supabase
      .from('nigeria_verification')
      .insert({
        user_id: user.id,
        verification_type: 'NIN',
        verification_id: nin,
        verification_data: {
          ...userData,
          document_url: documentUrl,
          submitted_at: new Date().toISOString()
        },
        is_verified: verificationResult.verified,
        failure_reason: verificationResult.reason
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving NIN verification result:', error);
      return { success: false, error: error.message };
    }

    // 4. Update user profile nin_verified status
    if (verificationResult.verified) {
      await supabase
        .from('user_profiles')
        .update({ nin_verified: true })
        .eq('id', user.id);
    }
    
    if (verificationResult.verified) {
      return { 
        success: true, 
        verified: true,
        data,
        message: 'NIN verified successfully!' 
      };
    } else {
      return { 
        success: true, 
        verified: false,
        data,
        error: verificationResult.reason || 'Verification failed. Please ensure the information is correct and the image is clear.'
      };
    }
  } catch (error) {
    console.error('Error in NIN verification process:', error);
    return { success: false, error: error.message || 'An unexpected error occurred during verification' };
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
  submitNINVerification,
  submitBVNVerification,
  checkVerificationStatus
};