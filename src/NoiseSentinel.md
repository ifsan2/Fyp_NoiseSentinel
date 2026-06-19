# NoiseSentinel Source Code

Complete source code for the **NoiseSentinel Traffic Management System** - An integrated IoT, mobile, and web platform for noise and emission violation enforcement with full legal lifecycle management.

---

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Directory Structure](#-directory-structure)
- [Components Overview](#-components-overview)
- [Data Flow](#-data-flow)
- [Technology Stack](#-technology-stack)
- [Quick Start Guide](#-quick-start-guide)
- [User Roles](#-user-roles)
- [Documentation Links](#-documentation-links)
- [Development Setup](#-development-setup)

---

## 🏗️ System Architecture

The NoiseSentinel system follows a **multi-tier architecture** with IoT integration:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ESP32 IoT Devices                                │
│               (Noise, CO, HC sensors + BLE communication)                │
└────────────────────────┬────────────────────────────────────────────────┘
                         │ BLE Protocol (FFE0 Service)
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  React Native Mobile App (Police Officers)               │
│         - Pair with IoT devices                                          │
│         - Run noise/emission tests                                       │
│         - Create challans with evidence                                  │
└────────────────────────┬────────────────────────────────────────────────┘
                         │ REST API (HTTPS + JWT)
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ASP.NET Core Web API (.NET 8.0)                       │
│         ┌───────────────────────────────────────────────────┐           │
│         │          Business Logic Layer (BLL)              │           │
│         │   - Services, DTOs, Helpers, Email, Auth         │           │
│         └───────────────────┬───────────────────────────────┘           │
│         ┌───────────────────▼───────────────────────────────┐           │
│         │          Data Access Layer (DAL)                 │           │
│         │   - Entity Models, Repositories, DbContext       │           │
│         └───────────────────┬───────────────────────────────┘           │
└─────────────────────────────┼───────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       SQL Server Database                                │
│   - 17 Tables: Users, Roles, Cases, Challans, FIRs, Courts, etc.        │
└────────────────────────┬────────────────────────────────────────────────┘
                         │ REST API (HTTPS + JWT)
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              React Web Portal (Vite + TypeScript + MUI)                  │
│         - Admin, Station Authority, Court Authority, Judge dashboards    │
│         - FIR creation, Case management, Device registration             │
│         - Public case status lookup (OTP-verified)                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
src/
├── ESP32_Firmware/             # 🔌 IoT Sensor Device Firmware
│   ├── NoiseSentinel_IoT.ino   # Main firmware (908 lines)
│   ├── sensor_calibration.h    # ADC-to-physical unit conversions
│   ├── ble_protocol.h          # BLE communication protocol
│   ├── README.md               # Hardware setup, wiring, calibration
│   └── .gitignore              # Arduino/ESP32 build artifacts
│
├── NoiseSentinel.DAL/          # 📦 Data Access Layer
│   ├── Contexts/
│   │   └── NoiseSentinelDbContext.cs
│   ├── Models/                 # 17 Entity Models
│   │   ├── User.cs
│   │   ├── Policeofficer.cs
│   │   ├── Judge.cs
│   │   ├── Challan.cs
│   │   ├── Emissionreport.cs
│   │   ├── Fir.cs
│   │   ├── Case.cs
│   │   ├── Casestatement.cs
│   │   └── ... (9 more)
│   └── Repositories/           # Repository pattern implementation
│
├── NoiseSentinel.BLL/          # 🧠 Business Logic Layer
│   ├── Common/
│   │   └── ServiceResult.cs    # Generic result wrapper
│   ├── Configuration/
│   │   ├── EmailSettings.cs
│   │   └── JwtSettings.cs
│   ├── DTOs/                   # Data Transfer Objects (by entity)
│   ├── Helpers/
│   │   ├── ImageCompressionHelper.cs
│   │   └── ChallanTypeHelper.cs
│   └── Services/               # 15 Business Services
│       ├── AuthService.cs
│       ├── ChallanService.cs
│       ├── EmissionreportService.cs
│       ├── FirService.cs
│       ├── CaseService.cs
│       └── ... (10 more)
│
├── NoiseSentinel.WebApi/       # 🌐 ASP.NET Core Web API
│   ├── Controllers/            # 14 API Controllers
│   ├── Program.cs              # Startup + DI configuration
│   ├── appsettings.json        # JWT, DB, Email settings
│   ├── README.md               # API documentation
│   └── bin/, obj/
│
├── Noisesentinel.WebPortal/    # 💻 React Web Dashboard
│   ├── src/
│   │   ├── api/                # Axios API clients
│   │   ├── components/         # React components (by role)
│   │   ├── contexts/           # Auth & Theme contexts
│   │   ├── models/             # TypeScript interfaces
│   │   ├── pages/              # Admin, Station, Court, Judge pages
│   │   ├── routes/             # React Router config
│   │   ├── theme/              # MUI theme (light/dark)
│   │   └── utils/
│   ├── package.json
│   ├── vite.config.ts
│   ├── README.md               # Web portal setup
│   └── dist/                   # Production build output
│
├── NoiseSentinel.MobileApp/    # 📱 React Native (Expo) Mobile App
│   ├── src/
│   │   ├── api/                # Axios API clients
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # AuthContext
│   │   ├── models/             # TypeScript interfaces
│   │   ├── screens/            # Auth, Dashboard, Challan, IoT screens
│   │   ├── styles/             # Theme, colors, typography
│   │   └── utils/
│   ├── assets/                 # Images, fonts, icons
│   ├── app.json                # Expo config (BLE permissions)
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md               # Mobile app setup, BLE integration
│   └── .expo/, node_modules/
│
├── src.sln                     # Visual Studio Solution
├── CHALLAN_TYPE_SYSTEM.md      # Challan type explanation
├── EMAIL_AUTHENTICATION_SETUP.md # Gmail App Password setup
└── README.md                   # This file
```

---

## 🧩 Components Overview

### 1. **ESP32 Firmware** (`ESP32_Firmware/`)

**Purpose:** IoT sensor device for on-site noise and emission testing

**Technology:** Arduino C++ on ESP32 DevKit with BLE 4.2

**Features:**

- **Sensors:** MAX4466 microphone (noise dBA), MQ-7 (CO ppm), MQ-2 (HC ppm)
- **BLE Server:** Service UUID `FFE0`, Control char `FFE1`, Data char `FFE2`
- **Tests:** 10-second noise test, 40-second emission test (30s warmup + 10s sampling)
- **LED Indicators:** Red (not connected), Yellow (connected), Green (scanning)
- **Digital Signatures:** SHA256 hash for tamper-proof emission reports
- **JSON Protocol:** Command/response format for mobile app communication

**Documentation:** [ESP32_Firmware/README.md](ESP32_Firmware/README.md)

---

### 2. **Mobile App** (`NoiseSentinel.MobileApp/`)

**Purpose:** Field enforcement app for police officers

**Technology:** React Native 0.72.10 + Expo SDK 49 + TypeScript

**Features:**

- **BLE Integration:** Pair with ESP32 devices via `react-native-ble-plx`
- **IoT Testing:** Trigger noise/emission tests from mobile UI
- **Challan Creation:** Traffic (manual) and Non-Traffic (IoT-based) challans
- **Vehicle/Accused Search:** Auto-complete, quick-add to challans
- **Evidence Upload:** Camera integration with auto-compression
- **Offline-Ready Storage:** JWT tokens in `expo-secure-store`
- **Bank Account Display:** Read-only challan payment details

**Documentation:** [NoiseSentinel.MobileApp/README.md](NoiseSentinel.MobileApp/README.md)

---

### 3. **Backend API** (`NoiseSentinel.WebApi/`)

**Purpose:** Centralized REST API with JWT authentication

**Technology:** ASP.NET Core 8.0 + Entity Framework Core + SQL Server

**Features:**

- **3-Tier Architecture:** DAL → BLL → API Controllers
- **17 Entity Models:** Users, Roles, Challans, FIRs, Cases, Courts, IoT Devices, etc.
- **15 Services:** Auth, Email, Challan, FIR, Case, Court, IoT Device, etc.
- **14 API Controllers:** Role-based authorization policies
- **JWT Authentication:** 24-hour tokens, email verification, OTP reset
- **Email Notifications:** HTML templates for OTP, credentials, case updates
- **Immutable Records:** Emission Reports and Challans cannot be modified (evidence integrity)
- **Digital Signatures:** Emission report validation
- **Evidence Chain:** IoT Device → Emission Report → Challan → FIR → Case → Verdict

**Documentation:** [NoiseSentinel.WebApi/README.md](NoiseSentinel.WebApi/README.md)

---

### 4. **Web Portal** (`Noisesentinel.WebPortal/`)

**Purpose:** Administrative dashboard for Admins, Station/Court Authorities, Judges

**Technology:** React 18 + TypeScript + Vite + Material-UI 5 + React Router 6

**Features:**

- **Role-Based Dashboards:** Admin, Station Authority, Court Authority, Judge
- **User Management:** Create/activate/deactivate users across roles
- **Station Operations:** Officer management, FIR creation, IoT device registration
- **Court Operations:** Case creation from FIRs, judge assignment, verdict tracking
- **Judicial Functions:** Case statement recording, verdict delivery
- **Public Access:** OTP-verified case status lookup (no login required)
- **Theme Support:** Light/dark mode with MUI customization
- **Responsive Design:** Optimized for desktop and tablets

**Documentation:** [Noisesentinel.WebPortal/README.md](Noisesentinel.WebPortal/README.md)

---

## 🔄 Data Flow

### Evidence Lifecycle (IoT → Verdict)

```
1. IoT Device Pairing
   └─ Police Officer pairs ESP32 device via BLE (Mobile App)

2. On-Site Testing
   ├─ Noise Test: 10 seconds @ 5 samples/sec → Average dBA
   └─ Emission Test: 40 seconds (30s warmup + 10s sampling) → CO, HC, NOx, CO2

3. Emission Report Creation
   ├─ IoT device sends JSON data to Mobile App
   ├─ ML classification (Normal/High CO/Critical)
   ├─ Digital signature generated (SHA256)
   └─ Report saved to database (IMMUTABLE)

4. Challan Issuance
   ├─ Officer links Emission Report to Challan
   ├─ Adds vehicle, accused, violation type, evidence photo
   ├─ Challan saved with bank account details (IMMUTABLE)
   └─ Accused receives notification (future feature)

5. FIR Filing (Station Authority - Web Portal)
   ├─ Review challans at station
   ├─ Select cognizable violation challan
   ├─ Auto-generate FIR number: FIR-{StationCode}-{Year}-{Seq}
   └─ Forward to Court Authority

6. Case Creation (Court Authority - Web Portal)
   ├─ Review FIRs from stations
   ├─ Create court case from FIR
   ├─ Auto-generate case number
   └─ Assign to Judge

7. Court Proceedings (Judge - Web Portal)
   ├─ Review case details, linked challan, emission report
   ├─ Record case statements (proceedings)
   ├─ Set hearing dates
   └─ Deliver verdict (Guilty/Not Guilty/Pending)

8. Public Access
   ├─ Accused requests case status via web portal
   ├─ OTP sent to registered email/phone
   ├─ Verify OTP → View case status, verdict, challan details
   └─ Pay fine (if guilty) via bank account displayed on challan
```

---

## 🛠️ Technology Stack

| Layer              | Technologies                                                              |
| ------------------ | ------------------------------------------------------------------------- |
| **IoT Firmware**   | Arduino C++, ESP32 DevKit, BLE 4.2, ArduinoJson, MAX4466, MQ-7, MQ-2      |
| **Mobile App**     | React Native 0.72.10, Expo SDK 49, TypeScript 5.1.3, react-native-ble-plx |
| **Backend API**    | .NET 8.0, ASP.NET Core Web API, Entity Framework Core 8, SQL Server       |
| **Web Portal**     | React 18.2, TypeScript 5.2, Vite 5.0, Material-UI 5.15, React Router 6.20 |
| **Authentication** | ASP.NET Identity, JWT Bearer Tokens (HS256), expo-secure-store            |
| **Email**          | MailKit (Gmail SMTP with App Password)                                    |
| **Navigation**     | React Router (web), React Navigation 6 (mobile)                           |
| **HTTP Client**    | Axios (mobile + web), Axios interceptors for JWT                          |
| **State**          | React Context API (AuthContext, ThemeContext)                             |
| **Notifications**  | react-native-toast-message (mobile), Notistack (web)                      |
| **Forms**          | React Hook Form (web), Custom validation (mobile)                         |
| **Styling**        | Material-UI 5 (web), Custom components (mobile), Lucide icons (mobile)    |

---

## 🚀 Quick Start Guide

### Prerequisites

- **Backend:** .NET 8.0 SDK, SQL Server, Gmail account (for email OTP)
- **Web Portal:** Node.js 18+, npm/yarn
- **Mobile App:** Node.js 18+, Expo CLI, Android Studio/Xcode
- **IoT Device:** ESP32 DevKit, sensors (MAX4466, MQ-7, MQ-2), Arduino IDE

---

### 1. Setup Backend API

```bash
# Navigate to API project
cd src/NoiseSentinel.WebApi

# Configure database connection and JWT secret
# Edit appsettings.json (see EMAIL_AUTHENTICATION_SETUP.md for Gmail setup)

# Apply database migrations
dotnet ef database update

# Run the API (default: http://localhost:5200)
dotnet run
```

**Verify:** Open `http://localhost:5200/swagger` to see API documentation

---

### 2. Setup Web Portal

```bash
# Navigate to portal
cd src/Noisesentinel.WebPortal

# Install dependencies
npm install

# Configure API URL
# Create .env file: VITE_API_BASE_URL=http://localhost:5200/api

# Start development server (default: http://localhost:5173)
npm run dev
```

**First Use:**

1. Open `http://localhost:5173/register-admin`
2. Create first admin account (email OTP verification required)
3. Login at `http://localhost:5173/login`

---

### 3. Setup Mobile App

```bash
# Navigate to mobile app
cd src/NoiseSentinel.MobileApp

# Install dependencies
npm install

# Configure API URL
# Edit src/api/axios.config.ts: const API_BASE_URL = "http://YOUR_IP:5200/api"

# Start Expo development server
npx expo start

# Run on device (recommended for BLE)
# - Scan QR code with Expo Go app
# - OR use development build: npx expo run:android
```

**Note:** Expo Go doesn't support BLE. Use development builds for full functionality.

---

### 4. Setup ESP32 Firmware

```bash
# See ESP32_Firmware/README.md for complete hardware setup

# Quick steps:
# 1. Install Arduino IDE + ESP32 board support
# 2. Install ArduinoJson library (v6.21.0+)
# 3. Wire sensors: GPIO 34 (mic), GPIO 33 (MQ-7), GPIO 32 (MQ-2)
# 4. Open NoiseSentinel_IoT.ino
# 5. Upload to ESP32 (115200 baud)
# 6. Device advertises as "IOT-FRM-01" via BLE
```

---

## 👥 User Roles

| Role                  | Access          | Primary Functions                                           |
| --------------------- | --------------- | ----------------------------------------------------------- |
| **Admin**             | Web Portal      | User management, system configuration                       |
| **Station Authority** | Web Portal      | Officer/device management, FIR creation                     |
| **Court Authority**   | Web Portal      | Court/judge management, case creation                       |
| **Judge**             | Web Portal      | Case review, proceedings, verdict delivery                  |
| **Police Officer**    | Mobile App Only | Challan issuance, IoT testing, evidence collection          |
| **Public/Accused**    | Web Portal      | OTP-verified case status lookup, challan search (no signup) |

**Role Hierarchy:**

```
Admin
├── Court Authority
│   └── Judge
└── Station Authority
    └── Police Officer
```

---

## 📚 Documentation Links

| Component               | README                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| **ESP32 Firmware**      | [ESP32_Firmware/README.md](ESP32_Firmware/README.md)                                                     |
| **Mobile App**          | [NoiseSentinel.MobileApp/README.md](NoiseSentinel.MobileApp/README.md)                                   |
| **Backend API**         | [NoiseSentinel.WebApi/README.md](NoiseSentinel.WebApi/README.md)                                         |
| **Web Portal**          | [Noisesentinel.WebPortal/README.md](Noisesentinel.WebPortal/README.md)                                   |
| **Public Pages**        | [Noisesentinel.WebPortal/src/pages/public/README.md](Noisesentinel.WebPortal/src/pages/public/README.md) |
| **Email Setup**         | [EMAIL_AUTHENTICATION_SETUP.md](EMAIL_AUTHENTICATION_SETUP.md)                                           |
| **Challan Types**       | [CHALLAN_TYPE_SYSTEM.md](CHALLAN_TYPE_SYSTEM.md)                                                         |
| **Payment Integration** | [PAYMENT_FUNCTIONALITY_IMPLEMENTATION.md](PAYMENT_FUNCTIONALITY_IMPLEMENTATION.md)                       |

---

## ⚙️ Development Setup

### Database Migrations (After Model Changes)

```bash
cd NoiseSentinel.WebApi

# Add migration
dotnet ef migrations add MigrationName --project ../NoiseSentinel.DAL

# Update database
dotnet ef database update
```

### Port Configuration

| Component      | Default Port    | Config File                       |
| -------------- | --------------- | --------------------------------- |
| **API**        | 5200 (HTTP)     | `NoiseSentinel.WebApi/Program.cs` |
| **Web Portal** | 5173 (Vite dev) | `vite.config.ts`                  |
| **Swagger**    | 5200/swagger    | Auto-configured                   |

### Running All Components

1. **Terminal 1 (API):**

   ```bash
   cd src/NoiseSentinel.WebApi
   dotnet run
   ```

2. **Terminal 2 (Web Portal):**

   ```bash
   cd src/Noisesentinel.WebPortal
   npm run dev
   ```

3. **Terminal 3 (Mobile App):**

   ```bash
   cd src/NoiseSentinel.MobileApp
   npx expo start
   ```

4. **ESP32 Device:** Power on and ensure it's advertising "IOT-FRM-01"

---

## 🔧 Common Issues

### API Connection Failed (Mobile/Web)

- Check API is running: `http://localhost:5200/swagger`
- Verify `API_BASE_URL` in mobile app (`axios.config.ts`)
- Verify `.env` file in web portal
- Use device IP (not localhost) for mobile testing: `http://192.168.x.x:5200/api`

### BLE Not Working (Mobile)

- Use development build (not Expo Go): `npx expo run:android`
- Enable Bluetooth on device
- Grant location permissions (required for BLE on Android)
- Ensure ESP32 is powered and advertising

### Database Connection Failed

- Check SQL Server is running
- Verify connection string in `appsettings.json`
- Run `dotnet ef database update` to apply migrations
- Check firewall rules for SQL Server port 1433

### Email OTP Not Sending

- See [EMAIL_AUTHENTICATION_SETUP.md](EMAIL_AUTHENTICATION_SETUP.md)
- Generate Gmail App Password (not regular password)
- Update `EmailSettings` in `appsettings.json`
- Check SMTP port 587 is not blocked

---

## 📊 System Metrics

- **Total Lines of Code:** ~15,000+ lines (excluding node_modules, build artifacts)
- **Database Tables:** 17 tables with 50+ relationships
- **API Endpoints:** 80+ RESTful endpoints across 14 controllers
- **React Components:** 100+ components (web + mobile combined)
- **Services:** 15 business logic services
- **User Roles:** 5 distinct roles with hierarchical permissions

---

## 🔗 External Resources

- **Main Project Repo:** See root `README.md` in parent directory
- **Arduino ESP32 Docs:** https://docs.espressif.com/projects/arduino-esp32/
- **React Native Docs:** https://reactnative.dev/
- **Expo Docs:** https://docs.expo.dev/
- **ASP.NET Core Docs:** https://learn.microsoft.com/en-us/aspnet/core/
- **Material-UI Docs:** https://mui.com/

---

## 📄 License

This project is part of a Final Year Project for educational purposes.

---

## 💡 Future Enhancements

- [ ] Real-time notifications (SignalR)
- [ ] Offline mode for mobile app
- [ ] Multi-language support
- [ ] AI-powered violation detection
- [ ] Integration with Pakistan e-Challan system
- [ ] Dark mode for mobile app
- [ ] Payment gateway integration
- [ ] SMS OTP support
- [ ] Mobile app for accused/public

---

**For detailed setup instructions, see component-specific README files above.**
