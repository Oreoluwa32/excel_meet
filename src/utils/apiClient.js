/**
 * Centralized API client with interceptors and error handling
 */

import axios from 'axios';
import { logger } from './logger';
import { handleApiError } from './errorHandler';
import { getEnvConfig } from './envValidator';

const config = getEnvConfig();

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  timeout: config.app.timeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Request interceptor
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('supabase.auth.token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    logger.logApiRequest(config.method?.toUpperCase(), config.url, config.data);

    // Add request timestamp
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    logger.error('API Request Error', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 */
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;

    // Log response in development
    logger.logApiResponse(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      response.data
    );

    // Log slow requests
    if (duration > 3000) {
      logger.warn('Slow API request detected', {
        url: response.config.url,
        duration: `${duration}ms`
      });
    }

    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401) {
        logger.warn('Unauthorized request, redirecting to login');
        // Clear auth data
        localStorage.removeItem('supabase.auth.token');
        // Redirect to login (if not already there)
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle rate limiting
      if (status === 429) {
        logger.warn('Rate limit exceeded', {
          url: error.config.url
        });
      }

      logger.error('API Response Error', error, {
        status,
        url: error.config.url,
        data
      });
    } else if (error.request) {
      // Request made but no response received
      logger.error('API Network Error', error, {
        url: error.config?.url
      });
    } else {
      // Error in request configuration
      logger.error('API Configuration Error', error);
    }

    return Promise.reject(handleApiError(error, error.config?.url));
  }
);

/**
 * API request wrapper with retry logic
 */
export const apiRequest = async (config, retries = 3) => {
  try {
    const response = await apiClient(config);
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    // Retry on network errors
    if (retries > 0 && (!error.response || error.response.status >= 500)) {
      logger.info(`Retrying request (${retries} attempts left)`, {
        url: config.url
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest(config, retries - 1);
    }

    return error;
  }
};

/**
 * Convenience methods
 */
export const api = {
  get: (url, config = {}) => apiRequest({ ...config, method: 'GET', url }),
  post: (url, data, config = {}) => apiRequest({ ...config, method: 'POST', url, data }),
  put: (url, data, config = {}) => apiRequest({ ...config, method: 'PUT', url, data }),
  patch: (url, data, config = {}) => apiRequest({ ...config, method: 'PATCH', url, data }),
  delete: (url, config = {}) => apiRequest({ ...config, method: 'DELETE', url })
};

export default apiClient;