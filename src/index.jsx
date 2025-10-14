import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
import * as serviceWorkerRegistration from "./utils/registerServiceWorker";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

// Register service worker for PWA functionality
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('New version available! Please refresh.');
  }
});
