import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { ArrowBack } from "@mui/icons-material";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import caseApi from "@/api/caseApi";
import caseStatementApi from "@/api/caseStatementApi";
import { CaseResponse } from "@/models/Case";
import { CaseStatementListItem } from "@/models/CaseStatement";

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [statements, setStatements] = useState<CaseStatementListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCaseDetails(parseInt(id));
    }
  }, [id]);

  const loadCaseDetails = async (caseId: number) => {
    setLoading(true);
    try {
      const [caseResponse, statementsResponse] = await Promise.all([
        caseApi.getCaseById(caseId),
        caseStatementApi.getCaseStatementsByCaseId(caseId),
      ]);
      setCaseData(caseResponse);
      setStatements(statementsResponse);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load case details",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not Set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCaseStatusColor = (
    status: string
  ): "default" | "primary" | "secondary" | "success" | "warning" | "error" => {
    const statusMap: Record<
      string,
      "default" | "primary" | "secondary" | "success" | "warning" | "error"
    > = {
      "Under Review": "warning",
      "Hearing Scheduled": "info",
      "In Progress": "primary",
      "Verdict Announced": "success",
      Closed: "default",
      Dismissed: "error",
    };
    return statusMap[status] || "default";
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
    return (
      <Box>
        <Alert severity="error">Case not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Case: ${caseData.caseNo}`}
        subtitle="View case details (Read-only)"
        breadcrumbs={[
          { label: "Cases", path: COURT_ROUTES.CASES },
          { label: caseData.caseNo },
        ]}
        action={{
          label: "Back to Cases",
          icon: <ArrowBack />,
          onClick: () => navigate(COURT_ROUTES.CASES),
        }}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        This is a read-only view. Only the assigned judge can update case status, hearing dates, and record statements.
      </Alert>

      {/* Case Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Case Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Case Number
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {caseData.caseNo}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Case Type
            </Typography>
            <Typography variant="body1">{caseData.caseType}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={caseData.caseStatus}
              size="small"
              color={getCaseStatusColor(caseData.caseStatus)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Assigned Judge
            </Typography>
            <Typography variant="body1">{caseData.judgeName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Court
            </Typography>
            <Typography variant="body1">{caseData.courtName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Hearing Date
            </Typography>
            <Typography variant="body1">
              {caseData.hearingDate ? formatDate(caseData.hearingDate) : "Not Scheduled"}
            </Typography>
          </Grid>
          {caseData.verdict && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Verdict
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {caseData.verdict}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Accused Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Accused Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">{caseData.accusedName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              CNIC
            </Typography>
            <Typography variant="body1">{caseData.accusedCnic}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Contact
            </Typography>
            <Typography variant="body1">{caseData.accusedContact}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Address
            </Typography>
            <Typography variant="body1">{caseData.accusedAddress}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Vehicle Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Vehicle Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Registration Number
            </Typography>
            <Typography variant="body1">
              {caseData.vehicleRegistrationNo}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Model
            </Typography>
            <Typography variant="body1">{caseData.vehicleModel}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Violation Type
            </Typography>
            <Typography variant="body1">{caseData.violationType}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Case Statements */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Case Statements
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {statements.length === 0 ? (
          <Typography variant="body2" color="text.secondary" py={2}>
            No statements recorded yet
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Recorded By</TableCell>
                  <TableCell>Statement</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statements.map((statement) => (
                  <TableRow key={statement.statementId}>
                    <TableCell>
                      {formatDate(statement.statementDate)}
                    </TableCell>
                    <TableCell>
                      <Chip label={statement.statementType} size="small" />
                    </TableCell>
                    <TableCell>{statement.recordedByName}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {statement.statementText}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
