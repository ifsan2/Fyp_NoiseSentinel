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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Edit,
  Gavel,
  LocationOn,
  BusinessCenter,
  People,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import courtApi from "@/api/courtApi";
import { CourtResponse } from "@/models/Court";

export const CourtDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [court, setCourt] = useState<CourtResponse | null>(null);

  useEffect(() => {
    if (id) {
      loadCourtDetails();
    }
  }, [id]);

  const loadCourtDetails = async () => {
    setLoading(true);
    try {
      const courtData = await courtApi.getCourtById(parseInt(id!));
      setCourt(courtData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load court details",
        { variant: "error" }
      );
      navigate(COURT_ROUTES.COURTS);
    } finally {
      setLoading(false);
    }
  };

  const getCourtTypeColor = (type: string) => {
    switch (type) {
      case "Supreme Court":
        return "error";
      case "High Court":
        return "warning";
      case "District Court":
        return "info";
      case "Civil Court":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!court) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title={court.courtName}
        subtitle="Court Details"
        breadcrumbs={[
          { label: "Dashboard", path: COURT_ROUTES.DASHBOARD },
          { label: "Courts", path: COURT_ROUTES.COURTS },
          { label: court.courtName },
        ]}
        actions={
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`${COURT_ROUTES.EDIT_COURT}/${id}`)}
          >
            Edit Court
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Court Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Gavel sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Court Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Court Type
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    <Chip
                      label={court.courtTypeName}
                      color={getCourtTypeColor(court.courtTypeName)}
                    />
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Location
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
                      {court.location || "N/A"}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    District
                  </Typography>
                  <Typography variant="body1">
                    {court.district || "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Province
                  </Typography>
                  <Typography variant="body1">
                    {court.province || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <People sx={{ fontSize: 40, color: "success.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Court Statistics
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Judges
                  </Typography>
                  <Typography variant="h3" fontWeight={700} color="primary">
                    {court.totalJudges}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Active Judges
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={600}
                    color="success.main"
                  >
                    {court.judges.filter((j) => j.serviceStatus).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Judges List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Judges
              </Typography>

              <Divider sx={{ my: 2 }} />

              {court.judges.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    No judges assigned to this court yet.
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(COURT_ROUTES.CREATE_JUDGE)}
                  >
                    Add Judge
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Judge Name</TableCell>
                        <TableCell>Rank</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {court.judges.map((judge) => (
                        <TableRow key={judge.judgeId} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {judge.fullName}
                            </Typography>
                          </TableCell>
                          <TableCell>{judge.rank || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={
                                judge.serviceStatus ? "Active" : "Inactive"
                              }
                              color={
                                judge.serviceStatus ? "success" : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
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
                    startIcon={<People />}
                    onClick={() =>
                      navigate(
                        `${COURT_ROUTES.JUDGES}?courtId=${court.courtId}`
                      )
                    }
                  >
                    View Judges
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<BusinessCenter />}
                    onClick={() =>
                      navigate(`${COURT_ROUTES.CASES}?courtId=${court.courtId}`)
                    }
                  >
                    View Cases
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Edit />}
                    onClick={() => navigate(`${COURT_ROUTES.EDIT_COURT}/${id}`)}
                  >
                    Edit Court
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
