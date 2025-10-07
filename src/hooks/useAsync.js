import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Custom hook for handling async operations
 * Manages loading, error, and data states
 * 
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} immediate - Execute immediately on mount
 * @returns {Object} { execute, loading, error, data, reset }
 * 
 * @example
 * const { execute, loading, error, data } = useAsync(fetchUserData);
 * 
 * useEffect(() => {
 *   execute(userId);
 * }, [userId]);
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Execute the async function
  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);

      try {
        const response = await asyncFunction(...params);
        setData(response);
        return response;
      } catch (err) {
        setError(err);
        logger.error('Async operation failed', { error: err, params });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  // Reset state
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, loading, error, data, reset };
};

export default useAsync;