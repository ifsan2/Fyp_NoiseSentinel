import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  Gavel,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import { CASE_STATUSES, VERDICT_OPTIONS } from "@/utils/judgeConstants";
import caseApi from "@/api/caseApi";
import { CaseResponse, UpdateCaseDto } from "@/models/Case";

export const UpdateCasePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [formData, setFormData] = useState<UpdateCaseDto>({
    caseId: 0,
    caseStatus: "",
    hearingDate: "",
    verdict: "",
  });

  useEffect(() => {
    if (id) {
      loadCase(parseInt(id));
    }
  }, [id]);

  const loadCase = async (caseId: number) => {
    setLoading(true);
    try {
      const data = await caseApi.getCaseById(caseId);
      setCaseData(data);
      setFormData({
        caseId: data.caseId,
        caseStatus: data.caseStatus,
        hearingDate: data.hearingDate ? data.hearingDate.split("T")[0] : "", // Format for date input
        verdict: data.verdict || "",
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load case",
        { variant: "error" }
      );
      navigate(JUDGE_ROUTES.MY_CASES);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await caseApi.updateCase({
        ...formData,
        hearingDate: new Date(formData.hearingDate!).toISOString(),
      });
      enqueueSnackbar("Case updated successfully", { variant: "success" });
      navigate(`${JUDGE_ROUTES.CASE_DETAIL}/${formData.caseId}`);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update case",
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCaseStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "under review":
        return "info";
      case "verdict given":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!caseData) {
    return <Typography>Case not found</Typography>;
  }

  return (
    <Box>
      <PageHeader
        title={`Update Case - ${caseData.caseNo}`}
        subtitle="Update case status, hearing date, and verdict"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(`${JUDGE_ROUTES.CASE_DETAIL}/${caseData.caseId}`)}
          >
            Back to Case
          </Button>
        }
      />

      {/* Case Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Case Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Case Number
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {caseData.caseNo}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Case Type
            </Typography>
            <Typography variant="body1">{caseData.caseType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Accused
            </Typography>
            <Typography variant="body1">{caseData.accusedName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Current Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={caseData.caseStatus}
                color={getCaseStatusColor(caseData.caseStatus)}
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Update Form */}
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Case Status"
                value={formData.caseStatus}
                onChange={(e) =>
                  setFormData({ ...formData, caseStatus: e.target.value })
                }
                required
                InputProps={{
                  startAdornment: <Gavel sx={{ mr: 1, color: "action.active" }} />,
                }}
              >
                {CASE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Hearing Date"
                value={formData.hearingDate}
                onChange={(e) =>
                  setFormData({ ...formData, hearingDate: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Verdict (Optional)"
                value={formData.verdict}
                onChange={(e) =>
                  setFormData({ ...formData, verdict: e.target.value })
                }
                helperText="Select a verdict if case is ready for final judgment"
              >
                <MenuItem value="">
                  <em>No Verdict Yet</em>
                </MenuItem>
                {VERDICT_OPTIONS.map((verdict) => (
                  <MenuItem key={verdict} value={verdict}>
                    {verdict}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Note: Recording a verdict will automatically update the case status to "Verdict Given"
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`${JUDGE_ROUTES.CASE_DETAIL}/${caseData.caseId}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Case"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
