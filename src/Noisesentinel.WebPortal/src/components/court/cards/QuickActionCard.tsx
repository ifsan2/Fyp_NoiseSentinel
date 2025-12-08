import React from "react";
import { Box, Paper, Typography, Button, useTheme, alpha } from "@mui/material";
import { SvgIconComponent, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: SvgIconComponent;
  actionText: string;
  actionPath: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  actionPath,
  color = "primary",
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

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
      }}
    >
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
          mb: 2,
        }}
      >
        <Icon
          sx={{
            fontSize: 28,
            color: selectedColor,
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: theme.palette.text.primary,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      <Button
        variant="outlined"
        endIcon={<ArrowForward />}
        onClick={() => navigate(actionPath)}
        sx={{
          borderColor: alpha(selectedColor, 0.3),
          color: selectedColor,
          fontWeight: 600,
          textTransform: "none",
          borderRadius: "10px",
          px: 2,
          py: 1,
          "&:hover": {
            borderColor: selectedColor,
            backgroundColor: alpha(selectedColor, 0.08),
          },
        }}
      >
        {actionText}
      </Button>
    </Paper>
  );
};
