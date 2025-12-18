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
  Alert,
} from "@mui/material";
import {
  Assignment,
  LocalPolice,
  DirectionsCar,
  Person,
  Description,
  Gavel,
  Business,
  CalendarToday,
  Speed,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import firApi from "@/api/firApi";
import { FirResponseDto } from "@/models/Fir";

export const FirDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { firId } = useParams<{ firId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [fir, setFir] = useState<FirResponseDto | null>(null);

  useEffect(() => {
    if (firId) {
      loadFirDetails();
    }
  }, [firId]);

  const loadFirDetails = async () => {
    setLoading(true);
    try {
      const firData = await firApi.getFirById(parseInt(firId!));
      console.log("FIR Data loaded:", firData);
      console.log("Has Case:", firData.hasCase, "Case ID:", firData.caseId);
      setFir(firData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load FIR details",
        { variant: "error" }
      );
      navigate(COURT_ROUTES.FIRS);
    } finally {
      setLoading(false);
    }
  };

  const getFirStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "info";
      case "Under Investigation":
        return "warning";
      case "Forwarded to Court":
        return "success";
      case "Closed":
        return "default";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleViewCase = () => {
    if (!fir?.caseId) {
      console.error("Cannot view case: Case ID is missing", {
        hasCase: fir?.hasCase,
        caseId: fir?.caseId,
      });
      enqueueSnackbar("Case ID is missing. Unable to view case details.", {
        variant: "error",
      });
      return;
    }
    console.log("Navigating to case:", fir.caseId);
    navigate(`${COURT_ROUTES.CASE_DETAIL}/${fir.caseId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!fir) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title={`FIR: ${fir.firNo}`}
        subtitle="First Information Report Details"
        breadcrumbs={[
          { label: "Dashboard", path: COURT_ROUTES.DASHBOARD },
          { label: "FIRs", path: COURT_ROUTES.FIRS },
          { label: fir.firNo },
        ]}
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            {!fir.hasCase && (
              <Button
                variant="contained"
                startIcon={<Gavel />}
                onClick={() =>
                  navigate(`${COURT_ROUTES.CREATE_CASE}?firId=${fir.firId}`)
                }
              >
                Create Case
              </Button>
            )}
            {fir.hasCase && fir.caseId && (
              <Button
                variant="outlined"
                startIcon={<Gavel />}
                onClick={handleViewCase}
              >
                View Case
              </Button>
            )}
          </Box>
        }
      />

      {/* Data Consistency Warning */}
      {fir.hasCase && !fir.caseId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This FIR is marked as having a case, but the case ID is missing.
            This might be a data inconsistency issue. Please contact system
            administrator or try refreshing the page.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* FIR Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Description sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  FIR Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    FIR Number
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {fir.firNo}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={fir.firStatus}
                      color={getFirStatusColor(fir.firStatus)}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date Filed
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <CalendarToday color="action" fontSize="small" />
                    <Typography variant="body1">
                      {formatDate(fir.dateFiled)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Days Since Filed
                  </Typography>
                  <Typography variant="body1">
                    {fir.daysSinceFiled} days
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Police Station
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Business color="action" />
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {fir.stationName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {fir.stationCode}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Case Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {fir.hasCase ? (
                      <Chip label="Has Case" size="small" color="success" />
                    ) : (
                      <Chip label="No Case" size="small" color="warning" />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Accused & Vehicle Information Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Person sx={{ fontSize: 40, color: "error.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Accused Information
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Accused Name
                  </Typography>
                  <Typography variant="h6">{fir.accusedName}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CNIC
                  </Typography>
                  <Typography variant="body1">{fir.accusedCnic}</Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <DirectionsCar sx={{ fontSize: 32, color: "info.main" }} />
                  <Typography variant="h6" fontWeight={600}>
                    Vehicle Information
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Plate Number
                  </Typography>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {fir.vehiclePlateNumber}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Violation Type
                  </Typography>
                  <Typography variant="body1">{fir.violationType}</Typography>
                </Box>

                {fir.isCognizable && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      ⚠ Cognizable Offense
                    </Typography>
                    <Typography variant="caption">
                      This offense requires FIR filing under law
                    </Typography>
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Evidence Details Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Speed sx={{ fontSize: 40, color: "warning.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Evidence Details
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Sound Level
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error">
                      {fir.soundLevelDBa} dBa
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      ML Classification
                    </Typography>
                    <Typography variant="body1">
                      {fir.mlClassification || "N/A"}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Penalty Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="error">
                      Rs. {fir.penaltyAmount?.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Digital Signature
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ wordBreak: "break-all" }}
                    >
                      {fir.digitalSignatureValue?.substring(0, 20)}...
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Informant (Officer) Details Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <LocalPolice sx={{ fontSize: 40, color: "info.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  Informant (Officer)
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Officer Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {fir.informantName}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Badge Number
                  </Typography>
                  <Typography variant="body1">
                    {fir.informantBadgeNumber}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* FIR Description Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Description sx={{ fontSize: 40, color: "success.main" }} />
                <Typography variant="h5" fontWeight={600}>
                  FIR Description
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body1">{fir.firDescription}</Typography>

              {fir.investigationReport && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Investigation Report
                  </Typography>
                  <Typography variant="body2">
                    {fir.investigationReport}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Evidence Chain Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Evidence Chain
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                {fir.evidenceChain ||
                  "Evidence chain information not available"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
