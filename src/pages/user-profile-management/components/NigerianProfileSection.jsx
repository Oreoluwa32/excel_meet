import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePreferences } from '../../../contexts/PreferencesContext';
import NigerianStateSelect from '../../../components/ui/NigerianStateSelect';
import NigerianPhoneInput from '../../../components/ui/NigerianPhoneInput';
import NigerianVerificationForm from '../../../components/NigerianVerificationForm';
import { supabase } from '../../../utils/supabase';

/**
 * Nigerian-specific profile section component
 * Allows users to manage their Nigerian-specific profile information
 */
const NigerianProfileSection = () => {
  const { user, userProfile, updateProfile } = useAuth();
  
  // Safely use preferences context with fallbacks
  let preferences = { currency: 'NGN' };
  let updateCurrencyPreference = async () => ({ success: false });
  
  try {
    const prefContext = usePreferences();
    if (prefContext) {
      preferences = prefContext.preferences;
      updateCurrencyPreference = prefContext.updateCurrencyPreference;
    }
  } catch (e) {
    console.warn('PreferencesContext not found, using default preferences');
  }
  
  // Form state
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState('NGN');
  const [cities, setCities] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setState(userProfile.state || '');
      setCity(userProfile.city || '');
      setPostalCode(userProfile.postal_code || '');
      setPhone(userProfile.phone || '');
      setPreferredCurrency(userProfile.preferred_currency || 'NGN');
    }
  }, [userProfile]);
  
  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!state) {
        setCities([]);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .rpc('get_nigerian_cities', { state_name: state });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setCities(data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Don't show error to user, just log it
      } finally {
        setLoading(false);
      }
    };
    
    fetchCities();
  }, [state]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update user profile
      const updates = {
        state,
        city,
        postal_code: postalCode,
        phone,
        preferred_currency: preferredCurrency
      };
      
      const result = await updateProfile(updates);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile');
      }
      
      // Update currency preference in context
      if (preferredCurrency !== preferences.currency) {
        await updateCurrencyPreference(preferredCurrency);
      }
      
      setSuccess('Nigerian profile information updated successfully');
    } catch (error) {
      console.error('Error updating Nigerian profile:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Nigerian Profile Settings</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage your Nigeria-specific information and verification
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <NigerianStateSelect
              value={state}
              onChange={setState}
              label="State"
              required
            />
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading || !state}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="">
                  {loading ? 'Loading cities...' : 'Select City'}
                </option>
                {cities.map((cityOption) => (
                  <option key={cityOption.city} value={cityOption.city}>
                    {cityOption.city}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            
            <NigerianPhoneInput
              value={phone}
              onChange={setPhone}
              label="Phone Number"
            />
            
            <div>
              <label htmlFor="preferredCurrency" className="block text-sm font-medium text-gray-700">Preferred Currency</label>
              <select
                id="preferredCurrency"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">Identity Verification</h4>
        <NigerianVerificationForm />
      </div>
    </div>
  );
};

export default NigerianProfileSection;