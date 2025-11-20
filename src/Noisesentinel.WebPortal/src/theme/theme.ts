import { createTheme, alpha } from "@mui/material/styles";

// AWARD-WINNING COLOR SYSTEM
// Inspired by: Linear, Vercel, Stripe, Arc Browser
// Professional noise monitoring enforcement platform

const colors = {
  // Sophisticated neutrals - NOT the typical grays
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
  // Primary - Sophisticated indigo (professional, trustworthy, modern)
  primary: {
    50: "#EEF2FF",
    100: "#E0E7FF",
    200: "#C7D2FE",
    300: "#A5B4FC",
    400: "#818CF8",
    500: "#6366F1", // Main - Professional indigo
    600: "#4F46E5",
    700: "#4338CA",
    800: "#3730A3",
    900: "#312E81",
  },
  // Accent - Subtle cyan for data/tech feel
  accent: {
    50: "#ECFEFF",
    100: "#CFFAFE",
    200: "#A5F3FC",
    300: "#67E8F9",
    400: "#22D3EE",
    500: "#06B6D4",
    600: "#0891B2",
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },
  // Semantic colors
  success: {
    50: "#F0FDF4",
    500: "#10B981",
    700: "#047857",
  },
  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    700: "#B45309",
  },
  error: {
    50: "#FEF2F2",
    500: "#EF4444",
    700: "#B91C1C",
  },
};

// Dark mode palette - Premium, not harsh
const darkPalette = {
  mode: "dark" as const,
  primary: {
    main: colors.primary[500],
    light: colors.primary[400],
    dark: colors.primary[600],
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: colors.accent[500],
    light: colors.accent[400],
    dark: colors.accent[600],
    contrastText: "#FFFFFF",
  },
  background: {
    default: colors.neutral[950], // Pure black base
    paper: colors.neutral[900], // Slightly elevated
  },
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[400],
    disabled: colors.neutral[600],
  },
  divider: alpha(colors.neutral[700], 0.3),
  success: {
    main: colors.success[500],
    light: colors.success[50],
    dark: colors.success[700],
  },
  warning: {
    main: colors.warning[500],
    light: colors.warning[50],
    dark: colors.warning[700],
  },
  error: {
    main: colors.error[500],
    light: colors.error[50],
    dark: colors.error[700],
  },
};

// Light mode palette - Clean, professional
const lightPalette = {
  mode: "light" as const,
  primary: {
    main: colors.primary[600],
    light: colors.primary[400],
    dark: colors.primary[700],
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: colors.accent[600],
    light: colors.accent[400],
    dark: colors.accent[700],
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#FFFFFF",
    paper: colors.neutral[50],
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    disabled: colors.neutral[400],
  },
  divider: alpha(colors.neutral[300], 0.5),
  success: {
    main: colors.success[500],
    light: colors.success[50],
    dark: colors.success[700],
  },
  warning: {
    main: colors.warning[500],
    light: colors.warning[50],
    dark: colors.warning[700],
  },
  error: {
    main: colors.error[500],
    light: colors.error[50],
    dark: colors.error[700],
  },
};

// Professional typography - System font stack
const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  h1: {
    fontSize: "3.5rem",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
  },
  h2: {
    fontSize: "2.5rem",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.03em",
  },
  h3: {
    fontSize: "2rem",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "-0.02em",
  },
  h4: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "-0.01em",
  },
  h5: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.75,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.75,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: "none" as const,
    letterSpacing: "0",
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 2.66,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
};

// Modern component overrides
const getComponentOverrides = (mode: "light" | "dark") => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarWidth: "thin",
        scrollbarColor:
          mode === "dark"
            ? `${colors.neutral[700]} ${colors.neutral[900]}`
            : `${colors.neutral[300]} ${colors.neutral[100]}`,
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background:
            mode === "dark" ? colors.neutral[900] : colors.neutral[100],
        },
        "&::-webkit-scrollbar-thumb": {
          background:
            mode === "dark" ? colors.neutral[700] : colors.neutral[300],
          borderRadius: "4px",
          "&:hover": {
            background:
              mode === "dark" ? colors.neutral[600] : colors.neutral[400],
          },
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "0.875rem",
        fontWeight: 500,
        textTransform: "none" as const,
        boxShadow: "none",
        transition: "all 0.15s ease",
        "&:hover": {
          boxShadow: "none",
        },
      },
      contained: {
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow:
            mode === "dark"
              ? `0 4px 12px ${alpha(colors.primary[500], 0.4)}`
              : `0 4px 12px ${alpha(colors.primary[600], 0.25)}`,
        },
      },
      outlined: {
        borderWidth: "1px",
        "&:hover": {
          borderWidth: "1px",
          backgroundColor:
            mode === "dark"
              ? alpha(colors.primary[500], 0.08)
              : alpha(colors.primary[600], 0.04),
        },
      },
      text: {
        "&:hover": {
          backgroundColor:
            mode === "dark"
              ? alpha(colors.neutral[50], 0.05)
              : alpha(colors.neutral[900], 0.04),
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "12px",
        border: `1px solid ${
          mode === "dark" ? colors.neutral[800] : colors.neutral[200]
        }`,
        boxShadow:
          mode === "dark"
            ? "none"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor:
            mode === "dark" ? colors.neutral[700] : colors.neutral[300],
          boxShadow:
            mode === "dark"
              ? `0 4px 12px ${alpha(colors.neutral[950], 0.5)}`
              : "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
      rounded: {
        borderRadius: "12px",
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          "& fieldset": {
            borderColor:
              mode === "dark" ? colors.neutral[800] : colors.neutral[300],
          },
          "&:hover fieldset": {
            borderColor:
              mode === "dark" ? colors.neutral[700] : colors.neutral[400],
          },
          "&.Mui-focused fieldset": {
            borderWidth: "1px",
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: "6px",
        fontWeight: 500,
        fontSize: "0.8125rem",
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${
          mode === "dark" ? colors.neutral[800] : colors.neutral[200]
        }`,
        padding: "16px",
      },
      head: {
        fontWeight: 600,
        fontSize: "0.75rem",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        color: mode === "dark" ? colors.neutral[400] : colors.neutral[600],
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: "none",
        borderBottom: `1px solid ${
          mode === "dark" ? colors.neutral[800] : colors.neutral[200]
        }`,
        backgroundColor:
          mode === "dark"
            ? alpha(colors.neutral[900], 0.8)
            : alpha("#FFFFFF", 0.8),
        backdropFilter: "blur(12px)",
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${
          mode === "dark" ? colors.neutral[800] : colors.neutral[200]
        }`,
        backgroundColor: mode === "dark" ? colors.neutral[950] : "#FFFFFF",
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: "6px",
        margin: "2px 12px",
        padding: "8px 12px",
        transition: "all 0.15s ease",
        "&:hover": {
          backgroundColor:
            mode === "dark"
              ? alpha(colors.neutral[50], 0.06)
              : alpha(colors.neutral[900], 0.04),
        },
        "&.Mui-selected": {
          backgroundColor:
            mode === "dark"
              ? alpha(colors.primary[500], 0.12)
              : alpha(colors.primary[600], 0.08),
          "&:hover": {
            backgroundColor:
              mode === "dark"
                ? alpha(colors.primary[500], 0.16)
                : alpha(colors.primary[600], 0.12),
          },
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
        border: "1px solid",
      },
      standardSuccess: {
        backgroundColor:
          mode === "dark"
            ? alpha(colors.success[500], 0.12)
            : alpha(colors.success[500], 0.08),
        borderColor:
          mode === "dark"
            ? alpha(colors.success[500], 0.3)
            : alpha(colors.success[500], 0.2),
      },
      standardError: {
        backgroundColor:
          mode === "dark"
            ? alpha(colors.error[500], 0.12)
            : alpha(colors.error[500], 0.08),
        borderColor:
          mode === "dark"
            ? alpha(colors.error[500], 0.3)
            : alpha(colors.error[500], 0.2),
      },
      standardWarning: {
        backgroundColor:
          mode === "dark"
            ? alpha(colors.warning[500], 0.12)
            : alpha(colors.warning[500], 0.08),
        borderColor:
          mode === "dark"
            ? alpha(colors.warning[500], 0.3)
            : alpha(colors.warning[500], 0.2),
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: "16px",
        border: `1px solid ${
          mode === "dark" ? colors.neutral[800] : colors.neutral[200]
        }`,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: "6px",
        fontSize: "0.8125rem",
        padding: "6px 12px",
        backgroundColor:
          mode === "dark" ? colors.neutral[800] : colors.neutral[700],
      },
    },
  },
});

const shape = {
  borderRadius: 8,
};

export const createDarkTheme = () =>
  createTheme({
    palette: darkPalette,
    typography,
    shape,
    components: getComponentOverrides("dark"),
  });

export const createLightTheme = () =>
  createTheme({
    palette: lightPalette,
    typography,
    shape,
    components: getComponentOverrides("light"),
  });

export const darkTheme = createDarkTheme();
export const lightTheme = createLightTheme();
