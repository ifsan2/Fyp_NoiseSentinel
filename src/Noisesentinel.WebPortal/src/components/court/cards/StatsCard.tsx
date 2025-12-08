import React from "react";
import { Box, Paper, Typography, useTheme, alpha } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: SvgIconComponent;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "primary",
}) => {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const selectedColor = colorMap[color];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.background.paper, 0.95),
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.08)
            : alpha(theme.palette.common.black, 0.08)
        }`,
        borderRadius: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(selectedColor, 0.15)}`,
          borderColor: alpha(selectedColor, 0.2),
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(90deg, ${selectedColor}, ${alpha(
            selectedColor,
            0.6
          )})`,
          borderRadius: "16px 16px 0 0",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.875rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${alpha(
              selectedColor,
              0.15
            )}, ${alpha(selectedColor, 0.05)})`,
            border: `1px solid ${alpha(selectedColor, 0.2)}`,
          }}
        >
          <Icon
            sx={{
              fontSize: 28,
              color: selectedColor,
            }}
          />
        </Box>
      </Box>

      {trend && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1,
              py: 0.5,
              borderRadius: "6px",
              backgroundColor: trend.isPositive
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: trend.isPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            vs last month
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
