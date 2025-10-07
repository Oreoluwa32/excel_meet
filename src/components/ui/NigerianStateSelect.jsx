import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

/**
 * Nigerian states select component
 * Fetches states from the database and provides a select dropdown
 */
const NigerianStateSelect = ({
  value,
  onChange,
  className = '',
  placeholder = 'Select State',
  required = false,
  disabled = false,
  error = null,
  label = 'State',
  showLabel = true,
  id = 'state-select'
}) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch Nigerian states from the database
  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoading(true);
        
        // Query the database for the enum values
        const { data, error } = await supabase
          .rpc('get_enum_values', { enum_name: 'nigerian_state' });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Sort states alphabetically
          const sortedStates = data.sort();
          setStates(sortedStates);
        }
      } catch (error) {
        console.error('Error fetching Nigerian states:', error);
        setFetchError('Failed to load states. Please try again.');
        
        // Fallback to hardcoded list if database query fails
        setStates([
          'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
          'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 
          'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 
          'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 
          'Yobe', 'Zamfara'
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Handle change event
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="form-control w-full">
      {showLabel && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <select
        id={id}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${className} ${
          error ? 'border-red-500' : ''
        }`}
      >
        <option value="" disabled>
          {loading ? 'Loading states...' : placeholder}
        </option>
        
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {fetchError && !error && (
        <p className="mt-1 text-sm text-amber-500">{fetchError}</p>
      )}
    </div>
  );
};

export default NigerianStateSelect;