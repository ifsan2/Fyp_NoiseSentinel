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
import { CourtSidebar } from "./CourtSidebar";
import { useSnackbar } from "notistack";
import { COURT_ROUTES, ROUTES } from "@/utils/constants";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { BrandLogo } from "@/components/BrandLogo";

const drawerWidth = 280;

export const CourtLayout: React.FC = () => {
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
    navigate(COURT_ROUTES.PROFILE);
  };

  const handleChangePassword = () => {
    handleProfileMenuClose();
    navigate(COURT_ROUTES.CHANGE_PASSWORD);
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
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <BrandLogo size="small" showText />
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThemeToggleButton />

            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 1 }}
              aria-controls="profile-menu"
              aria-haspopup="true"
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {user?.fullName ? getInitials(user.fullName) : "CA"}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
            mt: 1.5,
            minWidth: 200,
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.95)
                : alpha(theme.palette.background.paper, 0.98),
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${
              theme.palette.mode === "dark"
                ? alpha(theme.palette.common.white, 0.08)
                : alpha(theme.palette.common.black, 0.08)
            }`,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.paper
                  : theme.palette.background.paper,
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleChangePassword} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <Lock fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Password</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: "error.main",
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" sx={{ color: "error.main" }} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
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
            },
          }}
        >
          <CourtSidebar />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          <CourtSidebar />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha(
                  theme.palette.background.default,
                  0.95
                )} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`
              : `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${alpha(
                  theme.palette.grey[50],
                  0.4
                )} 100%)`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
