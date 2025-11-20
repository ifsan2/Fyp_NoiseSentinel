import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  alpha,
} from "@mui/material";
import {
  Gavel,
  LocalPolice,
  AdminPanelSettings,
  PersonAdd,
  Groups,
  People,
  TrendingUp,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/utils/constants";
import userApi from "@/api/userApi";
import { UserCountsDto } from "@/models/User";
import { useTheme } from "@mui/material/styles";

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [counts, setCounts] = useState<UserCountsDto | null>(null);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const data = await userApi.getUserCounts();
      setCounts(data);
    } catch (error) {
      console.error("Failed to load counts:", error);
    }
  };

  const quickActions = [
    {
      title: "View All Users",
      description: "Manage system users",
      icon: <People />,
      color: theme.palette.primary.main,
      path: ROUTES.VIEW_USERS,
    },
    {
      title: "Court Authority",
      description: "Add court administrator",
      icon: <Gavel />,
      color: theme.palette.warning.main,
      path: ROUTES.CREATE_COURT_AUTHORITY,
    },
    {
      title: "Station Authority",
      description: "Add station administrator",
      icon: <LocalPolice />,
      color: theme.palette.info.main,
      path: ROUTES.CREATE_STATION_AUTHORITY,
    },
    {
      title: "System Admin",
      description: "Add system administrator",
      icon: <AdminPanelSettings />,
      color: theme.palette.success.main,
      path: ROUTES.CREATE_ADMIN,
    },
  ];

  const stats = [
    {
      label: "Court Authorities",
      value: counts?.totalCourtAuthorities || 0,
      icon: <Gavel sx={{ fontSize: 24 }} />,
      color: theme.palette.warning.main,
      change: "+12%",
      trend: "up",
    },
    {
      label: "Station Authorities",
      value: counts?.totalStationAuthorities || 0,
      icon: <LocalPolice sx={{ fontSize: 24 }} />,
      color: theme.palette.info.main,
      change: "+8%",
      trend: "up",
    },
    {
      label: "Total Users",
      value: counts?.totalUsers || 0,
      icon: <Groups sx={{ fontSize: 24 }} />,
      color: theme.palette.success.main,
      change: "+15%",
      trend: "up",
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: theme.palette.text.primary,
            letterSpacing: "-0.02em",
          }}
        >
          Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          System administration and user management
        </Typography>
      </Box>

      {/* Welcome Card */}
      <Card
        sx={{
          mb: 4,
          bgcolor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.08)
              : alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.primary.main,
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {user?.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                Welcome back, {user?.fullName}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Chip
                  label={user?.role}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "10px",
                      bgcolor: alpha(stat.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Chip
                    icon={<TrendingUp sx={{ fontSize: 16 }} />}
                    label={stat.change}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {stat.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            color: theme.palette.text.primary,
          }}
        >
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage users and system authorities
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.2s ease",
                cursor: "pointer",
                "&:hover": {
                  borderColor: action.color,
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? `0 4px 20px ${alpha(action.color, 0.15)}`
                      : `0 4px 20px ${alpha(action.color, 0.1)}`,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                    bgcolor: alpha(action.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: action.color,
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  {action.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {action.description}
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{
                    color: action.color,
                    fontWeight: 600,
                    textTransform: "none",
                    p: 0,
                    minWidth: 0,
                    "&:hover": {
                      bgcolor: "transparent",
                      "& .MuiButton-endIcon": {
                        transform: "translateX(4px)",
                      },
                    },
                    "& .MuiButton-endIcon": {
                      transition: "transform 0.2s ease",
                    },
                  }}
                >
                  {action.title.includes("View") ? "View all" : "Create new"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
