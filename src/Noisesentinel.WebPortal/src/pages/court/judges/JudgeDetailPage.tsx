import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Edit,
  Person,
  Gavel,
  Phone,
  Email,
  Badge,
  LocationOn,
  BusinessCenter,
  CheckCircle,
  Cancel as CancelIcon,
  Assignment,
  TrendingUp,
  Description,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/station/cards/StatsCard";
import { COURT_ROUTES } from "@/utils/courtConstants";
import judgeApi from "@/api/judgeApi";
import { JudgeDetailsDto } from "@/models/User";

export const JudgeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { judgeId } = useParams<{ judgeId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [judge, setJudge] = useState<JudgeDetailsDto | null>(null);

  useEffect(() => {
    if (judgeId) {
      loadJudgeDetails();
    }
  }, [judgeId]);

  const loadJudgeDetails = async () => {
    setLoading(true);
    try {
      // Get all judges and find by judgeId (similar to officer pattern)
      const judges = await judgeApi.getAllJudges();
      const judgeData = judges.find((j) => j.judgeId === parseInt(judgeId!));

      if (!judgeData) {
        throw new Error("Judge not found");
      }

      setJudge(judgeData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load judge details",
        { variant: "error" }
      );
      navigate(COURT_ROUTES.JUDGES);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!judge) return;

    try {
      if (judge.isActive) {
        await judgeApi.deactivateJudge(judge.judgeId);
        enqueueSnackbar(`Judge ${judge.fullName} deactivated successfully`, {
          variant: "success",
        });
      } else {
        await judgeApi.activateJudge(judge.judgeId);
        enqueueSnackbar(`Judge ${judge.fullName} activated successfully`, {
          variant: "success",
        });
      }
      loadJudgeDetails();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update judge status",
        { variant: "error" }
      );
    }
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!judge) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title={judge.fullName}
        subtitle="Judge Details"
        breadcrumbs={[
          { label: "Dashboard", path: COURT_ROUTES.DASHBOARD },
          { label: "Judges", path: COURT_ROUTES.JUDGES },
          { label: judge.fullName },
        ]}
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={judge.isActive ? "outlined" : "contained"}
              color={judge.isActive ? "error" : "success"}
              startIcon={judge.isActive ? <CancelIcon /> : <CheckCircle />}
              onClick={handleToggleStatus}
            >
              {judge.isActive ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() =>
                navigate(`${COURT_ROUTES.EDIT_JUDGE}/${judge.judgeId}`)
              }
            >
              Edit Judge
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Personal Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                  }}
                >
                  {getInitials(judge.fullName)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Personal Information
                  </Typography>
                  <Chip
                    label={judge.isActive ? "Active" : "Inactive"}
                    color={judge.isActive ? "success" : "error"}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Person color="action" />
                    <Typography variant="body1" fontWeight={500}>
                      {judge.fullName}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Email color="action" />
                    <Typography variant="body1">{judge.email}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contact Number
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Phone color="action" />
                    <Typography variant="body1">{judge.contactNo}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CNIC
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Badge color="action" />
                    <Typography variant="body1">{judge.cnic}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {judge.username}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Gavel sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Professional Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rank
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    <Chip label={judge.rank || "N/A"} color="primary" />
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Service Status
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    <Chip
                      label={judge.serviceStatus ? "In Service" : "Retired"}
                      color={judge.serviceStatus ? "success" : "default"}
                      size="small"
                    />
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Court Assignment
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <BusinessCenter color="action" />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {judge.courtName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {judge.courtType}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Court Location
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <LocationOn color="action" />
                    <Typography variant="body1">
                      {judge.courtLocation || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Statistics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Performance Statistics
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Total Cases Assigned"
                    value={judge.totalCases || 0}
                    icon={<Assignment />}
                    color="#3B82F6"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Cases This Month"
                    value={0}
                    icon={<Assignment />}
                    color="#10B981"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Statements Filed"
                    value={0}
                    icon={<Description />}
                    color="#F59E0B"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Resolution Rate"
                    value="-"
                    icon={<TrendingUp />}
                    color="#06B6D4"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<BusinessCenter />}
                    onClick={() =>
                      navigate(`${COURT_ROUTES.CASES}?judgeId=${judge.judgeId}`)
                    }
                  >
                    View Cases
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Gavel />}
                    onClick={() =>
                      navigate(`${COURT_ROUTES.COURTS}/detail/${judge.courtId}`)
                    }
                  >
                    View Court
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Edit />}
                    onClick={() =>
                      navigate(`${COURT_ROUTES.EDIT_JUDGE}/${judge.judgeId}`)
                    }
                  >
                    Edit Judge
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
