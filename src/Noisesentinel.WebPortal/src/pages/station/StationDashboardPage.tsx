import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  People,
  Devices,
  Assignment,
  Report,
  Gavel,
  Refresh,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/station/cards/StatsCard";
import { QuickActionCard } from "@/components/station/cards/QuickActionCard";
import { PageHeader } from "@/components/common/PageHeader";
import { STATION_ROUTES } from "@/utils/stationConstants";
import stationApi from "@/api/stationApi";
import stationOfficerApi from "@/api/stationOfficerApi";
import deviceApi from "@/api/deviceApi";
import violationApi from "@/api/violationApi";

export const StationDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [stations, officers, devices, violations] = await Promise.all([
        stationApi.getAllStations(),
        stationOfficerApi.getAllOfficers(),
        deviceApi.getAllDevices(),
        violationApi.getAllViolations(),
      ]);

      // Calculate basic statistics
      setStats({
        totalStations: stations.length,
        totalOfficers: officers.length,
        totalDevices: devices.length,
        activeDevices: devices.filter((d: any) => d.status === "Active").length,
        totalViolations: violations.length,
        cognizableViolations: violations.filter((v) => v.isCognizable).length,
        totalChallans: 0, // Will be added when challan API is ready
        totalFirs: 0, // Will be added when fir API is ready
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load dashboard data",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Police Station",
      description: "Register a new police station in the system",
      icon: "🏢",
      color: "#3B82F6",
      buttonLabel: "Create Station",
      onClick: () => navigate(STATION_ROUTES.CREATE_STATION),
    },
    {
      title: "Create Police Officer",
      description: "Add a new officer and assign to station",
      icon: "👮",
      color: "#10B981",
      buttonLabel: "Create Officer",
      onClick: () => navigate(STATION_ROUTES.CREATE_OFFICER),
    },
    {
      title: "Register IoT Device",
      description: "Register new noise detection device",
      icon: "📱",
      color: "#F59E0B",
      buttonLabel: "Register Device",
      onClick: () => navigate(STATION_ROUTES.REGISTER_DEVICE),
    },
    {
      title: "Create Violation Type",
      description: "Add new violation type with penalty",
      icon: "⚖️",
      color: "#EF4444",
      buttonLabel: "Create Violation",
      onClick: () => navigate(STATION_ROUTES.CREATE_VIOLATION),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Station Authority Dashboard"
        subtitle="System-wide police management and monitoring"
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadDashboardData}
          >
            Refresh
          </Button>
        }
      />

      {/* Welcome Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          bgcolor: "primary.main",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome, {user?.fullName}! 👋
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage police stations, officers, devices, and monitor system-wide
          activities
        </Typography>
      </Paper>

      {/* Statistics Cards */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        📊 System Overview
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Police Stations"
            value={stats?.totalStations || 0}
            icon={<Business />}
            color="#3B82F6"
            subtitle="Registered stations"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Police Officers"
            value={stats?.totalOfficers || 0}
            icon={<People />}
            color="#10B981"
            subtitle={`${stats?.activeOfficers || 0} active • ${
              stats?.investigationOfficers || 0
            } IO`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="IoT Devices"
            value={stats?.totalDevices || 0}
            icon={<Devices />}
            color="#F59E0B"
            subtitle={`${stats?.devicesInUse || 0} in use • ${
              stats?.availableDevices || 0
            } available`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total Challans"
            value={stats?.totalChallans || 0}
            icon={<Assignment />}
            color="#8B5CF6"
            subtitle={`${stats?.unpaidChallans || 0} unpaid • ${
              stats?.overdueChallans || 0
            } overdue`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total FIRs"
            value={stats?.totalFirs || 0}
            icon={<Report />}
            color="#EF4444"
            subtitle={`${stats?.underInvestigation || 0} under investigation`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Violation Types"
            value={stats?.totalViolations || 0}
            icon={<Gavel />}
            color="#EC4899"
            subtitle={`${stats?.cognizableViolations || 0} cognizable`}
          />
        </Grid>
      </Grid>

      {/* Today's Activity */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        📅 Today's Activity
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Challans Issued Today"
            value={stats?.todayChallans || 0}
            icon={<Assignment />}
            color="#3B82F6"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="FIRs Filed Today"
            value={stats?.todayFirs || 0}
            icon={<Report />}
            color="#EF4444"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="This Month Challans"
            value={stats?.thisMonthChallans || 0}
            icon={<TrendingUp />}
            color="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="This Month FIRs"
            value={stats?.thisMonthFirs || 0}
            icon={<TrendingUp />}
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        🎯 Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <QuickActionCard {...action} />
          </Grid>
        ))}
      </Grid>

      {/* Additional Navigation Cards */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        🔍 Monitoring
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
            onClick={() => navigate(STATION_ROUTES.CHALLANS)}
          >
            <Assignment sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              View All Challans
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor challans across all stations
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
            onClick={() => navigate(STATION_ROUTES.FIRS)}
          >
            <Report sx={{ fontSize: 48, color: "error.main", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              View All FIRs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track FIRs system-wide
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
