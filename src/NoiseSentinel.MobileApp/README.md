# 🔊 NoiseSentinel - Police Officer Mobile App

React Native mobile application for Police Officers to manage traffic noise violations.

## 📱 Features

### ✅ Authentication
- Secure login with JWT
- Role-based access (Police Officer only)
- Auto-login with stored credentials

### ✅ IoT Device Management
- View available IoT devices
- Pair with devices via Bluetooth
- Real-time device status

### ✅ Emission Report Generation
- Record sound levels from IoT device
- Optional emission readings (CO, CO2, HC, NOx)
- ML classification support
- Auto-detect violations (>85 dBA)
- Digital signature protection

### ✅ Challan Creation
- Multi-step form wizard
- Select violation type
- Auto-create vehicle (if new)
- Auto-create accused (if new)
- Search existing vehicle by plate number
- Search existing accused by CNIC
- Evidence upload support
- Bank details for payment

### ✅ Challan Management
- View all issued challans
- Filter by status (Unpaid, Paid, Disputed, Overdue, FIR)
- View detailed challan information
- Complete evidence chain display

### ✅ Search Features
- Search vehicle by plate number
- Search accused by CNIC
- View violation history
- View owned vehicles

### ✅ Violations Database
- Browse all violation types
- Filter cognizable violations
- View penalties and descriptions

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Setup

1. **Clone the repository**
```bash
cd NoiseSentinel.MobileApp