# Excel Meet - Setup Guide

Complete guide to set up Excel Meet for development and production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Development](#development)
5. [Testing](#testing)
6. [Building](#building)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 16.x or higher
  ```bash
  node --version  # Should be v16.0.0 or higher
  ```

- **npm**: Version 8.x or higher
  ```bash
  npm --version  # Should be 8.0.0 or higher
  ```

- **Git**: Latest version
  ```bash
  git --version
  ```

### Required Accounts

1. **Supabase Account**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Optional Services**
   - Google Analytics (for analytics)
   - Stripe (for payments)
   - OpenAI/Gemini (for AI features)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/excel-meet.git
cd excel-meet
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- Supabase client
- TailwindCSS
- Framer Motion
- And more...

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Required - Get from Supabase Dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional - Add if you want these features
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_OPENAI_API_KEY=your-openai-key
```

## Configuration

### Supabase Setup

1. **Create Tables**

   Run the migrations in `supabase/migrations/`:
   
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually in Supabase SQL Editor
   # Copy and run each migration file
   ```

2. **Configure Authentication**

   In Supabase Dashboard:
   - Go to Authentication > Settings
   - Enable Email/Password provider
   - Configure email templates
   - Set up redirect URLs

3. **Set Up Storage**

   Create storage buckets:
   - `avatars` - for user profile pictures
   - `documents` - for file uploads

4. **Configure Row Level Security**

   Enable RLS on all tables and set appropriate policies.

### Application Configuration

Edit configuration files as needed:

- `tailwind.config.js` - Customize theme colors, fonts
- `vite.config.mjs` - Build and dev server settings
- `public/manifest.json` - PWA configuration

## Development

### Start Development Server

```bash
npm start
# or
npm run dev
```

The application will be available at `http://localhost:4028`

### Development Features

- **Hot Module Replacement (HMR)**: Changes reflect instantly
- **Error Overlay**: See errors directly in the browser
- **Source Maps**: Debug with original source code
- **Fast Refresh**: Preserves component state during edits

### Project Structure

```
excel-meet/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts
│   ├── pages/          # Page components
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── Routes.jsx      # Route configuration
│   └── index.jsx       # Entry point
├── supabase/
│   └── migrations/     # Database migrations
├── .env                # Environment variables
├── package.json        # Dependencies
└── vite.config.mjs     # Vite configuration
```

## Testing

### Manual Testing

1. **Authentication Flow**
   - Sign up with email
   - Verify email
   - Log in
   - Password reset
   - Log out

2. **Core Features**
   - Profile creation/editing
   - Job search
   - Professional connections
   - Messaging

3. **Responsive Design**
   - Test on mobile (375px)
   - Test on tablet (768px)
   - Test on desktop (1920px)

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Performance Testing

Use browser DevTools:
- Lighthouse audit
- Network throttling
- Performance profiling

## Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
npm run build:prod
```

This will:
- Minify JavaScript and CSS
- Remove console.logs
- Optimize images
- Generate source maps (if enabled)
- Split code into chunks

### Preview Production Build

```bash
npm run preview
```

Access at `http://localhost:4029`

### Build Output

The build creates a `build/` directory:

```
build/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-chunks].js
├── index.html
└── [other-static-files]
```

## Troubleshooting

### Common Issues

#### 1. Dependencies Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Port Already in Use

```bash
# Kill process on port 4028
# Windows
netstat -ano | findstr :4028
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4028 | xargs kill -9
```

#### 3. Supabase Connection Issues

- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check network connectivity
- Verify Supabase project is active
- Check browser console for errors

#### 4. Build Fails

```bash
# Check for TypeScript/ESLint errors
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

#### 5. Environment Variables Not Loading

- Ensure `.env` file is in root directory
- Restart development server after changes
- Verify variable names start with `VITE_`
- Check for syntax errors in `.env`

### Getting Help

1. **Check Logs**
   - Browser console
   - Terminal output
   - Network tab in DevTools

2. **Documentation**
   - [React Documentation](https://react.dev)
   - [Vite Documentation](https://vitejs.dev)
   - [Supabase Documentation](https://supabase.com/docs)
   - [TailwindCSS Documentation](https://tailwindcss.com/docs)

3. **Community Support**
   - GitHub Issues
   - Stack Overflow
   - Discord/Slack channels

## Next Steps

After setup:

1. **Customize Branding**
   - Update colors in `tailwind.config.js`
   - Replace logo and favicon
   - Update meta tags in `index.html`

2. **Configure Features**
   - Set up payment processing
   - Configure email templates
   - Add analytics tracking
   - Set up error monitoring

3. **Deploy to Production**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Set up CI/CD pipeline
   - Configure monitoring

## Additional Resources

- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./API.md)
- [Security Policy](./SECURITY.md)

## Support

For issues or questions:
- Email: support@excelmeet.com
- GitHub: [github.com/yourusername/excel-meet](https://github.com/yourusername/excel-meet)