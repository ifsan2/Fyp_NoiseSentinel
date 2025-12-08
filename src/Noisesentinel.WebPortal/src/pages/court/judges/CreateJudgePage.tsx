import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES, JUDGE_RANKS } from "@/utils/courtConstants";
import judgeApi from "@/api/judgeApi";
import courtApi from "@/api/courtApi";
import { CourtListItem } from "@/models/Court";

interface CreateJudgeFormData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  cnic: string;
  contactNo: string;
  rank: string;
  courtId: number;
  serviceStatus: boolean;
}

export const CreateJudgePage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [courts, setCourts] = useState<CourtListItem[]>([]);
  const [formData, setFormData] = useState<CreateJudgeFormData>({
    fullName: "",
    email: "",
    username: "",
    password: "",
    cnic: "",
    contactNo: "",
    rank: "",
    courtId: 0,
    serviceStatus: true,
  });

  useEffect(() => {
    loadCourts();
  }, []);

  const loadCourts = async () => {
    try {
      const data = await courtApi.getAllCourts();
      setCourts(data);
    } catch (error) {
      enqueueSnackbar("Failed to load courts", { variant: "error" });
    }
  };

  const handleChange = (field: keyof CreateJudgeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await judgeApi.createJudge(formData);
      enqueueSnackbar("Judge created successfully", { variant: "success" });
      navigate(COURT_ROUTES.JUDGES);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to create judge",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Judge"
        subtitle="Add a new judge to the system"
      />

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                fullWidth
                required
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                placeholder="e.g., Justice Muhammad Ali"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g., judge@court.gov.pk"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Username"
                fullWidth
                required
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="e.g., judge_ali"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                helperText="Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="CNIC"
                fullWidth
                required
                value={formData.cnic}
                onChange={(e) => handleChange("cnic", e.target.value)}
                placeholder="e.g., 12345-1234567-1"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Contact Number"
                fullWidth
                required
                value={formData.contactNo}
                onChange={(e) => handleChange("contactNo", e.target.value)}
                placeholder="e.g., +92-300-1234567"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Rank"
                fullWidth
                required
                value={formData.rank}
                onChange={(e) => handleChange("rank", e.target.value)}
              >
                <MenuItem value="">Select Rank</MenuItem>
                {JUDGE_RANKS.map((rank) => (
                  <MenuItem key={rank} value={rank}>
                    {rank}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Assign to Court"
                fullWidth
                required
                value={formData.courtId}
                onChange={(e) =>
                  handleChange("courtId", Number(e.target.value))
                }
              >
                <MenuItem value={0}>Select Court</MenuItem>
                {courts.map((court) => (
                  <MenuItem key={court.courtId} value={court.courtId}>
                    {court.courtName} - {court.courtTypeName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.serviceStatus}
                    onChange={(e) =>
                      handleChange("serviceStatus", e.target.checked)
                    }
                  />
                }
                label="Service Status (Active/On Leave)"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(COURT_ROUTES.JUDGES)}
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
                  {loading ? "Creating..." : "Create Judge"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
