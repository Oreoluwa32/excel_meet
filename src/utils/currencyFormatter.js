/**
 * Currency formatter utility for Excel Meet
 * Provides functions to format currency values based on user preferences
 * Primarily focused on Nigerian Naira (₦) formatting
 */

/**
 * Format a number as currency with the appropriate symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (NGN, USD, EUR, GBP)
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'NGN', options = {}) => {
  if (amount === null || amount === undefined) {
    return '';
  }

  const defaultOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };

  // Currency symbols
  const symbols = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  // Get the symbol or use the currency code if symbol not found
  const symbol = symbols[currency] || currency;

  // Format the number
  const formattedNumber = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: defaultOptions.minimumFractionDigits,
    maximumFractionDigits: defaultOptions.maximumFractionDigits
  }).format(amount);

  // Return the formatted currency
  return `${symbol}${formattedNumber}`;
};

/**
 * Format a number as Nigerian Naira
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted Naira string
 */
export const formatNaira = (amount, options = {}) => {
  return formatCurrency(amount, 'NGN', options);
};

/**
 * Parse a currency string back to a number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The parsed number
 */
export const parseCurrencyValue = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and non-numeric characters except decimal point
  const numericString = currencyString.replace(/[^0-9.]/g, '');
  return parseFloat(numericString) || 0;
};

/**
 * Get currency symbol by currency code
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'NGN') => {
  const symbols = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  return symbols[currency] || currency;
};

export default {
  formatCurrency,
  formatNaira,
  parseCurrencyValue,
  getCurrencySymbol
};