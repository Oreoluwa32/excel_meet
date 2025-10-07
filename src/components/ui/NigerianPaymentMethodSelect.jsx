import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

/**
 * Nigerian payment methods select component
 * Provides a select dropdown for Nigerian payment methods
 */
const NigerianPaymentMethodSelect = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select Payment Method',
  required = false,
  disabled = false,
  error = null,
  label = 'Payment Method',
  showLabel = true,
  id = 'payment-method-select'
}) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch Nigerian payment methods from the database
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        
        // Query the database for the enum values
        const { data, error } = await supabase
          .rpc('get_enum_values', { enum_name: 'nigerian_payment_method' });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setPaymentMethods(data);
        }
      } catch (error) {
        console.error('Error fetching Nigerian payment methods:', error);
        setFetchError('Failed to load payment methods. Please try again.');
        
        // Fallback to hardcoded list if database query fails
        setPaymentMethods([
          'bank_transfer', 'card', 'ussd', 'paystack', 'flutterwave', 'cash', 'wallet'
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle change event
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="form-control w-full">
      {showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={id}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${className} ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="" disabled>
          {loading ? 'Loading payment methods...' : placeholder}
        </option>
        
        {paymentMethods.map((method) => (
          <option key={method} value={method}>
            {formatPaymentMethod(method)}
          </option>
        ))}
      </select>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {fetchError && !error && (
        <p className="mt-1 text-sm text-amber-500">{fetchError}</p>
      )}
    </div>
  );
};

export default NigerianPaymentMethodSelect;