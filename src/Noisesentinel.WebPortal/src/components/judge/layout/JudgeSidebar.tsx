import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
  Avatar,
} from "@mui/material";
import {
  DashboardOutlined,
  GavelOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import { BrandLogo } from "@/components/BrandLogo";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
}

export const JudgeSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <DashboardOutlined />,
      path: JUDGE_ROUTES.DASHBOARD,
    },
    {
      label: "My Cases",
      icon: <GavelOutlined />,
      path: JUDGE_ROUTES.MY_CASES,
    },
    {
      label: "Case Statements",
      icon: <DescriptionOutlined />,
      path: JUDGE_ROUTES.CASE_STATEMENTS,
    },
  ];

  const renderMenuItem = (item: MenuItem, index: number) => {
    const isActive = item.path ? location.pathname === item.path : false;

    return (
      <ListItemButton
        key={index}
        onClick={() => item.path && navigate(item.path)}
        sx={{
          mb: 0.5,
          mx: 1,
          px: 2,
          py: 1.5,
          borderRadius: "12px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: isActive
            ? alpha(theme.palette.primary.main, 0.12)
            : "transparent",
          "&:hover": {
            backgroundColor: isActive
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.primary.main, 0.08),
            transform: "translateX(4px)",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: isActive ? theme.palette.primary.main : "text.secondary",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: isActive
                ? theme.palette.primary.main
                : "transparent",
              color: isActive ? "white" : "inherit",
              transition: "all 0.2s",
            }}
          >
            {item.icon}
          </Box>
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: "0.925rem",
            fontWeight: isActive ? 600 : 500,
            color: isActive
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          }}
        />
      </ListItemButton>
    );
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.background.paper, 0.6)
            : alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: `1px solid ${
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.08)
            : alpha(theme.palette.common.black, 0.08)
        }`,
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: `1px solid ${
            theme.palette.mode === "dark"
              ? alpha(theme.palette.common.white, 0.08)
              : alpha(theme.palette.common.black, 0.08)
          }`,
        }}
      >
        <BrandLogo size="large" />
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.125rem",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NoiseSentinel
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Judge Portal
          </Typography>
        </Box>
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          mx: 1,
          my: 2,
          borderRadius: "12px",
          backgroundColor: alpha(theme.palette.primary.main, 0.06),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {user?.fullName ? getInitials(user.fullName) : "J"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              noWrap
              sx={{ color: "text.primary" }}
            >
              {user?.fullName || "Judge"}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: "text.secondary" }}
            >
              {user?.role || "Judge"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <List component="nav" sx={{ px: 0 }}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${
            theme.palette.mode === "dark"
              ? alpha(theme.palette.common.white, 0.08)
              : alpha(theme.palette.common.black, 0.08)
          }`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "text.disabled",
          }}
        >
          Judge Authority Portal v1.0
        </Typography>
      </Box>
    </Box>
  );
};
