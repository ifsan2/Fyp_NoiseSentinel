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
} from "@mui/material";
import {
  Edit,
  LocalPolice,
  Phone,
  Business,
  Badge,
  Email,
  SwapHoriz,
  Assignment,
  Report,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/station/cards/StatsCard";
import { STATION_ROUTES } from "@/utils/stationConstants";
import stationOfficerApi from "@/api/stationOfficerApi";
import { PoliceOfficerDetailsDto } from "@/models/User";

export const OfficerDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [officer, setOfficer] = useState<PoliceOfficerDetailsDto | null>(null);

  useEffect(() => {
    if (userId) {
      loadOfficer();
    }
  }, [userId]);

  const loadOfficer = async () => {
    setLoading(true);
    try {
      const officers = await stationOfficerApi.getAllOfficers();
      const officerData = officers.find((o) => o.userId === parseInt(userId!));

      if (!officerData) {
        throw new Error("Officer not found");
      }

      setOfficer(officerData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load officer details",
        { variant: "error" }
      );
      navigate(STATION_ROUTES.OFFICERS);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!officer) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title={officer.fullName}
        subtitle="Police Officer Details"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Police Officers", path: STATION_ROUTES.OFFICERS },
          { label: officer.fullName },
        ]}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<SwapHoriz />}
              onClick={() =>
                navigate(
                  `${STATION_ROUTES.TRANSFER_OFFICER}/${officer.officerId}`
                )
              }
              sx={{ mr: 1 }}
            >
              Transfer
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() =>
                navigate(`${STATION_ROUTES.EDIT_OFFICER}/${officer.officerId}`)
              }
            >
              Edit Officer
            </Button>
          </>
        }
      />

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <LocalPolice sx={{ fontSize: 40, color: "info.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Personal Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="h6">{officer.fullName}</Typography>
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
                    <Typography variant="body1">{officer.email}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1">{officer.username}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CNIC
                  </Typography>
                  <Typography variant="body1">{officer.cnic}</Typography>
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
                    <Typography variant="body1">{officer.contactNo}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={officer.isActive ? "Active" : "Inactive"}
                      color={officer.isActive ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Badge sx={{ fontSize: 40, color: "warning.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Service Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Badge Number
                  </Typography>
                  <Typography variant="h6">
                    <Chip label={officer.badgeNumber} color="primary" />
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rank
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {officer.rank}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Investigation Officer
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={officer.isInvestigationOfficer ? "Yes" : "No"}
                      color={
                        officer.isInvestigationOfficer ? "warning" : "default"
                      }
                      size="small"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Posting Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(officer.postingDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Assigned Station
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Business color="primary" />
                    <Box>
                      <Typography variant="h6" color="primary.main">
                        {officer.stationName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {officer.stationCode} • {officer.stationLocation}
                      </Typography>
                    </Box>
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
                    title="Total Challans Issued"
                    value={officer.totalChallans || 0}
                    icon={<Assignment />}
                    color="#3B82F6"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Challans This Month"
                    value={0}
                    icon={<Assignment />}
                    color="#10B981"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="FIRs Involved"
                    value={0}
                    icon={<Report />}
                    color="#F59E0B"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <StatsCard
                    title="Success Rate"
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
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.CHALLANS}?officerId=${officer.officerId}`
                      )
                    }
                  >
                    View Challans
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.FIRS}?officerId=${officer.officerId}`
                      )
                    }
                  >
                    View FIRs
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.EDIT_OFFICER}/${officer.officerId}`
                      )
                    }
                  >
                    Edit Officer
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="warning"
                    onClick={() =>
                      navigate(
                        `${STATION_ROUTES.TRANSFER_OFFICER}/${officer.officerId}`
                      )
                    }
                  >
                    Transfer Officer
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
