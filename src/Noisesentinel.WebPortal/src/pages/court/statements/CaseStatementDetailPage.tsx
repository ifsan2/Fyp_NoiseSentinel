import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Description,
  Gavel,
  AccountBalance,
  Person,
  DirectionsCar,
  Warning,
  CalendarToday,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import caseStatementApi from "@/api/caseStatementApi";
import { CaseStatementResponse } from "@/models/CaseStatement";

export const CaseStatementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [statement, setStatement] = useState<CaseStatementResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

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
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load case statement",
        { variant: "error" }
      );
      navigate(COURT_ROUTES.CASE_STATEMENTS);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCaseStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "info";
      case "under investigation":
        return "warning";
      case "pending":
        return "warning";
      case "closed":
        return "success";
      case "dismissed":
        return "error";
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

  if (!statement) {
    return (
      <Box>
        <Typography variant="h6">Statement not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Case Statement - ${statement.caseNo}`}
        subtitle={`Statement by ${statement.statementBy}`}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(COURT_ROUTES.CASE_STATEMENTS)}
          >
            Back to Statements
          </Button>
        }
      />

      {/* Statement Header Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Description color="primary" />
              <Typography variant="h6">Case Information</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Case Number
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {statement.caseNo}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Case Type
                </Typography>
                <Typography variant="body1">{statement.caseType}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={statement.caseStatus}
                    color={getCaseStatusColor(statement.caseStatus)}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Gavel color="primary" />
              <Typography variant="h6">Court Information</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Judge
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Gavel fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight={600}>
                    {statement.judgeName}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Court
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <AccountBalance fontSize="small" color="action" />
                  <Typography variant="body1">{statement.courtName}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Statement Date
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body1">
                    {formatDate(statement.statementDate)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Accused & Violation Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Person color="primary" />
          <Typography variant="h6">Accused & Violation Details</Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">
              Accused Name
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body1" fontWeight={600}>
                {statement.accusedName}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">
              Vehicle Plate Number
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <DirectionsCar fontSize="small" color="action" />
              <Typography variant="body1" fontWeight={600}>
                {statement.vehiclePlateNumber}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="caption" color="text.secondary">
              Violation Type
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              <Warning fontSize="small" color="error" />
              <Typography variant="body1" fontWeight={600}>
                {statement.violationType}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Statement Text */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Description color="primary" />
          <Typography variant="h6">Statement</Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Typography
          variant="body1"
          sx={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.8,
            fontSize: "1rem",
            fontFamily: "Georgia, serif",
          }}
        >
          {statement.statementText}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Statement recorded {statement.daysSinceStatement} days ago
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Statement by: {statement.statementBy}
          </Typography>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`${COURT_ROUTES.CASE_DETAIL}/${statement.caseId}`)
          }
        >
          View Full Case
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(COURT_ROUTES.CASE_STATEMENTS)}
        >
          View All Statements
        </Button>
      </Box>
    </Box>
  );
};
