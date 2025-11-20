import React from "react";
import { IconButton, Tooltip, useTheme, alpha } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useThemeMode } from "../contexts/ThemeContext";

interface ThemeToggleButtonProps {
  size?: "small" | "medium" | "large";
  showTooltip?: boolean;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  size = "medium",
  showTooltip = true,
}) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  const button = (
    <IconButton
      onClick={toggleTheme}
      size={size}
      sx={{
        color: theme.palette.text.primary,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.16),
          transform: "rotate(180deg)",
        },
      }}
    >
      {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        placement="bottom"
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};
