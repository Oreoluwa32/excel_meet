/**
 * Performance monitoring and optimization utilities
 */

import { logger } from './logger';

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName) => {
  if (!import.meta.env.DEV) return () => {};

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > 16) { // More than one frame (60fps)
      logger.warn(`Slow render detected: ${componentName}`, {
        duration: `${duration.toFixed(2)}ms`
      });
    }
  };
};

/**
 * Debounce function for performance optimization
 */
export const debounce = (func, wait = 300) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;

  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy load images with intersection observer
 */
export const lazyLoadImage = (imageElement, src) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imageElement.src = src;
          observer.unobserve(imageElement);
        }
      });
    });

    observer.observe(imageElement);
  } else {
    // Fallback for browsers without IntersectionObserver
    imageElement.src = src;
  }
};

/**
 * Memoize expensive function calls
 */
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
};

/**
 * Monitor page load performance
 */
export const monitorPageLoad = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Use Performance API to get metrics
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    logger.info('Page Load Performance', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`
    });

    // Send to analytics if available
    if (window.gtag && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      window.gtag('event', 'timing_complete', {
        name: 'page_load',
        value: pageLoadTime,
        event_category: 'Performance'
      });
    }
  });
};

/**
 * Detect slow network connection
 */
export const isSlowConnection = () => {
  if (!navigator.connection) return false;

  const connection = navigator.connection;
  const slowConnections = ['slow-2g', '2g', '3g'];

  return (
    slowConnections.includes(connection.effectiveType) ||
    connection.saveData === true
  );
};

/**
 * Prefetch resources
 */
export const prefetchResource = (url, type = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Report Web Vitals
 */
export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      // web-vitals not installed, skip
    });
  }
};

export default {
  measureRenderTime,
  debounce,
  throttle,
  lazyLoadImage,
  memoize,
  monitorPageLoad,
  isSlowConnection,
  prefetchResource,
  reportWebVitals
};