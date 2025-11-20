import React from "react";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface BrandLogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  variant?: "default" | "inverse"; // inverse for colored backgrounds
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "medium",
  showText = true,
  variant = "default",
}) => {
  const theme = useTheme();

  const sizes = {
    small: { icon: 28, text: "1.125rem", gap: 1 },
    medium: { icon: 32, text: "1.25rem", gap: 1.5 },
    large: { icon: 40, text: "1.5rem", gap: 2 },
  };

  const currentSize = sizes[size];

  // Use white color for inverse variant (on colored backgrounds)
  const iconColor =
    variant === "inverse" ? "#ffffff" : theme.palette.primary.main;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: currentSize.gap }}>
      {/* Minimalist Logo Icon - Shield with Waveform */}
      <Box
        sx={{
          width: currentSize.icon,
          height: currentSize.icon,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield outline */}
          <path
            d="M16 2L4 8V14C4 21 9.5 27.5 16 30C22.5 27.5 28 21 28 14V8L16 2Z"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Sound wave inside shield */}
          <path
            d="M16 11V13M12 13V15M20 13V15M10 15V17M22 15V17"
            stroke={iconColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </Box>

      {/* Brand Name - Clean typography */}
      {showText && (
        <Typography
          sx={{
            fontSize: currentSize.text,
            fontWeight: 600,
            color: theme.palette.text.primary,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            component="span"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
            }}
          >
            Noise
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: "0.85em",
              fontWeight: 500,
              color: theme.palette.text.secondary,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              mt: -0.5,
            }}
          >
            Sentinel
          </Box>
        </Typography>
      )}
    </Box>
  );
};
