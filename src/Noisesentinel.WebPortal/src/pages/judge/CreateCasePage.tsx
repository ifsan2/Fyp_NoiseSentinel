import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import { Save, Cancel, Gavel } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import caseApi from "@/api/caseApi";
import firApi from "@/api/firApi";
import { FirResponseDto } from "@/models/Fir";

interface CreateCaseFormData {
  firId: number;
  judgeId: number;
  caseType: string;
  hearingDate?: string;
}

const CASE_TYPES = [
  "Traffic Violation",
  "Noise Pollution",
  "Environmental Violation",
  "Public Nuisance",
  "Other",
];

export const CreateCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedFir, setSelectedFir] = useState<FirResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateCaseFormData>({
    firId: 0,
    judgeId: user?.userId || 0,
    caseType: "Traffic Violation",
    hearingDate: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, judgeId: user.userId }));
    }
    const firId = searchParams.get("firId");
    if (firId) {
      loadFirDetails(parseInt(firId));
      setFormData((prev) => ({ ...prev, firId: parseInt(firId) }));
    }
  }, [searchParams, user]);

  const loadFirDetails = async (firId: number) => {
    try {
      const data = await firApi.getFirById(firId);
      setSelectedFir(data);
    } catch (error) {
      enqueueSnackbar("Failed to load FIR details", { variant: "error" });
    }
  };

  const handleChange = (field: keyof CreateCaseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firId || formData.firId === 0) {
      enqueueSnackbar("Please select a FIR", { variant: "error" });
      return;
    }

    setLoading(true);

    try {
      const dto = {
        firId: formData.firId,
        judgeId: formData.judgeId,
        caseType: formData.caseType,
        hearingDate: formData.hearingDate || undefined,
      };

      await caseApi.createCase(dto);
      enqueueSnackbar("Case created and assigned to you successfully", {
        variant: "success",
      });
      navigate(JUDGE_ROUTES.MY_CASES);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to create case",
        { variant: "error" }
      );
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

  return (
    <Box>
      <PageHeader
        title="Create Case"
        subtitle="Create a new case from FIR (will be assigned to you)"
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        The case will be automatically assigned to you as the presiding judge.
      </Alert>

      {selectedFir && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Gavel sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">FIR Details</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  FIR Number
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedFir.firNo}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Station
                </Typography>
                <Typography variant="body1">
                  {selectedFir.stationName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Filed Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedFir.dateFiled)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Accused Name
                </Typography>
                <Typography variant="body1">
                  {selectedFir.accusedName || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Vehicle Registration
                </Typography>
                <Typography variant="body1">
                  {selectedFir.vehiclePlateNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip
                  label={selectedFir.firStatus}
                  size="small"
                  color={selectedFir.firStatus === "Filed" ? "info" : "default"}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedFir.firDescription}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="FIR ID"
                type="number"
                fullWidth
                required
                value={formData.firId || ""}
                onChange={(e) =>
                  handleChange("firId", parseInt(e.target.value) || 0)
                }
                helperText="Enter FIR ID to create case from"
                disabled={!!searchParams.get("firId")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Assigned Judge"
                fullWidth
                value={user?.fullName || ""}
                disabled
                helperText="Case will be assigned to you"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Case Type"
                fullWidth
                required
                value={formData.caseType}
                onChange={(e) => handleChange("caseType", e.target.value)}
              >
                {CASE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Hearing Date (Optional)"
                type="date"
                fullWidth
                value={formData.hearingDate}
                onChange={(e) => handleChange("hearingDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="You can set or update this later"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(JUDGE_ROUTES.MY_CASES)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <Save />
                  }
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Case"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
