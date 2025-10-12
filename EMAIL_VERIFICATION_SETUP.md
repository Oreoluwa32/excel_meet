# Email Verification Setup Guide

## Overview
This guide explains how the email verification system works and how to configure it properly in your Supabase project.

## How It Works

### User Registration Flow
1. User fills out the registration form
2. System creates account in Supabase with email verification required
3. User sees a "Check Your Email" message
4. Supabase sends verification email with a link
5. User clicks the link in their email
6. User is redirected to `/email-verified` page (not localhost)
7. Page shows success message with login button
8. If already logged in, auto-redirects to dashboard after 5 seconds

## Files Modified

### 1. `src/utils/authService.js`
- Added `emailRedirectTo` option in the `signUp` function
- Redirects to `${window.location.origin}/email-verified` instead of localhost

### 2. `src/pages/email-verified/index.jsx` (NEW)
- Beautiful success page shown after email verification
- Shows verification success message
- Provides login button to redirect to login page
- Auto-redirects to dashboard if user is already logged in
- Includes countdown timer for auto-redirect

### 3. `src/pages/login-register/components/RegisterForm.jsx`
- Added success state to show "Check Your Email" message
- Detects if email confirmation is required
- Shows helpful instructions after registration

### 4. `src/Routes.jsx`
- Added new public route: `/email-verified`

## Supabase Configuration

### Required Settings

1. **Enable Email Confirmation**
   - Go to your Supabase Dashboard
   - Navigate to: Authentication → Settings → Email Auth
   - Enable "Confirm email" option
   - Save changes

2. **Configure Site URL**
   - In Authentication → URL Configuration
   - Set "Site URL" to your production domain (e.g., `https://excelmeet.com`)
   - For development, use: `http://localhost:4028`

3. **Configure Redirect URLs**
   - In Authentication → URL Configuration
   - Add to "Redirect URLs" list:
     - `http://localhost:4028/email-verified` (for development)
     - `https://yourdomain.com/email-verified` (for production)
     - `https://www.yourdomain.com/email-verified` (if using www)

4. **Email Templates (Optional)**
   - Go to: Authentication → Email Templates
   - Customize the "Confirm signup" template
   - The `{{ .ConfirmationURL }}` variable will automatically use the correct redirect URL

### Environment Variables

Make sure your `.env` file has the correct app URL:

```env
VITE_APP_URL=http://localhost:4028  # Development
# or
VITE_APP_URL=https://yourdomain.com  # Production
```

## Testing

### Development Testing
1. Start your development server: `npm run dev`
2. Register a new account
3. Check your email for verification link
4. Click the link - should redirect to `http://localhost:4028/email-verified`
5. Verify the success page displays correctly
6. Click "Login to Your Account" button

### Production Testing
1. Deploy your application
2. Update Supabase Site URL and Redirect URLs to production domain
3. Register a new account
4. Verify email link redirects to production domain, not localhost

## Troubleshooting

### Issue: Still redirecting to localhost in production
**Solution:** 
- Check Supabase Site URL is set to production domain
- Verify Redirect URLs include production domain
- Clear browser cache and cookies
- Check email template uses `{{ .ConfirmationURL }}` not hardcoded URL

### Issue: Email not received
**Solution:**
- Check spam/junk folder
- Verify email confirmation is enabled in Supabase
- Check Supabase email rate limits
- Verify SMTP settings if using custom email provider

### Issue: "Invalid redirect URL" error
**Solution:**
- Add the exact URL to Supabase Redirect URLs list
- Include protocol (http:// or https://)
- Check for trailing slashes
- Verify URL matches exactly (including www if applicable)

### Issue: User not auto-logged in after verification
**Solution:**
- This is expected behavior for security
- User must manually log in after email verification
- Session is created only after successful login

## Features

### Email Verified Page Features
- ✅ Beautiful, responsive design
- ✅ Success animation with pulsing icon
- ✅ Clear success message
- ✅ Login button with arrow icon
- ✅ Auto-redirect for logged-in users (5 second countdown)
- ✅ Support email link
- ✅ Mobile-friendly layout

### Registration Form Features
- ✅ Shows "Check Your Email" message after registration
- ✅ Displays user's email address
- ✅ Helpful tips about spam folder
- ✅ Back to login button
- ✅ Handles both confirmed and unconfirmed email flows

## Security Notes

1. **Email verification is required** - Users cannot access protected routes until email is verified
2. **Secure redirect URLs** - Only whitelisted URLs in Supabase can be used
3. **Token-based verification** - Supabase handles secure token generation and validation
4. **Session management** - Proper session handling after verification

## Future Enhancements

Potential improvements:
- Add "Resend verification email" button
- Add email verification status indicator in user profile
- Send welcome email after successful verification
- Add verification reminder emails
- Track verification analytics

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify all configuration steps completed
4. Contact support at support@excelmeet.com

---

**Last Updated:** 2024
**Version:** 1.0.0