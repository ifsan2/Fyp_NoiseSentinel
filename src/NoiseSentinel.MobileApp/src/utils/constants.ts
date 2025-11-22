// API Configuration
export const API_CONFIG = {
  // For web browser testing: use http://localhost:5200
  // For Android emulator: use http://10.0.2.2:5200/api
  // For real device: use your PC's IP (e.g., http://192.168.100.16:5200/api)
  BASE_URL: __DEV__
    ? "http://localhost:5200/api" // Development - localhost for web, change to device IP for mobile
    : "https://your-production-api.com/api", // Production
  TIMEOUT: 30000,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  REMEMBER_ME: "remember_me",
};

// Police Officer Role
export const ROLES = {
  POLICE_OFFICER: "Police Officer",
  STATION_AUTHORITY: "Station Authority",
  COURT_AUTHORITY: "Court Authority",
  JUDGE: "Judge",
  ADMIN: "Admin",
};

// Sound Level Threshold
export const SOUND_THRESHOLD = 85.0; // dBA

// Challan Status
export const CHALLAN_STATUS = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  DISPUTED: "Disputed",
};

// Date Formats
export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
