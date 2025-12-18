import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Gavel,
  Person,
  DirectionsCar,
  CalendarToday,
  Description,
  Add,
  Visibility,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
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
      const data = await caseApi.getCaseById(caseId);
      setCaseData(data);

      // Load case statements
      const statementsData = await caseStatementApi.getStatementsByCase(caseId);
      setStatements(statementsData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load case details",
        { variant: "error" }
      );
      navigate(JUDGE_ROUTES.MY_CASES);
    } finally {
      setLoading(false);
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
      case "dismissed":
        return "error";
      default:
        return "default";
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
        <Typography variant="h6">Case not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title={`Case Details - ${caseData.caseNo}`}
        subtitle={caseData.caseType}
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(JUDGE_ROUTES.MY_CASES)}
            >
              Back to Cases
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() =>
                navigate(`${JUDGE_ROUTES.UPDATE_CASE}/${caseData.caseId}`)
              }
            >
              Update Case
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={() =>
                navigate(
                  `${JUDGE_ROUTES.CREATE_STATEMENT}?caseId=${caseData.caseId}`
                )
              }
            >
              Record Statement
            </Button>
          </Box>
        }
      />

      {/* Case Header Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Case Number
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {caseData.caseNo}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Case Type
              </Typography>
              <Typography variant="body1">{caseData.caseType}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={caseData.caseStatus}
                  color={getCaseStatusColor(caseData.caseStatus)}
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Hearing Date
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <CalendarToday fontSize="small" color="action" />
                <Typography variant="body1">
                  {["Closed", "Convicted", "Acquitted", "Dismissed"].includes(
                    caseData.caseStatus
                  )
                    ? "N/A"
                    : caseData.hearingDate
                    ? formatDate(caseData.hearingDate)
                    : "Not Set"}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                FIR Number
              </Typography>
              <Typography variant="body1">{caseData.firNo}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Accused & Vehicle Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Accused & Vehicle Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Accused Name
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Person fontSize="small" color="action" />
                <Typography variant="body1" fontWeight={600}>
                  {caseData.accusedName}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                CNIC
              </Typography>
              <Typography variant="body1">{caseData.accusedCnic}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Vehicle Plate Number
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <DirectionsCar fontSize="small" color="action" />
                <Typography variant="body1" fontWeight={600}>
                  {caseData.vehiclePlateNumber}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Violation Type
              </Typography>
              <Typography variant="body1">{caseData.violationType}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Verdict Section */}
      {caseData.verdict && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: "success.50" }}>
          <Typography
            variant="h6"
            fontWeight={600}
            gutterBottom
            color="success.main"
          >
            Final Verdict
          </Typography>
          <Typography variant="body1">{caseData.verdict}</Typography>
        </Paper>
      )}

      {/* Case Statements */}
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Case Statements & Proceedings
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              navigate(
                `${JUDGE_ROUTES.CREATE_STATEMENT}?caseId=${caseData.caseId}`
              )
            }
          >
            Add Statement
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Statement By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Preview</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ py: 4 }}>
                      <Description
                        sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        No statements recorded yet
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                statements.map((statement) => (
                  <TableRow key={statement.statementId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {statement.statementBy}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(statement.statementDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 400,
                        }}
                      >
                        {statement.statementPreview}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Statement">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `${JUDGE_ROUTES.STATEMENT_DETAIL}/${statement.statementId}`
                            )
                          }
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
