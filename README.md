# 🔊 NoiseSentinel

<div align="center">

![NoiseSentinel Banner](https://img.shields.io/badge/NoiseSentinel-Noise%20Pollution%20Enforcement-6366F1?style=for-the-badge&logo=soundcloud&logoColor=white)

**An integrated IoT, mobile, and web platform for noise and emission violation enforcement with full legal lifecycle management**

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![ESP32](https://img.shields.io/badge/ESP32-IoT-E7352C?style=flat-square&logo=espressif)](https://www.espressif.com/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-FYP-green?style=flat-square)](LICENSE.txt)

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Components Overview](#-components-overview)
- [Data Flow](#-data-flow)
- [Technology Stack](#-technology-stack)
- [User Roles](#-user-roles)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Common Issues](#-common-issues)
- [System Metrics](#-system-metrics)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## 🎯 Overview

**NoiseSentinel** is an enterprise-grade traffic management system that manages the complete lifecycle of noise and emission violations — from IoT device readings to court case resolution.

The system enables:

- 🔌 **IoT-based measurement** via calibrated ESP32 devices with BLE
- 📊 **Real-time noise/emission monitoring** with digital signatures
- 📝 **Digital challan issuance** with tamper-proof evidence preservation
- 📁 **FIR filing** for cognizable violations
- ⚖️ **Court case management** with verdict tracking
- 🔐 **Role-based access** for all stakeholders
- 🌐 **Public status lookup** with OTP verification

---

## ✨ Features

### � ESP32 IoT Device (Firmware)

- **Sensors:** MAX4466 microphone (noise dBA), MQ-7 (CO ppm), MQ-2 (HC ppm)
- **BLE Server:** Service UUID `FFE0`, real-time data transmission
- **Tests:** 10-second noise test, 40-second emission test (30s warmup + 10s sampling)
- **LED Indicators:** Red (not connected), Yellow (connected), Green (scanning)
- **Digital Signatures:** SHA256 hash for tamper-proof emission reports

### 🚔 For Police Officers (Mobile App)

- Pair with calibrated IoT noise monitoring devices via BLE
- Run noise/emission tests from mobile UI
- Generate emission reports with ML-based violation detection
- Issue digital challans (Traffic and Non-Traffic types)
- Search vehicles by plate number
- Search accused by CNIC
- Upload evidence images with auto-compression
- Track issued challans with status filters

### 🏢 For Station Authority (Web Portal)

- Manage police stations and officers
- Register and manage IoT devices
- Define violation types and fine amounts
- File FIRs from cognizable challans
- Monitor all challans and their status
- Transfer officers between stations

### ⚖️ For Court Authority (Web Portal)

- Manage courts and court types
- Create and manage judge accounts
- Create court cases from FIRs
- Assign judges to cases
- Monitor case proceedings

### 👨‍⚖️ For Judges (Web Portal)

- View assigned cases
- Record case statements
- Update case status
- Deliver verdicts
- Set hearing dates

### 👑 For Admins (Web Portal)

- Create Court Authorities
- Create Station Authorities
- Manage all system users
- View system-wide statistics

### 🌍 For Public (No Login Required)

- Search challans by vehicle plate + CNIC
- Check case status via OTP verification

---

## 🏗️ Architecture

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

## 🧩 Components Overview

### 1. **ESP32 Firmware** (`src/ESP32_Firmware/`)

**Purpose:** IoT sensor device for on-site noise and emission testing

**Technology:** Arduino C++ on ESP32 DevKit with BLE 4.2

- **Hardware:** MAX4466 microphone, MQ-7 (CO), MQ-2 (HC) sensors
- **Communication:** BLE Server with JSON protocol
- **Tests:** 10-second noise, 40-second emission (30s warmup + 10s sampling)
- **Security:** SHA256 digital signatures for tamper-proof reports

### 2. **Mobile App** (`src/NoiseSentinel.MobileApp/`)

**Purpose:** Field enforcement app for police officers

**Technology:** React Native 0.72.10 + Expo SDK 49 + TypeScript

- **BLE Integration:** `react-native-ble-plx` for ESP32 communication
- **Challan Creation:** Traffic (manual) and Non-Traffic (IoT-based) types
- **Evidence Upload:** Camera integration with auto-compression
- **Offline-Ready Storage:** JWT tokens in `expo-secure-store`

### 3. **Backend API** (`src/NoiseSentinel.WebApi/`)

**Purpose:** Centralized REST API with JWT authentication

**Technology:** ASP.NET Core 8.0 + Entity Framework Core + SQL Server

- **Architecture:** DAL → BLL → API Controllers (3-tier)
- **17 Entity Models:** Users, Roles, Challans, FIRs, Cases, Courts, IoT Devices, etc.
- **15 Business Services:** Auth, Email, Challan, FIR, Case, Court, IoT Device, etc.
- **Immutable Records:** Emission Reports and Challans cannot be modified (evidence integrity)

### 4. **Web Portal** (`src/Noisesentinel.WebPortal/`)

**Purpose:** Administrative dashboard for Admins, Station/Court Authorities, Judges

**Technology:** React 18 + TypeScript + Vite + Material-UI 5 + React Router 6

- **Role-Based Dashboards:** Tailored views for each user role
- **Station Operations:** Officer management, FIR creation, IoT device registration
- **Court Operations:** Case creation from FIRs, judge assignment, verdict tracking
- **Public Access:** OTP-verified case status lookup (no login required)
- **Theme Support:** Light/dark mode with MUI customization

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

## � Getting Started

### Prerequisites

- **Backend:** .NET 8.0 SDK, SQL Server, Gmail account (for email OTP)
- **Web Portal:** Node.js 18+, npm/yarn
- **Mobile App:** Node.js 18+, Expo CLI, Android Studio/Xcode
- **IoT Device:** ESP32 DevKit, sensors (MAX4466, MQ-7, MQ-2), Arduino IDE

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Fyp_NoiseSentinel.git
   cd Fyp_NoiseSentinel
   ```

2. **Setup Backend**

   ```bash
   cd src/NoiseSentinel.WebApi
   # Configure appsettings.json (database, email, JWT)
   dotnet ef database update
   dotnet run
   ```

   API will be available at `http://localhost:5200`

   **Verify:** Open `http://localhost:5200/swagger` to see API documentation

3. **Setup Web Portal**

   ```bash
   cd src/Noisesentinel.WebPortal
   npm install
   # Create .env file: VITE_API_BASE_URL=http://localhost:5200/api
   npm run dev
   ```

   Portal will be available at `http://localhost:5173`

   **First Use:**
   - Open `http://localhost:5173/register-admin`
   - Create first admin account (email OTP verification required)
   - Login at `http://localhost:5173/login`

4. **Setup Mobile App**

   ```bash
   cd src/NoiseSentinel.MobileApp
   npm install
   # Configure API URL in src/api/axios.config.ts
   npx expo start
   ```

   **Note:** Expo Go doesn't support BLE. Use development builds for full functionality: `npx expo run:android`

5. **Setup ESP32 Firmware**

   ```bash
   # See src/ESP32_Firmware/README.md for complete hardware setup
   # Quick steps:
   # 1. Install Arduino IDE + ESP32 board support
   # 2. Install ArduinoJson library (v6.21.0+)
   # 3. Wire sensors: GPIO 34 (mic), GPIO 33 (MQ-7), GPIO 32 (MQ-2)
   # 4. Open NoiseSentinel_IoT.ino
   # 5. Upload to ESP32 (115200 baud)
   # 6. Device advertises as "IOT-FRM-01" via BLE
   ```

### Port Configuration

| Component      | Default Port    | Config File                                  |
| -------------- | --------------- | -------------------------------------------- |
| **API**        | 5200 (HTTP)     | `src/NoiseSentinel.WebApi/Program.cs`        |
| **Web Portal** | 5173 (Vite dev) | `src/Noisesentinel.WebPortal/vite.config.ts` |
| **Swagger**    | 5200/swagger    | Auto-configured                              |

For detailed setup instructions, see:

- [Backend README](src/NoiseSentinel.WebApi/README.md)
- [Web Portal README](src/Noisesentinel.WebPortal/README.md)
- [Mobile App README](src/NoiseSentinel.MobileApp/README.md)
- [ESP32 Firmware README](src/ESP32_Firmware/README.md)

---

## 📁 Project Structure

```
Fyp_NoiseSentinel/
├── README.md                    # This file
├── LICENSE.txt
├── Documents/                   # Project documentation
├── SQL Queries/
│   ├── ERD FYP.sql             # Database schema
│   └── INSERTION QUERIES.sql   # Sample data
│
└── src/
    ├── src.sln                 # Visual Studio solution
    ├── CHALLAN_TYPE_SYSTEM.md  # Challan type explanation
    ├── EMAIL_AUTHENTICATION_SETUP.md # Gmail App Password setup
    ├── PAYMENT_FUNCTIONALITY_IMPLEMENTATION.md # Payment integration
    │
    ├── ESP32_Firmware/         # 🔌 IoT Sensor Device Firmware
    │   ├── NoiseSentinel_IoT.ino   # Main firmware
    │   ├── sensor_calibration.h    # ADC-to-physical unit conversions
    │   ├── ble_protocol.h          # BLE communication protocol
    │   └── README.md               # Hardware setup, wiring, calibration
    │
    ├── NoiseSentinel.DAL/      # 📦 Data Access Layer
    │   ├── Contexts/           # DbContext
    │   ├── Models/             # 17 Entity Models
    │   └── Repositories/       # Repository pattern
    │
    ├── NoiseSentinel.BLL/      # 🧠 Business Logic Layer
    │   ├── Common/             # ServiceResult wrapper
    │   ├── Configuration/      # EmailSettings, JwtSettings
    │   ├── DTOs/               # Data Transfer Objects (by entity)
    │   ├── Helpers/            # ImageCompression, ChallanTypeHelper
    │   └── Services/           # 15 Business Services
    │
    ├── NoiseSentinel.WebApi/   # 🌐 ASP.NET Core Web API
    │   ├── Controllers/        # 14 API Controllers
    │   ├── Program.cs          # Entry point + DI configuration
    │   ├── appsettings.json    # JWT, DB, Email settings
    │   └── README.md           # API documentation
    │
    ├── Noisesentinel.WebPortal/# 💻 React Web Dashboard
    │   ├── src/
    │   │   ├── api/            # Axios API clients
    │   │   ├── components/     # React components (by role)
    │   │   ├── contexts/       # Auth & Theme contexts
    │   │   ├── models/         # TypeScript interfaces
    │   │   ├── pages/          # Admin, Station, Court, Judge pages
    │   │   ├── routes/         # React Router config
    │   │   └── theme/          # MUI theme (light/dark)
    │   └── package.json
    │
    └── NoiseSentinel.MobileApp/# 📱 React Native (Expo) Mobile App
        ├── src/
        │   ├── api/            # Axios API clients
        │   ├── components/     # Reusable UI components
        │   ├── contexts/       # AuthContext
        │   ├── models/         # TypeScript interfaces
        │   ├── screens/        # Auth, Dashboard, Challan, IoT screens
        │   └── styles/         # Theme, colors, typography
        └── package.json
```

---

## 📚 Documentation

| Document                                                           | Description                                                  |
| ------------------------------------------------------------------ | ------------------------------------------------------------ |
| [ESP32 Firmware README](src/ESP32_Firmware/README.md)              | Hardware setup, wiring, sensor calibration                   |
| [Backend API README](src/NoiseSentinel.WebApi/README.md)           | API architecture, endpoints, authentication, database schema |
| [Web Portal README](src/Noisesentinel.WebPortal/README.md)         | Web application features, routes, and setup                  |
| [Mobile App README](src/NoiseSentinel.MobileApp/README.md)         | Mobile app features, screens, BLE integration                |
| [Email Setup Guide](src/EMAIL_AUTHENTICATION_SETUP.md)             | Gmail App Password configuration for email notifications     |
| [Challan Types](src/CHALLAN_TYPE_SYSTEM.md)                        | Traffic vs Non-Traffic challan explanation                   |
| [Payment Integration](src/PAYMENT_FUNCTIONALITY_IMPLEMENTATION.md) | Payment functionality implementation guide                   |
| [Database Schema](SQL%20Queries/ERD%20FYP.sql)                     | Complete SQL schema for the database                         |

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

- See [EMAIL_AUTHENTICATION_SETUP.md](src/EMAIL_AUTHENTICATION_SETUP.md)
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

## 🏆 Key Highlights

- ✅ **Complete Evidence Chain**: IoT → Report → Challan → FIR → Case → Verdict
- ✅ **Immutable Records**: Challans and reports cannot be modified
- ✅ **Digital Signatures**: SHA256 tamper-proof evidence
- ✅ **Multi-Platform**: ESP32 IoT + Mobile app + Web portal
- ✅ **Role-Based Access**: 5 distinct user roles with hierarchical permissions
- ✅ **Public Access**: No-login challan/case lookup with OTP verification
- ✅ **Email Notifications**: OTP, credentials, case updates

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

## 🔗 External Resources

- **Arduino ESP32 Docs:** https://docs.espressif.com/projects/arduino-esp32/
- **React Native Docs:** https://reactnative.dev/
- **Expo Docs:** https://docs.expo.dev/
- **ASP.NET Core Docs:** https://learn.microsoft.com/en-us/aspnet/core/
- **Material-UI Docs:** https://mui.com/

---

## 📝 License

This project is part of a **Final Year Project** for educational purposes.

---

## 👨‍💻 Author

**Final Year Project - NoiseSentinel**

---

<div align="center">

**Built with ❤️ for a cleaner, quieter environment**

</div>
