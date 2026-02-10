/**
 * Environment variable validator
 * Ensures all required environment variables are present
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_GEMINI_API_KEY',
  'VITE_ANTHROPIC_API_KEY',
  'VITE_PERPLEXITY_API_KEY',
  'VITE_GOOGLE_ANALYTICS_ID',
  'VITE_ADSENSE_ID',
  'VITE_STRIPE_PUBLISHABLE_KEY'
];

/**
 * Validate environment variables
 * @throws {Error} If required environment variables are missing
 */
export const validateEnv = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName] || import.meta.env[varName].includes('your-')) {
      missing.push(varName);
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!import.meta.env[varName] || import.meta.env[varName].includes('your-')) {
      warnings.push(varName);
    }
  });

  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables:\n${missing.join('\n')}\n\nPlease check your .env file.`;
    console.error(errorMsg);
    // Don't throw, just return false so the app can handle it or show a warning
    return false;
  }

  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn(
      '⚠️ Optional environment variables not configured:\n',
      warnings.join('\n'),
      '\n\nSome features may be disabled.'
    );
  }

  return true;
};

/**
 * Get environment configuration
 */
export const getEnvConfig = () => ({
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Excel Meet',
    url: import.meta.env.VITE_APP_URL || window.location.origin,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10)
  },
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    payments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true'
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
});

export default {
  validateEnv,
  getEnvConfig
};