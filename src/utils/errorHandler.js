/**
 * Global error handler utility
 * Provides consistent error handling across the application
 */

import { logger } from './logger';

/**
 * Error types for categorization
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION: 'PERMISSION_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, statusCode = 500, details = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse error from various sources
 */
export const parseError = (error) => {
  // Handle AppError
  if (error instanceof AppError) {
    return error;
  }

  // Handle Supabase errors
  if (error?.message && error?.status) {
    const type = error.status === 401 ? ErrorTypes.AUTH : ErrorTypes.SERVER;
    return new AppError(error.message, type, error.status, { original: error });
  }

  // Handle Axios errors
  if (error?.response) {
    const status = error.response.status;
    let type = ErrorTypes.SERVER;

    if (status === 401 || status === 403) type = ErrorTypes.AUTH;
    else if (status === 404) type = ErrorTypes.NOT_FOUND;
    else if (status === 422) type = ErrorTypes.VALIDATION;

    return new AppError(
      error.response.data?.message || error.message || 'An error occurred',
      type,
      status,
      { response: error.response.data }
    );
  }

  // Handle network errors
  if (error?.message === 'Network Error' || !navigator.onLine) {
    return new AppError(
      'Network connection error. Please check your internet connection.',
      ErrorTypes.NETWORK,
      0
    );
  }

  // Handle generic errors
  return new AppError(
    error?.message || 'An unexpected error occurred',
    ErrorTypes.UNKNOWN,
    500,
    { original: error }
  );
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  const parsedError = parseError(error);

  const messages = {
    [ErrorTypes.NETWORK]: 'Unable to connect. Please check your internet connection and try again.',
    [ErrorTypes.AUTH]: 'Authentication failed. Please log in again.',
    [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
    [ErrorTypes.NOT_FOUND]: 'The requested resource was not found.',
    [ErrorTypes.PERMISSION]: 'You do not have permission to perform this action.',
    [ErrorTypes.SERVER]: 'A server error occurred. Please try again later.',
    [ErrorTypes.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };

  return parsedError.message || messages[parsedError.type] || messages[ErrorTypes.UNKNOWN];
};

/**
 * Handle error globally
 */
export const handleError = (error, context = {}) => {
  const parsedError = parseError(error);
  
  // Log the error
  logger.error(parsedError.message, parsedError, {
    ...context,
    type: parsedError.type,
    statusCode: parsedError.statusCode
  });

  return parsedError;
};

/**
 * Create error handler for async operations
 */
export const asyncErrorHandler = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, { function: fn.name });
    }
  };
};

/**
 * Handle API errors specifically
 */
export const handleApiError = (error, endpoint = '') => {
  const parsedError = handleError(error, { endpoint });
  
  // Return structured error response
  return {
    success: false,
    error: {
      message: getUserFriendlyMessage(parsedError),
      type: parsedError.type,
      statusCode: parsedError.statusCode,
      details: import.meta.env.DEV ? parsedError.details : undefined
    }
  };
};

export default {
  AppError,
  ErrorTypes,
  parseError,
  getUserFriendlyMessage,
  handleError,
  asyncErrorHandler,
  handleApiError
};