import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../utils/supabase';

// Create context
const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const { user, userProfile } = useAuth();
  
  // Default preferences
  const [preferences, setPreferences] = useState({
    currency: 'NGN',
    language: 'en-NG',
    theme: 'light',
    notifications: true,
    dataOptimization: true
  });

  // Load preferences from user profile when available
  useEffect(() => {
    if (userProfile) {
      setPreferences(prev => ({
        ...prev,
        currency: userProfile.preferred_currency || 'NGN'
      }));
    }
  }, [userProfile]);

  // Update user's currency preference
  const updateCurrencyPreference = async (currency) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Update local state
      setPreferences(prev => ({
        ...prev,
        currency
      }));

      // Update in database
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ preferred_currency: currency })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        // Revert on error
        setPreferences(prev => ({
          ...prev,
          currency: userProfile?.preferred_currency || 'NGN'
        }));
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating currency preference:', error);
      return { success: false, error: 'Failed to update currency preference' };
    }
  };

  // Update theme preference
  const updateThemePreference = (theme) => {
    setPreferences(prev => ({
      ...prev,
      theme
    }));
    // Store in localStorage for persistence
    localStorage.setItem('theme', theme);
  };

  // Update data optimization preference
  const updateDataOptimization = (enabled) => {
    setPreferences(prev => ({
      ...prev,
      dataOptimization: enabled
    }));
    // Store in localStorage for persistence
    localStorage.setItem('dataOptimization', JSON.stringify(enabled));
  };

  // Load preferences from localStorage on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const storedDataOpt = localStorage.getItem('dataOptimization');
    
    if (storedTheme) {
      setPreferences(prev => ({
        ...prev,
        theme: storedTheme
      }));
    }
    
    if (storedDataOpt !== null) {
      try {
        const parsedValue = JSON.parse(storedDataOpt);
        setPreferences(prev => ({
          ...prev,
          dataOptimization: parsedValue
        }));
      } catch (e) {
        console.error('Error parsing dataOptimization preference:', e);
      }
    }
  }, []);

  // Context value
  const value = {
    preferences,
    updateCurrencyPreference,
    updateThemePreference,
    updateDataOptimization
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

// Custom hook to use the preferences context
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export default PreferencesContext;