import React, { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import Routes from "./Routes";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineIndicator from "./components/OfflineIndicator";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { validateEnv } from "./utils/envValidator";
import { analytics } from "./utils/analytics";
import { monitorPageLoad } from "./utils/performance";
import { preventClickjacking } from "./utils/security";
import { logger } from "./utils/logger";

function App() {
  useEffect(() => {
    // Sequential initialization with individual try-catches
    const init = () => {
      try {
        validateEnv();
      } catch (e) {
        console.error('Env validation failed:', e);
      }

      try {
        analytics.initialize();
      } catch (e) {
        console.error('Analytics init failed:', e);
      }

      try {
        monitorPageLoad();
      } catch (e) {
        console.error('Performance monitoring failed:', e);
      }

      try {
        preventClickjacking();
      } catch (e) {
        console.error('Security check failed:', e);
      }

      logger.info('Application initialization attempt finished');
    };

    init();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PreferencesProvider>
          <OfflineIndicator />
          <PWAInstallPrompt />
          <Routes />
        </PreferencesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;