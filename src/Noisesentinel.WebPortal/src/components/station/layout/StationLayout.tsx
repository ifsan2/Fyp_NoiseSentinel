import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon, Logout, Person, Lock } from "@mui/icons-material";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StationSidebar } from "./StationSidebar";
import { useSnackbar } from "notistack";
import { STATION_ROUTES, ROUTES } from "@/utils/constants";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { BrandLogo } from "@/components/BrandLogo";

const drawerWidth = 280;

export const StationLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    navigate(STATION_ROUTES.PROFILE);
  };

  const handleChangePassword = () => {
    handleProfileMenuClose();
    navigate(STATION_ROUTES.CHANGE_PASSWORD);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    enqueueSnackbar("Logged out successfully", { variant: "success" });
    navigate(ROUTES.LOGIN);
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
    <Box sx={{ display: "flex" }}>
      {/* Glassmorphism App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.8)
              : alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "none",
          borderBottom: `1px solid ${
            theme.palette.mode === "dark"
              ? alpha(theme.palette.common.white, 0.08)
              : alpha(theme.palette.common.black, 0.08)
          }`,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 1,
                display: { sm: "none" },
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Station Authority
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  display: { xs: "none", md: "block" },
                }}
              >
                Enforcement Portal
              </Typography>
            </Box>
          </Box>

          {/* Right side - Theme Toggle & User Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ThemeToggleButton />

            <Box
              sx={{
                display: { xs: "none", md: "block" },
                textAlign: "right",
                mr: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {user?.fullName}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                }}
              >
                {user?.role}
              </Typography>
            </Box>

            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 42,
                  height: 42,
                  fontWeight: 700,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  boxShadow: `0 4px 14px ${alpha(
                    theme.palette.primary.main,
                    0.3
                  )}`,
                }}
              >
                {user ? getInitials(user.fullName) : "SA"}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: "12px",
                background:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.background.paper, 0.95)
                    : theme.palette.background.paper,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.common.white, 0.08)
                    : alpha(theme.palette.common.black, 0.08)
                }`,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                    : "0 8px 32px rgba(0, 0, 0, 0.08)",
                "& .MuiMenuItem-root": {
                  borderRadius: "8px",
                  mx: 1,
                  my: 0.5,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                },
              },
            }}
          >
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleChangePassword}>
              <ListItemIcon>
                <Lock fontSize="small" />
              </ListItemIcon>
              <ListItemText>Change Password</ListItemText>
            </MenuItem>

            <Divider sx={{ my: 1 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: `${alpha(
                    theme.palette.error.main,
                    0.08
                  )} !important`,
                },
              }}
            >
              <ListItemIcon>
                <Logout
                  fontSize="small"
                  sx={{ color: theme.palette.error.main }}
                />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.95)
                  : theme.palette.background.paper,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRight: `1px solid ${
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.08)
                  : alpha(theme.palette.common.black, 0.08)
              }`,
            },
          }}
        >
          <StationSidebar />
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background:
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.background.paper, 0.95)
                  : theme.palette.background.paper,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRight: `1px solid ${
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.08)
                  : alpha(theme.palette.common.black, 0.08)
              }`,
            },
          }}
          open
        >
          <StationSidebar />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box
          sx={{
            maxWidth: "1600px",
            margin: "0 auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
