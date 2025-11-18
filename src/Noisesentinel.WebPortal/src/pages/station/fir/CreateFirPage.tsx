import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import firApi from "@/api/firApi";
import challanApi from "@/api/challanApi";
import { CreateFirDto } from "@/models/Fir";
import { ChallanDto } from "@/models/Challan";

export default function CreateFirPage() {
  const { challanId } = useParams<{ challanId: string }>();
  const navigate = useNavigate();

  const [challan, setChallan] = useState<ChallanDto | null>(null);
  const [firDescription, setFirDescription] = useState("");
  const [investigationReport, setInvestigationReport] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    firDescription?: string;
  }>({});

  useEffect(() => {
    if (challanId) {
      loadChallan(parseInt(challanId));
    }
  }, [challanId]);

  const loadChallan = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await challanApi.getChallanById(id);
      setChallan(data);

      // Pre-fill FIR description with violation details
      const vehicleInfo =
        data.vehiclePlateNumber ||
        data.plateNumber ||
        data.vehicleMake ||
        "Not specified";
      const description = `Challan #${data.challanId} - ${
        data.violationType || "Unknown"
      } violation. Accused: ${data.accusedName || "Unknown"} (CNIC: ${
        data.accusedCnic || "N/A"
      }). Vehicle: ${vehicleInfo}. Penalty: Rs. ${
        data.penaltyAmount || 0
      }. This is a cognizable offense requiring FIR filing.`;
      setFirDescription(description);
    } catch (err: any) {
      console.error("Failed to load challan:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load challan details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errors: { firDescription?: string } = {};

    if (!firDescription.trim()) {
      errors.firDescription = "FIR description is required";
    } else if (firDescription.trim().length < 20) {
      errors.firDescription = "FIR description must be at least 20 characters";
    } else if (firDescription.length > 500) {
      errors.firDescription = "FIR description must not exceed 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !challanId) return;

    try {
      setSubmitting(true);
      setError(null);

      const dto: CreateFirDto = {
        challanId: parseInt(challanId),
        firDescription: firDescription.trim(),
        investigationReport: investigationReport.trim() || undefined,
      };

      const result = await firApi.createFir(dto);

      // Navigate to FIR detail page
      navigate(`/station/fir/detail/${result.firId}`);
    } catch (err: any) {
      console.error("Failed to create FIR:", err);
      setError(
        err.response?.data?.message || "Failed to create FIR. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading challan details...
        </Typography>
      </Container>
    );
  }

  if (!challan) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Challan not found. Please go back and try again.
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate("/station/fir/cognizable")}
        >
          Back to Cognizable Challans
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            <DescriptionIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            File FIR
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filing FIR for cognizable offense against Challan #
            {challan.challanId}
          </Typography>
        </Box>

        {/* Challan Details Card */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Challan Details (Evidence)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Challan ID
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  #{challan.challanId}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Violation Type
                </Typography>
                <Typography variant="body1">{challan.violationType}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Accused
                </Typography>
                <Typography variant="body1">{challan.accusedName}</Typography>
                <Typography variant="caption">
                  CNIC: {challan.accusedCnic}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Vehicle
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {challan.vehiclePlateNumber ||
                    challan.plateNumber ||
                    challan.vehicleMake ||
                    "Not specified"}
                </Typography>
                {challan.vehicleMake &&
                  (challan.vehiclePlateNumber || challan.plateNumber) && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Make: {challan.vehicleMake}
                    </Typography>
                  )}
                {challan.vehicleColor && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Color: {challan.vehicleColor}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Penalty Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="error">
                  Rs. {(challan.penaltyAmount || 0).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Issue Date & Time
                </Typography>
                <Typography variant="body2">
                  {new Date(challan.issueDateTime).toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Issuing Officer
                </Typography>
                <Typography variant="body2">{challan.officerName}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* FIR Form */}
        <Box component="form" noValidate>
          <TextField
            fullWidth
            required
            multiline
            rows={6}
            label="FIR Description"
            placeholder="Describe the offense in detail..."
            value={firDescription}
            onChange={(e) => setFirDescription(e.target.value)}
            error={!!validationErrors.firDescription}
            helperText={
              validationErrors.firDescription ||
              `${firDescription.length}/500 characters (minimum 20)`
            }
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Investigation Report (Optional)"
            placeholder="Preliminary investigation details..."
            value={investigationReport}
            onChange={(e) => setInvestigationReport(e.target.value)}
            helperText={`${investigationReport.length}/500 characters (optional)`}
            sx={{ mb: 3 }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate("/station/fir/cognizable")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Filing FIR..." : "File FIR"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
