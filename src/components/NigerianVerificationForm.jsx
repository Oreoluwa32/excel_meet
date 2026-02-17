import React, { useState, useEffect } from 'react';
import { validateNIN, validateBVN, checkVerificationStatus } from '../utils/nigerianVerification';
import { useAuth } from '../contexts/AuthContext';
import NigerianStateSelect from './ui/NigerianStateSelect';
import { supabase } from '../utils/supabase';

/**
 * Nigerian verification form component
 * Integrates with MetaMap for automatic identity verification
 */
const NigerianVerificationForm = () => {
  const { user } = useAuth();
  
  // Form state
  const [verificationType, setVerificationType] = useState('NIN');
  const [verificationId, setVerificationId] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ninStatus, setNinStatus] = useState({ status: 'not_submitted' });
  const [bvnStatus, setBvnStatus] = useState({ status: 'not_submitted' });
  const [sdkLoaded, setSdkLoaded] = useState(false);
  
  // MetaMap Config - Using import.meta.env for Vite
  const METAMAP_CLIENT_ID = import.meta.env.VITE_METAMAP_CLIENT_ID;
  const METAMAP_FLOW_ID = import.meta.env.VITE_METAMAP_FLOW_ID;

  const loadMetaMapSDK = () => {
    const scriptId = 'metamap-sdk-script';
    
    if (window.MetaMap) {
      setSdkLoaded(true);
      setError(null);
      return;
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://web-button.metamap.com/button.js';
    script.async = true;
    script.onload = () => {
      console.log('MetaMap SDK Loaded');
      setSdkLoaded(true);
      setError(null);
    };
    script.onerror = () => {
      console.error('MetaMap SDK Load Error');
      setError('Failed to load verification SDK. Please check your internet connection.');
      setSdkLoaded(false);
    };
    document.body.appendChild(script);
  };

  // Load MetaMap SDK script
  useEffect(() => {
    loadMetaMapSDK();

    // Polling fallback
    const interval = setInterval(() => {
      if (window.MetaMap && !sdkLoaded) {
        setSdkLoaded(true);
        setError(null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  
  // Listen for MetaMap events
  useEffect(() => {
    const handleMetaMapVerified = async (event) => {
      console.log('MetaMap Verification Success:', event.detail);
      const { identityId, verificationId: metamapVid } = event.detail;
      
      setLoading(true);
      try {
        // First, clean up any previous failed attempts to keep the DB clean
        await supabase
          .from('nigeria_verification')
          .delete()
          .eq('user_id', user.id)
          .eq('verification_type', verificationType)
          .eq('is_verified', false);

        // ONLY save to database when verified
        const { error: dbError } = await supabase
          .from('nigeria_verification')
          .insert({
            user_id: user.id,
            verification_type: verificationType,
            verification_id: verificationId,
            verification_data: {
              metamap_identity_id: identityId,
              metamap_verification_id: metamapVid,
              verified_at: new Date().toISOString()
            },
            is_verified: true
          });

        if (dbError) throw dbError;

        // Update profile status as well
        if (verificationType === 'NIN') {
          await supabase.from('user_profiles').update({ nin_verified: true }).eq('id', user.id);
          setNinStatus({ status: 'verified' });
        } else {
          await supabase.from('user_profiles').update({ bvn_verified: true }).eq('id', user.id);
          setBvnStatus({ status: 'verified' });
        }

        setSuccess(`${verificationType} verified successfully!`);
        setError(null);
      } catch (err) {
        console.error('Error saving verification:', err);
        setError('Verification successful but failed to update your profile. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    const handleMetaMapFailed = (event) => {
      console.log('MetaMap Verification Failed:', event.detail);
      // We do NOT save failures to the database as requested
      setError('Verification failed. Please ensure your details match your document and try again.');
      setSuccess(null);
    };

    window.addEventListener('metamap:verified', handleMetaMapVerified);
    window.addEventListener('metamap:failed', handleMetaMapFailed);
    
    return () => {
      window.removeEventListener('metamap:verified', handleMetaMapVerified);
      window.removeEventListener('metamap:failed', handleMetaMapFailed);
    };
  }, [user, verificationType, verificationId]);
  
  // Load verification status on component mount
  useEffect(() => {
    const loadVerificationStatus = async () => {
      if (!user) return;
      
      const ninResult = await checkVerificationStatus('NIN');
      if (ninResult.success) setNinStatus(ninResult);
      
      const bvnResult = await checkVerificationStatus('BVN');
      if (bvnResult.success) setBvnStatus(bvnResult);
    };
    
    loadVerificationStatus();
  }, [user]);
  
  // Render verification status badge
  const renderStatusBadge = (status) => {
    if (status === 'verified') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Verified</span>;
    } else if (status === 'pending') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    } else if (status === 'rejected') {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Submitted</span>;
    }
  };
  
  const handleTryAgain = async () => {
    setLoading(true);
    try {
      // Clean up the rejected record from DB so it doesn't show up again
      await supabase
        .from('nigeria_verification')
        .delete()
        .eq('user_id', user.id)
        .eq('verification_type', verificationType)
        .eq('is_verified', false);

      setNinStatus({ status: 'not_submitted' });
      setBvnStatus({ status: 'not_submitted' });
      setError(null);
      setSuccess(null);
      setVerificationId('');
      
      // Retry loading SDK if it failed
      if (!sdkLoaded) {
        loadMetaMapSDK();
      }
    } catch (err) {
      console.error('Error during try again:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!METAMAP_CLIENT_ID || !METAMAP_FLOW_ID) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-700 font-medium">
            Verification system configuration missing.
          </p>
        </div>
      </div>
    );
  }

  const currentStatus = verificationType === 'NIN' ? ninStatus.status : bvnStatus.status;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Nigerian Identity Verification</h2>
      
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">NIN Status</h3>
          <div className="mt-1 flex items-center">
            {renderStatusBadge(ninStatus.status)}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">BVN Status</h3>
          <div className="mt-1 flex items-center">
            {renderStatusBadge(bvnStatus.status)}
          </div>
        </div>
      </div>
      
      {(ninStatus.status === 'verified' && bvnStatus.status === 'verified') ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Fully Verified</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your identity has been fully verified. You now have access to all features.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Verification Type</label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="verificationType"
                  value="NIN"
                  checked={verificationType === 'NIN'}
                  onChange={() => {
                    setVerificationType('NIN');
                    setVerificationId('');
                  }}
                  disabled={ninStatus.status === 'verified'}
                />
                <span className="ml-2">NIN (National ID)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="verificationType"
                  value="BVN"
                  checked={verificationType === 'BVN'}
                  onChange={() => {
                    setVerificationType('BVN');
                    setVerificationId('');
                  }}
                  disabled={bvnStatus.status === 'verified'}
                />
                <span className="ml-2">BVN (Bank Verification)</span>
              </label>
            </div>
          </div>
          
          {currentStatus === 'verified' ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-700">This identity has been verified.</p>
            </div>
          ) : (currentStatus === 'pending' || currentStatus === 'rejected') ? (
            <div className={`rounded-md p-4 ${currentStatus === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {currentStatus === 'rejected' ? (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${currentStatus === 'rejected' ? 'text-red-800' : 'text-yellow-800'}`}>
                    {currentStatus === 'rejected' ? 'Verification Failed' : 'Verification Pending'}
                  </h3>
                  <div className={`mt-2 text-sm ${currentStatus === 'rejected' ? 'text-red-700' : 'text-yellow-700'}`}>
                    <p>{currentStatus === 'rejected' ? (ninStatus.failure_reason || 'Identity verification failed.') : 'Your verification is being processed.'}</p>
                    <button onClick={handleTryAgain} className="mt-3 text-sm font-medium underline text-blue-600">Try Again</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700">
                  {verificationType === 'NIN' ? 'National Identification Number (NIN)' : 'Bank Verification Number (BVN)'}
                </label>
                <input
                  type="text"
                  id="verificationId"
                  value={verificationId}
                  onChange={(e) => setVerificationId(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder={`Enter 11-digit ${verificationType}`}
                  maxLength={11}
                />
              </div>

              {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{success}</div>}
              
              <div className="flex justify-center pt-2 min-h-[60px]" key={`${verificationType}-${verificationId}`}>
                {sdkLoaded && verificationId.length === 11 ? (
                  <metamap-button
                    clientid={METAMAP_CLIENT_ID}
                    flowid={METAMAP_FLOW_ID}
                    metadata={JSON.stringify({ userId: user?.id, verificationType, verificationId })}
                    className="w-full"
                    style={{ display: 'block', minHeight: '48px' }}
                  />
                ) : (
                  <div className="w-full h-12 bg-gray-50 border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-sm">
                    {verificationId.length < 11 ? `Please enter 11 digits to enable verification` : 'Loading Verification Button...'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NigerianVerificationForm;
