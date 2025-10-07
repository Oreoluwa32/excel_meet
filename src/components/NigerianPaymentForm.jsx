import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatNaira } from '../utils/currencyFormatter';
import NigerianPaymentMethodSelect from './ui/NigerianPaymentMethodSelect';
import {
  initializePaystackPayment,
  initializeFlutterwavePayment,
  processUSSDPayment,
  processBankTransferPayment,
  verifyPayment
} from '../utils/nigerianPayments';

/**
 * Nigerian payment form component
 * Allows users to make payments using Nigerian payment methods
 */
const NigerianPaymentForm = ({
  amount,
  description,
  onSuccess,
  onCancel,
  metadata = {}
}) => {
  const { user, userProfile } = useAuth();
  
  // Form state
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  
  // Pre-fill form with user profile data if available
  useEffect(() => {
    if (userProfile) {
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
      setName(userProfile.full_name || '');
    }
  }, [userProfile]);
  
  // Nigerian bank codes for USSD
  const bankCodes = [
    { code: '057', name: 'Zenith Bank' },
    { code: '058', name: 'GTBank' },
    { code: '011', name: 'First Bank' },
    { code: '044', name: 'Access Bank' },
    { code: '033', name: 'UBA' },
    { code: '050', name: 'Ecobank' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '221', name: 'Stanbic IBTC' },
    { code: '101', name: 'Providus Bank' },
    { code: '232', name: 'Sterling Bank' }
  ];
  
  // Validate form based on payment method
  const validateForm = () => {
    setError(null);
    
    if (!paymentMethod) {
      setError('Please select a payment method');
      return false;
    }
    
    if (paymentMethod === 'paystack' || paymentMethod === 'flutterwave') {
      if (!email) {
        setError('Email is required for card payments');
        return false;
      }
    }
    
    if (paymentMethod === 'flutterwave') {
      if (!name) {
        setError('Name is required for Flutterwave payments');
        return false;
      }
      
      if (!phone) {
        setError('Phone number is required for Flutterwave payments');
        return false;
      }
    }
    
    if (paymentMethod === 'ussd') {
      if (!bankCode) {
        setError('Please select a bank for USSD payment');
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
    setPaymentDetails(null);
    
    try {
      const reference = `EM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      let result;
      
      switch (paymentMethod) {
        case 'paystack':
          result = await initializePaystackPayment({
            amount: amount * 100, // Paystack expects amount in kobo
            email,
            reference,
            metadata: {
              ...metadata,
              description
            }
          });
          break;
          
        case 'flutterwave':
          result = await initializeFlutterwavePayment({
            amount,
            email,
            name,
            phone,
            reference,
            metadata: {
              ...metadata,
              description
            }
          });
          break;
          
        case 'ussd':
          result = await processUSSDPayment({
            amount,
            bankCode,
            reference,
            metadata: {
              ...metadata,
              description
            }
          });
          break;
          
        case 'bank_transfer':
          result = await processBankTransferPayment({
            amount,
            reference,
            metadata: {
              ...metadata,
              description
            }
          });
          break;
          
        default:
          setError('Unsupported payment method');
          setLoading(false);
          return;
      }
      
      if (result.success) {
        setPaymentReference(result.data.reference);
        setPaymentDetails(result.data);
        
        // For redirect payment methods
        if (paymentMethod === 'paystack' || paymentMethod === 'flutterwave') {
          // In a real application, we would redirect to the payment page
          // For this example, we'll just show the URL
          console.log('Redirect to:', result.data.link || result.data.authorization_url);
        }
      } else {
        setError(result.error || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle payment verification
  const handleVerifyPayment = async () => {
    if (!paymentReference) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await verifyPayment(paymentReference);
      
      if (result.success && result.data.verified) {
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError('Payment verification failed. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Failed to verify payment status');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  // Render payment details based on method
  const renderPaymentDetails = () => {
    if (!paymentDetails) return null;
    
    switch (paymentMethod) {
      case 'ussd':
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">USSD Payment</h3>
            <p className="mt-2 text-sm text-gray-600">Dial the following code on your phone:</p>
            <div className="mt-2 p-3 bg-white rounded border border-gray-300 text-center">
              <span className="text-lg font-mono font-bold">{paymentDetails.ussdCode}</span>
            </div>
            <p className="mt-2 text-xs text-gray-500">{paymentDetails.instructions}</p>
            <button
              type="button"
              onClick={handleVerifyPayment}
              className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              I've Completed the Payment
            </button>
          </div>
        );
        
      case 'bank_transfer':
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Bank Transfer Details</h3>
            <dl className="mt-2 divide-y divide-gray-200">
              <div className="py-2 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Bank Name</dt>
                <dd className="text-sm font-medium text-gray-900">{paymentDetails.bank_name}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Account Number</dt>
                <dd className="text-sm font-medium text-gray-900">{paymentDetails.account_number}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Account Name</dt>
                <dd className="text-sm font-medium text-gray-900">{paymentDetails.account_name}</dd>
              </div>
              <div className="py-2 flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Reference</dt>
                <dd className="text-sm font-medium text-gray-900">{paymentDetails.reference}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-gray-500">{paymentDetails.instructions}</p>
            <button
              type="button"
              onClick={handleVerifyPayment}
              className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              I've Completed the Transfer
            </button>
          </div>
        );
        
      case 'paystack':
      case 'flutterwave':
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">
              {paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'} Payment
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Click the button below to proceed to the payment page:
            </p>
            <a
              href={paymentDetails.link || paymentDetails.authorization_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Proceed to Payment
            </a>
            <button
              type="button"
              onClick={handleVerifyPayment}
              className="mt-2 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              I've Completed the Payment
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Payment</h2>
        <span className="text-xl font-bold text-primary">{formatNaira(amount)}</span>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      
      {!paymentDetails ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <NigerianPaymentMethodSelect
            value={paymentMethod}
            onChange={setPaymentMethod}
            required
          />
          
          {paymentMethod === 'ussd' && (
            <div>
              <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700">Select Bank</label>
              <select
                id="bankCode"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              >
                <option value="">Select Bank</option>
                {bankCodes.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {(paymentMethod === 'paystack' || paymentMethod === 'flutterwave') && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
          )}
          
          {paymentMethod === 'flutterwave' && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>
            </>
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
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !paymentMethod}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      ) : (
        <>
          {renderPaymentDetails()}
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
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
          
          <button
            type="button"
            onClick={handleCancel}
            className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel Payment
          </button>
        </>
      )}
    </div>
  );
};

export default NigerianPaymentForm;