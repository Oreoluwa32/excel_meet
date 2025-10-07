---
description: Repository Information Overview
alwaysApply: true
---

# Excel Meet Information

## Summary
Excel Meet is a modern React-based web application for connecting professionals. It uses React 18 with Vite as the build tool, and integrates with Supabase for authentication and data storage. The application features responsive design with TailwindCSS and includes data visualization capabilities.

## Structure
- **public/**: Static assets and resources
- **src/**: Main application source code
  - **components/**: Reusable UI components
  - **contexts/**: React context providers (AuthContext)
  - **pages/**: Page components for different routes
  - **styles/**: Global styles and Tailwind configuration
  - **utils/**: Utility functions and services
- **supabase/**: Supabase database migrations

## Language & Runtime
**Language**: JavaScript (React)
**Version**: React 18.2.0
**Build System**: Vite 5.0.0
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- React 18.2.0 and React DOM 18.2.0
- @supabase/supabase-js 2.39.0
- React Router DOM 6.0.2
- @reduxjs/toolkit 2.6.1
- TailwindCSS 3.4.6
- Framer Motion 10.16.4
- D3.js 7.9.0 and Recharts 2.15.2
- React Hook Form 7.55.0
- Axios 1.8.4

**Development Dependencies**:
- Vite 5.0.0
- @vitejs/plugin-react 4.3.4
- TailwindCSS plugins (typography, aspect-ratio, container-queries)
- PostCSS 8.4.8
- Autoprefixer 10.4.2

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run serve
```

## Environment Configuration
The application uses environment variables for configuration:
- Supabase URL and anonymous key
- API keys for various services (OpenAI, Gemini, Anthropic, Perplexity)
- Google Analytics and AdSense IDs
- Stripe publishable key

## Main Entry Points
- **src/index.jsx**: Application entry point
- **src/App.jsx**: Main application component
- **src/Routes.jsx**: Application routing configuration

## Authentication
The application uses Supabase for authentication with the following features:
- Email/password sign-in and registration
- Password reset functionality
- User profile management
- Session persistence

## Pages
- Home Dashboard
- Login/Register
- Job Details
- Professional Profile
- Search/Discovery
- User Profile Management

## Styling
The application uses TailwindCSS with custom configuration:
- Custom color scheme with light/dark mode support
- Responsive design with container queries
- Animation utilities
- Custom font configuration (Inter, JetBrains Mono)