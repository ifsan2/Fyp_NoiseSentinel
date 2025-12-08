import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES, PAKISTAN_PROVINCES } from "@/utils/courtConstants";
import courtApi from "@/api/courtApi";
import { CreateCourtDto, CourtType } from "@/models/Court";

export const CreateCourtPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
  const [formData, setFormData] = useState<CreateCourtDto>({
    courtName: "",
    courtTypeId: 0,
    location: "",
    district: "",
    province: "",
  });

  useEffect(() => {
    loadCourtTypes();
  }, []);

  const loadCourtTypes = async () => {
    try {
      const types = await courtApi.getCourtTypes();
      setCourtTypes(types);
    } catch (error) {
      enqueueSnackbar("Failed to load court types", { variant: "error" });
    }
  };

  const handleChange = (field: keyof CreateCourtDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await courtApi.createCourt(formData);
      enqueueSnackbar("Court created successfully", { variant: "success" });
      navigate(COURT_ROUTES.COURTS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to create court",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Court"
        subtitle="Register a new court in the system"
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Court Name"
                fullWidth
                required
                value={formData.courtName}
                onChange={(e) => handleChange("courtName", e.target.value)}
                placeholder="e.g., Lahore High Court"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Court Type"
                fullWidth
                required
                value={formData.courtTypeId}
                onChange={(e) =>
                  handleChange("courtTypeId", Number(e.target.value))
                }
              >
                <MenuItem value={0}>Select Court Type</MenuItem>
                {courtTypes.map((type) => (
                  <MenuItem key={type.courtTypeId} value={type.courtTypeId}>
                    {type.courtTypeName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Province"
                fullWidth
                required
                value={formData.province}
                onChange={(e) => handleChange("province", e.target.value)}
              >
                <MenuItem value="">Select Province</MenuItem>
                {PAKISTAN_PROVINCES.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="District"
                fullWidth
                required
                value={formData.district}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder="e.g., Lahore"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Location"
                fullWidth
                required
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g., Mall Road, Lahore"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(COURT_ROUTES.COURTS)}
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
                  {loading ? "Creating..." : "Create Court"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
