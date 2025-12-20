# 🔊 NoiseSentinel

<div align="center">

![NoiseSentinel Banner](https://img.shields.io/badge/NoiseSentinel-Noise%20Pollution%20Enforcement-6366F1?style=for-the-badge&logo=soundcloud&logoColor=white)

**A comprehensive noise pollution monitoring and traffic enforcement system**

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square&logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-CC2927?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![License](https://img.shields.io/badge/License-FYP-green?style=flat-square)](LICENSE.txt)

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [User Roles](#-user-roles)
- [System Workflow](#-system-workflow)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🎯 Overview

**NoiseSentinel** is an enterprise-grade noise pollution monitoring and traffic enforcement system that manages the complete lifecycle of environmental violations — from IoT device readings to court case resolution.

The system enables:
- 📊 **Real-time noise monitoring** via IoT devices
- 📝 **Digital challan issuance** with evidence preservation
- 📁 **FIR filing** for cognizable violations
- ⚖️ **Court case management** with verdict tracking
- 🔐 **Role-based access** for all stakeholders
- 🌐 **Public status lookup** with OTP verification

---

## ✨ Features

### 🚔 For Police Officers (Mobile App)
- Pair with calibrated IoT noise monitoring devices
- Generate emission reports with ML-based violation detection
- Issue digital challans with evidence images
- Search vehicles by plate number
- Search accused by CNIC
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

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           NoiseSentinel System                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │   Mobile App    │    │   Web Portal    │    │   Public Pages  │        │
│  │  (Officers)     │    │ (Authority/     │    │  (Case Status)  │        │
│  │  React Native   │    │  Judge/Admin)   │    │                 │        │
│  │     Expo        │    │  React + Vite   │    │                 │        │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
│           │                      │                      │                  │
│           └──────────────────────┼──────────────────────┘                  │
│                                  │                                         │
│                                  ▼                                         │
│                    ┌─────────────────────────┐                            │
│                    │    NoiseSentinel API    │                            │
│                    │   ASP.NET Core 8.0      │                            │
│                    │   JWT Authentication    │                            │
│                    └────────────┬────────────┘                            │
│                                 │                                          │
│           ┌─────────────────────┼─────────────────────┐                   │
│           ▼                     ▼                     ▼                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │      BLL        │  │      DAL        │  │   SQL Server    │           │
│  │   (Services)    │  │ (Repositories)  │  │   Database      │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
| Component | Technology |
|-----------|------------|
| Framework | .NET 8.0 |
| API | ASP.NET Core Web API |
| ORM | Entity Framework Core 8.0 |
| Database | SQL Server |
| Authentication | ASP.NET Core Identity + JWT |
| Email | MailKit (Gmail SMTP) |
| Documentation | Swagger/OpenAPI |

### Web Portal
| Component | Technology |
|-----------|------------|
| Framework | React 18.2 |
| Language | TypeScript |
| Build Tool | Vite 5.0 |
| UI Library | Material-UI (MUI) 5.15 |
| Routing | React Router DOM 6.20 |
| Forms | React Hook Form |
| HTTP Client | Axios |

### Mobile App
| Component | Technology |
|-----------|------------|
| Framework | React Native 0.72.10 |
| Platform | Expo SDK 49 |
| Language | TypeScript |
| Navigation | React Navigation 6.x |
| Storage | expo-secure-store |
| HTTP Client | Axios |

---

## 👥 User Roles

```
                        ┌─────────────┐
                        │    Admin    │
                        │ (Web Portal)│
                        └──────┬──────┘
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌────────────────┐ ┌────────────────┐
     │Court Authority │ │Station Authority│
     │ (Web Portal)   │ │  (Web Portal)   │
     └───────┬────────┘ └───────┬────────┘
             ▼                  ▼
       ┌──────────┐     ┌──────────────┐
       │  Judge   │     │Police Officer │
       │(Web Portal)    │ (Mobile App)  │
       └──────────┘     └──────────────┘
```

| Role | Platform | Responsibilities |
|------|----------|------------------|
| **Admin** | Web Portal | System administration, user management |
| **Court Authority** | Web Portal | Court/Judge management, case creation |
| **Station Authority** | Web Portal | Station/Officer management, FIR filing |
| **Judge** | Web Portal | Case proceedings, verdicts |
| **Police Officer** | Mobile App | Challan issuance, field enforcement |

---

## 🔄 System Workflow

### Evidence Chain Flow

```
┌─────────────┐    ┌────────────────┐    ┌─────────┐    ┌─────┐    ┌──────┐    ┌──────────┐
│ IoT Device  │ → │ Emission Report│ → │ Challan │ → │ FIR │ → │ Case │ → │  Verdict │
└─────────────┘    └────────────────┘    └─────────┘    └─────┘    └──────┘    └──────────┘
       │                   │                  │            │          │             │
       ▼                   ▼                  ▼            ▼          ▼             ▼
  Calibrated          Digital            Evidence     Station    Assigned      Closed
   Device            Signature           Images       Authority    Judge        Case
```

### Complete Workflow

1. **Device Pairing**: Officer pairs with calibrated IoT device
2. **Emission Scan**: Device captures noise/emission readings
3. **Report Generation**: System generates digitally signed report
4. **Challan Issuance**: Officer issues challan if violation detected
5. **FIR Filing**: Station Authority files FIR for cognizable violations
6. **Case Creation**: Court Authority creates court case from FIR
7. **Judge Assignment**: Case assigned to a judge
8. **Proceedings**: Judge records statements, sets hearings
9. **Verdict**: Judge delivers final verdict
10. **Case Closure**: Case status updated, accused notified

---

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 SDK
- Node.js 18+
- SQL Server
- Gmail account with App Password
- Expo CLI (for mobile app)

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

3. **Setup Web Portal**
   ```bash
   cd src/Noisesentinel.WebPortal
   npm install
   # Configure .env with API URL
   npm run dev
   ```
   Portal will be available at `http://localhost:5173`

4. **Setup Mobile App**
   ```bash
   cd src/NoiseSentinel.MobileApp
   npm install
   # Configure API URL in src/api/axios.config.ts
   npx expo start
   ```

For detailed setup instructions, see:
- [Backend README](src/NoiseSentinel.WebApi/README.md)
- [Web Portal README](src/Noisesentinel.WebPortal/README.md)
- [Mobile App README](src/NoiseSentinel.MobileApp/README.md)

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
    │
    ├── NoiseSentinel.DAL/      # Data Access Layer
    │   ├── Contexts/           # DbContext
    │   ├── Models/             # Entity models
    │   └── Repositories/       # Repository pattern
    │
    ├── NoiseSentinel.BLL/      # Business Logic Layer
    │   ├── Common/             # Shared utilities
    │   ├── Configuration/      # Settings classes
    │   ├── DTOs/               # Data Transfer Objects
    │   ├── Helpers/            # Utility helpers
    │   └── Services/           # Business services
    │
    ├── NoiseSentinel.WebApi/   # ASP.NET Core Web API
    │   ├── Controllers/        # API controllers
    │   ├── Program.cs          # Entry point
    │   └── appsettings.json    # Configuration
    │
    ├── Noisesentinel.WebPortal/# React Web Application
    │   ├── src/
    │   │   ├── api/            # API services
    │   │   ├── components/     # React components
    │   │   ├── contexts/       # Context providers
    │   │   ├── pages/          # Page components
    │   │   └── routes/         # Routing
    │   └── package.json
    │
    └── NoiseSentinel.MobileApp/# React Native Mobile App
        ├── src/
        │   ├── api/            # API services
        │   ├── components/     # React Native components
        │   ├── contexts/       # Context providers
        │   ├── navigation/     # Navigation config
        │   └── screens/        # Screen components
        └── package.json
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Backend API README](src/NoiseSentinel.WebApi/README.md) | Complete backend documentation including architecture, API endpoints, authentication, and database schema |
| [Web Portal README](src/Noisesentinel.WebPortal/README.md) | Web application documentation including features, routes, and setup |
| [Mobile App README](src/NoiseSentinel.MobileApp/README.md) | Mobile app documentation including features, screens, and workflow |
| [Email Setup Guide](src/EMAIL_AUTHENTICATION_SETUP.md) | Gmail App Password configuration for email notifications |
| [Database Schema](SQL%20Queries/ERD%20FYP.sql) | Complete SQL schema for the database |

---

## 📸 Screenshots

### Web Portal

| Admin Dashboard | Station Authority | Court Authority | Judge Dashboard |
|-----------------|-------------------|-----------------|-----------------|
| User management | Station operations | Case management | Assigned cases |
| Statistics | FIR filing | Judge management | Verdicts |

### Mobile App

| Dashboard | Create Challan | Device Pairing | My Challans |
|-----------|----------------|----------------|-------------|
| Quick stats | Multi-step wizard | IoT pairing | History view |
| Actions | Evidence upload | Scan readings | Filters |

---

## 🔐 Security Features

- **JWT Authentication** with configurable expiration
- **Email Verification** with OTP before login
- **Forced Password Change** on first login
- **Role-Based Authorization** policies
- **Digital Signatures** for evidence integrity
- **Secure Token Storage** (mobile app)
- **Password Policy** enforcement
- **Account Lockout** after failed attempts

---

## 🏆 Key Highlights

- ✅ **Complete Evidence Chain**: IoT → Report → Challan → FIR → Case → Verdict
- ✅ **Immutable Records**: Challans and reports cannot be modified
- ✅ **Digital Signatures**: Tamper-proof evidence
- ✅ **Multi-Platform**: Web portal + Mobile app
- ✅ **Role-Based Access**: 5 distinct user roles
- ✅ **Public Access**: No-login challan/case lookup
- ✅ **Email Notifications**: OTP, credentials, case updates

---

## 📝 License

This project is part of a **Final Year Project** at the university level.

---

## 👨‍💻 Author

**Final Year Project - NoiseSentinel**

---

<div align="center">

**Built with ❤️ for a cleaner, quieter environment**

</div>
