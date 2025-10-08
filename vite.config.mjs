import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // Build configuration
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'data-vendor': ['d3', 'recharts'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    }
  },
  
  // Plugins
  plugins: [
    tsconfigPaths(), 
    react({
      // Enable Fast Refresh
      fastRefresh: true
    }), 
    tagger()
  ],
  
  // Development server
  server: {
    port: 4028,
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new'],
    open: false, // Don't auto-open browser
    cors: true
  },
  
  // Preview server (for production builds)
  preview: {
    port: 4029,
    host: "0.0.0.0",
    strictPort: true
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js'
    ]
  },
  
  // Environment variables prefix
  envPrefix: 'VITE_',
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});