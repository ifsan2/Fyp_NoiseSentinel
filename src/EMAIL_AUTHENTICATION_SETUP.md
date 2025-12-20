# Email Authentication Setup Guide

## Overview

This guide will help you configure email authentication for NoiseSentinel using Gmail SMTP with App Passwords.

## Prerequisites

- Gmail account
- 2-Factor Authentication enabled on your Gmail account
- .NET 8.0 SDK installed
- Node.js and npm installed

---

## Part 1: Gmail App Password Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", select **2-Step Verification**
3. Follow the prompts to enable 2FA if not already enabled

### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Sign in with your Gmail credentials
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Enter: `NoiseSentinel API`
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
8. **IMPORTANT**: Save this password securely - you won't see it again!

---

## Part 2: Backend API Configuration

### Step 1: Configure appsettings.json

1. Navigate to: `NoiseSentinel.WebApi/`
2. Open `appsettings.json` (or create it from `appsettings.example.json`)
3. Update the `EmailSettings` section:

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your.email@gmail.com",
    "SmtpPassword": "your 16-char app password here",
    "FromEmail": "your.email@gmail.com",
    "FromName": "NoiseSentinel",
    "EnableSsl": true,
    "OtpExpirationMinutes": 15
  }
}
```

**Example:**

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "admin@noisesentinel.com",
    "SmtpPassword": "abcdefghijklmnop",
    "FromEmail": "admin@noisesentinel.com",
    "FromName": "NoiseSentinel",
    "EnableSsl": true,
    "OtpExpirationMinutes": 15
  }
}
```

### Step 2: Apply Database Migration

```bash
cd "NoiseSentinel.WebApi"

# Install EF Core tools (if not already installed)
dotnet tool install --global dotnet-ef

# Apply the migration
dotnet ef database update --project ../NoiseSentinel.DAL

# Verify migration was applied
dotnet ef migrations list --project ../NoiseSentinel.DAL
```

### Step 3: Build and Run Backend

```bash
# Build the project
dotnet build

# Run the API
dotnet run
```

The API should now be running at `https://localhost:7000` (or the port configured in launchSettings.json)

---

## Part 3: WebPortal Configuration

### Step 1: Configure API Base URL

1. Navigate to: `Noisesentinel.WebPortal/`
2. Create `.env` file in the root:

```env
VITE_API_BASE_URL=https://localhost:7000/api
```

**For Production:**

```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

### Step 2: Update axios.config.ts (if needed)

The file should already be configured to use `import.meta.env.VITE_API_BASE_URL`

File: `src/api/axios.config.ts`

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7000/api";
```

### Step 3: Install Dependencies and Run

```bash
# Install packages
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The portal will be available at `http://localhost:5173`

---

## Part 4: MobileApp Configuration

### Step 1: Configure API Base URL

1. Navigate to: `NoiseSentinel.MobileApp/`
2. Open `src/api/axios.config.ts`
3. Update the baseURL:

**For Development (your computer's local IP):**

```typescript
const API_BASE_URL = "http://192.168.1.100:7000/api"; // Replace with your IP
```

**How to find your local IP:**

- **Windows**: Open CMD → `ipconfig` → Look for "IPv4 Address"
- **Mac/Linux**: Open Terminal → `ifconfig` → Look for "inet"

**For Production:**

```typescript
const API_BASE_URL = "https://yourdomain.com/api";
```

### Step 2: Install Dependencies

```bash
# Install packages
npm install

# For iOS
cd ios && pod install && cd ..
```

### Step 3: Run the App

```bash
# Start Expo
npm start

# Or run directly on device
npm run android  # For Android
npm run ios      # For iOS (Mac only)
```

---

## Part 5: Testing Email Verification

### Test Registration Flow

#### WebPortal:

1. Navigate to Register/Admin page
2. Fill in all fields with a **valid email address**
3. Submit the form
4. Check email inbox for verification code
5. Enter the 6-digit OTP on verification page
6. Click "Verify Email"
7. Success! You can now login

#### MobileApp:

1. Open the app
2. Navigate to Register screen (if available)
3. Fill in registration details with **valid email**
4. Submit registration
5. App should navigate to VerifyEmail screen
6. Check email inbox for verification code
7. Enter 6-digit OTP
8. Click "Verify Email"
9. Success! Navigate to login

### Test Resend OTP:

1. On verification page, click "Resend Code"
2. Wait for cooldown (60 seconds)
3. Check email for new OTP
4. Enter new OTP and verify

### Common Issues:

#### Email Not Received:

- ✅ Check spam/junk folder
- ✅ Verify Gmail SMTP credentials in appsettings.json
- ✅ Ensure 2FA and App Password are set up correctly
- ✅ Check backend logs for errors
- ✅ Test SMTP with a simple email tool first

#### Invalid OTP Error:

- ✅ OTP expires after 15 minutes - request new one
- ✅ Ensure you're using the most recent OTP
- ✅ Check that email matches exactly (case-sensitive)

#### API Connection Error:

- ✅ Backend API is running
- ✅ Correct API URL in frontend .env or config
- ✅ CORS is configured in backend Program.cs
- ✅ Firewall allows connections on API port

#### MobileApp Can't Connect:

- ✅ Use local IP address (not localhost)
- ✅ Phone and computer on same WiFi network
- ✅ Backend is running and accessible
- ✅ Port 7000 is open in firewall

---

## Part 6: Security Best Practices

### Production Checklist:

- [ ] **Never commit** appsettings.json with real credentials to Git
- [ ] Use **User Secrets** for development (dotnet user-secrets)
- [ ] Use **Azure Key Vault** or **AWS Secrets Manager** for production
- [ ] Enable **rate limiting** on /verify-email and /resend-otp endpoints
- [ ] Add **CAPTCHA** to prevent automated attacks
- [ ] Use **HTTPS** only in production
- [ ] Implement **email verification expiry** (already set to 15 minutes)
- [ ] Add **maximum resend attempts** (e.g., 5 per hour)
- [ ] Log failed verification attempts for security monitoring
- [ ] Consider using dedicated **email service** (SendGrid, AWS SES, Mailgun)

### Environment Variables (Recommended for Production):

```bash
# Backend - use User Secrets or environment variables
dotnet user-secrets set "EmailSettings:SmtpUsername" "your.email@gmail.com"
dotnet user-secrets set "EmailSettings:SmtpPassword" "your-app-password"
```

---

## Part 7: Email Template Customization

The HTML email templates are in `NoiseSentinel.BLL/Services/EmailService.cs`

### Customize Email Appearance:

1. Open `EmailService.cs`
2. Find `GetEmailVerificationTemplate` method
3. Modify HTML/CSS as needed:
   - Change colors: `#007AFF` → your brand color
   - Update logo/branding
   - Adjust text content
   - Add footer links

### Email Preview:

Send test email to yourself:

```csharp
// Add temporary endpoint in AuthController for testing
[HttpPost("test-email")]
public async Task<IActionResult> TestEmail([FromBody] string email)
{
    await _emailService.SendEmailVerificationAsync(
        email,
        "John Doe",
        "123456",
        "http://localhost:5173/verify-email?email=" + email
    );
    return Ok("Test email sent");
}
```

---

## Part 8: Troubleshooting

### Backend Logs:

Check console output for errors related to:

- SMTP connection failures
- Invalid credentials
- Network timeouts

### Frontend Network Inspection:

- **Chrome DevTools** → Network tab → Check API calls
- **React Native Debugger** → Network tab

### Database Verification:

```sql
-- Check if user was created
SELECT * FROM Users WHERE Email = 'test@example.com';

-- Check OTP and expiry
SELECT EmailVerificationOtp, OtpExpiresAt, EmailVerifiedAt
FROM Users
WHERE Email = 'test@example.com';

-- Manually verify email (for testing)
UPDATE Users
SET EmailVerifiedAt = GETDATE(),
    EmailVerificationOtp = NULL,
    OtpExpiresAt = NULL
WHERE Email = 'test@example.com';
```

---

## Support

For additional help:

- Check backend logs in console
- Review browser console for frontend errors
- Verify all configuration files
- Test SMTP credentials with external tool
- Contact support team if issues persist

---

## Quick Start Summary

```bash
# 1. Setup Gmail App Password
# → https://myaccount.google.com/apppasswords

# 2. Configure Backend
cd NoiseSentinel.WebApi
# Edit appsettings.json with SMTP credentials
dotnet ef database update --project ../NoiseSentinel.DAL
dotnet run

# 3. Configure WebPortal
cd ../Noisesentinel.WebPortal
# Create .env with VITE_API_BASE_URL
npm install
npm run dev

# 4. Configure MobileApp
cd ../NoiseSentinel.MobileApp
# Update axios.config.ts with your local IP
npm install
npm start

# 5. Test
# Register → Check Email → Enter OTP → Verify → Login
```

**🎉 You're all set! Email authentication is now configured.**
