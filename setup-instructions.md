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

#### **SOLUTION: Custom SMTP Setup (Recommended)**

Since Supabase's built-in email service has rate limits and may not deliver emails reliably, setting up custom SMTP is the best solution:

---

## 🇻🇳 **HƯỚNG DẪN TIẾNG VIỆT: Cấu Hình SendGrid SMTP**

### **Bước 1: Tạo Tài Khoản SendGrid (Miễn Phí)**

1. **Truy cập SendGrid**:
   - Vào trang web: https://sendgrid.com/
   - Click nút **"Start for Free"** hoặc **"Get Started"**

2. **Đăng Ký Tài Khoản**:
   - Điền thông tin cá nhân (họ tên, email, mật khẩu)
   - Chọn **"I'm a developer"** khi được hỏi về vai trò
   - Chọn **"Transactional Email"** khi được hỏi về mục đích sử dụng
   - Click **"Create Account"**

3. **Xác Minh Email**:
   - Kiểm tra email của bạn (có thể trong thư mục spam)
   - Click vào link xác minh từ SendGrid
   - Đăng nhập vào tài khoản SendGrid

### **Bước 2: Tạo API Key**

1. **Vào Settings**:
   - Sau khi đăng nhập, click **"Settings"** ở sidebar bên trái
   - Click **"API Keys"**

2. **Tạo API Key Mới**:
   - Click nút **"Create API Key"**
   - Đặt tên cho API Key: `VietLinker Email Service`
   - Chọn **"Restricted Access"**

3. **Cấp Quyền**:
   - Tìm mục **"Mail Send"**
   - Chọn **"Full Access"** cho Mail Send
   - Click **"Create & View"**

4. **Lưu API Key**:
   - **QUAN TRỌNG**: Copy API Key và lưu vào notepad
   - API Key chỉ hiển thị 1 lần duy nhất
   - Ví dụ: `SG.abc123xyz...`

### **Bước 3: Cấu Hình SMTP Trong Supabase**

1. **Vào Supabase Dashboard**:
   - Truy cập: https://supabase.com/dashboard
   - Chọn project VietLinker của bạn

2. **Vào Email Settings**:
   - Click **"Authentication"** ở sidebar
   - Click **"Emails"**
   - Click tab **"SMTP Settings"**

3. **Bật Custom SMTP**:
   - Bật toggle **"Enable Custom SMTP"**
   - Điền thông tin như sau:

   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Dán API Key từ bước 2]
   Sender name: VietLinker
   Sender email: noreply@vietlinker.info
   ```

4. **Lưu Cấu Hình**:
   - Click **"Save"** hoặc **"Update"**
   - Đợi thông báo thành công

### **Bước 4: Test Email Verification**

1. **Mở Deploy Preview**:
   - Vào: https://deploy-preview-4--famous-pasca-610e24.netlify.app/register_improved.html

2. **Test Gửi Email**:
   - Nhập email: `sangpho966996@gmail.com`
   - Click **"Gửi Email Xác Minh"**
   - Kiểm tra inbox và spam folder

3. **Kiểm Tra Kết Quả**:
   - Email sẽ đến trong 1-2 phút
   - Click vào link xác minh trong email
   - Form đăng ký sẽ được kích hoạt

### **🔧 Debug Nếu Có Lỗi**

Nếu vẫn không nhận được email:

1. **Kiểm tra API Key**:
   - Đảm bảo copy đúng API Key từ SendGrid
   - Không có khoảng trắng thừa

2. **Kiểm tra Email Templates**:
   - Vào Authentication → Emails → Templates
   - Đảm bảo template "Confirm signup" có `{{ .ConfirmationURL }}`

3. **Debug Function**:
   - Mở browser console (F12)
   - Chạy: `debugEmailVerification()`
   - Xem log chi tiết

### **💡 Lưu Ý Quan Trọng**

- **Free Tier**: SendGrid cho phép 100 emails/ngày miễn phí
- **Production**: Nên upgrade plan khi có nhiều user
- **Domain Authentication**: Nên setup domain authentication cho tỷ lệ delivery cao hơn
- **Monitoring**: Theo dõi email delivery stats trong SendGrid dashboard

---

##### **Option 1: SendGrid SMTP Setup**

1. **Create SendGrid Account**:
   - Go to https://sendgrid.com/
   - Sign up for free account (100 emails/day free tier)
   - Verify your account via email

2. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Choose "Restricted Access"
   - Give permissions: Mail Send (Full Access)
   - Copy the API key (save it securely)

3. **Configure Supabase SMTP**:
   - Go to Supabase Dashboard → Authentication → Emails → SMTP Settings
   - Enable "Enable Custom SMTP"
   - Configure settings:
     ```
     Host: smtp.sendgrid.net
     Port: 587
     Username: apikey
     Password: [Your SendGrid API Key]
     Sender name: VietLinker
     Sender email: noreply@vietlinker.info
     ```

4. **Domain Authentication** (Optional but recommended):
   - In SendGrid: Settings → Sender Authentication
   - Authenticate your domain (vietlinker.info)
   - Add DNS records as instructed

##### **Option 2: Gmail SMTP Setup** (For testing only)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Configure Supabase SMTP**:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-gmail@gmail.com
   Password: [App Password from step 2]
   Sender name: VietLinker
   Sender email: your-gmail@gmail.com
   ```

##### **Option 3: Mailgun SMTP Setup**

1. **Create Mailgun Account**: https://www.mailgun.com/
2. **Get SMTP Credentials** from dashboard
3. **Configure Supabase SMTP**:
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: [Mailgun SMTP username]
   Password: [Mailgun SMTP password]
   ```

##### **Testing SMTP Configuration**

After configuring custom SMTP:

1. **Test Email Sending**:
   - Go to deploy preview: https://deploy-preview-4--famous-pasca-610e24.netlify.app/register_improved.html
   - Enter your email address
   - Click "Gửi Email Xác Minh"
   - Check your inbox (and spam folder)

2. **Debug Function**:
   - Open browser console
   - Run: `debugEmailVerification()`
   - Check for detailed logging

3. **Verify Email Delivery**:
   - Email should arrive within 1-2 minutes
   - Click verification link to test complete flow
   - Registration form should be enabled after verification

#### **Production Email Setup Checklist**:
- [ ] Custom SMTP configured (SendGrid/Mailgun recommended)
- [ ] Domain authentication (SPF/DKIM) set up
- [ ] Email templates customized and tested
- [ ] Sender email address verified
- [ ] Rate limiting and error handling implemented
- [ ] Email delivery monitoring set up
- [ ] Test email verification flow end-to-end

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
