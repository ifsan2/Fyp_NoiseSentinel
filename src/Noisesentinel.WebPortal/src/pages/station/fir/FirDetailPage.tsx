import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import firApi from "@/api/firApi";
import { FirResponseDto, UpdateFirDto } from "@/models/Fir";

export default function FirDetailPage() {
  const { firId } = useParams<{ firId: string }>();
  const navigate = useNavigate();

  const [fir, setFir] = useState<FirResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateInvestigation, setUpdateInvestigation] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (firId) {
      loadFir(parseInt(firId));
    }
  }, [firId]);

  const loadFir = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await firApi.getFirById(id);
      setFir(data);
      setUpdateStatus(data.firStatus);
      setUpdateInvestigation(data.investigationReport || "");
    } catch (err: any) {
      console.error("Failed to load FIR:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load FIR details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!fir) return;

    try {
      setUpdating(true);

      const dto: UpdateFirDto = {
        firId: fir.firId,
        firStatus: updateStatus,
        investigationReport: updateInvestigation.trim() || undefined,
      };

      const updatedFir = await firApi.updateFir(dto);
      setFir(updatedFir);
      setUpdateDialogOpen(false);
    } catch (err: any) {
      console.error("Failed to update FIR:", err);
      alert(
        err.response?.data?.message || "Failed to update FIR. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "info";
      case "UnderInvestigation":
        return "warning";
      case "Completed":
        return "success";
      case "Closed":
        return "default";
      default:
        return "default";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/([A-Z])/g, " $1").trim();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading FIR details...
        </Typography>
      </Container>
    );
  }

  if (error || !fir) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          {error || "FIR not found. Please go back and try again."}
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/station/fir/list")}
        >
          Back to FIR List
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/station/fir/list")}
            sx={{ mb: 1 }}
          >
            Back to FIR List
          </Button>
          <Typography variant="h4" gutterBottom>
            FIR Details
          </Typography>
          <Typography variant="h5" color="error" fontWeight="bold">
            {fir.firNo}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setUpdateDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            Update Status
          </Button>
          {fir.hasCase && (
            <Button
              variant="contained"
              color="success"
              startIcon={<GavelIcon />}
              onClick={() => navigate(`/station/cases/${fir.caseId}`)}
            >
              View Case
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Status Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    FIR Status
                  </Typography>
                  <Chip
                    label={formatStatus(fir.firStatus)}
                    color={getStatusColor(fir.firStatus)}
                    sx={{ fontSize: "1.1rem", padding: "20px 12px" }}
                  />
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" color="text.secondary">
                    Filed Date
                  </Typography>
                  <Typography variant="h6">{fir.dateFiledFormatted}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {fir.daysSinceFiled} days ago
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Station Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Station Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Station Name
                  </Typography>
                  <Typography variant="body1">{fir.stationName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Station Code
                  </Typography>
                  <Typography variant="body1">{fir.stationCode}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Informant (Officer) Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informant (Police Officer)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Officer Name
                  </Typography>
                  <Typography variant="body1">{fir.informantName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Badge Number
                  </Typography>
                  <Typography variant="body1">
                    {fir.informantBadgeNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Accused & Vehicle Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Accused Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{fir.accusedName}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    CNIC
                  </Typography>
                  <Typography variant="body1">{fir.accusedCnic}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Vehicle Plate Number
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {fir.vehiclePlateNumber}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Violation Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Violation Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Violation Type
                  </Typography>
                  <Typography variant="body1">{fir.violationType}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Sound Level
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={`${fir.soundLevelDBa} dB(A)`}
                      color="error"
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Penalty Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">
                    Rs. {fir.penaltyAmount.toLocaleString()}
                  </Typography>
                </Grid>
                {fir.mlClassification && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      ML Classification
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={fir.mlClassification}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* FIR Description */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                FIR Description
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {fir.firDescription}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Investigation Report */}
        {fir.investigationReport && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investigation Report
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {fir.investigationReport}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Evidence Chain */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Evidence Chain
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Challan ID → Emission Report → Digital Signature
              </Typography>
              <Typography
                variant="body2"
                sx={{ wordBreak: "break-all", fontFamily: "monospace" }}
              >
                {fir.evidenceChain}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Case Status */}
        {fir.hasCase && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: "#e8f5e9" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Case Filed</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => navigate(`/station/cases/${fir.caseId}`)}
                  >
                    View Case Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Update Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update FIR Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="FIR Status"
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              sx={{ mb: 3 }}
            >
              <MenuItem value="Filed">Filed</MenuItem>
              <MenuItem value="UnderInvestigation">
                Under Investigation
              </MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Investigation Report"
              placeholder="Update investigation details..."
              value={updateInvestigation}
              onChange={(e) => setUpdateInvestigation(e.target.value)}
              helperText="Optional: Add or update investigation report"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUpdateDialogOpen(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateSubmit}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update FIR"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
