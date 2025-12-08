import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  useTheme,
  alpha,
  Avatar,
} from "@mui/material";
import {
  DashboardOutlined,
  AccountBalanceOutlined,
  GavelOutlined,
  ReportOutlined,
  AssignmentOutlined,
  DescriptionOutlined,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { COURT_ROUTES } from "@/utils/courtConstants";
import { BrandLogo } from "@/components/BrandLogo";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

export const CourtSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(
    {}
  );

  const handleToggle = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <DashboardOutlined />,
      path: COURT_ROUTES.DASHBOARD,
    },
    {
      label: "Courts",
      icon: <AccountBalanceOutlined />,
      path: COURT_ROUTES.COURTS,
    },
    {
      label: "Judges",
      icon: <GavelOutlined />,
      path: COURT_ROUTES.JUDGES,
    },
    {
      label: "FIRs",
      icon: <ReportOutlined />,
      path: COURT_ROUTES.FIRS,
    },
    {
      label: "Cases",
      icon: <AssignmentOutlined />,
      path: COURT_ROUTES.CASES,
    },
    {
      label: "Case Statements",
      icon: <DescriptionOutlined />,
      path: COURT_ROUTES.CASE_STATEMENTS,
    },
  ];

  const renderMenuItem = (item: MenuItem, index: number, depth: number = 0) => {
    const isActive = item.path ? location.pathname === item.path : false;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = hasChildren && openMenus[item.label.toLowerCase()];

    if (hasChildren) {
      return (
        <React.Fragment key={index}>
          <ListItemButton
            onClick={() => handleToggle(item.label.toLowerCase())}
            sx={{
              mb: 0.5,
              mx: 1,
              px: 2,
              py: 1.5,
              borderRadius: "12px",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: "translateX(4px)",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.text.secondary
                    : "rgba(0, 0, 0, 0.65)",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: "0.9375rem",
                fontWeight: 500,
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette.text.primary
                    : "rgba(0, 0, 0, 0.87)",
              }}
            />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child, childIndex) =>
                renderMenuItem(child, childIndex, depth + 1)
              )}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItemButton
        key={index}
        onClick={() => item.path && navigate(item.path)}
        sx={{
          mb: 0.5,
          mx: depth === 0 ? 1 : 2,
          px: 2,
          py: 1.5,
          pl: depth > 0 ? 4 : 2,
          borderRadius: "12px",
          backgroundColor: isActive
            ? alpha(theme.palette.primary.main, 0.12)
            : "transparent",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: isActive
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.primary.main, 0.08),
            transform: "translateX(4px)",
          },
          "&::before": isActive
            ? {
                content: '""',
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "4px",
                height: "24px",
                borderRadius: "0 4px 4px 0",
                backgroundColor: theme.palette.primary.main,
              }
            : undefined,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: isActive
              ? theme.palette.primary.main
              : theme.palette.mode === "dark"
              ? theme.palette.text.secondary
              : "rgba(0, 0, 0, 0.65)",
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: "0.9375rem",
            fontWeight: isActive ? 600 : 500,
            color: isActive
              ? theme.palette.primary.main
              : theme.palette.mode === "dark"
              ? theme.palette.text.primary
              : "rgba(0, 0, 0, 0.87)",
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
            : alpha(theme.palette.background.paper, 0.98),
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: `1px solid ${
          theme.palette.mode === "dark"
            ? alpha(theme.palette.common.white, 0.08)
            : alpha(theme.palette.common.black, 0.08)
        }`,
      }}
    >
      {/* Logo & User Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ mb: 3 }}>
          <BrandLogo size="medium" showText />
        </Box>

        {/* User Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderRadius: "12px",
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {user?.fullName ? getInitials(user.fullName) : "CA"}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.fullName || "Court Authority"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.role || "Court Authority"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        <List component="nav" disablePadding>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: theme.palette.text.secondary,
          }}
        >
          NoiseSentinel v1.0.0
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: theme.palette.text.disabled,
            mt: 0.5,
          }}
        >
          Court Authority Portal
        </Typography>
      </Box>
    </Box>
  );
};
