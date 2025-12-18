import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh,
  Gavel,
  PendingActions,
  CheckCircle,
  Visibility,
  Add,
  Edit,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/court/cards/StatsCard";
import { QuickActionCard } from "@/components/court/cards/QuickActionCard";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import { useAuth } from "@/contexts/AuthContext";
import caseApi from "@/api/caseApi";
import { CaseListItem } from "@/models/Case";

export const JudgeDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    upcomingHearings: 0,
    verdictsGiven: 0,
  });
  const [recentCases, setRecentCases] = useState<CaseListItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load judge's assigned cases
      const casesData = await caseApi.getMyCases();
      setRecentCases(casesData.slice(0, 5));

      // Calculate stats
      const pending = casesData.filter(
        (c: CaseListItem) =>
          c.caseStatus === "Pending" || c.caseStatus === "Under Review"
      ).length;
      const verdicts = casesData.filter(
        (c: CaseListItem) =>
          c.caseStatus === "Verdict Given" || c.caseStatus === "Closed"
      ).length;

      // Count upcoming hearings (next 7 days) - exclude closed cases
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcoming = casesData.filter((c: CaseListItem) => {
        // Exclude closed/completed cases
        if (
          ["Closed", "Convicted", "Acquitted", "Dismissed"].includes(
            c.caseStatus
          )
        ) {
          return false;
        }
        if (!c.hearingDate) return false;
        try {
          const hearingDate = new Date(c.hearingDate);
          return hearingDate >= now && hearingDate <= nextWeek;
        } catch {
          return false;
        }
      }).length;

      setStats({
        totalCases: casesData.length,
        pendingCases: pending,
        upcomingHearings: upcoming,
        verdictsGiven: verdicts,
      });

      // Note: Judge can view statements per case, not all statements at once
      // This prevents unauthorized access errors
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load dashboard data",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const getCaseStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "under review":
        return "info";
      case "verdict given":
        return "success";
      case "closed":
        return "default";
      case "dismissed":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        title="Judge Dashboard"
        subtitle={`Welcome back, ${user?.fullName || "Judge"}`}
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
            title="Total Assigned Cases"
            value={stats.totalCases}
            icon={Gavel}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Cases"
            value={stats.pendingCases}
            icon={PendingActions}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Upcoming Hearings"
            value={stats.upcomingHearings}
            icon={PendingActions}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Verdicts Given"
            value={stats.verdictsGiven}
            icon={CheckCircle}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="View My Cases"
            description="Review all assigned cases"
            icon={Gavel}
            actionText="View Cases"
            actionPath={JUDGE_ROUTES.MY_CASES}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Record Statement"
            description="Create case statement or verdict"
            icon={Add}
            actionText="Create"
            actionPath={JUDGE_ROUTES.CREATE_STATEMENT}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Case Statements"
            description="View and manage statements"
            icon={Visibility}
            actionText="View All"
            actionPath={JUDGE_ROUTES.CASE_STATEMENTS}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <QuickActionCard
            title="Update Cases"
            description="Update case status and verdicts"
            icon={Edit}
            actionText="Update"
            actionPath={JUDGE_ROUTES.MY_CASES}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Recent Cases */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Recent Assigned Cases
          </Typography>
          <Button size="small" onClick={() => navigate(JUDGE_ROUTES.MY_CASES)}>
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Case No.</TableCell>
                <TableCell>Case Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hearing Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No cases assigned yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                recentCases.map((caseItem) => (
                  <TableRow key={caseItem.caseId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {caseItem.caseNo}
                      </Typography>
                    </TableCell>
                    <TableCell>{caseItem.caseType}</TableCell>
                    <TableCell>
                      <Chip
                        label={caseItem.caseStatus}
                        color={getCaseStatusColor(caseItem.caseStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {[
                        "Closed",
                        "Convicted",
                        "Acquitted",
                        "Dismissed",
                      ].includes(caseItem.caseStatus)
                        ? "N/A"
                        : caseItem.hearingDate
                        ? formatDate(caseItem.hearingDate)
                        : "Not Set"}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `${JUDGE_ROUTES.CASE_DETAIL}/${caseItem.caseId}`
                            )
                          }
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
