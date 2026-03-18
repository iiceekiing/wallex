# 📧 Email Service Setup Guide

This guide explains how to configure the email service for Wallex to send welcome emails and OTP verification codes.

## 🚀 Quick Setup

### 1. Choose an Email Provider

We recommend using **Gmail** for development and **SendGrid** or **AWS SES** for production.

### 2. Gmail Setup (Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Wallex"
3. **Update your .env file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_generated_app_password
   EMAIL_FROM=Wallex <noreply@wallex.com>
   ```

### 3. SendGrid Setup (Production)

1. **Create a SendGrid account** at [sendgrid.com](https://sendgrid.com)
2. **Verify your sender identity**
3. **Generate an API key**
4. **Update your .env file**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASS=your_sendgrid_api_key
   EMAIL_FROM=Wallex <noreply@wallex.com>
   ```

## 📨 What Emails Are Sent?

### 1. Welcome Email
- **Trigger**: After successful email verification
- **Content**: Welcome message, platform features, security tips
- **Template**: Beautiful HTML with Wallex branding

### 2. OTP Verification Email
- **Trigger**: During registration and password reset
- **Content**: 6-digit verification code
- **Expires**: 5 minutes

## 🔧 Testing Email Service

### Development Mode
In development (`NODE_ENV=development`), if email is not configured:
- ✅ OTP codes are shown in console
- ✅ Welcome email content is logged to console
- ✅ Application continues working normally

### Production Mode
In production (`NODE_ENV=production`):
- ❌ Email failures are logged but don't stop the application
- ✅ Users can still use the platform without email issues

## 🛠️ Troubleshooting

### Common Issues

1. **"Email service initialization failed"**
   - Check your email credentials
   - Verify SMTP settings
   - Ensure app password (not regular password) for Gmail

2. **"535 Authentication failed"**
   - Use app password for Gmail, not regular password
   - Enable 2-factor authentication

3. **"Connection timeout"**
   - Check firewall settings
   - Verify SMTP port (587 for TLS, 465 for SSL)

### Test Email Functionality

```bash
# Register a new user to test OTP email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"+1234567890","password":"Password123!"}'

# Verify OTP to test welcome email
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## 🔐 Security Best Practices

1. **Never commit email credentials to version control**
2. **Use app passwords, not regular passwords**
3. **Enable TLS/SSL encryption** (`EMAIL_SECURE=true` for port 465)
4. **Use dedicated email service** for production
5. **Monitor email deliverability** and bounce rates

## 📧 Email Templates

### Welcome Email Features
- ✅ Personalized greeting
- ✅ Platform feature overview
- ✅ Security tips
- ✅ Call-to-action button
- ✅ Professional branding

### OTP Email Features
- ✅ Clear code display
- ✅ Expiration warning
- ✅ Security notice
- ✅ Mobile-friendly design

## 🚀 Next Steps

1. Configure your email service
2. Test with a new user registration
3. Check email deliverability
4. Monitor console logs for any issues
5. Set up production email service for deployment

---

**Need help?** Check the console logs for detailed error messages or contact support at support@wallex.com
