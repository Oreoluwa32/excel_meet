import React from 'react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { usePreferences } from '../../contexts/PreferencesContext';

/**
 * PriceDisplay component for displaying prices with proper currency formatting
 * Automatically uses the user's preferred currency from PreferencesContext
 */
const PriceDisplay = ({ 
  amount, 
  currency = null, 
  className = '', 
  showSymbol = true,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
}) => {
  const { preferences } = usePreferences();
  
  // Use provided currency or fall back to user preference
  const currencyToUse = currency || preferences.currency;
  
  return (
    <span className={className}>
      {formatCurrency(amount, currencyToUse, { 
        minimumFractionDigits, 
        maximumFractionDigits,
        showSymbol 
      })}
    </span>
  );
};

/**
 * NairaPrice component - specialized component for displaying prices in Naira
 */
export const NairaPrice = ({ 
  amount, 
  className = '', 
  minimumFractionDigits = 2,
  maximumFractionDigits = 2
}) => {
  return (
    <PriceDisplay
      amount={amount}
      currency="NGN"
      className={className}
      minimumFractionDigits={minimumFractionDigits}
      maximumFractionDigits={maximumFractionDigits}
    />
  );
};

export default PriceDisplay;