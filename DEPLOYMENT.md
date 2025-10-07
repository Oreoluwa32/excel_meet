# Excel Meet - Deployment Guide

This guide covers deploying Excel Meet to production environments.

## Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- Domain name (optional but recommended)
- Hosting platform account (Netlify, Vercel, or similar)

## Environment Setup

### 1. Environment Variables

Create a `.env.production` file with your production values:

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Optional but recommended
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
VITE_APP_URL=https://yourdomain.com
```

### 2. Supabase Configuration

1. Create a production Supabase project
2. Run migrations from `supabase/migrations/`
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers
5. Configure storage buckets for file uploads

## Deployment Options

### Option 1: Netlify

1. **Connect Repository**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Initialize
   netlify init
   ```

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables: Add in Netlify UI

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Add variables in Vercel dashboard
   - Or use `vercel env add`

### Option 3: Manual Deployment

1. **Build the Application**
   ```bash
   npm run build:prod
   ```

2. **Upload to Server**
   - Upload contents of `build/` directory
   - Configure web server (nginx, Apache, etc.)
   - Set up SSL certificate

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Security headers in place
- [ ] Rate limiting configured

### Performance
- [ ] CDN configured
- [ ] Gzip/Brotli compression enabled
- [ ] Cache headers set correctly
- [ ] Images optimized
- [ ] Lazy loading implemented

### Monitoring
- [ ] Google Analytics configured
- [ ] Error tracking set up
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Log aggregation set up

### SEO
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Meta tags verified
- [ ] Open Graph tags set
- [ ] Schema markup added

### Testing
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Forms submit properly
- [ ] API calls succeed
- [ ] Mobile responsive
- [ ] Cross-browser tested

## Web Server Configuration

### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/excel-meet/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:prod
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

## Monitoring & Maintenance

### Health Checks

The application includes built-in health checks:
- Supabase connectivity
- Browser compatibility
- Network status

Access health status programmatically:
```javascript
import { getHealthStatus } from './utils/healthCheck';

const health = await getHealthStatus();
console.log(health);
```

### Error Tracking

Integrate with error tracking services:
- Sentry
- Rollbar
- Bugsnag

### Performance Monitoring

Monitor key metrics:
- Page load time
- Time to interactive
- First contentful paint
- Largest contentful paint

## Rollback Procedure

If issues occur after deployment:

1. **Immediate Rollback**
   ```bash
   # Netlify
   netlify rollback
   
   # Vercel
   vercel rollback
   ```

2. **Manual Rollback**
   - Revert to previous build
   - Redeploy last stable version

3. **Database Rollback**
   - Restore from backup if needed
   - Run rollback migrations

## Support

For deployment issues:
- Check logs in hosting platform
- Review Supabase logs
- Check browser console for errors
- Verify environment variables

## Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)