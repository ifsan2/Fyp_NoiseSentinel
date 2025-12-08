import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  AccountBalance,
  Gavel,
  Report,
  Assignment,
  Refresh,
  Add,
  TrendingUp,
  Description,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/court/cards/StatsCard";
import { QuickActionCard } from "@/components/court/cards/QuickActionCard";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import courtApi from "@/api/courtApi";
import judgeApi from "@/api/judgeApi";
import caseApi from "@/api/caseApi";
import firApi from "@/api/firApi";

export const CourtDashboardPage: React.FC = () => {
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
      const [courts, judges, cases, firs] = await Promise.all([
        courtApi.getAllCourts(),
        judgeApi.getAllJudges(),
        caseApi.getAllCases(),
        firApi.getAllFirs(),
      ]);

      // Get today's date for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      // Filter FIRs without cases (forwarded to court)
      const firsWithoutCases = firs.filter(
        (f: any) => f.caseStatus === "Forwarded to Court" || !f.caseId
      );

      // Filter this month's cases
      const thisMonthCases = cases.filter((c: any) => {
        const caseDate = new Date(c.hearingDate || c.createdAt);
        return caseDate >= thisMonth;
      });

      // Count cases by status
      const underReviewCases = cases.filter(
        (c: any) => c.caseStatus === "Under Review"
      ).length;
      const closedCases = cases.filter(
        (c: any) => c.caseStatus === "Closed"
      ).length;

      // Count judges by status
      const activeJudges = judges.filter(
        (j: any) => j.isActive && j.serviceStatus
      ).length;

      // Count courts by type
      const supremeCourts = courts.filter(
        (c: any) => c.courtTypeName === "Supreme Court"
      ).length;
      const highCourts = courts.filter(
        (c: any) => c.courtTypeName === "High Court"
      ).length;
      const districtCourts = courts.filter(
        (c: any) => c.courtTypeName === "District Court"
      ).length;

      // Calculate upcoming hearings
      const upcomingHearings = cases.filter((c: any) => {
        if (!c.hearingDate) return false;
        const hearingDate = new Date(c.hearingDate);
        return hearingDate >= today;
      }).length;

      setStats({
        totalCourts: courts.length,
        supremeCourts,
        highCourts,
        districtCourts,
        totalJudges: judges.length,
        activeJudges,
        totalCases: cases.length,
        underReviewCases,
        closedCases,
        thisMonthCases: thisMonthCases.length,
        totalFirs: firs.length,
        firsWithoutCases: firsWithoutCases.length,
        upcomingHearings,
      });

      setLoading(false);
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      enqueueSnackbar(
        error.response?.data?.message ||
          "Failed to load dashboard data. Please try again.",
        { variant: "error" }
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Court Authority Dashboard"
        subtitle={`Welcome back, ${user?.fullName || "Court Authority"}`}
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Courts"
            value={stats?.totalCourts || 0}
            subtitle={`${stats?.supremeCourts || 0} Supreme, ${
              stats?.highCourts || 0
            } High, ${stats?.districtCourts || 0} District`}
            icon={AccountBalance}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Judges"
            value={stats?.totalJudges || 0}
            subtitle={`${stats?.activeJudges || 0} active judges`}
            icon={Gavel}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Cases"
            value={stats?.totalCases || 0}
            subtitle={`${stats?.underReviewCases || 0} under review, ${
              stats?.closedCases || 0
            } closed`}
            icon={Assignment}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="FIRs Awaiting"
            value={stats?.firsWithoutCases || 0}
            subtitle="FIRs without cases"
            icon={Report}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Additional Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="This Month Cases"
            value={stats?.thisMonthCases || 0}
            subtitle="Cases filed this month"
            icon={TrendingUp}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Upcoming Hearings"
            value={stats?.upcomingHearings || 0}
            subtitle="Scheduled hearings"
            icon={Description}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard
            title="Total FIRs"
            value={stats?.totalFirs || 0}
            subtitle="All filed FIRs"
            icon={Report}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}
        >
          Quick Actions
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Create Court"
            description="Register a new court in the system"
            icon={AccountBalance}
            actionText="Create Court"
            actionPath={COURT_ROUTES.CREATE_COURT}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Create Judge"
            description="Add a new judge to the system"
            icon={Gavel}
            actionText="Create Judge"
            actionPath={COURT_ROUTES.CREATE_JUDGE}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Create Case"
            description="File a new case from FIR"
            icon={Assignment}
            actionText="Create Case"
            actionPath={COURT_ROUTES.CREATE_CASE}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="View FIRs"
            description="Browse FIRs filed by stations"
            icon={Report}
            actionText="View FIRs"
            actionPath={COURT_ROUTES.FIRS}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Manage Cases"
            description="View and manage all cases"
            icon={Assignment}
            actionText="View Cases"
            actionPath={COURT_ROUTES.CASES}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Case Statements"
            description="View judge statements and verdicts"
            icon={Description}
            actionText="View Statements"
            actionPath={COURT_ROUTES.CASE_STATEMENTS}
            color="info"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
