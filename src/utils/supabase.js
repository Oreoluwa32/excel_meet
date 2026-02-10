import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  throw new Error('Missing Supabase environment variables');
}

// Safely get storage
const getStorage = () => {
  try {
    // Check if sessionStorage is available and working
    const storage = window.sessionStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return storage;
  } catch (e) {
    console.warn('sessionStorage is not available, falling back to in-memory storage');
    // Simple in-memory storage fallback
    const memoryStorage = {
      getItem: (key) => memoryStorage[key] || null,
      setItem: (key, value) => { memoryStorage[key] = value; },
      removeItem: (key) => { delete memoryStorage[key]; },
      clear: () => {
        Object.keys(memoryStorage).forEach(key => {
          if (typeof memoryStorage[key] !== 'function') delete memoryStorage[key];
        });
      }
    };
    return memoryStorage;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: getStorage(),
  }
});

console.log('Supabase client initialized successfully');