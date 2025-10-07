/**
 * Central export file for all utility functions
 * Allows for cleaner imports: import { logger, apiClient } from '@/utils'
 */

export { default as analytics } from './analytics';
export { default as apiClient } from './apiClient';
export { 
  formatCurrency, 
  formatNaira, 
  parseCurrencyValue, 
  getCurrencySymbol 
} from './currencyFormatter';
export { validateEnv } from './envValidator';
export { 
  AppError, 
  handleApiError, 
  handleError, 
  withErrorHandling 
} from './errorHandler';
export { default as healthCheck } from './healthCheck';
export { default as helpers } from './helpers';
export { default as logger } from './logger';
export { 
  measureRenderTime, 
  debounce, 
  throttle, 
  lazyLoad, 
  memoize, 
  monitorPageLoad, 
  detectSlowConnection, 
  reportWebVitals 
} from './performance';
export { 
  apiRateLimiter, 
  authRateLimiter, 
  searchRateLimiter, 
  uploadRateLimiter, 
  withRateLimit, 
  TokenBucket 
} from './rateLimiter';
export { 
  sanitizeInput, 
  validateEmail, 
  validateUrl, 
  checkPasswordStrength, 
  generateSecureToken, 
  validateFileUpload, 
  preventClickjacking, 
  RateLimiter as SecurityRateLimiter, 
  SecureStorage 
} from './security';
export { generateSitemap } from './sitemap';
export { 
  validateEmail as validateEmailField,
  validatePhoneNumber,
  validatePassword,
  validateUrl as validateUrlField,
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
} from './validation';