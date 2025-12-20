// API Configuration
export const API_CONFIG = {
  // Default to backend running on localhost:5200 if env not provided
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5200/api",
  TIMEOUT: 30000,
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || "NoiseSentinel Portal",
  VERSION: "1.0.0",
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  REMEMBER_ME: "remember_me",
};

// User Roles
export const ROLES = {
  ADMIN: "Admin",
  COURT_AUTHORITY: "Court Authority",
  STATION_AUTHORITY: "Station Authority",
  JUDGE: "Judge",
  POLICE_OFFICER: "Police Officer",
};

// Password Regex
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Username Regex
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// ✅ UPDATE: Role-Based Routes
export const ROUTES = {
  // Public
  LOGIN: "/login",
  REGISTER_ADMIN: "/register-admin",
  VERIFY_EMAIL: "/verify-email",

  // Admin Routes
  DASHBOARD: "/admin/dashboard",
  CREATE_COURT_AUTHORITY: "/admin/create-court-authority",
  CREATE_STATION_AUTHORITY: "/admin/create-station-authority",
  CREATE_ADMIN: "/admin/create-admin",
  VIEW_USERS: "/admin/view-users",
  PROFILE: "/admin/profile",
  CHANGE_PASSWORD: "/admin/change-password",

  // ✅ Court Authority Routes
  COURT_DASHBOARD: "/court/dashboard",
  COURT_PROFILE: "/court/profile",
  COURT_CHANGE_PASSWORD: "/court/change-password",

  // ✅ Station Authority Routes
  STATION_DASHBOARD: "/station/dashboard",
  STATION_PROFILE: "/station/profile",
  STATION_CHANGE_PASSWORD: "/station/change-password",

  // ✅ Judge Routes
  JUDGE_DASHBOARD: "/judge/dashboard",
  JUDGE_PROFILE: "/judge/profile",
  JUDGE_CHANGE_PASSWORD: "/judge/change-password",
};

// ✅ Court Routes - Re-export for convenience
export { COURT_ROUTES } from "./courtConstants";

// ✅ Judge Routes - Re-export for convenience
export { JUDGE_ROUTES } from "./judgeConstants";

// ✅ Station Routes
export const STATION_ROUTES = {
  DASHBOARD: "/station/dashboard",
  PROFILE: "/station/profile",
  CHANGE_PASSWORD: "/station/change-password",

  // Stations
  VIEW_STATIONS: "/station/stations",
  CREATE_STATION: "/station/stations/create",
  EDIT_STATION: "/station/stations/edit",

  // Officers
  VIEW_OFFICERS: "/station/officers",
  CREATE_OFFICER: "/station/officers/create",
  EDIT_OFFICER: "/station/officers/edit",
  TRANSFER_OFFICER: "/station/officers/transfer",

  // Devices
  VIEW_DEVICES: "/station/devices",
  REGISTER_DEVICE: "/station/devices/register",
  EDIT_DEVICE: "/station/devices/edit",

  // Violations
  VIEW_VIOLATIONS: "/station/violations",
  CREATE_VIOLATION: "/station/violations/create",
  EDIT_VIOLATION: "/station/violations/edit",

  // Monitoring
  VIEW_CHALLANS: "/station/monitoring/challans",
  VIEW_VEHICLES: "/station/monitoring/vehicles",
  VIEW_ACCUSED: "/station/monitoring/accused",

  // FIR Management
  VIEW_FIRS: "/station/fir/list",
  COGNIZABLE_CHALLANS: "/station/fir/cognizable",
  FILE_FIR: "/station/fir/create",
};
