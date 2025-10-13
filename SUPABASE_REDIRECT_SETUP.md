# Supabase Redirect Configuration Guide

## Overview
This guide will help you configure Supabase to properly handle OAuth redirects (Google Sign-In) and password reset links for your production environment.

## Issues Fixed
1. ✅ Google Sign-In now redirects to production URL instead of localhost
2. ✅ Password reset links now redirect to production URL instead of localhost

## Configuration Steps

### Step 1: Update Environment Variables

#### For Production (Vercel)
In your Vercel dashboard, add the following environment variable:
```
VITE_APP_URL=https://excel-meet.vercel.app
```

#### For Local Development
The `.env` file has been updated with:
```
VITE_APP_URL=http://localhost:4028
```

### Step 2: Configure Supabase Authentication Settings

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `izxjmcfbhktnmtqbdjkm`

2. **Update Redirect URLs**
   - Go to: **Authentication** → **URL Configuration**
   - Add the following URLs to **Redirect URLs**:
     ```
     https://excel-meet.vercel.app/home-dashboard
     https://excel-meet.vercel.app/reset-password
     https://excel-meet.vercel.app/email-verified
     http://localhost:4028/home-dashboard
     http://localhost:4028/reset-password
     http://localhost:4028/email-verified
     ```

3. **Update Site URL**
   - In the same **URL Configuration** section
   - Set **Site URL** to: `https://excel-meet.vercel.app`

4. **Configure Google OAuth Provider**
   - Go to: **Authentication** → **Providers**
   - Find **Google** provider
   - Make sure it's enabled
   - Verify your **Authorized redirect URIs** in Google Cloud Console includes:
     ```
     https://izxjmcfbhktnmtqbdjkm.supabase.co/auth/v1/callback
     ```

### Step 3: Google Cloud Console Configuration

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com
   - Select your project

2. **Update Authorized JavaScript Origins**
   - Go to: **APIs & Services** → **Credentials**
   - Click on your OAuth 2.0 Client ID
   - Under **Authorized JavaScript origins**, add:
     ```
     https://excel-meet.vercel.app
     https://izxjmcfbhktnmtqbdjkm.supabase.co
     ```

3. **Update Authorized Redirect URIs**
   - In the same OAuth client configuration
   - Under **Authorized redirect URIs**, ensure you have:
     ```
     https://izxjmcfbhktnmtqbdjkm.supabase.co/auth/v1/callback
     ```

### Step 4: Deploy to Production

After making these changes:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Fix OAuth and password reset redirects for production"
   git push
   ```

2. **Verify Environment Variables in Vercel**:
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Ensure `VITE_APP_URL` is set to `https://excel-meet.vercel.app`
   - Redeploy if necessary

### Step 5: Testing

#### Test Google Sign-In:
1. Go to your production site: https://excel-meet.vercel.app
2. Click "Continue with Google"
3. Complete the Google authentication
4. Verify you're redirected to: https://excel-meet.vercel.app/home-dashboard

#### Test Password Reset:
1. Go to the forgot password page
2. Enter your email
3. Check your email for the reset link
4. Click the reset link
5. Verify you're redirected to: https://excel-meet.vercel.app/reset-password

## Troubleshooting

### Google Sign-In Still Redirects to Localhost
- Clear your browser cache and cookies
- Verify `VITE_APP_URL` is set in Vercel environment variables
- Redeploy your application
- Check Supabase redirect URLs are correctly configured

### Password Reset Link Goes to Localhost
- Verify `VITE_APP_URL` is set in Vercel environment variables
- Check Supabase redirect URLs include your production reset-password URL
- Request a new password reset email after deploying

### "Redirect URL not allowed" Error
- Double-check all URLs in Supabase **Authentication** → **URL Configuration**
- Ensure there are no typos in the URLs
- Make sure to include both `http://localhost:4028` (for development) and `https://excel-meet.vercel.app` (for production)

## Code Changes Made

### Files Modified:
1. **src/utils/authService.js**
   - Updated `signUp()` to use `VITE_APP_URL` environment variable
   - Updated `resetPassword()` to use `VITE_APP_URL` environment variable
   - Updated `signInWithGoogle()` to use `VITE_APP_URL` environment variable

2. **.env**
   - Added `VITE_APP_URL=http://localhost:4028` for local development

3. **.env.production**
   - Updated `VITE_APP_URL=https://excel-meet.vercel.app` for production

## Important Notes

- The code now uses `import.meta.env.VITE_APP_URL` with a fallback to `window.location.origin`
- This ensures compatibility with both development and production environments
- Always set `VITE_APP_URL` in your deployment platform's environment variables
- Remember to add all redirect URLs to Supabase before testing

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase project is active and not paused
4. Check that Google OAuth credentials are properly configured