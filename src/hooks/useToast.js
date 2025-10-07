import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 * Usage:
 * const { toasts, showToast, hideToast } = useToast();
 * showToast({ type: 'success', message: 'Operation successful!' });
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((options) => {
    const {
      type = 'info',
      message,
      title,
      duration = 5000,
      id = Date.now()
    } = options;

    const toast = {
      id,
      type,
      message,
      title,
      duration
    };

    setToasts((prev) => [...prev, toast]);

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return showToast({ type: 'success', message, ...options });
  }, [showToast]);

  const error = useCallback((message, options = {}) => {
    return showToast({ type: 'error', message, duration: 7000, ...options });
  }, [showToast]);

  const warning = useCallback((message, options = {}) => {
    return showToast({ type: 'warning', message, ...options });
  }, [showToast]);

  const info = useCallback((message, options = {}) => {
    return showToast({ type: 'info', message, ...options });
  }, [showToast]);

  return {
    toasts,
    showToast,
    hideToast,
    hideAllToasts,
    success,
    error,
    warning,
    info
  };
};

export default useToast;