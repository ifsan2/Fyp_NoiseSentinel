import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import { Save, Cancel, Description } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import caseStatementApi from "@/api/caseStatementApi";
import { CaseStatementResponse } from "@/models/CaseStatement";

export const UpdateCaseStatementPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statement, setStatement] = useState<CaseStatementResponse | null>(
    null
  );
  const [statementText, setStatementText] = useState("");

  useEffect(() => {
    if (id) {
      loadStatement(parseInt(id));
    }
  }, [id]);

  const loadStatement = async (statementId: number) => {
    setLoading(true);
    try {
      const data = await caseStatementApi.getCaseStatementById(statementId);
      setStatement(data);
      setStatementText(data.statementText);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load statement",
        { variant: "error" }
      );
      navigate(JUDGE_ROUTES.CASE_STATEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statementText.trim()) {
      enqueueSnackbar("Please enter statement text", { variant: "error" });
      return;
    }

    if (!statement) return;

    setSubmitting(true);
    try {
      await caseStatementApi.updateCaseStatement({
        statementId: statement.statementId,
        statementText: statementText.trim(),
      });

      enqueueSnackbar("Statement updated successfully", { variant: "success" });
      navigate(JUDGE_ROUTES.CASE_STATEMENTS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update statement",
        { variant: "error" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <CircularProgress sx={{ color: "#8B5CF6" }} />
      </Box>
    );
  }

  if (!statement) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        title="Update Case Statement"
        subtitle={`Update statement for case ${statement.caseNo}`}
        breadcrumbs={[
          { label: "Dashboard", path: JUDGE_ROUTES.DASHBOARD },
          { label: "Case Statements", path: JUDGE_ROUTES.CASE_STATEMENTS },
          { label: "Update Statement" },
        ]}
      />

      {/* Case Information */}
      <Card sx={{ mb: 3, borderLeft: "4px solid #8B5CF6" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Case Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Case Number
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {statement.caseNo}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Case Type
              </Typography>
              <Typography variant="body1">{statement.caseType}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Accused Name
              </Typography>
              <Typography variant="body1">{statement.accusedName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Original Date
              </Typography>
              <Typography variant="body1">
                {formatDate(statement.statementDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Statement By
              </Typography>
              <Typography variant="body1">{statement.statementBy}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Vehicle Plate
              </Typography>
              <Typography variant="body1">
                {statement.vehiclePlateNumber}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Violation Type
              </Typography>
              <Typography variant="body1">{statement.violationType}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Update Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Statement Text"
            multiline
            rows={12}
            fullWidth
            required
            value={statementText}
            onChange={(e) => setStatementText(e.target.value)}
            helperText={`${statementText.length} characters`}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate(JUDGE_ROUTES.CASE_STATEMENTS)}
              disabled={submitting}
              sx={{
                borderColor: "#6B7280",
                color: "#6B7280",
                "&:hover": {
                  borderColor: "#4B5563",
                  backgroundColor: "#F9FAFB",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
              disabled={submitting}
              sx={{
                backgroundColor: "#8B5CF6",
                "&:hover": {
                  backgroundColor: "#7C3AED",
                },
              }}
            >
              {submitting ? "Updating..." : "Update Statement"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
