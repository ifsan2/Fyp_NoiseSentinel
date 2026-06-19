# NoiseSentinel Backend API

A robust .NET 8.0 Web API for noise pollution monitoring and traffic enforcement system with complete lifecycle management from IoT device readings to court case resolution.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Data Access Layer (DAL)](#data-access-layer-dal)
- [Business Logic Layer (BLL)](#business-logic-layer-bll)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Role-Based Access Control](#role-based-access-control)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Database Schema](#database-schema)

---

## 🏗️ Architecture Overview

The backend follows a **3-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     NoiseSentinel.WebApi                        │
│                    (Controllers & API Layer)                    │
├─────────────────────────────────────────────────────────────────┤
│                     NoiseSentinel.BLL                           │
│               (Business Logic & Services Layer)                 │
├─────────────────────────────────────────────────────────────────┤
│                     NoiseSentinel.DAL                           │
│          (Data Access Layer - Repositories & Models)            │
├─────────────────────────────────────────────────────────────────┤
│                       SQL Server Database                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Component            | Technology                                |
| -------------------- | ----------------------------------------- |
| **Framework**        | .NET 8.0                                  |
| **API**              | ASP.NET Core Web API                      |
| **ORM**              | Entity Framework Core 8.0                 |
| **Database**         | SQL Server                                |
| **Authentication**   | ASP.NET Core Identity + JWT Bearer Tokens |
| **Email**            | MailKit (Gmail SMTP)                      |
| **Documentation**    | Swashbuckle (Swagger/OpenAPI)             |
| **Image Processing** | GZip Compression                          |

---

## 📁 Project Structure

```
src/
├── NoiseSentinel.DAL/           # Data Access Layer
│   ├── Contexts/
│   │   └── NoiseSentinelDbContext.cs
│   ├── Models/                  # 17 Entity Models
│   │   ├── User.cs
│   │   ├── Accused.cs
│   │   ├── Vehicle.cs
│   │   ├── Violation.cs
│   │   ├── Challan.cs
│   │   ├── Fir.cs
│   │   ├── Case.cs
│   │   ├── Casestatement.cs
│   │   ├── Emissionreport.cs
│   │   ├── Iotdevice.cs
│   │   ├── Policeofficer.cs
│   │   ├── Policestation.cs
│   │   ├── Judge.cs
│   │   ├── Court.cs
│   │   ├── Courttype.cs
│   │   ├── Role.cs
│   │   └── PublicStatusOtp.cs
│   └── Repositories/            # Repository Pattern Implementation
│
├── NoiseSentinel.BLL/           # Business Logic Layer
│   ├── Common/
│   │   └── ServiceResult.cs     # Generic Result Wrapper
│   ├── Configuration/
│   │   ├── EmailSettings.cs
│   │   └── JwtSettings.cs
│   ├── DTOs/                    # Data Transfer Objects
│   │   ├── Auth/
│   │   ├── User/
│   │   ├── Case/
│   │   ├── CaseStatement/
│   │   ├── Challan/
│   │   ├── Court/
│   │   ├── EmissionReport/
│   │   ├── Fir/
│   │   ├── IotDevice/
│   │   ├── Policestation/
│   │   ├── Public/
│   │   ├── Vehicle/
│   │   ├── Violation/
│   │   └── Accused/
│   ├── Helpers/
│   │   └── ImageCompressionHelper.cs
│   └── Services/                # 15 Business Services
│       ├── AuthService.cs
│       ├── UserService.cs
│       ├── EmailService.cs
│       ├── CaseService.cs
│       ├── CasestatementService.cs
│       ├── ChallanService.cs
│       ├── CourtService.cs
│       ├── FirService.cs
│       ├── ViolationService.cs
│       ├── EmissionreportService.cs
│       ├── IotdeviceService.cs
│       ├── VehicleService.cs
│       ├── AccusedService.cs
│       ├── PolicestationService.cs
│       └── PublicStatusService.cs
│
└── NoiseSentinel.WebApi/        # Web API Layer
    ├── Controllers/             # 14 API Controllers
    ├── Program.cs               # Application Entry Point
    ├── appsettings.json         # Configuration
    └── appsettings.example.json # Configuration Template
```

---

## 💾 Data Access Layer (DAL)

### Entity Models

The system manages 17 interconnected entities:

| Entity              | Description                                                                       |
| ------------------- | --------------------------------------------------------------------------------- |
| **User**            | System users (extends ASP.NET Identity)                                           |
| **Role**            | Business roles (Admin, Court Authority, Station Authority, Judge, Police Officer) |
| **Policeofficer**   | Officers linked to users and stations                                             |
| **Policestation**   | Police station locations                                                          |
| **Judge**           | Judges linked to users and courts                                                 |
| **Court**           | Court locations                                                                   |
| **Courttype**       | Court categories (Supreme, High, District, etc.)                                  |
| **Iotdevice**       | Noise/emission monitoring devices                                                 |
| **Emissionreport**  | IoT device readings with digital signatures                                       |
| **Violation**       | Violation type catalog with fines                                                 |
| **Vehicle**         | Registered vehicles                                                               |
| **Accused**         | Violators/offenders                                                               |
| **Challan**         | Traffic citations (immutable evidence)                                            |
| **Fir**             | First Information Reports                                                         |
| **Case**            | Court cases                                                                       |
| **Casestatement**   | Court proceedings/verdicts                                                        |
| **PublicStatusOtp** | OTP for public case status lookup                                                 |

### Entity Relationship Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    User     │────<│Policeofficer │>────│Policestation│
│             │     │              │     │             │
│             │────<│    Judge     │>────│    Court    │>──│Courttype│
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │                    │
       ▼                   ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Role     │     │    Case     │────<│Casestatement│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐     ┌─────────────┐
                    │     FIR     │────<│   Challan   │
                    └─────────────┘     └─────────────┘
                                               │
                 ┌─────────┬─────────┬────────┴───────┐
                 ▼         ▼         ▼                ▼
           ┌─────────┐┌─────────┐┌──────────┐┌───────────────┐
           │ Accused ││ Vehicle ││Violation ││Emissionreport │
           └─────────┘└─────────┘└──────────┘└───────────────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │  Iotdevice  │
                                              └─────────────┘
```

### Evidence Chain Flow

```
IoT Device → Emission Report → Challan → FIR → Case → Case Statement/Verdict
                  ↓                ↓        ↓       ↓
            Digital Signature  Evidence  Investigation  Proceedings
```

---

## 🧠 Business Logic Layer (BLL)

### Services Overview

| Service                   | Responsibility                                                      |
| ------------------------- | ------------------------------------------------------------------- |
| **AuthService**           | Authentication, registration, OTP verification, password management |
| **UserService**           | User CRUD, role-specific queries, status management                 |
| **EmailService**          | HTML email templates for notifications (OTP, credentials, updates)  |
| **ViolationService**      | Violation type catalog management                                   |
| **IotdeviceService**      | Device registration, pairing with officers                          |
| **EmissionreportService** | IoT readings with digital signatures                                |
| **ChallanService**        | Citation issuance with evidence preservation                        |
| **VehicleService**        | Vehicle registration and lookup                                     |
| **AccusedService**        | Offender management                                                 |
| **FirService**            | FIR filing from cognizable violations                               |
| **CaseService**           | Court case management                                               |
| **CasestatementService**  | Court proceedings and verdicts                                      |
| **CourtService**          | Court management                                                    |
| **PolicestationService**  | Station management                                                  |
| **PublicStatusService**   | Public OTP-based case status lookup                                 |

### Key Business Rules

1. **Immutable Records**: Emission Reports and Challans cannot be modified after creation (evidence integrity)
2. **Digital Signatures**: Emission reports generate signatures that link to challans
3. **One-to-One Enforcement**: One FIR per Challan, One Case per FIR
4. **Auto-Generation**: Sequential numbering for FIR (`FIR-{StationCode}-{Year}-{Seq}`) and Case numbers
5. **Sound Threshold**: 85 dBA is the legal limit for violation detection
6. **Cognizable Violations**: Only cognizable violations can lead to FIR filing

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint                          | Access            | Description              |
| ------ | --------------------------------- | ----------------- | ------------------------ |
| POST   | `/register/admin`                 | Anonymous         | Bootstrap first admin    |
| POST   | `/admin/create/admin`             | Admin             | Create additional admin  |
| POST   | `/admin/create/court-authority`   | Admin             | Create Court Authority   |
| POST   | `/admin/create/station-authority` | Admin             | Create Station Authority |
| POST   | `/court-authority/create/judge`   | Court Authority   | Create Judge             |
| POST   | `/create/police-officer`          | Station Authority | Create Police Officer    |
| POST   | `/login`                          | Anonymous         | User login               |
| POST   | `/verify-email`                   | Anonymous         | Verify email OTP         |
| POST   | `/change-password`                | Authenticated     | Change password          |
| POST   | `/forgot-password`                | Anonymous         | Request password reset   |
| GET    | `/me`                             | Authenticated     | Get current user         |

### Users (`/api/user`)

| Method | Endpoint                | Access                   | Description             |
| ------ | ----------------------- | ------------------------ | ----------------------- |
| GET    | `/admins`               | Admin                    | Get all admins          |
| GET    | `/court-authorities`    | Admin                    | Get court authorities   |
| GET    | `/station-authorities`  | Admin                    | Get station authorities |
| GET    | `/judges`               | Admin, Court Authority   | Get all judges          |
| GET    | `/police-officers`      | Admin, Station Authority | Get all officers        |
| GET    | `/{id}`                 | Authority Roles          | Get user by ID          |
| PUT    | `/judges/{judgeId}`     | Admin, Court Authority   | Update judge            |
| PUT    | `/officers/{officerId}` | Admin, Station Authority | Update officer          |
| DELETE | `/{id}`                 | Admin                    | Delete user             |

### Cases (`/api/case`)

| Method | Endpoint                 | Access          | Description          |
| ------ | ------------------------ | --------------- | -------------------- |
| POST   | `/create`                | Court Authority | Create case from FIR |
| GET    | `/{id}`                  | Authenticated   | Get case by ID       |
| GET    | `/number/{caseNumber}`   | Court Roles     | Get by case number   |
| GET    | `/list`                  | Court Authority | Get all cases        |
| GET    | `/judge/{judgeId}`       | Judge           | Get judge's cases    |
| GET    | `/court/{courtId}`       | Court Authority | Get cases by court   |
| PUT    | `/update`                | Court Roles     | Update case          |
| PUT    | `/assign-judge/{caseId}` | Court Authority | Assign judge         |

### FIRs (`/api/fir`)

| Method | Endpoint                         | Access                  | Description             |
| ------ | -------------------------------- | ----------------------- | ----------------------- |
| POST   | `/create`                        | Station Authority       | Create FIR from challan |
| GET    | `/{id}`                          | All Roles               | Get FIR by ID           |
| GET    | `/list`                          | Station/Court Authority | Get all FIRs            |
| GET    | `/station/{stationId}`           | Station Authority       | Get FIRs by station     |
| GET    | `/eligible-challans/{stationId}` | Station Authority       | Get challans for FIR    |
| PUT    | `/update`                        | Station Authority       | Update FIR              |

### Challans (`/api/challan`)

| Method | Endpoint               | Access            | Description                |
| ------ | ---------------------- | ----------------- | -------------------------- |
| POST   | `/create`              | Police Officer    | Create challan (immutable) |
| GET    | `/{id}`                | Authenticated     | Get challan by ID          |
| GET    | `/officer/{officerId}` | Police Officer    | Get officer's challans     |
| GET    | `/list`                | Station Authority | Get all challans           |
| GET    | `/station/{stationId}` | Station Authority | Get challans by station    |
| POST   | `/public/search`       | **Anonymous**     | Public search              |

### Emission Reports (`/api/emissionreport`)

| Method | Endpoint             | Access            | Description               |
| ------ | -------------------- | ----------------- | ------------------------- |
| POST   | `/create`            | Police Officer    | Create report (immutable) |
| GET    | `/{id}`              | All Roles         | Get report by ID          |
| GET    | `/list`              | Station Authority | Get all reports           |
| GET    | `/device/{deviceId}` | Station Authority | Get by device             |

### IoT Devices (`/api/iotdevice`)

| Method | Endpoint     | Access            | Description               |
| ------ | ------------ | ----------------- | ------------------------- |
| POST   | `/register`  | Station Authority | Register device           |
| GET    | `/{id}`      | Station Roles     | Get device by ID          |
| GET    | `/list`      | Station Authority | Get all devices           |
| GET    | `/available` | Police Officer    | Get available for pairing |
| POST   | `/pair`      | Police Officer    | Pair device               |
| POST   | `/unpair`    | Police Officer    | Unpair device             |

### Violations (`/api/violation`)

| Method | Endpoint      | Access            | Description           |
| ------ | ------------- | ----------------- | --------------------- |
| POST   | `/create`     | Station Authority | Create violation type |
| GET    | `/{id}`       | Authenticated     | Get violation by ID   |
| GET    | `/list`       | Authenticated     | Get all violations    |
| GET    | `/cognizable` | Station Authority | Get FIR-eligible      |

### Public (`/api/public`)

| Method | Endpoint                        | Access                | Description |
| ------ | ------------------------------- | --------------------- | ----------- |
| POST   | `/request-status-otp`           | **Anonymous**         | Request OTP |
| POST   | `/verify-status-otp`            | **Anonymous**         | Verify OTP  |
| GET    | `/case-status/{vehiclePlateNo}` | **Anonymous** (Token) | Get status  |

---

## 🔐 Authentication & Authorization

### JWT Configuration

| Setting          | Value                   |
| ---------------- | ----------------------- |
| Algorithm        | HS256                   |
| Issuer           | `NoiseSentinelAPI`      |
| Audience         | `NoiseSentinelClient`   |
| Token Expiration | 1440 minutes (24 hours) |

### Password Policy

- Minimum 8 characters
- Requires: digit, lowercase, uppercase, special character
- Account lockout: 5 failed attempts → 15 min lockout

### Email Verification Flow

1. User registers/is created → OTP sent to email
2. User cannot login until OTP verified
3. After verification, first login requires password change
4. Then user gets full JWT access

---

## 👥 Role-Based Access Control

### Role Hierarchy

```
                    ┌─────────┐
                    │  Admin  │
                    └────┬────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   ┌──────────────┐ ┌──────────────┐
   │Court Authority│ │Station Authority│
   └──────┬───────┘ └──────┬───────┘
          ▼                ▼
      ┌───────┐     ┌──────────────┐
      │ Judge │     │Police Officer │
      └───────┘     └──────────────┘
```

### Authorization Policies

| Policy                 | Allowed Roles                             |
| ---------------------- | ----------------------------------------- |
| `AdminOnly`            | Admin                                     |
| `CourtAuthorityOnly`   | Court Authority                           |
| `StationAuthorityOnly` | Station Authority                         |
| `JudgeOnly`            | Judge                                     |
| `PoliceOfficerOnly`    | Police Officer                            |
| `CourtRoles`           | Admin, Court Authority, Judge             |
| `StationRoles`         | Admin, Station Authority, Police Officer  |
| `AuthorityRoles`       | Admin, Court Authority, Station Authority |
| `AllRoles`             | All authenticated users                   |

### Role Permissions

| Role                  | Can Create                                          | Primary Functions               |
| --------------------- | --------------------------------------------------- | ------------------------------- |
| **Admin**             | Admin, Court Authority, Station Authority           | System administration           |
| **Court Authority**   | Judge, Court, Case                                  | Court management, case creation |
| **Station Authority** | Police Officer, Station, Violation, FIR, IoT Device | Station operations              |
| **Judge**             | Case Statement                                      | Case proceedings, verdicts      |
| **Police Officer**    | Challan, Emission Report                            | Field enforcement               |

---

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 SDK
- SQL Server
- Gmail account with App Password (for email)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Fyp_NoiseSentinel.git
   cd Fyp_NoiseSentinel/src
   ```

2. **Configure the database**

   ```bash
   # Update connection string in appsettings.json
   ```

3. **Configure email settings**

   ```bash
   # Update EmailSettings in appsettings.json
   # See EMAIL_AUTHENTICATION_SETUP.md for Gmail App Password setup
   ```

4. **Run migrations**

   ```bash
   cd NoiseSentinel.WebApi
   dotnet ef database update
   ```

5. **Run the API**

   ```bash
   dotnet run
   ```

6. **Access Swagger UI**
   ```
   http://localhost:5200/swagger
   ```

---

## ⚙️ Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=NoiseSentinelDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "SecretKey": "your-256-bit-secret-key-here",
    "Issuer": "NoiseSentinelAPI",
    "Audience": "NoiseSentinelClient",
    "ExpirationMinutes": 1440
  },
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "SmtpUsername": "your.email@gmail.com",
    "AppPassword": "your-app-password",
    "SenderEmail": "your.email@gmail.com",
    "SenderName": "NoiseSentinel",
    "OtpExpirationMinutes": 15
  }
}
```

---

## 📊 Database Schema

The database uses SQL Server with the following key tables:

- `AspNetUsers` - Identity users
- `AspNetRoles` - Identity roles
- `USER` - Extended user information
- `ROLE` - Business roles
- `POLICEOFFICER`, `POLICESTATION`
- `JUDGE`, `COURT`, `COURTTYPE`
- `IOTDEVICE`, `EMISSIONREPORT`
- `VIOLATION`, `VEHICLE`, `ACCUSED`
- `CHALLAN`, `FIR`, `CASE`, `CASESTATEMENT`
- `PUBLIC_STATUS_OTP`

For full SQL schema, see [SQL Queries/ERD FYP.sql](../../SQL%20Queries/ERD%20FYP.sql).

---

## 📝 License

This project is part of a Final Year Project.

---

## 🔗 Related Documentation

- [Main Project README](../../README.md)
- [Web Portal README](../Noisesentinel.WebPortal/README.md)
- [Mobile App README](../NoiseSentinel.MobileApp/README.md)
- [Email Setup Guide](../EMAIL_AUTHENTICATION_SETUP.md)
