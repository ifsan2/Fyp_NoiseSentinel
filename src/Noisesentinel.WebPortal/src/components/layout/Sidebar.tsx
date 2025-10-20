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
} from "@mui/material";
import {
  Dashboard,
  Gavel,
  LocalPolice,
  AdminPanelSettings,
  People,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/utils/constants";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  dividerAfter?: boolean;
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ✅ ADD

  // ✅ Only show admin menu items
  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      path: ROUTES.DASHBOARD,
      dividerAfter: true,
    },
    {
      label: "View Users",
      icon: <People />,
      path: ROUTES.VIEW_USERS,
      dividerAfter: true,
    },
    {
      label: "Create Court Authority",
      icon: <Gavel />,
      path: ROUTES.CREATE_COURT_AUTHORITY,
    },
    {
      label: "Create Station Authority",
      icon: <LocalPolice />,
      path: ROUTES.CREATE_STATION_AUTHORITY,
    },
    {
      label: "Create Admin",
      icon: <AdminPanelSettings />,
      path: ROUTES.CREATE_ADMIN,
      dividerAfter: true,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

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
            {user?.role || "Portal"} {/* ✅ ADD: Show role */}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <List sx={{ px: 2, py: 2 }}>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
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
                      color: isActive(item.path) ? "white" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive(item.path) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
              {item.dividerAfter && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
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
          Version 1.0.0
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          © 2025 NoiseSentinel
        </Typography>
      </Box>
    </Box>
  );
};
