import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Dashboard,
  Business,
  People,
  Devices,
  Gavel,
  Assignment,
  Report,
  DirectionsCar,
  PersonSearch,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { STATION_ROUTES } from "@/utils/stationConstants";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  dividerAfter?: boolean;
}

export const StationSidebar: React.FC = () => {
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
      icon: <Dashboard />,
      path: STATION_ROUTES.DASHBOARD,
      dividerAfter: true,
    },
    {
      label: "Police Stations",
      icon: <Business />,
      path: STATION_ROUTES.STATIONS,
    },
    {
      label: "Police Officers",
      icon: <People />,
      path: STATION_ROUTES.OFFICERS,
    },
    {
      label: "IoT Devices",
      icon: <Devices />,
      path: STATION_ROUTES.DEVICES,
    },
    {
      label: "Violations",
      icon: <Gavel />,
      path: STATION_ROUTES.VIOLATIONS,
      dividerAfter: true,
    },
    {
      label: "Monitoring",
      icon: <Assignment />,
      children: [
        {
          label: "Challans",
          icon: <Assignment />,
          path: STATION_ROUTES.CHALLANS,
        },
        {
          label: "FIRs",
          icon: <Report />,
          path: STATION_ROUTES.FIRS,
        },
        {
          label: "Vehicles",
          icon: <DirectionsCar />,
          path: STATION_ROUTES.VEHICLES,
        },
        {
          label: "Accused",
          icon: <PersonSearch />,
          path: STATION_ROUTES.ACCUSED,
        },
      ],
      dividerAfter: true,
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const renderMenuItem = (item: MenuItem, index: number, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);

    if (hasChildren) {
      const isOpen = openMenus[item.label.toLowerCase().replace(/\s+/g, "_")];
      return (
        <React.Fragment key={index}>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() =>
                handleToggle(item.label.toLowerCase().replace(/\s+/g, "_"))
              }
              sx={{
                borderRadius: 2,
                pl: depth * 2 + 2,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child, childIndex) =>
                renderMenuItem(child, childIndex, depth + 1)
              )}
            </List>
          </Collapse>
          {item.dividerAfter && <Divider sx={{ my: 1 }} />}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={index}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => item.path && navigate(item.path)}
            selected={active}
            sx={{
              borderRadius: 2,
              pl: depth * 2 + 2,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "& .MuiListItemIcon-root": {
                  color: "white",
                },
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: active ? "white" : "text.secondary",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: "0.9rem",
                fontWeight: active ? 600 : 400,
              }}
            />
          </ListItemButton>
        </ListItem>
        {item.dividerAfter && <Divider sx={{ my: 1 }} />}
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
          }}
        >
          🔊
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            NoiseSentinel
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Station Authority
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          {user?.fullName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );
};
