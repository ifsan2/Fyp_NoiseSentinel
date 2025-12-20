# NoiseSentinel - Complete Setup Guide

A professional enterprise-grade noise monitoring and traffic enforcement system with email authentication.

## 🏗️ Architecture

```
NoiseSentinel/
├── NoiseSentinel.DAL/          # Data Access Layer
│   ├── Models/                 # Entity models
│   ├── Repositories/           # Data access logic
│   └── Contexts/              # Database context
├── NoiseSentinel.BLL/          # Business Logic Layer
│   ├── Services/              # Business logic services
│   ├── DTOs/                  # Data transfer objects
│   └── Configuration/         # App settings models
├── NoiseSentinel.WebApi/       # ASP.NET Core Web API
│   └── Controllers/           # API endpoints
├── Noisesentinel.WebPortal/    # React Admin Portal
│   └── src/                   # React TypeScript app
└── NoiseSentinel.MobileApp/    # React Native Mobile App
    └── src/                   # React Native TypeScript app
```

## 🚀 Technology Stack

### Backend

- **.NET 8.0** - Latest LTS framework
- **ASP.NET Core Web API** - RESTful API
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **ASP.NET Identity** - Authentication
- **JWT** - Token-based auth
- **MailKit** - Email sending

### Frontend - WebPortal

- **React 18.2** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material-UI 5** - Component library
- **React Router 6** - Navigation
- **React Hook Form** - Form management
- **Axios** - HTTP client

### Frontend - MobileApp

- **React Native 0.72** - Mobile framework
- **Expo 49** - Development platform
- **TypeScript** - Type safety
- **React Navigation** - Mobile navigation
- **Axios** - HTTP client

---

## 📋 Prerequisites

### Required Software:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) and npm
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express or Developer Edition)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

### For Mobile Development:

- [Android Studio](https://developer.android.com/studio) (for Android)
- [Xcode](https://developer.apple.com/xcode/) (for iOS - Mac only)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

---

## 🛠️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd src
```

### 2️⃣ Backend Setup (WebApi)

#### Install Database

1. Install SQL Server Express
2. Note your connection string

#### Configure Database Connection

Edit `NoiseSentinel.WebApi/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=NoiseSentinelDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

#### Configure Email Settings

See [EMAIL_AUTHENTICATION_SETUP.md](EMAIL_AUTHENTICATION_SETUP.md) for detailed Gmail SMTP configuration.

Quick setup:

```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your.email@gmail.com",
    "SmtpPassword": "your-16-char-app-password",
    "FromEmail": "your.email@gmail.com",
    "FromName": "NoiseSentinel",
    "EnableSsl": true,
    "OtpExpirationMinutes": 15
  }
}
```

#### Install EF Tools and Apply Migrations

```bash
# Install Entity Framework tools globally
dotnet tool install --global dotnet-ef

# Navigate to WebApi project
cd NoiseSentinel.WebApi

# Apply database migrations
dotnet ef database update --project ../NoiseSentinel.DAL

# Build the project
dotnet build

# Run the API
dotnet run
```

API will be available at: `https://localhost:7000`

---

### 3️⃣ WebPortal Setup

```bash
cd Noisesentinel.WebPortal

# Install dependencies
npm install

# Create environment file
echo VITE_API_BASE_URL=https://localhost:7000/api > .env

# Run development server
npm run dev

# Build for production
npm run build
```

Portal will be available at: `http://localhost:5173`

---

### 4️⃣ MobileApp Setup

#### Configure API URL

Edit `NoiseSentinel.MobileApp/src/api/axios.config.ts`:

```typescript
// For development - use your computer's IP address
const API_BASE_URL = "http://192.168.1.100:7000/api"; // Replace with your IP

// For production
const API_BASE_URL = "https://yourdomain.com/api";
```

**Find your local IP:**

- Windows: `ipconfig` in CMD
- Mac/Linux: `ifconfig` in Terminal

#### Install and Run

```bash
cd NoiseSentinel.MobileApp

# Install dependencies
npm install

# Start Expo
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (Mac only)
```

---

## 🔐 Email Authentication Flow

### Registration Process:

1. User registers with email, password, and details
2. System generates 6-digit OTP
3. Email sent with OTP and verification link
4. User enters OTP on verification screen
5. System validates OTP and marks email as verified
6. User can now login

### Features:

- ✅ 6-digit OTP generation
- ✅ OTP expires after 15 minutes
- ✅ Resend OTP functionality (60-second cooldown)
- ✅ Professional HTML email templates
- ✅ Verification link in email (alternative to OTP)
- ✅ Email verification status tracking
- ✅ User-friendly error messages

---

## 🧪 Testing the Application

### Test Backend API

```bash
# Using curl
curl -X POST https://localhost:7000/api/Auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Using Postman
# Import the API collection (if available)
# Or create requests manually
```

### Test Email Verification

1. **Register a new user** with valid email
2. **Check email inbox** for OTP (check spam folder)
3. **Enter OTP** on verification screen
4. **Verify success** message appears
5. **Login** with verified credentials

### Test WebPortal

```bash
cd Noisesentinel.WebPortal
npm run dev
# Open http://localhost:5173
# Navigate to Register → Verify Email → Login
```

### Test MobileApp

```bash
cd NoiseSentinel.MobileApp
npm start
# Scan QR code with Expo Go app
# Test registration and verification flow
```

---

## 📁 Project Structure Details

### Backend (NoiseSentinel.WebApi)

```
Controllers/
├── AuthController.cs          # Login, Register, Verify Email, Resend OTP
├── UserController.cs          # User management
├── ViolationController.cs     # Traffic violations
└── ...

Program.cs                     # Startup configuration
appsettings.json              # Configuration settings
```

### Business Logic (NoiseSentinel.BLL)

```
Services/
├── AuthService.cs            # Authentication logic
├── EmailService.cs           # Email sending with templates
├── UserService.cs            # User operations
└── Interfaces/               # Service interfaces

DTOs/
├── Auth/                     # Auth DTOs (Login, Register, VerifyOtp)
├── User/                     # User DTOs
└── ...
```

### Data Access (NoiseSentinel.DAL)

```
Models/
├── User.cs                   # User entity with email verification fields
├── Violation.cs              # Traffic violation entity
└── ...

Repositories/
├── UserRepository.cs         # User data access
└── ...

Contexts/
└── NoiseSentinelDbContext.cs # EF Core context
```

### WebPortal

```
src/
├── api/                      # API client services
│   ├── authApi.ts           # Auth endpoints
│   ├── axios.config.ts      # Axios configuration
│   └── ...
├── pages/                    # React pages
│   ├── auth/                # Auth pages (Login, Register, VerifyEmail)
│   ├── dashboard/           # Dashboard pages
│   └── ...
├── components/               # Reusable components
├── contexts/                 # React contexts (Auth, Theme)
└── routes/                   # Routing configuration
```

### MobileApp

```
src/
├── api/                      # API client services
│   ├── authApi.ts           # Auth endpoints
│   └── axios.config.ts      # Axios configuration
├── screens/                  # Mobile screens
│   ├── auth/                # Auth screens (Login, VerifyEmail)
│   ├── dashboard/           # Dashboard screens
│   └── ...
├── components/               # Reusable components
├── navigation/               # Navigation configuration
│   ├── AuthNavigator.tsx    # Auth stack (Login, VerifyEmail)
│   └── ...
└── contexts/                 # React contexts
```

---

## 🔧 Configuration Files

### Backend Configuration

**appsettings.json** - Main configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=NoiseSentinelDb;..."
  },
  "JwtSettings": {
    "Secret": "your-secret-key-min-32-chars",
    "Issuer": "NoiseSentinel",
    "Audience": "NoiseSentinelUsers",
    "ExpiryInMinutes": 60
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your.email@gmail.com",
    "SmtpPassword": "app-password",
    "FromEmail": "your.email@gmail.com",
    "FromName": "NoiseSentinel",
    "EnableSsl": true,
    "OtpExpirationMinutes": 15
  }
}
```

### WebPortal Configuration

**.env** - Environment variables

```env
VITE_API_BASE_URL=https://localhost:7000/api
```

### MobileApp Configuration

**axios.config.ts** - API base URL

```typescript
const API_BASE_URL = "http://192.168.1.100:7000/api";
```

---

## 🐛 Common Issues & Solutions

### Backend Issues

#### ❌ Database Migration Error

```bash
# Solution: Install EF tools
dotnet tool install --global dotnet-ef

# Clear and rebuild
dotnet ef database drop --force --project NoiseSentinel.DAL
dotnet ef database update --project NoiseSentinel.DAL
```

#### ❌ Email Not Sending

- Check Gmail SMTP credentials
- Verify 2FA and App Password are set up
- Check spam/junk folder
- Review backend logs for SMTP errors
- See [EMAIL_AUTHENTICATION_SETUP.md](EMAIL_AUTHENTICATION_SETUP.md)

#### ❌ CORS Error

Ensure CORS is configured in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});
```

### Frontend Issues

#### ❌ API Connection Failed (WebPortal)

- Verify backend is running
- Check .env file has correct API URL
- Check browser console for CORS errors
- Verify API endpoint in axios.config.ts

#### ❌ MobileApp Can't Connect to API

- Use your computer's **local IP** (not localhost)
- Ensure phone and computer are on **same WiFi**
- Check firewall allows port 7000
- Verify API URL in axios.config.ts

#### ❌ TypeScript Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npm list typescript
```

---

## 🚀 Deployment

### Backend Deployment (Azure/IIS)

1. Update appsettings.Production.json with production settings
2. Build release version: `dotnet publish -c Release`
3. Deploy to Azure App Service or IIS
4. Configure environment variables for sensitive data
5. Set up SSL certificate

### WebPortal Deployment (Netlify/Vercel)

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to hosting service
# Configure environment variables on hosting platform
```

### MobileApp Deployment

#### Android:

```bash
# Build APK
eas build --platform android

# Generate signed APK for Play Store
# Follow Expo EAS Build documentation
```

#### iOS:

```bash
# Build IPA (requires Mac)
eas build --platform ios

# Submit to App Store
# Follow Expo EAS Submit documentation
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/Auth/login

```json
Request:
{
  "username": "admin",
  "password": "Admin@123"
}

Response:
{
  "message": "Login successful",
  "data": {
    "userId": 1,
    "username": "admin",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "Admin",
    "token": "eyJhbGciOiJIUzI1...",
    "expiresAt": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /api/Auth/verify-email

```json
Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "message": "Email verified successfully"
}
```

#### POST /api/Auth/resend-otp

```json
Request:
{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent successfully to your email"
}
```

---

## 🔒 Security Best Practices

### Production Checklist:

- [ ] Use **HTTPS** only (SSL/TLS)
- [ ] Store secrets in **Azure Key Vault** or **AWS Secrets Manager**
- [ ] Enable **rate limiting** on auth endpoints
- [ ] Add **CAPTCHA** to prevent bots
- [ ] Implement **IP whitelisting** where appropriate
- [ ] Use **strong JWT secrets** (min 32 characters)
- [ ] Set proper **CORS** policy (don't use AllowAnyOrigin in production)
- [ ] Enable **logging and monitoring** (Application Insights, Serilog)
- [ ] Regular **security audits** and dependency updates
- [ ] Implement **password policies** (complexity, expiry)
- [ ] Add **two-factor authentication** for admin accounts
- [ ] Use **prepared statements** to prevent SQL injection (EF Core handles this)

---

## 📞 Support & Contribution

### Reporting Issues

- Check existing issues first
- Provide detailed error messages
- Include steps to reproduce
- Specify environment (OS, .NET version, Node version)

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

---

## 📝 License

[Add your license information]

---

## 🙏 Acknowledgments

- ASP.NET Core team
- React and React Native communities
- Material-UI team
- All open-source contributors

---

## 📖 Additional Resources

- [EMAIL_AUTHENTICATION_SETUP.md](EMAIL_AUTHENTICATION_SETUP.md) - Detailed email setup guide
- [API Documentation](docs/API.md) - Complete API reference
- [Database Schema](docs/DATABASE.md) - Database structure
- [Troubleshooting Guide](docs/TROUBLESHOOTING.md) - Common issues and solutions

---

**Built with ❤️ by the NoiseSentinel Team**
