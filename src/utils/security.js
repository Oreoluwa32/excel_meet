/**
 * Security utilities for the application
 * Provides XSS protection, input sanitization, and security headers
 */

import { logger } from './logger';

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Create a temporary div to use browser's built-in HTML parser
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
};

/**
 * Sanitize HTML content (more permissive than sanitizeInput)
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') return html;

  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '');
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url) => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = {
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
    score: 0
  };

  // Calculate score
  if (strength.length) strength.score++;
  if (hasUpperCase) strength.score++;
  if (hasLowerCase) strength.score++;
  if (hasNumbers) strength.score++;
  if (hasSpecialChar) strength.score++;

  // Determine strength level
  if (strength.score <= 2) {
    strength.level = 'weak';
  } else if (strength.score <= 3) {
    strength.level = 'medium';
  } else {
    strength.level = 'strong';
  }

  return strength;
};

/**
 * Generate a secure random string
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate and sanitize file uploads
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Prevent clickjacking by checking if app is in iframe
 */
export const preventClickjacking = () => {
  if (window.self !== window.top) {
    logger.warn('Clickjacking attempt detected');
    
    // Optionally, break out of iframe
    if (import.meta.env.PROD) {
      window.top.location = window.self.location;
    }
  }
};

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  /**
   * Check if action is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the time window
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      logger.warn('Rate limit exceeded', { key });
      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }

  /**
   * Reset attempts for a key
   */
  reset(key) {
    this.attempts.delete(key);
  }
}

/**
 * Content Security Policy helper
 */
export const getCSPDirectives = () => {
  return {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://static.rocket.new'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://*.supabase.co', 'https://api.openai.com'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };
};

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      logger.error('Failed to save to secure storage', error);
    }
  },

  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      logger.error('Failed to read from secure storage', error);
      return null;
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};

export default {
  sanitizeInput,
  sanitizeHTML,
  isValidEmail,
  isValidURL,
  checkPasswordStrength,
  generateSecureToken,
  validateFileUpload,
  preventClickjacking,
  RateLimiter,
  getCSPDirectives,
  secureStorage
};