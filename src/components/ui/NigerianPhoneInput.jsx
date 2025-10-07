import React, { useState } from 'react';

/**
 * Nigerian phone number input component with validation
 * Supports common Nigerian phone number formats
 */
const NigerianPhoneInput = ({
  value,
  onChange,
  className = '',
  placeholder = 'Enter phone number',
  required = false,
  disabled = false,
  error = null,
  label = 'Phone Number',
  showLabel = true,
  id = 'phone-input',
  helpText = 'Format: 0801234567 or +2348012345678'
}) => {
  const [localError, setLocalError] = useState(null);

  // Validate Nigerian phone number
  const validateNigerianPhone = (phone) => {
    if (!phone) return true; // Empty is valid unless required
    
    // Nigerian phone number patterns
    // 1. Starting with 0 followed by 10 digits (e.g., 0801234567)
    // 2. Starting with +234 followed by 10 digits (e.g., +2348012345678)
    // 3. Starting with 234 followed by 10 digits (e.g., 2348012345678)
    const nigerianPhoneRegex = /^(0|\+234|234)?[789][01]\d{8}$/;
    
    return nigerianPhoneRegex.test(phone);
  };

  // Handle change event
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Validate as user types
    if (!validateNigerianPhone(newValue)) {
      setLocalError('Please enter a valid Nigerian phone number');
    } else {
      setLocalError(null);
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };

  // Handle blur event for final validation
  const handleBlur = (e) => {
    const currentValue = e.target.value;
    
    if (currentValue && !validateNigerianPhone(currentValue)) {
      setLocalError('Please enter a valid Nigerian phone number');
    } else {
      setLocalError(null);
    }
  };

  return (
    <div className="form-control w-full">
      {showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <input
        type="tel"
        id={id}
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${className} ${
          (error || localError) ? 'border-red-500' : ''
        }`}
      />
      
      {helpText && !error && !localError && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      
      {(error || localError) && (
        <p className="mt-1 text-sm text-red-500">{error || localError}</p>
      )}
    </div>
  );
};

export default NigerianPhoneInput;