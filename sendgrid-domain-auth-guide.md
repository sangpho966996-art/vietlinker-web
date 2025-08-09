# SendGrid Domain Authentication Guide for VietLinker

## Overview
This guide provides step-by-step instructions for configuring SendGrid domain authentication to resolve 500 "Error sending confirmation email" errors in the VietLinker email verification system.

## Problem Description
- **Symptoms**: 500 server errors when sending confirmation emails
- **Root Cause**: SendGrid domain `em312.vietlinker.info` is not properly authenticated
- **Impact**: Users cannot receive email verification messages

## Solution: Configure SendGrid Domain Authentication

### Step 1: Access SendGrid Dashboard
1. Log into your SendGrid account at https://app.sendgrid.com/
2. Navigate to **Settings** → **Sender Authentication** → **Domain Authentication**
3. Look for `em312.vietlinker.info` in the domain list

### Step 2: Initiate Domain Authentication
If the domain is not listed or not verified:
1. Click **"Authenticate Your Domain"**
2. Select your DNS host (where your domain is registered)
3. Enter domain: `em312.vietlinker.info`
4. Choose **"No"** for branded links (unless specifically needed)
5. Click **"Next"**

### Step 3: Configure DNS Records
SendGrid will provide specific DNS records that you must add to your domain registrar. The records will look similar to this:

#### SPF Record (TXT)
```
Name: em312.vietlinker.info
Type: TXT
Value: v=spf1 include:sendgrid.net ~all
TTL: 300 (or default)
```

#### DKIM Records (CNAME)
```
Name: s1._domainkey.em312.vietlinker.info
Type: CNAME
Value: s1.domainkey.u[UNIQUE_ID].wl[UNIQUE_ID].sendgrid.net
TTL: 300 (or default)

Name: s2._domainkey.em312.vietlinker.info
Type: CNAME
Value: s2.domainkey.u[UNIQUE_ID].wl[UNIQUE_ID].sendgrid.net
TTL: 300 (or default)
```

#### Domain Verification (CNAME)
```
Name: em312.vietlinker.info
Type: CNAME
Value: u[UNIQUE_ID].wl[UNIQUE_ID].sendgrid.net
TTL: 300 (or default)
```

**Important**: Use the exact values provided by SendGrid, not the examples above.

### Step 4: Add DNS Records to Domain Registrar
1. Log into your domain registrar's control panel
2. Navigate to DNS management for `vietlinker.info`
3. Add each DNS record exactly as provided by SendGrid
4. Save the changes

### Step 5: Verify Domain Authentication
1. Return to SendGrid dashboard
2. Click **"Verify"** next to your domain
3. SendGrid will check the DNS records
4. If successful, status will change to **"Verified"**

**Note**: DNS propagation can take up to 48 hours. If verification fails initially, wait and try again.

### Step 6: Test Email Delivery
1. Once domain is verified, test email verification at:
   https://deploy-preview-4--famous-pasca-610e24.netlify.app/register_improved.html
2. Check SendGrid Activity dashboard for delivery status
3. Verify emails arrive in recipient inboxes (check spam folder too)

## Troubleshooting

### DNS Propagation Issues
- Use online DNS checker tools to verify records are propagated
- Wait up to 48 hours for global DNS propagation
- Contact domain registrar if records don't appear after 48 hours

### Verification Still Failing
1. **Double-check DNS records**: Ensure exact match with SendGrid values
2. **Check TTL settings**: Use 300 seconds or domain registrar default
3. **Remove conflicting records**: Delete any existing conflicting DNS records
4. **Contact SendGrid support**: If issues persist after 48 hours

### Email Still Not Delivered After Verification
1. **Check SendGrid Activity**: Monitor email processing status
2. **Test different email providers**: Try Gmail, Yahoo, Outlook
3. **Check spam folders**: Emails may be filtered as spam initially
4. **Verify sender reputation**: New domains may have delivery delays

## Verification Checklist
- [ ] SendGrid domain authentication initiated
- [ ] All DNS records added to domain registrar
- [ ] DNS propagation completed (up to 48 hours)
- [ ] Domain status shows "Verified" in SendGrid
- [ ] Test email sent successfully
- [ ] Email received in recipient inbox
- [ ] No 500 errors in browser console

## Additional Resources
- SendGrid Domain Authentication Documentation: https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication
- DNS Propagation Checker: https://dnschecker.org/
- SendGrid Support: https://support.sendgrid.com/

## Contact Information
If you need assistance with this setup, please refer to:
- VietLinker setup documentation: `setup-instructions.md`
- SendGrid troubleshooting section in setup guide
- GitHub issue tracking for authentication fixes

---
*This guide was created to resolve the persistent 500 "Error sending confirmation email" errors in the VietLinker authentication system.*
