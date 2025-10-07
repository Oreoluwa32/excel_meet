/**
 * Form validation utilities for Excel Meet
 * Provides comprehensive validation functions for user inputs
 */

import { sanitizeInput } from './security';

/**
 * Validation result object
 */
class ValidationResult {
  constructor(isValid, errors = {}) {
    this.isValid = isValid;
    this.errors = errors;
  }

  addError(field, message) {
    this.errors[field] = message;
    this.isValid = false;
  }

  getError(field) {
    return this.errors[field];
  }

  hasError(field) {
    return !!this.errors[field];
  }
}

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid email address'
  };
};

/**
 * Validate Nigerian phone number
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return { isValid: false, message: 'Phone number is required' };
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Nigerian number (11 digits starting with 0, or 10 digits)
  const isValid = (cleaned.length === 11 && cleaned.startsWith('0')) || cleaned.length === 10;
  
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid Nigerian phone number (e.g., 08012345678)'
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;

  const errors = [];

  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'none' };
  }

  if (password.length < minLength) {
    errors.push(`at least ${minLength} characters`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character');
  }

  // Calculate password strength
  let strength = 'weak';
  if (password.length >= 12 && errors.length === 0) {
    strength = 'strong';
  } else if (password.length >= 8 && errors.length <= 1) {
    strength = 'medium';
  }

  const isValid = errors.length === 0;
  const message = isValid ? '' : `Password must contain ${errors.join(', ')}`;

  return { isValid, message, strength };
};

/**
 * Validate URL format
 */
export const validateUrl = (url, options = {}) => {
  const { requireHttps = false, allowLocalhost = true } = options;

  if (!url) return { isValid: false, message: 'URL is required' };

  try {
    const urlObj = new URL(url);
    
    if (requireHttps && urlObj.protocol !== 'https:') {
      return { isValid: false, message: 'URL must use HTTPS protocol' };
    }

    if (!allowLocalhost && (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1')) {
      return { isValid: false, message: 'Localhost URLs are not allowed' };
    }

    return { isValid: true, message: '' };
  } catch (error) {
    return { isValid: false, message: 'Please enter a valid URL' };
  }
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName = 'This field') => {
  const isValid = value !== null && value !== undefined && value !== '';
  
  return {
    isValid,
    message: isValid ? '' : `${fieldName} is required`
  };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value) return { isValid: false, message: `${fieldName} is required` };
  
  const isValid = value.length >= minLength;
  
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must be at least ${minLength} characters`
  };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (!value) return { isValid: true, message: '' };
  
  const isValid = value.length <= maxLength;
  
  return {
    isValid,
    message: isValid ? '' : `${fieldName} must not exceed ${maxLength} characters`
  };
};

/**
 * Validate number range
 */
export const validateRange = (value, min, max, fieldName = 'This field') => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid number` };
  }

  if (num < min || num > max) {
    return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate date format and range
 */
export const validateDate = (dateString, options = {}) => {
  const { minDate, maxDate, allowFuture = true, allowPast = true } = options;

  if (!dateString) return { isValid: false, message: 'Date is required' };

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }

  const now = new Date();
  
  if (!allowFuture && date > now) {
    return { isValid: false, message: 'Future dates are not allowed' };
  }

  if (!allowPast && date < now) {
    return { isValid: false, message: 'Past dates are not allowed' };
  }

  if (minDate && date < new Date(minDate)) {
    return { isValid: false, message: `Date must be after ${minDate}` };
  }

  if (maxDate && date > new Date(maxDate)) {
    return { isValid: false, message: `Date must be before ${maxDate}` };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate file upload
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;

  if (!file) return { isValid: false, message: 'Please select a file' };

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { isValid: false, message: `File size must not exceed ${maxSizeMB}MB` };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (allowedExtensions.length > 0 && !allowedExtensions.includes(extension)) {
    return { isValid: false, message: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}` };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate Nigerian BVN (Bank Verification Number)
 */
export const validateBVN = (bvn) => {
  if (!bvn) return { isValid: false, message: 'BVN is required' };
  
  const cleaned = bvn.replace(/\D/g, '');
  const isValid = cleaned.length === 11;
  
  return {
    isValid,
    message: isValid ? '' : 'BVN must be exactly 11 digits'
  };
};

/**
 * Validate Nigerian NIN (National Identification Number)
 */
export const validateNIN = (nin) => {
  if (!nin) return { isValid: false, message: 'NIN is required' };
  
  const cleaned = nin.replace(/\D/g, '');
  const isValid = cleaned.length === 11;
  
  return {
    isValid,
    message: isValid ? '' : 'NIN must be exactly 11 digits'
  };
};

/**
 * Validate LinkedIn profile URL
 */
export const validateLinkedInUrl = (url) => {
  if (!url) return { isValid: false, message: 'LinkedIn URL is required' };
  
  const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9_-]+\/?$/;
  const isValid = linkedInRegex.test(url);
  
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid LinkedIn profile URL'
  };
};

/**
 * Validate form with multiple fields
 */
export const validateForm = (formData, validationRules) => {
  const result = new ValidationResult(true, {});

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];

    // Check required
    if (rules.required) {
      const validation = validateRequired(value, rules.label || field);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return;

    // Check email
    if (rules.email) {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check phone
    if (rules.phone) {
      const validation = validatePhoneNumber(value);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check password
    if (rules.password) {
      const validation = validatePassword(value, rules.passwordOptions);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check URL
    if (rules.url) {
      const validation = validateUrl(value, rules.urlOptions);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check min length
    if (rules.minLength) {
      const validation = validateMinLength(value, rules.minLength, rules.label || field);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check max length
    if (rules.maxLength) {
      const validation = validateMaxLength(value, rules.maxLength, rules.label || field);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check range
    if (rules.min !== undefined && rules.max !== undefined) {
      const validation = validateRange(value, rules.min, rules.max, rules.label || field);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }

    // Check custom validation
    if (rules.custom) {
      const validation = rules.custom(value, formData);
      if (!validation.isValid) {
        result.addError(field, validation.message);
        return;
      }
    }
  });

  return result;
};

/**
 * Sanitize and validate user input
 */
export const sanitizeAndValidate = (value, validationType) => {
  // First sanitize
  const sanitized = sanitizeInput(value);

  // Then validate based on type
  switch (validationType) {
    case 'email':
      return { ...validateEmail(sanitized), value: sanitized };
    case 'phone':
      return { ...validatePhoneNumber(sanitized), value: sanitized };
    case 'url':
      return { ...validateUrl(sanitized), value: sanitized };
    default:
      return { isValid: true, message: '', value: sanitized };
  }
};

export default {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateUrl,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateRange,
  validateDate,
  validateFile,
  validateBVN,
  validateNIN,
  validateLinkedInUrl,
  validateForm,
  sanitizeAndValidate,
  ValidationResult
};