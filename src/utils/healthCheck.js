/**
 * Health check utility for monitoring application status
 */

import { logger } from './logger';
import { supabase } from './supabase';

/**
 * Check if Supabase connection is healthy
 */
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return {
      status: 'healthy',
      service: 'supabase',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Supabase health check failed', error);
    return {
      status: 'unhealthy',
      service: 'supabase',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Check browser compatibility
 */
export const checkBrowserCompatibility = () => {
  const features = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof Storage !== 'undefined',
    indexedDB: typeof indexedDB !== 'undefined',
    serviceWorker: 'serviceWorker' in navigator,
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    intersectionObserver: 'IntersectionObserver' in window,
    webWorkers: typeof Worker !== 'undefined'
  };

  const unsupported = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);

  return {
    status: unsupported.length === 0 ? 'compatible' : 'partial',
    features,
    unsupported,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check network connectivity
 */
export const checkNetworkHealth = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  return {
    status: navigator.onLine ? 'online' : 'offline',
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 'unknown',
    rtt: connection?.rtt || 'unknown',
    saveData: connection?.saveData || false,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get application health status
 */
export const getHealthStatus = async () => {
  const [supabaseHealth, browserCompat, networkHealth] = await Promise.all([
    checkSupabaseHealth(),
    Promise.resolve(checkBrowserCompatibility()),
    Promise.resolve(checkNetworkHealth())
  ]);

  const overallStatus = 
    supabaseHealth.status === 'healthy' && 
    browserCompat.status === 'compatible' && 
    networkHealth.status === 'online'
      ? 'healthy'
      : 'degraded';

  return {
    status: overallStatus,
    checks: {
      supabase: supabaseHealth,
      browser: browserCompat,
      network: networkHealth
    },
    timestamp: new Date().toISOString(),
    version: __APP_VERSION__ || '0.1.0'
  };
};

/**
 * Monitor application health periodically
 */
export const startHealthMonitoring = (interval = 60000) => {
  const monitor = async () => {
    const health = await getHealthStatus();
    
    if (health.status !== 'healthy') {
      logger.warn('Application health degraded', health);
    } else {
      logger.debug('Application health check passed', health);
    }
  };

  // Initial check
  monitor();

  // Periodic checks
  return setInterval(monitor, interval);
};

export default {
  checkSupabaseHealth,
  checkBrowserCompatibility,
  checkNetworkHealth,
  getHealthStatus,
  startHealthMonitoring
};