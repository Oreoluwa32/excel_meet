import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import Routes from "./Routes";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import { validateEnv } from "./utils/envValidator";
import { analytics } from "./utils/analytics";
import { monitorPageLoad } from "./utils/performance";
import { preventClickjacking } from "./utils/security";
import { logger } from "./utils/logger";

function App() {
  useEffect(() => {
    try {
      // Validate environment variables
      validateEnv();

      // Initialize analytics
      analytics.initialize();

      // Monitor performance
      monitorPageLoad();

      // Security checks
      preventClickjacking();

      logger.info('Application initialized successfully');
    } catch (error) {
      logger.error('Application initialization failed', error);
      
      // Show user-friendly error if critical env vars are missing
      if (error.message.includes('environment variables')) {
        alert(error.message);
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PreferencesProvider>
          <OfflineIndicator />
          <Routes />
        </PreferencesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;