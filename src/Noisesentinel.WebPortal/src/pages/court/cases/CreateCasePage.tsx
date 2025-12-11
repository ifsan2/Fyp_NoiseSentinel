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
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import caseApi from "@/api/caseApi";
import firApi from "@/api/firApi";
import judgeApi from "@/api/judgeApi";
import { FirResponseDto } from "@/models/Fir";
import { JudgeDetailsDto } from "@/models/User";

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
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [judges, setJudges] = useState<JudgeDetailsDto[]>([]);
  const [selectedFir, setSelectedFir] = useState<FirResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateCaseFormData>({
    firId: 0,
    judgeId: 0,
    caseType: "Traffic Violation",
    hearingDate: "",
  });

  useEffect(() => {
    loadJudges();
    const firId = searchParams.get("firId");
    if (firId) {
      loadFirDetails(parseInt(firId));
      setFormData((prev) => ({ ...prev, firId: parseInt(firId) }));
    }
  }, [searchParams]);

  const loadJudges = async () => {
    try {
      console.log("Loading judges...");
      const data = await judgeApi.getAllJudges();
      console.log("All judges loaded:", data);
      
      // Filter only active judges
      const activeJudges = data.filter((judge) => judge.serviceStatus);
      console.log("Active judges:", activeJudges);
      setJudges(activeJudges);
      
      if (activeJudges.length === 0) {
        enqueueSnackbar("No active judges found. Please create a judge first.", { 
          variant: "warning" 
        });
      } else {
        enqueueSnackbar(`Loaded ${activeJudges.length} active judge(s)`, { 
          variant: "info" 
        });
      }
    } catch (error) {
      console.error("Load judges error:", error);
      enqueueSnackbar("Failed to load judges", { variant: "error" });
    }
  };

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

    if (!formData.judgeId || formData.judgeId === 0) {
      enqueueSnackbar("Please select a judge", { variant: "error" });
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

      console.log("Creating case with data:", dto); // Debug log
      await caseApi.createCase(dto);
      enqueueSnackbar("Case created and assigned successfully", { variant: "success" });
      navigate(COURT_ROUTES.CASES);
    } catch (error: any) {
      console.error("Create case error:", error); // Debug log
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to create case. Please ensure the selected judge exists.";
      enqueueSnackbar(errorMessage, { variant: "error" });
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
        subtitle="Create a new case from FIR and assign to a judge"
      />

      {judges.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No judges available. Please create a judge first before creating a case.
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ ml: 2 }}
            onClick={() => navigate(COURT_ROUTES.CREATE_JUDGE)}
          >
            Create Judge
          </Button>
        </Alert>
      )}

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
                helperText="Enter FIR ID or come from FIRs page"
                disabled={!!searchParams.get("firId")}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Assign to Judge"
                fullWidth
                required
                value={formData.judgeId}
                onChange={(e) =>
                  handleChange("judgeId", Number(e.target.value))
                }
                helperText={judges.length === 0 ? "No judges available" : `${judges.length} judge(s) available`}
              >
                <MenuItem value={0}>Select Judge</MenuItem>
                {judges.map((judge) => (
                  <MenuItem key={judge.judgeId} value={judge.judgeId}>
                    {judge.fullName} - {judge.rank || "Judge"} (Judge ID: {judge.judgeId})
                  </MenuItem>
                ))}
              </TextField>
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
                helperText="Initial hearing date can be set by judge later"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(COURT_ROUTES.CASES)}
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
