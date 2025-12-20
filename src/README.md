# NoiseSentinel Source Code

This directory contains the complete source code for the NoiseSentinel system.

## 📁 Directory Structure

```
src/
├── NoiseSentinel.DAL/          # Data Access Layer
├── NoiseSentinel.BLL/          # Business Logic Layer
├── NoiseSentinel.WebApi/       # ASP.NET Core Web API
├── Noisesentinel.WebPortal/    # React Web Application
├── NoiseSentinel.MobileApp/    # React Native Mobile App
└── src.sln                     # Visual Studio Solution
```

## 📚 Documentation

| Component       | README                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| **Backend API** | [NoiseSentinel.WebApi/README.md](NoiseSentinel.WebApi/README.md)       |
| **Web Portal**  | [Noisesentinel.WebPortal/README.md](Noisesentinel.WebPortal/README.md) |
| **Mobile App**  | [NoiseSentinel.MobileApp/README.md](NoiseSentinel.MobileApp/README.md) |

## 🚀 Quick Start

### 1. Backend API

```bash
cd NoiseSentinel.WebApi
# Configure appsettings.json
dotnet ef database update
dotnet run
```

### 2. Web Portal

```bash
cd Noisesentinel.WebPortal
npm install
npm run dev
```

### 3. Mobile App

```bash
cd NoiseSentinel.MobileApp
npm install
npx expo start
```

## ⚙️ Configuration

### Email Setup

See [EMAIL_AUTHENTICATION_SETUP.md](EMAIL_AUTHENTICATION_SETUP.md) for Gmail App Password configuration.

## 🔗 Main Documentation

See the [Main Project README](../README.md) for complete project overview.
