/**
 * Centralized logging utility
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      context,
      environment: this.isDevelopment ? 'development' : 'production'
    };
  }

  /**
   * Log error messages
   */
  error(message, error = null, context = {}) {
    const logData = this.formatMessage(LOG_LEVELS.ERROR, message, {
      ...context,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : null
    });

    console.error(`[ERROR] ${message}`, logData);

    // In production, send to error tracking service
    if (this.isProduction && window.errorTracker) {
      window.errorTracker.captureException(error || new Error(message), {
        extra: context
      });
    }

    return logData;
  }

  /**
   * Log warning messages
   */
  warn(message, context = {}) {
    const logData = this.formatMessage(LOG_LEVELS.WARN, message, context);
    console.warn(`[WARN] ${message}`, logData);
    return logData;
  }

  /**
   * Log info messages
   */
  info(message, context = {}) {
    const logData = this.formatMessage(LOG_LEVELS.INFO, message, context);
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, logData);
    }
    
    return logData;
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message, context = {}) {
    if (!this.isDevelopment) return;

    const logData = this.formatMessage(LOG_LEVELS.DEBUG, message, context);
    console.debug(`[DEBUG] ${message}`, logData);
    return logData;
  }

  /**
   * Log API requests
   */
  logApiRequest(method, url, data = null) {
    this.debug('API Request', {
      method,
      url,
      data: this.isDevelopment ? data : '[REDACTED]'
    });
  }

  /**
   * Log API responses
   */
  logApiResponse(method, url, status, data = null) {
    this.debug('API Response', {
      method,
      url,
      status,
      data: this.isDevelopment ? data : '[REDACTED]'
    });
  }

  /**
   * Log user actions for analytics
   */
  logUserAction(action, details = {}) {
    this.info('User Action', {
      action,
      ...details
    });

    // Send to analytics if enabled
    if (window.gtag && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      window.gtag('event', action, details);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

export default logger;