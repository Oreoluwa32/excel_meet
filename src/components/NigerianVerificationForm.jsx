import React, { useState, useEffect } from 'react';
import { validateNIN, validateBVN, submitNINVerification, submitBVNVerification, checkVerificationStatus } from '../utils/nigerianVerification';
import { useAuth } from '../contexts/AuthContext';
import NigerianStateSelect from './ui/NigerianStateSelect';

/**
 * Nigerian verification form component
 * Allows users to submit their NIN or BVN for verification
 */
const NigerianVerificationForm = () => {
  const { user, userProfile, updateProfile } = useAuth();
  
  // Form state
  const [verificationType, setVerificationType] = useState('NIN');
  const [verificationId, setVerificationId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [state, setState] = useState('');
  const [ninFile, setNinFile] = useState(null);
  const [ninFilePreview, setNinFilePreview] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ninStatus, setNinStatus] = useState({ status: 'not_submitted' });
  const [bvnStatus, setBvnStatus] = useState({ status: 'not_submitted' });
  
  // Load verification status on component mount
  useEffect(() => {
    const loadVerificationStatus = async () => {
      if (!user) return;
      
      // Check NIN status
      const ninResult = await checkVerificationStatus('NIN');
      if (ninResult.success) {
        setNinStatus(ninResult);
      }
      
      // Check BVN status
      const bvnResult = await checkVerificationStatus('BVN');
      if (bvnResult.success) {
        setBvnStatus(bvnResult);
      }
    };
    
    loadVerificationStatus();
  }, [user]);
  
  // Pre-fill form with user profile data if available
  useEffect(() => {
    if (userProfile) {
      const nameParts = userProfile.full_name?.split(' ') || [];
      if (nameParts.length > 0) {
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
      }
      
      if (userProfile.state) {
        setState(userProfile.state);
      }
    }
  }, [userProfile]);
  
  // Validate form based on verification type
  const validateForm = () => {
    setError(null);
    
    if (!firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    
    if (!state) {
      setError('State is required');
      return false;
    }
    
    if (verificationType === 'NIN') {
      if (!validateNIN(verificationId)) {
        setError('Please enter a valid 11-digit NIN');
        return false;
      }
      if (!ninFile) {
        setError('Please upload a clear image of your NIN document');
        return false;
      }
    } else if (verificationType === 'BVN') {
      if (!validateBVN(verificationId)) {
        setError('Please enter a valid 11-digit BVN');
        return false;
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const userData = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        state
      };
      
      let result;
      
      if (verificationType === 'NIN') {
        result = await submitNINVerification(verificationId, ninFile, userData);
        if (result.success) {
          if (result.verified) {
            setNinStatus({ status: 'verified' });
            setSuccess('NIN verified successfully!');
          } else {
            setNinStatus({ status: 'rejected', failure_reason: result.error });
            setError(result.error);
          }
        }
      } else if (verificationType === 'BVN') {
        result = await submitBVNVerification(verificationId, userData);
        if (result.success) {
          setBvnStatus({ status: 'pending' });
          setSuccess(result.message || 'BVN verification submitted successfully');
        }
      }
      
      if (result.success && result.verified) {
        setVerificationId('');
        setNinFile(null);
        setNinFilePreview(null);
      } else if (!result.success) {
        setError(result.error || 'Verification submission failed');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <NigerianStateSelect
                    value={state}
                    onChange={setState}
                    required
                  />
                </div>
              </div>
              
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
                <p className="mt-1 text-xs text-gray-500">
                  {verificationType === 'NIN' 
                    ? 'Your 11-digit National Identification Number' 
                    : 'Your 11-digit Bank Verification Number'}
                </p>
              </div>

              {verificationType === 'NIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIN Document Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {ninFilePreview ? (
                        <div className="relative inline-block">
                          <img src={ninFilePreview} alt="NIN Preview" className="h-32 w-auto rounded-md" />
                          <button
                            type="button"
                            onClick={() => {
                              setNinFile(null);
                              setNinFilePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="nin-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                              <span>Upload a file</span>
                              <input
                                id="nin-upload"
                                name="nin-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setNinFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setNinFilePreview(reader.result);
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Ensure the image is clear and shows all four corners of the document.
                  </p>
                </div>
              )}
              
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Success</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>{success}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {loading ? 'Submitting...' : `Submit ${verificationType} for Verification`}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
};

export default NigerianVerificationForm;