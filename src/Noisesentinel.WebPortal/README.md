# 🔊 NoiseSentinel - Admin Portal

React + TypeScript + Vite web application for system administrators to manage the NoiseSentinel traffic noise violation system.

## 📱 Overview

The Admin Portal is the central management interface for NoiseSentinel, allowing administrators to:

- ✅ Create Court Authority accounts
- ✅ Create Station Authority accounts
- ✅ Create additional Admin accounts
- ✅ Manage user roles and permissions
- ✅ Monitor system health

## 🚀 Features

### ✅ Authentication
- Secure JWT-based login
- First admin registration (one-time bootstrap)
- Password change functionality
- Auto-logout on token expiry

### ✅ User Management
- Create Court Authorities (who can create Judges)
- Create Station Authorities (who can create Police Officers)
- Create additional system Admins
- Role-based access control

### ✅ Dashboard
- Welcome screen with user info
- Quick action cards
- System statistics (coming soon)
- Easy navigation

### ✅ Profile & Settings
- View account information
- Session details
- Change password

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast!)
- **Material-UI v5** - UI components
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hook Form** - Form validation
- **Notistack** - Toast notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `https://localhost:7022`

### Setup

1. **Install dependencies**
```bash
npm install
# or
yarn install