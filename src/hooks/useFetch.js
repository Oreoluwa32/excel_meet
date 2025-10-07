import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../utils/apiClient';
import logger from '../utils/logger';

// Simple in-memory cache
const cache = new Map();
const cacheTimestamps = new Map();

/**
 * Custom hook for data fetching with caching and automatic retries
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Object} { data, loading, error, refetch, mutate }
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch('/api/users', {
 *   cacheTime: 5 * 60 * 1000, // 5 minutes
 *   onSuccess: (data) => console.log('Data loaded:', data)
 * });
 */
export const useFetch = (url, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval = null,
    onSuccess = null,
    onError = null,
    retry = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const refetchIntervalRef = useRef(null);

  // Generate cache key
  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;

  // Check if cached data is still valid
  const getCachedData = useCallback(() => {
    if (!cache.has(cacheKey)) return null;

    const timestamp = cacheTimestamps.get(cacheKey);
    const now = Date.now();

    if (now - timestamp > cacheTime) {
      // Cache expired
      cache.delete(cacheKey);
      cacheTimestamps.delete(cacheKey);
      return null;
    }

    return cache.get(cacheKey);
  }, [cacheKey, cacheTime]);

  // Fetch data
  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) return;

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData && !isRetry) {
      setData(cachedData);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const config = {
        method,
        headers,
        signal: abortControllerRef.current.signal
      };

      if (body) {
        config.data = body;
      }

      const response = await apiClient.request({
        url,
        ...config
      });

      const responseData = response.data;

      // Update cache
      cache.set(cacheKey, responseData);
      cacheTimestamps.set(cacheKey, Date.now());

      setData(responseData);
      setLoading(false);
      retryCountRef.current = 0;

      if (onSuccess) {
        onSuccess(responseData);
      }

      logger.info('Data fetched successfully', { url, method });
    } catch (err) {
      // Don't handle aborted requests
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        return;
      }

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        logger.warn(`Retrying request (${retryCountRef.current}/${retry})`, { url });
        
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(err);
      setLoading(false);

      if (onError) {
        onError(err);
      }

      logger.error('Data fetch failed', { url, method, error: err });
    }
  }, [url, method, body, headers, enabled, getCachedData, cacheKey, onSuccess, onError, retry, retryDelay]);

  // Refetch function
  const refetch = useCallback(() => {
    // Clear cache for this request
    cache.delete(cacheKey);
    cacheTimestamps.delete(cacheKey);
    retryCountRef.current = 0;
    fetchData();
  }, [cacheKey, fetchData]);

  // Mutate function (optimistic updates)
  const mutate = useCallback((newData) => {
    setData(newData);
    cache.set(cacheKey, newData);
    cacheTimestamps.set(cacheKey, Date.now());
  }, [cacheKey]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, refetch]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    refetchIntervalRef.current = setInterval(() => {
      refetch();
    }, refetchInterval);

    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [refetchInterval, refetch]);

  return { data, loading, error, refetch, mutate };
};

/**
 * Clear all cached data
 */
export const clearCache = () => {
  cache.clear();
  cacheTimestamps.clear();
  logger.info('Cache cleared');
};

/**
 * Clear specific cache entry
 */
export const clearCacheEntry = (url, method = 'GET', body = null) => {
  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;
  cache.delete(cacheKey);
  cacheTimestamps.delete(cacheKey);
  logger.info('Cache entry cleared', { url, method });
};

export default useFetch;