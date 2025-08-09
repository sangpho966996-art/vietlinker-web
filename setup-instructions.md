# Setup Instructions for VietLinker Authentication

## Supabase Configuration Required

### 1. Email Templates
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure "Confirm signup" template:
   ```html
   <h2>Xác nhận đăng ký VietLinker</h2>
   <p>Chào {{ .Name }},</p>
   <p>Cảm ơn bạn đã đăng ký VietLinker! Vui lòng nhấp vào liên kết bên dưới để xác nhận email của bạn:</p>
   <p><a href="{{ .ConfirmationURL }}">Xác nhận Email</a></p>
   <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
   <p>Trân trọng,<br>Đội ngũ VietLinker</p>
   ```

### 2. Redirect URLs
1. Go to Authentication → URL Configuration
2. Add these URLs to "Redirect URLs":
   ```
   http://localhost:3000/email-confirmed.html
   http://localhost:8080/email-confirmed.html
   https://yourdomain.com/email-confirmed.html
   http://localhost:3000/register_improved.html
   http://localhost:8080/register_improved.html
   https://yourdomain.com/register_improved.html
   ```

### 3. OAuth Providers Configuration

#### Facebook OAuth Setup:
1. Go to Authentication → Providers → Facebook
2. Enable Facebook provider
3. Add your Facebook App ID and App Secret
4. Configure redirect URL: `https://[your-project-ref].supabase.co/auth/v1/callback`

#### Google OAuth Setup:
1. Go to Authentication → Providers → Google
2. Enable Google provider
3. Add your Google Client ID and Client Secret
4. Configure redirect URL: `https://[your-project-ref].supabase.co/auth/v1/callback`

### 4. Email Confirmation Settings
1. Go to Authentication → Settings
2. Enable "Enable email confirmations"
3. Enable "Enable email OTP" (for email-first verification flow)
4. Set "Email confirmation redirect URL" to: `https://yourdomain.com/email-confirmed.html`
5. Add redirect URLs for email verification:
   ```
   https://deploy-preview-4--famous-pasca-610e24.netlify.app/register_improved.html
   https://vietlinker.info/register_improved.html
   http://localhost:3000/register_improved.html
   ```

## SMS Verification Backend (Required)

### Twilio Setup
1. **Create Twilio Account**: Sign up at https://www.twilio.com/
2. **Get Credentials**:
   - Account SID
   - Auth Token
   - Create a Verify Service and get Service SID

### Backend API Endpoints Needed

#### 1. Send Verification Code Endpoint
```javascript
// POST /api/send-verification
app.post('/api/send-verification', async (req, res) => {
  const { phone } = req.body;
  
  try {
    const verification = await client.verify.v2.services(TWILIO_VERIFY_SID)
      .verifications
      .create({ to: phone, channel: 'sms' });
    
    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### 2. Verify Code Endpoint
```javascript
// POST /api/verify-code
app.post('/api/verify-code', async (req, res) => {
  const { phone, code } = req.body;
  
  try {
    const verification = await client.verify.v2.services(TWILIO_VERIFY_SID)
      .verificationChecks
      .create({ to: phone, code: code });
    
    if (verification.status === 'approved') {
      res.json({ success: true, verified: true });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Environment Variables
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SID=your_verify_service_sid
```

## Facebook App Configuration

### 1. Create Facebook App
1. Go to https://developers.facebook.com/
2. Create a new app
3. Add "Facebook Login" product

### 2. Configure Facebook Login
1. Go to Facebook Login → Settings
2. Add Valid OAuth Redirect URIs:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   ```
3. Enable "Client OAuth Login"
4. Enable "Web OAuth Login"

### 3. App Settings
1. Go to Settings → Basic
2. Note down App ID and App Secret
3. Add these to Supabase Facebook OAuth settings

## Google OAuth Configuration

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API (or Google Identity API)

### 2. Create OAuth 2.0 Credentials
1. Go to APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. **CRITICAL**: Add authorized redirect URIs (this must match exactly):
   ```
   https://wwlmvcsozavqfvwlxkrt.supabase.co/auth/v1/callback
   ```
5. Add authorized JavaScript origins (for your domains):
   ```
   https://deploy-preview-4--famous-pasca-610e24.netlify.app
   https://yourdomain.com
   http://localhost:3000
   ```

### 3. Supabase Site URL Configuration (SIMPLIFIED - ONE-TIME SETUP)
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. **Set Site URL to your main production domain:**
   ```
   https://vietlinker.info
   ```

3. **Add ALL your environments to "Additional Redirect URLs":**
   ```
   https://vietlinker.info/**
   https://deploy-preview-*--famous-pasca-610e24.netlify.app/**
   https://famous-pasca-610e24.netlify.app/**
   http://localhost:3000/**
   http://localhost:8080/**
   ```

**✅ ADVANTAGE**: With the updated OAuth code using dynamic redirectTo, you only need to configure this ONCE. The code automatically detects the current domain and redirects appropriately, so OAuth works on production, deploy previews, and local development without changing Site URL.

### 4. Configure OAuth Consent Screen
1. Go to OAuth consent screen
2. Fill in required information
3. Add scopes: email, profile, openid
4. Add test users if in development

### 5. OAuth Flow Explanation
- When user clicks "Login with Google", Supabase redirects to Google OAuth
- Google authenticates user and redirects back to: `https://wwlmvcsozavqfvwlxkrt.supabase.co/auth/v1/callback`
- Supabase processes the OAuth response and redirects user to the configured Site URL
- The register_improved.html page detects the OAuth session and completes registration

### 6. Troubleshooting OAuth Issues
- **Problem**: "Page not found" after Google OAuth
- **Root Cause**: OAuth state parameter contains wrong site_url causing Supabase to redirect to incorrect domain
- **Solution**: Enhanced session-based detection with comprehensive logging and fallback handling
- **One-time setup**: Just ensure all your domains are in the "Additional Redirect URLs" list
- **No more manual Site URL changes needed** for different environments

**If OAuth still fails:**
1. **Check Redirect URLs**: Ensure your current domain is in the "Additional Redirect URLs" list
2. **Verify Google Cloud Console**: Ensure callback URL is `https://wwlmvcsozavqfvwlxkrt.supabase.co/auth/v1/callback`
3. **Check browser console**: Look for OAuth debugging logs and any CORS or authentication errors
4. **Test session detection**: The page should automatically detect successful OAuth sessions
5. **Monitor OAuth flow**: Use browser developer tools to track the complete OAuth redirect chain

**Enhanced OAuth Debugging:**
- Comprehensive console logging tracks each step of the OAuth process
- Session-based detection works even when OAuth state redirects to wrong domain
- URL parameter detection catches OAuth callbacks with `code` and `state` parameters
- Timing adjustments allow Supabase to process OAuth callbacks before checking user status
- Fallback error handling provides clear feedback when OAuth fails

**Dynamic OAuth Flow:**
- Code automatically detects current domain (production, deploy preview, localhost)
- Uses `window.location.origin` to build correct redirect URL
- Works on any environment without configuration changes
- Enhanced session-based detection ensures registration completes even if redirect fails
- Multiple detection methods (session, URL parameters, timing) provide robust fallback handling

**Testing OAuth Flow:**
1. Open browser developer tools and go to Console tab
2. Navigate to registration page and click Google OAuth button
3. Complete Google authentication
4. Monitor console logs for OAuth debugging information
5. Verify successful registration or identify specific error points

## Database Schema Updates

### Users Table Modifications
```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_method VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level VARCHAR(20) DEFAULT 'basic';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_registration_method ON users(registration_method);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(phone_verified, email_verified);
```

## Testing Configuration

### Local Development
1. Use ngrok or similar tool to expose local server:
   ```bash
   ngrok http 3000
   ```
2. Update Supabase redirect URLs with ngrok URL
3. Test all authentication flows

### Production Deployment
1. Update all redirect URLs to production domain
2. Configure SSL certificates
3. Set up proper CORS headers
4. Test all authentication flows in production

## Security Considerations

### API Security
- Implement rate limiting for SMS endpoints
- Use HTTPS for all authentication endpoints
- Validate and sanitize all input data
- Implement proper error handling

### Data Protection
- Encrypt sensitive user data
- Implement proper session management
- Use secure cookie settings
- Regular security audits

## Monitoring and Logging

### Authentication Metrics
- Track successful/failed login attempts
- Monitor SMS verification success rates
- Log OAuth callback errors
- Track user registration completion rates

### Error Monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API endpoint performance
- Track authentication flow abandonment
- Alert on unusual authentication patterns

## Troubleshooting Common Issues

### Email Verification Issues

#### **CRITICAL: API Success But No Email Delivery**
If Supabase API calls succeed (no 400 errors) but users don't receive verification emails:

1. **Check Supabase Email Service Configuration**:
   - Go to Supabase Dashboard → Settings → API
   - Verify that email service is properly configured
   - Check if custom SMTP is required for your project tier

2. **Verify Email Templates**:
   - Go to Authentication → Email Templates
   - Ensure "Magic Link" template is configured (used by signInWithOtp)
   - Template must include `{{ .ConfirmationURL }}` variable
   - Test template with preview function

3. **Check Email Provider Restrictions**:
   - Gmail/Yahoo may block emails from new domains
   - Check Supabase email delivery logs in dashboard
   - Consider using custom SMTP (SendGrid, Mailgun, etc.)

4. **Domain Authentication**:
   - Verify sender domain is authenticated
   - Check SPF/DKIM records if using custom domain
   - Ensure "From" email address is verified

#### **Step-by-Step Debugging**:

1. **Supabase Dashboard Checks**:
   ```
   Authentication → Settings:
   ✅ Enable email confirmations: ON
   ✅ Enable email OTP: ON
   ✅ Confirm email change: ON
   ✅ Secure email change: ON
   ```

2. **Email Template Configuration**:
   ```
   Authentication → Email Templates → Magic Link:
   Subject: Xác minh email VietLinker
   Body: <a href="{{ .ConfirmationURL }}">Xác minh email</a>
   ```

3. **SMTP Configuration** (if built-in service fails):
   ```
   Settings → API → SMTP Settings:
   - Host: smtp.sendgrid.net
   - Port: 587
   - Username: apikey
   - Password: [SendGrid API Key]
   ```

4. **Test Email Delivery**:
   - Use Supabase SQL Editor to check auth.users table
   - Look for email_confirmed_at field
   - Check Supabase logs for email delivery errors

#### **Common Issues & Solutions**:

- **400 Error on Email Signup**: Check Supabase Authentication settings
  - Go to Authentication → Settings → Enable "Enable email confirmations"
  - Verify SMTP configuration is set up (or use Supabase's built-in email service)
  - Check that Site URL and redirect URLs are properly configured

- **Email OTP Configuration**: For email-first verification flow
  - Go to Authentication → Settings → Enable "Enable email OTP"
  - Configure email templates for OTP verification
  - Set appropriate redirect URLs for email verification

- **Emails Going to Spam**: 
  - Check sender reputation
  - Configure SPF/DKIM records
  - Use reputable SMTP service

- **Rate Limiting**: 
  - Supabase may limit email sending frequency
  - Check project usage limits
  - Implement proper error handling for rate limits

- **Debug Email Sending**: Check browser console for 400 errors from Supabase auth endpoints

#### **Production Email Setup Checklist**:
- [ ] Custom SMTP configured (recommended for production)
- [ ] Domain authentication (SPF/DKIM) set up
- [ ] Email templates customized and tested
- [ ] Sender email address verified
- [ ] Rate limiting and error handling implemented
- [ ] Email delivery monitoring set up

### SMS Verification Issues
- Verify Twilio credentials are correct
- Check phone number format (+1 for US numbers)
- Monitor Twilio console for delivery status
- Implement fallback for international numbers

### OAuth Issues
- Verify app credentials in provider dashboards
- Check redirect URI configuration
- Monitor OAuth provider status pages
- Test with different browsers/devices

This setup guide provides comprehensive instructions for implementing all authentication features in the VietLinker platform.
