import { Platform } from 'react-native';
import { colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography } from './typography';

// PREMIUM THEME SYSTEM
// World-class design system inspired by top 1% mobile applications
// Features: Glassmorphism, Blur effects, Micro-interactions, Premium animations

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,

  // Glassmorphism effects
  glassmorphism: {
    light: {
      backgroundColor: colors.glass.light,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    medium: {
      backgroundColor: colors.glass.medium,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.medium,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    dark: {
      backgroundColor: colors.glass.dark,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      ...Platform.select({
        ios: {
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  },

  // Shadow presets - Professional shadows
  shadows: {
    none: {
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    sm: {
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.light,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    md: {
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    lg: {
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.medium,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    xl: {
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.strong,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.16,
          shadowRadius: 16,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    colored: {
      ...Platform.select({
        ios: {
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  },

  // Animation timing - Smooth, professional
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    verySlow: 500,
    // Spring configs
    spring: {
      damping: 15,
      stiffness: 150,
      mass: 1,
    },
    springBouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
  },

  // Blur intensity (for BlurView)
  blur: {
    light: 10,
    medium: 20,
    strong: 40,
    extraStrong: 60,
  },

  // Card variants
  card: {
    flat: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    elevated: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.default,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    glass: {
      backgroundColor: colors.glass.light,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow.medium,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    outlined: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.border.default,
    },
  },

  // Button variants
  button: {
    primary: {
      backgroundColor: colors.primary[600],
      borderRadius: borderRadius.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary[600],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    secondary: {
      backgroundColor: colors.accent[500],
      borderRadius: borderRadius.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.accent[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    outline: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: colors.primary[600],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.lg,
    },
    glass: {
      backgroundColor: colors.glass.light,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
    },
  },

  // Input variants
  input: {
    default: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.default,
      padding: spacing.md,
    },
    glass: {
      backgroundColor: colors.glass.light,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      padding: spacing.md,
    },
    focused: {
      borderColor: colors.primary[500],
      borderWidth: 2,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary[500],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
  },

  // Badge variants
  badgeVariants: {
    primary: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
    success: {
      backgroundColor: colors.success[50],
      color: colors.success[700],
    },
    warning: {
      backgroundColor: colors.warning[50],
      color: colors.warning[700],
    },
    error: {
      backgroundColor: colors.error[50],
      color: colors.error[700],
    },
    info: {
      backgroundColor: colors.info[50],
      color: colors.info[700],
    },
  },
};

export type Theme = typeof theme;
export default theme;