import { styled, keyframes } from "@mui/material/styles";
import { Card, Box, alpha, IconButton } from "@mui/material";

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Modern Glass Card with enhanced depth
export const GlassCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)"
      : "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: `1px solid ${
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.06)"
      : "rgba(0, 0, 0, 0.06)"
  }`,
  borderRadius: "20px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.5)"
      : "0 4px 20px rgba(0, 0, 0, 0.04)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.08), transparent)"
        : "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.04), transparent)",
    transition: "left 0.5s",
  },
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 20px 60px rgba(14, 165, 233, 0.2)"
        : "0 16px 48px rgba(14, 165, 233, 0.12)",
    borderColor:
      theme.palette.mode === "dark"
        ? alpha("#0EA5E9", 0.4)
        : alpha("#0EA5E9", 0.3),
    "&::before": {
      left: "100%",
    },
  },
}));

// Stats Card with animated gradient border
export const StatsCard = styled(Card)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 1) 100%)"
      : "#FFFFFF",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: `2px solid ${
    theme.palette.mode === "dark"
      ? "rgba(14, 165, 233, 0.2)"
      : "rgba(14, 165, 233, 0.15)"
  }`,
  borderRadius: "20px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(14, 165, 233, 0.15)"
      : "0 4px 20px rgba(14, 165, 233, 0.08)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "linear-gradient(90deg, #0EA5E9, #8B5CF6, #0EA5E9)",
    backgroundSize: "200% 100%",
    animation: `${shimmer} 3s linear infinite`,
  },
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 24px 64px rgba(14, 165, 233, 0.25)"
        : "0 20px 56px rgba(14, 165, 233, 0.15)",
    borderColor:
      theme.palette.mode === "dark"
        ? alpha("#0EA5E9", 0.4)
        : alpha("#0EA5E9", 0.3),
  },
}));

// Gradient Action Button
export const ActionButton = styled("button")(({ theme }) => ({
  position: "relative",
  padding: "14px 32px",
  fontSize: "0.9375rem",
  fontWeight: 600,
  color: "#FFFFFF",
  background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 24px rgba(14, 165, 233, 0.3)"
      : "0 8px 24px rgba(14, 165, 233, 0.2)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)",
    opacity: 0,
    transition: "opacity 0.3s",
  },
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 40px rgba(14, 165, 233, 0.4)"
        : "0 12px 40px rgba(14, 165, 233, 0.3)",
    "&::before": {
      opacity: 1,
    },
  },
  "&:active": {
    transform: "translateY(-1px)",
  },
  "& > *": {
    position: "relative",
    zIndex: 1,
  },
}));

// Animated Icon Box
export const IconBox = styled(Box)(({ theme }) => ({
  width: "64px",
  height: "64px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${alpha("#0EA5E9", 0.2)}, ${alpha(
          "#8B5CF6",
          0.2
        )})`
      : `linear-gradient(135deg, ${alpha("#0EA5E9", 0.1)}, ${alpha(
          "#8B5CF6",
          0.1
        )})`,
  color: theme.palette.primary.main,
  fontSize: "1.75rem",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background: `radial-gradient(circle, ${alpha(
      "#0EA5E9",
      0.3
    )}, transparent 70%)`,
    opacity: 0,
    transition: "opacity 0.3s",
  },
  "&:hover": {
    transform: "scale(1.1) rotate(5deg)",
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
    "&::before": {
      opacity: 1,
    },
  },
}));

// Status Badge with pulse animation
export const StatusBadge = styled(Box)<{ statuscolor?: string }>(
  ({ theme, statuscolor }) => {
    const color = statuscolor || theme.palette.primary.main;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 16px",
      borderRadius: "12px",
      fontSize: "0.8125rem",
      fontWeight: 600,
      backgroundColor: alpha(color, 0.12),
      color: color,
      border: `2px solid ${alpha(color, 0.3)}`,
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        left: "8px",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        backgroundColor: color,
        animation: `${pulse} 2s ease-in-out infinite`,
      },
      "&:hover": {
        backgroundColor: alpha(color, 0.2),
        transform: "scale(1.05)",
        boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
      },
    };
  }
);

// Gradient Background Box
export const GradientBox = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? `radial-gradient(circle at 20% 20%, ${alpha(
          "#0EA5E9",
          0.08
        )} 0%, transparent 50%),
         radial-gradient(circle at 80% 80%, ${alpha(
           "#8B5CF6",
           0.08
         )} 0%, transparent 50%),
         ${theme.palette.background.default}`
      : `radial-gradient(circle at 20% 20%, ${alpha(
          "#0EA5E9",
          0.03
        )} 0%, transparent 50%),
         radial-gradient(circle at 80% 80%, ${alpha(
           "#8B5CF6",
           0.03
         )} 0%, transparent 50%),
         ${theme.palette.background.default}`,
  minHeight: "100vh",
}));

// Section Container with animation
export const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  animation: `${slideIn} 0.6s ease-out`,
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

// Animated Page Header
export const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  animation: `${slideIn} 0.6s ease-out`,
  "& .MuiTypography-h4, & .MuiTypography-h3": {
    fontWeight: 800,
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, #38BDF8, #8B5CF6)"
        : "linear-gradient(135deg, #0EA5E9, #8B5CF6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    display: "inline-block",
    letterSpacing: "-0.02em",
  },
}));

// Modern Data Container
export const DataContainer = styled(GlassCard)(({ theme }) => ({
  padding: theme.spacing(3),
  "& .MuiTableContainer-root": {
    borderRadius: "12px",
    overflow: "hidden",
  },
  "& .MuiTable-root": {
    "& .MuiTableHead-root": {
      "& .MuiTableRow-root": {
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(139, 92, 246, 0.08))"
            : "linear-gradient(135deg, rgba(14, 165, 233, 0.04), rgba(139, 92, 246, 0.04))",
      },
    },
    "& .MuiTableBody-root": {
      "& .MuiTableRow-root": {
        transition: "all 0.2s ease",
        "&:hover": {
          background:
            theme.palette.mode === "dark"
              ? alpha("#0EA5E9", 0.06)
              : alpha("#0EA5E9", 0.03),
          transform: "scale(1.01)",
        },
      },
    },
  },
}));

// Floating Action Button with animation
export const FloatingButton = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  bottom: "32px",
  right: "32px",
  width: "64px",
  height: "64px",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #0EA5E9, #8B5CF6)",
  color: "#FFFFFF",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 12px 40px rgba(14, 165, 233, 0.4)"
      : "0 12px 40px rgba(14, 165, 233, 0.3)",
  animation: `${float} 3s ease-in-out infinite`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "scale(1.1)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 16px 56px rgba(14, 165, 233, 0.5)"
        : "0 16px 56px rgba(14, 165, 233, 0.4)",
    animation: "none",
  },
}));

// Dashboard Metric Card
export const MetricCard = styled(StatsCard)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background:
      theme.palette.mode === "dark"
        ? `linear-gradient(to top, ${alpha("#0EA5E9", 0.08)}, transparent)`
        : `linear-gradient(to top, ${alpha("#0EA5E9", 0.04)}, transparent)`,
    pointerEvents: "none",
  },
}));
