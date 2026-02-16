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
  const { user, userProfile } = useAuth();
  
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
  
  // MetaMap Config
  const METAMAP_CLIENT_ID = import.meta.env.VITE_METAMAP_CLIENT_ID;
  const METAMAP_FLOW_ID = import.meta.env.VITE_METAMAP_FLOW_ID;

  // Load MetaMap SDK script
  useEffect(() => {
    if (window.MetaMap) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://static.metamap.com/sdk/v1/index.js';
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup script if needed
    };
  }, []);

  // Listen for MetaMap events
  useEffect(() => {
    const handleMetaMapComplete = async (event) => {
      console.log('MetaMap Verification Completed:', event.detail);
      const { identityId, verificationId: metamapVid } = event.detail;
      
      setLoading(true);
      try {
        // Update database that verification is in progress/pending
        const { error: dbError } = await supabase
          .from('nigeria_verification')
          .insert({
            user_id: user.id,
            verification_type: verificationType,
            verification_id: verificationId,
            verification_data: {
              metamap_identity_id: identityId,
              metamap_verification_id: metamapVid,
              submitted_at: new Date().toISOString()
            },
            is_verified: false
          });

        if (dbError) throw dbError;

        setSuccess('Verification submitted! We are processing your identity.');
        if (verificationType === 'NIN') setNinStatus({ status: 'pending' });
        else setBvnStatus({ status: 'pending' });

      } catch (err) {
        console.error('Error saving verification:', err);
        setError('Failed to record verification submission.');
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('metamap:complete', handleMetaMapComplete);
    return () => window.removeEventListener('metamap:complete', handleMetaMapComplete);
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
  
  if (!METAMAP_CLIENT_ID || !METAMAP_FLOW_ID) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-700 font-medium">
            Verification system configuration missing. Please contact support.
          </p>
        </div>
      </div>
    );
  }

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
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
                  className="form-radio"
                  name="verificationType"
                  value="NIN"
                  checked={verificationType === 'NIN'}
                  onChange={() => setVerificationType('NIN')}
                  disabled={ninStatus.status === 'verified' || ninStatus.status === 'pending'}
                />
                <span className="ml-2">NIN (National ID)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="verificationType"
                  value="BVN"
                  checked={verificationType === 'BVN'}
                  onChange={() => setVerificationType('BVN')}
                  disabled={bvnStatus.status === 'verified' || bvnStatus.status === 'pending'}
                />
                <span className="ml-2">BVN (Bank Verification)</span>
              </label>
            </div>
          </div>
          
          {(verificationType === 'NIN' && (ninStatus.status === 'pending' || ninStatus.status === 'rejected')) || 
           (verificationType === 'BVN' && bvnStatus.status === 'pending') ? (
            <div className={`rounded-md p-4 ${
              (verificationType === 'NIN' && ninStatus.status === 'rejected') 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {verificationType === 'NIN' && ninStatus.status === 'rejected' ? (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    verificationType === 'NIN' && ninStatus.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {verificationType === 'NIN' && ninStatus.status === 'rejected' ? 'Verification Failed' : 'Verification Pending'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    verificationType === 'NIN' && ninStatus.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    <p>
                      {verificationType === 'NIN' && ninStatus.status === 'rejected' 
                        ? (ninStatus.failure_reason || 'Your NIN verification was rejected. Please check your details and try again.')
                        : `Your ${verificationType} verification is currently being processed. This may take 24-48 hours.`}
                    </p>
                    {verificationType === 'NIN' && ninStatus.status === 'rejected' && (
                      <button
                        type="button"
                        onClick={() => setNinStatus({ status: 'not_submitted' })}
                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 underline"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="verificationId" className="block text-sm font-medium text-gray-700">
                  {verificationType === 'NIN' ? 'National Identification Number (NIN)' : 'Bank Verification Number (BVN)'}
                </label>
                <input
                  type="text"
                  id="verificationId"
                  value={verificationId}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setVerificationId(val);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder={verificationType === 'NIN' ? 'Enter 11-digit NIN' : 'Enter 11-digit BVN'}
                  maxLength={11}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              
              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}
              
              <div className="flex justify-center py-4">
                {sdkLoaded ? (
                  <metamap-button
                    clientid={METAMAP_CLIENT_ID}
                    flowid={METAMAP_FLOW_ID}
                    metadata={JSON.stringify({
                      userId: user?.id,
                      verificationType,
                      verificationId
                    })}
                    className="w-full"
                  />
                ) : (
                  <div className="animate-pulse bg-gray-200 h-10 w-full rounded-md flex items-center justify-center text-gray-400">
                    Loading Verification Button...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NigerianVerificationForm;
