# NoiseSentinel Mobile App (Police Officer App)

React Native mobile application for police officers to issue traffic violation challans using IoT sensor data.

## 📱 Overview

This is the **field officer app** for the NoiseSentinel Traffic Management System. Police officers use this app to:

- 📡 Connect to IoT devices via Bluetooth (BLE)
- 🔊 Measure noise levels (silencer violations)
- 💨 Test vehicle emissions (CO, HC, NOx)
- 🚗 Search vehicles and accused persons
- 📝 Create challans with digital evidence
- 📊 View issued challan history

**Note:** This app is NOT for accused persons or public users. Accused/public access is via the Web Portal only.

---

## 🛠️ Technology Stack

- **Framework:** React Native 0.72.10 + Expo SDK 49
- **Language:** TypeScript 5.1.3
- **Navigation:** React Navigation 6.x (Stack + Bottom Tabs)
- **Bluetooth:** react-native-ble-plx 3.1.2
- **HTTP Client:** Axios
- **State:** React Context API
- **Storage:** expo-secure-store (JWT tokens)
- **UI Components:** Custom components + Lucide icons
- **Fonts:** Plus Jakarta Sans
- **Camera/Images:** expo-image-picker + expo-image-manipulator
- **Notifications:** react-native-toast-message

---

## 📁 Project Structure

```
NoiseSentinel.MobileApp/
├── src/
│   ├── api/               # API clients (axios instances)
│   │   ├── axios.config.ts
│   │   ├── accusedApi.ts
│   │   ├── authApi.ts
│   │   ├── challanApi.ts
│   │   ├── emissionReportApi.ts
│   │   ├── iotDeviceApi.ts
│   │   ├── vehicleApi.ts
│   │   └── violationApi.ts
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Button, Card, Input, Header, etc.
│   │   ├── challan/      # Challan-specific components
│   │   └── navigation/   # Bottom tab navigator
│   ├── contexts/          # React Context (AuthContext)
│   ├── models/            # TypeScript interfaces/types
│   ├── screens/           # App screens
│   │   ├── auth/         # Login, Register
│   │   ├── challan/      # Create, Search, Detail screens
│   │   ├── dashboard/    # Officer dashboard
│   │   ├── emission/     # Emission report screens
│   │   ├── iot/          # IoT device pairing
│   │   ├── profile/      # Officer profile
│   │   └── search/       # Vehicle/Accused search
│   ├── styles/            # Theme, colors, typography
│   └── utils/             # Helpers, formatters, constants
├── assets/                # Images, icons, fonts
├── app.json              # Expo config
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md             # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android) or Xcode (for iOS)
- Physical Android/iOS device (recommended) or emulator

### Installation

1. **Clone and navigate:**

   ```bash
   cd NoiseSentinel.MobileApp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure API endpoint:**
   Edit `src/utils/constants.ts`:

```typescript
BASE_URL: __DEV__
  ? "https://noisesentinel.tech/api"
  : "https://noisesentinel.tech/api",
```

Replace with your backend server address if you want to use a local server.

4. **Start development server:**

   ```bash
   npm start
   ```

5. **Run on device:**
   - Scan QR code with Expo Go app (Android/iOS)
   - OR press `a` for Android emulator
   - OR press `i` for iOS simulator

### Development Build (Recommended for BLE)

Expo Go doesn't support native BLE modules. Use development builds:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

---

## 🔐 Authentication

### Login Process

1. Officer enters **Badge Number** and **Password**
2. API returns JWT access token (valid 24 hours)
3. Token stored in `expo-secure-store`
4. Auto-refresh on app restart if token valid

### Authorization

- All API requests include `Authorization: Bearer <token>`
- Configured in `axios.config.ts` interceptor
- Automatic logout on 401 Unauthorized

### First-Time Setup

Officers must register via:

1. Admin creates officer account in Web Portal
2. Admin provides temporary password
3. Officer logs in and changes password

---

## 📡 IoT Device Integration (BLE)

### Supported Devices

- ESP32-based IoT sensors (firmware: IOT-FRM-01)
- BLE Service UUID: `0000FFE0-0000-1000-8000-00805F9B34FB`
- Max range: ~10 meters

### Pairing Flow

1. **Dashboard** → Tap "Pair IoT Device"
2. App scans for nearby BLE devices
3. Select device from list (e.g., "IOT-FRM-01")
4. Device pairs and shows status (Red → Yellow → Green LEDs)
5. Officer can now run noise/emission tests

### Device Operations

- **Noise Test:** 10 seconds, returns dBA measurement
- **Emission Test:** 40 seconds (30s warmup + 10s sampling)
  - Returns: CO, HC, NOx, CO2 levels
  - ML Classification (e.g., "High CO Detected")

### BLE Protocol

JSON-based command/response via BLE characteristics:

```json
// Command (App → Device)
{
  "command": "START_EMISSION_TEST",
  "device_id": 1,
  "officer_id": 42
}

// Response (Device → App)
{
  "status": "COMPLETED",
  "test_type": "EMISSION",
  "data": {
    "co": 152.3,
    "hc": 245.7,
    "nox": 73.71,
    "ml_classification": "High CO"
  }
}
```

See [ESP32_Firmware README](../ESP32_Firmware/README.md) for details.

---

## 📝 Challan Workflow

### Creating a Challan

#### **Option 1: Traffic Challan (Manual)**

1. **Dashboard** → "Create Traffic Challan"
2. Select violation type (from backend)
3. Search/add vehicle (plate number)
4. Search/add accused (CNIC)
5. Upload evidence photo
6. Submit → Challan created

#### **Option 2: Non-Traffic Challan (IoT-Based)**

1. **Pair IoT device** via BLE
2. **Create Non-Traffic Challan** → Select category:
   - Noise Violation (silencer)
   - Emission Violation (exhaust gases)
3. **Run Test:**
   - Noise: 10s audio sampling
   - Emission: 40s gas analysis
4. System auto-creates **Emission Report** with:
   - CO, HC, NOx, CO2 readings
   - ML Classification
   - Digital Signature (SHA256)
5. Enter vehicle/accused details
6. Upload evidence photo
7. Submit → Challan + Emission Report created

### Challan States

- **Unpaid:** Newly issued
- **Paid:** Payment confirmed (via web portal)
- **Disputed:** Accused filed dispute
- **Overdue:** Past due date

---

## 🔍 Search Features

### Vehicle Search

- Search by **plate number** (e.g., ABC-123)
- Auto-complete suggestions
- Shows: Make, model, color, owner details
- Quick-add to challan

### Accused Search

- Search by **CNIC** (13 digits)
- Shows: Name, address, contact
- View challan history
- Quick-add to challan

### Challan Search

- Filter by:
  - Status (Unpaid, Paid, Disputed, Overdue)
  - Challan Type (Traffic, Non-Traffic)
  - Date range
- Sort by issue date
- View full details

---

## 🧩 Key Features

### Dashboard

- Quick stats: Issued today, total challans
- IoT device pairing status
- Quick actions: Create challan, scan device, search

### Emission Reports

- Linked to IoT device readings
- Digital signature for tamper-proof data
- View CO, HC, NOx, CO2 levels
- ML classification (Normal/High/Critical)

### Bank Account Display

- **Read-only** bank account details shown on challan
- Auto-populated from backend configuration
- Accused pays via web portal (not mobile app)

### Profile

- View officer details (name, badge, station)
- View statistics (total challans issued)
- Logout

---

## 🎨 UI/UX

### Design System

- **Primary Color:** Blue (#1E3A8A)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Error:** Red (#EF4444)
- **Typography:** Plus Jakarta Sans
- **Component Library:** Custom-built (Button, Card, Input, Header)

### Navigation

- **Bottom Tabs:** Dashboard, Search, Create Challan, Profile
- **Stack Navigation:** Detail screens, forms, settings
- **Back Button:** Consistent header across screens

### Feedback

- Toast notifications (success/error)
- Loading spinners
- Haptic feedback (button presses)
- Error messages with retry

---

## 📦 Dependencies

### Core

```json
{
  "expo": "~49.0.15",
  "react": "18.2.0",
  "react-native": "0.72.10",
  "typescript": "^5.1.3"
}
```

### Navigation

```json
{
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/native-stack": "^6.9.17",
  "@react-navigation/bottom-tabs": "^6.5.11"
}
```

### Networking

```json
{
  "axios": "^1.6.2",
  "react-native-ble-plx": "^3.1.2"
}
```

### UI/Utilities

```json
{
  "lucide-react-native": "^0.554.0",
  "react-native-toast-message": "^2.1.7",
  "expo-image-picker": "~14.3.2",
  "expo-secure-store": "~12.3.1",
  "date-fns": "^2.30.0"
}
```

---

## 🏗️ Build & Deployment

### Development Build

```bash
# Android
eas build --profile development --platform android

# iOS
eas build --profile development --platform ios
```

### Production Build

```bash
# Android APK
eas build --profile production --platform android

# iOS IPA
eas build --profile production --platform ios
```

### EAS Configuration

Create `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### BLE Not Working

- **Issue:** "Bluetooth unavailable" error
- **Fix:** Ensure device has Bluetooth enabled
- **Fix:** Use development build (not Expo Go)
- **Fix:** Grant location permissions (required for BLE on Android)

### API Connection Failed

- **Issue:** Network error or timeout
- **Fix:** Check `API_CONFIG.BASE_URL` in `utils/constants.ts`
- **Fix:** Ensure backend is running and accessible
- **Fix:** Use device IP if testing on local network
- **Fix:** Disable SSL verification for local dev (Android only)

### Token Expired

- **Issue:** 401 Unauthorized on API calls
- **Fix:** Automatic logout triggered, re-login required
- **Fix:** Check token expiration time (24 hours default)

### Image Upload Fails

- **Issue:** Large file size or network timeout
- **Fix:** Images auto-compressed to max 1024x1024
- **Fix:** Check network stability
- **Fix:** Ensure backend accepts `multipart/form-data`

### Device Not Scanning

- **Issue:** No IoT devices found
- **Fix:** Ensure ESP32 is powered on and advertising
- **Fix:** Device name should be "IOT-FRM-01"
- **Fix:** Move closer to device (BLE range ~10m)
- **Fix:** Reset ESP32 (red LED should blink)

---

## 🔒 Security

- JWT tokens stored in secure encrypted storage
- No sensitive data in AsyncStorage
- API requests use HTTPS in production
- BLE communication: No encryption (future: pairing/bonding)
- Image evidence: Uploaded to secure server storage
- Challan data: Digital signatures prevent tampering

---

## 🚧 Known Issues

1. **BLE Background Mode:** Not fully supported on iOS (requires special permissions)
2. **Offline Mode:** Not implemented (requires network connection)
3. **Multi-language:** Only English supported currently
4. **Dark Mode:** Not implemented

---

## 🔄 Version History

**v1.0.0** (Current)

- Initial release
- BLE IoT device integration
- Traffic and Non-Traffic challan creation
- Vehicle/Accused search
- Emission report integration
- Payment functionality (web portal only)

---

## 📖 Related Documentation

- [ESP32 Firmware](../ESP32_Firmware/README.md) - IoT device setup
- [Web API](../NoiseSentinel.WebApi/README.md) - Backend API reference
- [Web Portal](../Noisesentinel.WebPortal/README.md) - Admin/Court portal
- [Payment Integration](../PAYMENT_FUNCTIONALITY_IMPLEMENTATION.md) - Payment system

---

## 👥 User Roles

This app is for **Police Officers** only.

Other roles use Web Portal:

- **Admin:** User management, system config
- **Station Authority:** FIR creation, case management
- **Court Authority:** Court case handling
- **Judge:** Court proceedings, decisions
- **Accused/Public:** View case status, pay challans

---

## 💬 Support

For technical issues:

1. Check troubleshooting section above
2. Enable debug logging in `axios.config.ts`
3. Check Serial Monitor for ESP32 issues (115200 baud)
4. Review API error messages in console

---

## 📄 License

Part of NoiseSentinel Traffic Management System.  
See main repository for license information.
