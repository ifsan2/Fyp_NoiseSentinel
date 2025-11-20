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
  BusinessOutlined,
  PeopleOutlined,
  DevicesOutlined,
  GavelOutlined,
  AssignmentOutlined,
  ReportOutlined,
  DirectionsCarOutlined,
  PersonSearchOutlined,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { STATION_ROUTES } from "@/utils/stationConstants";
import { BrandLogo } from "@/components/BrandLogo";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

export const StationSidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({
    monitoring: true,
  });

  const handleToggle = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <DashboardOutlined />,
      path: STATION_ROUTES.DASHBOARD,
    },
    {
      label: "Police Stations",
      icon: <BusinessOutlined />,
      path: STATION_ROUTES.STATIONS,
    },
    {
      label: "Police Officers",
      icon: <PeopleOutlined />,
      path: STATION_ROUTES.OFFICERS,
    },
    {
      label: "IoT Devices",
      icon: <DevicesOutlined />,
      path: STATION_ROUTES.DEVICES,
    },
    {
      label: "Violations",
      icon: <GavelOutlined />,
      path: STATION_ROUTES.VIOLATIONS,
    },
    {
      label: "Monitoring",
      icon: <AssignmentOutlined />,
      children: [
        {
          label: "Challans",
          icon: <AssignmentOutlined />,
          path: STATION_ROUTES.CHALLANS,
        },
        {
          label: "FIRs",
          icon: <ReportOutlined />,
          path: STATION_ROUTES.FIRS,
        },
        {
          label: "Vehicles",
          icon: <DirectionsCarOutlined />,
          path: STATION_ROUTES.VEHICLES,
        },
        {
          label: "Accused",
          icon: <PersonSearchOutlined />,
          path: STATION_ROUTES.ACCUSED,
        },
      ],
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
            {isOpen ? (
              <ExpandLess
                sx={{
                  fontSize: 20,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.secondary
                      : "rgba(0, 0, 0, 0.65)",
                }}
              />
            ) : (
              <ExpandMore
                sx={{
                  fontSize: 20,
                  color:
                    theme.palette.mode === "dark"
                      ? theme.palette.text.secondary
                      : "rgba(0, 0, 0, 0.65)",
                }}
              />
            )}
          </ListItemButton>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ mt: 0.25, mb: 0.5 }}>
              {item.children?.map((child, childIndex) =>
                renderMenuItem(child, childIndex, depth + 1)
              )}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={index}>
        <ListItemButton
          selected={isActive}
          onClick={() => item.path && navigate(item.path)}
          sx={{
            mb: 0.5,
            mx: depth > 0 ? 2 : 1,
            ml: depth > 0 ? 5 : 1,
            px: 2,
            py: 1.5,
            borderRadius: "12px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
            ...(isActive && {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.primary.main
                  : alpha(theme.palette.primary.main, 0.12),
              color:
                theme.palette.mode === "dark"
                  ? "#fff"
                  : theme.palette.primary.dark,
              boxShadow:
                theme.palette.mode === "dark"
                  ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                  : `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.primary.main, 0.18),
                transform: "translateX(2px)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 3,
                height: "50%",
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#fff"
                    : theme.palette.primary.main,
                borderRadius: "0 4px 4px 0",
              },
            }),
            ...(!isActive && {
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                transform: "translateX(2px)",
              },
            }),
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: isActive
                ? theme.palette.mode === "dark"
                  ? "#fff"
                  : theme.palette.primary.dark
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
              fontSize: depth > 0 ? "0.875rem" : "0.9375rem",
              fontWeight: isActive ? 600 : 500,
              color: isActive
                ? theme.palette.mode === "dark"
                  ? "#fff"
                  : theme.palette.primary.dark
                : theme.palette.mode === "dark"
                ? theme.palette.text.primary
                : "rgba(0, 0, 0, 0.87)",
            }}
          />
        </ListItemButton>
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, #1a1d29 0%, #13151f 100%)"
            : "linear-gradient(180deg, #fafbff 0%, #f5f7fb 100%)",
        borderRight: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Premium Header */}
      <Box
        sx={{
          p: 2.5,
          pb: 2,
        }}
      >
        <BrandLogo size="medium" showText={true} />

        {/* User Profile Card - More Compact */}
        <Box
          sx={{
            mt: 2.5,
            p: 1.5,
            borderRadius: "12px",
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.1)
                : "#ffffff",
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.primary.main, 0.15)
            }`,
            boxShadow:
              theme.palette.mode === "dark"
                ? "none"
                : "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: "0.9375rem",
                fontWeight: 600,
              }}
            >
              {user?.fullName?.charAt(0) || "S"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 0.125,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.fullName || "Station Auth"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.625rem",
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Station Portal
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation with Section Header */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          px: 1.5,
          py: 1,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: alpha(theme.palette.text.primary, 0.1),
            borderRadius: "3px",
            "&:hover": {
              background: alpha(theme.palette.text.primary, 0.2),
            },
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(
            theme.palette.text.primary,
            0.1
          )} transparent`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 2,
            mb: 1.5,
            mt: 0.5,
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.secondary
                : "rgba(0, 0, 0, 0.5)",
            fontWeight: 700,
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Menu
        </Typography>
        <List component="nav" disablePadding>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>

      {/* Minimalist Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color:
              theme.palette.mode === "dark"
                ? theme.palette.text.disabled
                : "rgba(0, 0, 0, 0.38)",
            fontSize: "0.6875rem",
            fontWeight: 500,
          }}
        >
          NoiseSentinel v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};
