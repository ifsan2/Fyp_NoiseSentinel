# NoiseSentinel Web Portal

A modern React-based administrative dashboard for noise pollution monitoring and traffic enforcement system. This portal serves **Judges**, **Court Authorities**, **Station Authorities**, and **Admins**.

> **Note:** Police Officers use the [Mobile App](../NoiseSentinel.MobileApp/README.md) instead.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [User Roles & Access](#user-roles--access)
- [Features by Role](#features-by-role)
- [Routes & Pages](#routes--pages)
- [Authentication Flow](#authentication-flow)
- [API Integration](#api-integration)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Build & Deployment](#build--deployment)

---

## 🎯 Overview

The NoiseSentinel Web Portal is a comprehensive administrative interface that enables:

- **System Administration** - User management across all roles
- **Police Station Operations** - Officer management, FIR filing, device registration
- **Court Operations** - Case management, judge assignments, verdict tracking
- **Judicial Functions** - Case review, statement recording, verdict delivery
- **Public Access** - Challan and case status lookup via OTP verification

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18.2 with TypeScript |
| **Build Tool** | Vite 5.0 |
| **UI Library** | Material-UI (MUI) 5.15 |
| **Routing** | React Router DOM 6.20 |
| **Forms** | React Hook Form 7.49 |
| **HTTP Client** | Axios 1.6 |
| **Notifications** | Notistack 3.0 |
| **Date Utilities** | date-fns 4.1 |
| **State Management** | React Context API |

---

## 📁 Project Structure

```
Noisesentinel.WebPortal/
├── public/                     # Static assets
├── src/
│   ├── api/                    # API service layer
│   │   ├── axios.config.ts     # Axios instance with interceptors
│   │   ├── authApi.ts          # Authentication endpoints
│   │   ├── caseApi.ts          # Case management
│   │   ├── caseStatementApi.ts # Case statements
│   │   ├── challanApi.ts       # Challan management
│   │   ├── courtApi.ts         # Court management
│   │   ├── firApi.ts           # FIR management
│   │   ├── judgeApi.ts         # Judge management
│   │   ├── stationApi.ts       # Police station management
│   │   ├── stationOfficerApi.ts# Officer management
│   │   ├── deviceApi.ts        # IoT device management
│   │   ├── violationApi.ts     # Violation types
│   │   └── publicStatusApi.ts  # Public case status
│   │
│   ├── components/
│   │   ├── common/             # Shared components
│   │   │   ├── Loading.tsx
│   │   │   ├── FormCard.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── BrandLogo.tsx
│   │   ├── layout/             # Admin layout
│   │   │   ├── AdminLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── station/            # Station Authority components
│   │   │   ├── layout/
│   │   │   ├── cards/
│   │   │   └── tables/
│   │   ├── court/              # Court Authority components
│   │   │   ├── layout/
│   │   │   └── cards/
│   │   └── judge/              # Judge components
│   │       └── layout/
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Theme (light/dark)
│   │
│   ├── models/                 # TypeScript interfaces
│   ├── pages/                  # Page components by role
│   ├── routes/                 # Route configuration
│   ├── theme/                  # MUI theme customization
│   ├── utils/                  # Utilities
│   └── styles/                 # Global CSS
│
├── .env.example                # Environment template
├── index.html                  # Entry HTML
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 👥 User Roles & Access

The system supports 5 roles, with 4 having web portal access:

| Role | Web Portal | Description |
|------|------------|-------------|
| **Admin** | ✅ Yes | System administrator, manages all users |
| **Station Authority** | ✅ Yes | Manages police stations, officers, FIRs |
| **Court Authority** | ✅ Yes | Manages courts, judges, creates cases |
| **Judge** | ✅ Yes | Reviews cases, delivers verdicts |
| **Police Officer** | ❌ No | Uses [Mobile App](../NoiseSentinel.MobileApp/README.md) only |

---

## ⭐ Features by Role

### 🔴 Admin Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | System-wide statistics overview |
| **User Management** | Create/view Admins, Court Authorities, Station Authorities |
| **Account Control** | Activate/deactivate users, reset passwords |
| **Profile** | Update personal information |

### 🔵 Station Authority Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Station statistics, quick actions |
| **Police Stations** | CRUD operations for stations |
| **Officers** | Create officers, transfer between stations, activate/deactivate |
| **IoT Devices** | Register, pair/unpair monitoring devices |
| **Violations** | Define violation types (cognizable/non-cognizable) |
| **Challans** | View all challans, filter by status, search |
| **Vehicles** | View registered vehicles |
| **Accused** | View accused persons |
| **FIRs** | Create FIRs from cognizable challans, track status |

### 🟢 Court Authority Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Court statistics, case overview |
| **Courts** | CRUD operations for courts |
| **Judges** | Create judge accounts, assign to courts |
| **FIRs** | View all FIRs submitted by stations |
| **Cases** | Create cases from FIRs, assign judges |
| **Statements** | Monitor all case statements |

### 🟡 Judge Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Assigned cases, upcoming hearings |
| **My Cases** | View and manage assigned cases |
| **Case Statements** | Create proceedings, deliver verdicts |
| **Updates** | Update case status, set hearing dates |

### 🌐 Public Features (No Login Required)

| Feature | Description |
|---------|-------------|
| **Challan Search** | Search by vehicle plate + CNIC |
| **Case Status** | OTP-verified case status lookup |

---

## 🛣️ Routes & Pages

### Public Routes

| Route | Description |
|-------|-------------|
| `/login` | User authentication |
| `/register-admin` | First admin registration |
| `/verify-email` | Email OTP verification |
| `/forgot-password` | Password reset |
| `/public/challan-search` | Public challan lookup |
| `/public/case-status` | Public case status |

### Admin Routes (`/admin/*`)

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Admin overview |
| `/admin/view-users` | All system users |
| `/admin/create-court-authority` | Create Court Authority |
| `/admin/create-station-authority` | Create Station Authority |
| `/admin/create-admin` | Create additional admin |
| `/admin/profile` | Profile management |
| `/admin/change-password` | Change password |

### Station Authority Routes (`/station/*`)

| Route | Description |
|-------|-------------|
| `/station/dashboard` | Station overview |
| `/station/stations/*` | Police station CRUD |
| `/station/officers/*` | Officer management |
| `/station/devices/*` | IoT device management |
| `/station/violations/*` | Violation types |
| `/station/challans` | Challan monitoring |
| `/station/vehicles` | Vehicle registry |
| `/station/accused` | Accused persons |
| `/station/fir/*` | FIR management |

### Court Authority Routes (`/court/*`)

| Route | Description |
|-------|-------------|
| `/court/dashboard` | Court overview |
| `/court/courts/*` | Court CRUD |
| `/court/judges/*` | Judge management |
| `/court/firs/*` | FIR viewing |
| `/court/cases/*` | Case management |
| `/court/statements/*` | Statement monitoring |

### Judge Routes (`/judge/*`)

| Route | Description |
|-------|-------------|
| `/judge/dashboard` | Judge overview |
| `/judge/cases/*` | Assigned cases |
| `/judge/statements/*` | Case statements |

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Login Request (username/password)                       │
│         ↓                                                   │
│  2. Backend validates → JWT token + user data               │
│         ↓                                                   │
│  3. Check: requiresEmailVerification?                       │
│         ├── Yes → Redirect to /verify-email                 │
│         └── No → Continue                                   │
│         ↓                                                   │
│  4. Check: role === "Police Officer"?                       │
│         ├── Yes → Block access (Mobile App only)            │
│         └── No → Continue                                   │
│         ↓                                                   │
│  5. Store token & user in localStorage                      │
│         ↓                                                   │
│  6. Check: mustChangePassword?                              │
│         ├── Yes → Redirect to change-password               │
│         └── No → Redirect to role dashboard                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Token Management

- JWT token stored in `localStorage` with key `auth_token`
- User data stored with key `user_data`
- Axios interceptor auto-attaches `Bearer` token
- 401 responses trigger automatic logout

---

## 🔌 API Integration

### Axios Configuration

```typescript
// src/api/axios.config.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5200/api',
  timeout: 30000,
});

// Request interceptor - adds JWT token
// Response interceptor - handles 401, 403, 404, 500 errors
```

### API Services

| Service | Purpose |
|---------|---------|
| `authApi` | Login, registration, password management |
| `stationApi` | Police station CRUD |
| `stationOfficerApi` | Officer CRUD, transfers |
| `deviceApi` | IoT device management |
| `violationApi` | Violation types |
| `challanApi` | Challan listing, search |
| `firApi` | FIR management |
| `courtApi` | Court CRUD |
| `judgeApi` | Judge management |
| `caseApi` | Case management |
| `caseStatementApi` | Case statements |
| `publicStatusApi` | Public OTP-based status |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running [Backend API](../NoiseSentinel.WebApi/README.md)

### Installation

1. **Navigate to the portal directory**
   ```bash
   cd src/Noisesentinel.WebPortal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5200/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5200/api` |

### Theme Configuration

The portal supports **light** and **dark** themes:

- Theme preference persists in `localStorage`
- Auto-detects system preference
- Toggle via `ThemeToggleButton` component

---

## 📦 Build & Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Build output is in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

---

## 🎨 UI Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `AdminLayout` | Admin dashboard wrapper |
| `StationLayout` | Station Authority wrapper |
| `CourtLayout` | Court Authority wrapper |
| `JudgeLayout` | Judge dashboard wrapper |

### Common Components

| Component | Description |
|-----------|-------------|
| `Loading` | Spinner component |
| `PageHeader` | Page title with actions |
| `FormCard` | Styled form wrapper |
| `BrandLogo` | NoiseSentinel branding |
| `ThemeToggleButton` | Light/dark mode switch |

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🔗 Related Documentation

- [Main Project README](../../README.md)
- [Backend API README](../NoiseSentinel.WebApi/README.md)
- [Mobile App README](../NoiseSentinel.MobileApp/README.md)
