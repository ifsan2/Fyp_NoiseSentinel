# NoiseSentinel Mobile App

A React Native mobile application designed **exclusively for Police Officers** to manage traffic noise violations, issue challans, and work with IoT emission monitoring devices in the field.

> **Note:** Admins, Court Authorities, Station Authorities, and Judges use the [Web Portal](../Noisesentinel.WebPortal/README.md) instead.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Officer Workflow](#officer-workflow)
- [Screens & Navigation](#screens--navigation)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
- [Build & Deployment](#build--deployment)

---

## 🎯 Overview

The NoiseSentinel Mobile App empowers Police Officers to:

- **Pair with IoT devices** for emission/noise monitoring
- **Generate emission reports** with ML-based violation detection
- **Issue challans** with digital signatures and evidence
- **Search vehicles and accused** by plate number or CNIC
- **Track issued challans** with status filters

---

## 🛠️ Technology Stack

| Category             | Technology                                        |
| -------------------- | ------------------------------------------------- |
| **Framework**        | React Native 0.72.10 with Expo SDK 49             |
| **Language**         | TypeScript                                        |
| **Navigation**       | React Navigation 6.x (Native Stack + Bottom Tabs) |
| **State Management** | React Context API                                 |
| **HTTP Client**      | Axios                                             |
| **Secure Storage**   | expo-secure-store                                 |
| **UI Icons**         | Lucide React Native                               |
| **Fonts**            | Plus Jakarta Sans (Google Fonts)                  |
| **Animation**        | react-native-reanimated 3.3.0                     |
| **Gestures**         | react-native-gesture-handler                      |
| **Image Handling**   | expo-image-picker                                 |
| **Haptics**          | expo-haptics                                      |
| **Notifications**    | react-native-toast-message                        |
| **Date Handling**    | date-fns                                          |

---

## 📁 Project Structure

```
NoiseSentinel.MobileApp/
├── App.tsx                    # Root component with providers
├── app.json                   # Expo configuration
├── package.json
├── app/
│   ├── _layout.tsx            # Expo Router layout
│   └── index.tsx              # Entry point
└── src/
    ├── api/                   # API service layer
    │   ├── axios.config.ts    # Axios instance
    │   ├── authApi.ts         # Authentication
    │   ├── challanApi.ts      # Challan operations
    │   ├── emissionReportApi.ts # Emission reports
    │   ├── iotDeviceApi.ts    # Device pairing
    │   ├── violationApi.ts    # Violation types
    │   ├── vehicleApi.ts      # Vehicle search
    │   ├── accusedApi.ts      # Accused search
    │   └── userApi.ts         # User profile
    │
    ├── components/
    │   ├── common/            # Shared UI components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── Header.tsx
    │   │   ├── Loading.tsx
    │   │   └── ErrorDisplay.tsx
    │   ├── challan/           # Challan components
    │   │   ├── ChallanCard.tsx
    │   │   ├── ViolationPicker.tsx
    │   │   ├── VehicleForm.tsx
    │   │   └── AccusedForm.tsx
    │   ├── device/            # Device components
    │   │   ├── DeviceCard.tsx
    │   │   └── PairedDeviceCard.tsx
    │   └── navigation/
    │       └── GlassTabBar.tsx # Custom bottom tab bar
    │
    ├── contexts/
    │   └── AuthContext.tsx    # Authentication state
    │
    ├── models/                # TypeScript interfaces
    │   ├── Challan.ts
    │   ├── EmissionReport.ts
    │   ├── IotDevice.ts
    │   ├── Vehicle.ts
    │   ├── Accused.ts
    │   └── Violation.ts
    │
    ├── navigation/
    │   ├── AppNavigator.tsx   # Root navigator
    │   ├── AuthNavigator.tsx  # Auth screens
    │   ├── MainNavigator.tsx  # Main app screens
    │   └── TabNavigator.tsx   # Bottom tabs
    │
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   ├── ForgotPasswordScreen.tsx
    │   │   ├── VerifyOtpScreen.tsx
    │   │   └── ChangePasswordScreen.tsx
    │   ├── dashboard/
    │   │   └── DashboardScreen.tsx
    │   ├── challan/
    │   │   ├── CreateChallanScreen.tsx
    │   │   ├── MyChallansScreen.tsx
    │   │   └── ChallanDetailScreen.tsx
    │   ├── device/
    │   │   ├── PairDeviceScreen.tsx
    │   │   └── CreateEmissionReportScreen.tsx
    │   ├── search/
    │   │   ├── SearchVehicleScreen.tsx
    │   │   └── SearchAccusedScreen.tsx
    │   ├── violation/
    │   │   └── ViolationsScreen.tsx
    │   └── profile/
    │       └── ProfileScreen.tsx
    │
    ├── services/
    │   └── storage.ts         # Secure storage service
    │
    ├── styles/
    │   ├── colors.ts          # Color palette
    │   └── typography.ts      # Font styles
    │
    ├── types/
    │   └── navigation.ts      # Navigation types
    │
    └── utils/
        ├── constants.ts       # App constants
        ├── formatters.ts      # Date/currency formatters
        └── validation.ts      # Form validation
```

---

## ⭐ Features

### 📱 Dashboard

- **Quick Stats**: Total challans issued, today's count
- **Quick Actions**: Device pairing, create challan, view history
- **Search Actions**: Vehicle lookup, accused lookup, violations list

### 🔗 IoT Device Pairing

- View available devices for pairing
- Pair with calibrated noise monitoring device
- View currently paired device details
- Unpair device when done

### 📊 Emission Report Generation

- Requires paired IoT device
- **Scan** captures simulated sensor data:
  - Sound Level (dBA)
  - CO, CO2, HC, NOx levels
  - ML Classification result
- Sound threshold: **85.0 dBA**
- Digital signature for evidence integrity
- Creates report linked to device

### 📝 Challan Creation

Multi-step wizard:

| Step | Content                                        |
| ---- | ---------------------------------------------- |
| 1️⃣   | Select Violation Type                          |
| 2️⃣   | Vehicle Information (search or create)         |
| 3️⃣   | Accused Information (search by CNIC or create) |
| 4️⃣   | Evidence Image + Bank Details                  |

**Business Logic**:

- From Emission Report → Only **Cognizable** violations shown
- Direct Challan → Only **Non-Cognizable** violations shown
- Auto-creates vehicle/accused if not found
- Image evidence upload (base64)

### 📋 Challan Management

- View all issued challans
- **Filters**: All, Unpaid, Paid, Overdue, FIR
- **Search**: By name, plate, violation, challan ID
- View challan details with digital signature

### 🔍 Search Features

- **Vehicle Search**: By plate number
- **Accused Search**: By CNIC
- **Violations**: View all violation types with fines

---

## 👮 Officer Workflow

### Complete Enforcement Flow

```
1. Pair Device → 2. Scan Emission → 3. Generate Report → 4. Create Challan
```

### Workflow Diagram

```
┌─────────────────┐
│   Pair Device   │ ← Select from available devices
└────────┬────────┘
         ▼
┌─────────────────┐
│  Scan Emission  │ ← IoT device captures readings
└────────┬────────┘
         ▼
┌─────────────────┐
│ Generate Report │ ← Sound level, ML classification
└────────┬────────┘
         ▼
   ┌─────┴─────┐
   │ Violation? │
   └─────┬─────┘
    Yes  │  No
    ▼    └──→ Done
┌─────────────────┐
│ Create Challan  │ ← Select violation, vehicle, accused
└────────┬────────┘
         ▼
┌─────────────────┐
│  Add Evidence   │ ← Photo upload, bank details
└────────┬────────┘
         ▼
┌─────────────────┐
│ Challan Issued  │ ← Digital signature, email to accused
└─────────────────┘
```

---

## 📱 Screens & Navigation

### Tab Navigator (Bottom Tabs)

| Tab        | Icon  | Screen                | Description       |
| ---------- | ----- | --------------------- | ----------------- |
| 🏠 Home    | Home  | `DashboardScreen`     | Officer dashboard |
| 📜 History | Clock | `MyChallansScreen`    | Issued challans   |
| 📷 Scan    | Scan  | `CreateChallanScreen` | Create challan    |
| 👤 Profile | User  | `ProfileScreen`       | Settings & logout |

### Authentication Screens

| Screen                 | Purpose                |
| ---------------------- | ---------------------- |
| `LoginScreen`          | Officer login          |
| `ForgotPasswordScreen` | Request password reset |
| `VerifyOtpScreen`      | Email OTP verification |
| `ChangePasswordScreen` | Change/reset password  |

### Main Screens

| Screen                       | Purpose                         |
| ---------------------------- | ------------------------------- |
| `DashboardScreen`            | Overview with stats and actions |
| `PairDeviceScreen`           | IoT device pairing              |
| `CreateEmissionReportScreen` | Generate emission report        |
| `CreateChallanScreen`        | Multi-step challan wizard       |
| `MyChallansScreen`           | View issued challans            |
| `ChallanDetailScreen`        | Challan details                 |
| `SearchVehicleScreen`        | Search by plate                 |
| `SearchAccusedScreen`        | Search by CNIC                  |
| `ViolationsScreen`           | View violation types            |

---

## 🔐 Authentication

### Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Login Flow                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Enter username/password                                 │
│         ↓                                                   │
│  2. Validate role === "Police Officer"                      │
│         ├── Other role → Block access                       │
│         └── Police Officer → Continue                       │
│         ↓                                                   │
│  3. Check: requiresEmailVerification?                       │
│         ├── Yes → Redirect to OTP screen                    │
│         └── No → Continue                                   │
│         ↓                                                   │
│  4. Store JWT token securely                                │
│         ↓                                                   │
│  5. Check: mustChangePassword?                              │
│         ├── Yes → Force password change                     │
│         └── No → Go to Dashboard                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Token Storage

- **Mobile**: `expo-secure-store` (encrypted)
- **Web**: `localStorage`
- Token key: `auth_token`
- User data key: `user_data`

---

## 🔌 API Integration

### Configuration

```typescript
// src/api/axios.config.ts
const BASE_URL = "http://localhost:5200/api";
const TIMEOUT = 30000;
```

### API Endpoints Used

| Service             | Endpoints                                     |
| ------------------- | --------------------------------------------- |
| **Auth**            | `/login`, `/verify-email`, `/change-password` |
| **Challan**         | `/create`, `/officer/{id}`, `/{id}`           |
| **Emission Report** | `/create`, `/list`, `/{id}`                   |
| **IoT Device**      | `/available`, `/pair`, `/unpair`, `/{id}`     |
| **Vehicle**         | `/plate/{plateNo}`, `/{id}`                   |
| **Accused**         | `/cnic/{cnic}`, `/{id}`                       |
| **Violation**       | `/list`, `/cognizable`                        |

### Request/Response Interceptors

- **Request**: Auto-attaches JWT Bearer token
- **Response**: Handles errors (401 → logout, 403, 404, 500)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Running [Backend API](../NoiseSentinel.WebApi/README.md)
- iOS Simulator (Mac) or Android Emulator or physical device

### Installation

1. **Navigate to mobile app directory**

   ```bash
   cd src/NoiseSentinel.MobileApp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API URL**

   Edit `src/api/axios.config.ts`:

   ```typescript
   const BASE_URL = "http://YOUR_IP:5200/api";
   ```

   > Use your machine's IP address instead of `localhost` for physical devices

4. **Start Expo development server**

   ```bash
   npm start
   # or
   npx expo start --clear
   ```

5. **Run on device/emulator**
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on physical device

---

## 📦 Build & Deployment

### Development

```bash
npm start              # Start Expo server
npm run android        # Run on Android
npm run ios            # Run on iOS (Mac only)
npm run web            # Run on web browser
```

### Clean Start

```bash
npx expo start --clear
```

### Production Build

```bash
# Create production build
npx expo build:android
npx expo build:ios

# Or use EAS Build
npx eas build --platform android
npx eas build --platform ios
```

---

## 📱 Platform Support

| Platform | Status                              |
| -------- | ----------------------------------- |
| Android  | ✅ Supported                        |
| iOS      | ✅ Supported                        |
| Web      | ✅ Supported (via react-native-web) |

---

## 🎨 Design System

### Colors

```typescript
// Primary (Deep Navy)
primary: '#0F172A'

// Accent (Electric Indigo)
accent: '#6366F1'

// Background
background: '#F8FAFC'

// Text
text: {
  primary: '#1E293B',
  secondary: '#475569',
  tertiary: '#94A3B8'
}
```

### Typography

- **Font Family**: Plus Jakarta Sans
- **Heading**: 28px, Bold
- **Subheading**: 20px, SemiBold
- **Body**: 16px, Regular

---

## 🔧 Constants

```typescript
// Sound threshold for violations
SOUND_THRESHOLD = 85.0; // dBA

// Challan statuses
CHALLAN_STATUS = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  DISPUTED: "Disputed",
};
```

---

## 📝 Scripts

| Script            | Description       |
| ----------------- | ----------------- |
| `npm start`       | Start Expo server |
| `npm run android` | Run on Android    |
| `npm run ios`     | Run on iOS        |
| `npm run web`     | Run on web        |

---

## 🔗 Related Documentation

- [Main Project README](../../README.md)
- [Backend API README](../NoiseSentinel.WebApi/README.md)
- [Web Portal README](../Noisesentinel.WebPortal/README.md)
