/**
 * Analytics utility for tracking user interactions
 */

import { logger } from './logger';

class Analytics {
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
    this.initialized = false;
  }

  /**
   * Initialize Google Analytics
   */
  initialize() {
    if (!this.isEnabled || !this.gaId || this.initialized) {
      return;
    }

    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', this.gaId, {
        send_page_view: false // We'll send page views manually
      });

      this.initialized = true;
      logger.info('Analytics initialized');
    } catch (error) {
      logger.error('Failed to initialize analytics', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path, title) {
    if (!this.isEnabled || !window.gtag) return;

    try {
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title
      });

      logger.debug('Page view tracked', { path, title });
    } catch (error) {
      logger.error('Failed to track page view', error);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName, eventParams = {}) {
    if (!this.isEnabled || !window.gtag) return;

    try {
      window.gtag('event', eventName, eventParams);
      logger.debug('Event tracked', { eventName, eventParams });
    } catch (error) {
      logger.error('Failed to track event', error);
    }
  }

  /**
   * Track user action
   */
  trackAction(action, category, label, value) {
    this.trackEvent(action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName, location) {
    this.trackAction('button_click', 'engagement', buttonName, location);
  }

  /**
   * Track form submission
   */
  trackFormSubmission(formName, success = true) {
    this.trackEvent('form_submission', {
      form_name: formName,
      success: success
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm, resultsCount) {
    this.trackEvent('search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  /**
   * Track user signup
   */
  trackSignup(method = 'email') {
    this.trackEvent('sign_up', {
      method: method
    });
  }

  /**
   * Track user login
   */
  trackLogin(method = 'email') {
    this.trackEvent('login', {
      method: method
    });
  }

  /**
   * Track error
   */
  trackError(errorMessage, errorType, fatal = false) {
    this.trackEvent('exception', {
      description: errorMessage,
      error_type: errorType,
      fatal: fatal
    });
  }

  /**
   * Track timing
   */
  trackTiming(category, variable, value, label) {
    this.trackEvent('timing_complete', {
      name: variable,
      value: value,
      event_category: category,
      event_label: label
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    if (!this.isEnabled || !window.gtag) return;

    try {
      window.gtag('set', 'user_properties', properties);
      logger.debug('User properties set', properties);
    } catch (error) {
      logger.error('Failed to set user properties', error);
    }
  }

  /**
   * Set user ID
   */
  setUserId(userId) {
    if (!this.isEnabled || !window.gtag) return;

    try {
      window.gtag('config', this.gaId, {
        user_id: userId
      });
      logger.debug('User ID set', { userId });
    } catch (error) {
      logger.error('Failed to set user ID', error);
    }
  }
}

// Export singleton instance
export const analytics = new Analytics();

export default analytics;