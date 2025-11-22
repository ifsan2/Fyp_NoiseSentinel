// PREMIUM AWARD-WINNING COLOR SYSTEM - $50K APP GRADE
// Inspired by: Linear, Stripe, Vercel, Arc Browser, Apple Design System
// Professional traffic enforcement platform with optimal outdoor visibility
// Deep Navy for Authority/Trust + Electric Indigo for Action

export const colors = {
  // Primary - Deep Navy Blue (Authority, Trust, Professional)
  // Optimized for outdoor police work - high contrast
  primary: {
    50: "#F0F4F8",
    100: "#D9E2EC",
    200: "#BCCCDC",
    300: "#9FB3C8",
    400: "#829AB1",
    500: "#627D98",
    600: "#486581",
    700: "#334E68",
    800: "#243B53",
    900: "#0F172A", // Main - Deep Navy
  },
  
  // Accent - Electric Indigo (Action, Interactive, Modern)
  accent: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1", // Main - Electric Indigo
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
  },

  // Sophisticated neutrals - Premium gray scale
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A",
  },

  // Status Colors - Semantic palette
  success: {
    50: "#F0FDF4",
    200: "#86EFAC",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
  },
  warning: {
    50: "#FFFBEB",
    200: "#FDE68A",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
  },
  error: {
    50: "#FEF2F2",
    200: "#FECACA",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
  },
  info: {
    50: "#EFF6FF",
    200: "#BFDBFE",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
  },

  // Quick access - Most commonly used
  white: "#FFFFFF",
  black: "#000000",
  
  // Background system - Off-white prevents eye strain in bright outdoor conditions
  background: {
    primary: "#F8FAFC", // Off-white (not pure white)
    secondary: "#F1F5F9",
    tertiary: "#E2E8F0",
    elevated: "#FFFFFF",
    dark: "#0F172A",
    darkElevated: "#1E293B",
  },

  // Text system
  text: {
    primary: "#0A0A0A",
    secondary: "#525252",
    tertiary: "#A3A3A3",
    disabled: "#D4D4D4",
    inverse: "#FFFFFF",
    link: "#4F46E5",
  },

  // Border system
  border: {
    light: "#F5F5F5",
    default: "#E5E5E5",
    medium: "#D4D4D4",
    strong: "#A3A3A3",
  },

  // Shadow system - Soft, diffuse shadows for elevation (not dirt)
  shadow: {
    light: "rgba(100, 116, 139, 0.03)",
    default: "rgba(100, 116, 139, 0.05)",
    medium: "rgba(100, 116, 139, 0.08)",
    strong: "rgba(100, 116, 139, 0.12)",
    colored: "rgba(99, 102, 241, 0.08)", // Indigo shadow
  },

  // Glassmorphism effects
  glass: {
    light: "rgba(255, 255, 255, 0.7)",
    medium: "rgba(255, 255, 255, 0.5)",
    strong: "rgba(255, 255, 255, 0.3)",
    dark: "rgba(0, 0, 0, 0.3)",
  },

  // Overlay system
  overlay: {
    light: "rgba(0, 0, 0, 0.2)",
    medium: "rgba(0, 0, 0, 0.4)",
    strong: "rgba(0, 0, 0, 0.6)",
    dark: "rgba(0, 0, 0, 0.8)",
  },

  // Badge/Status colors
  badge: {
    pending: {
      bg: "#FEF3C7",
      text: "#92400E",
    },
    approved: {
      bg: "#D1FAE5",
      text: "#065F46",
    },
    rejected: {
      bg: "#FEE2E2",
      text: "#991B1B",
    },
    cognizable: {
      bg: "#FEE2E2",
      text: "#B91C1C",
    },
  },

  // Gradients - Premium gradient combinations
  gradient: {
    primary: ["#6366F1", "#4F46E5"],
    accent: ["#06B6D4", "#0891B2"],
    success: ["#10B981", "#047857"],
    sunset: ["#6366F1", "#EC4899"],
    ocean: ["#06B6D4", "#3B82F6"],
    midnight: ["#312E81", "#1E293B"],
  },

  // Backward compatibility - Legacy color names
  // These map to the new system for existing components
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textDisabled: "#A3A3A3",
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#E5E5E5",
  gray300: "#D4D4D4",
  gray400: "#A3A3A3",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#404040",
  gray800: "#262626",
  gray900: "#171717",
  borderLight: "#F5F5F5",
  borderDark: "#D4D4D4",
  secondary: "#06B6D4", // Cyan accent
  primaryLight: "#818CF8", // Primary 400
  secondaryLight: "#22D3EE", // Accent 400
  cognizable: "#EF4444", // Error 500
};
