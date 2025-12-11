import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Tooltip,
  MenuItem,
} from "@mui/material";
import {
  Visibility,
  Search,
  Refresh,
  Edit,
  Add,
  Gavel,
  CalendarToday,
  FilterList,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import { CASE_STATUSES } from "@/utils/judgeConstants";
import caseApi from "@/api/caseApi";
import { CaseListItem } from "@/models/Case";

export const ViewMyCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCasesData();
  }, [searchQuery, filterStatus, cases]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await caseApi.getMyCases();
      setCases(data);
      setFilteredCases(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load cases",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const filterCasesData = () => {
    let filtered = [...cases];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.accusedName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus && filterStatus !== "All") {
      filtered = filtered.filter((c) => c.caseStatus === filterStatus);
    }

    setFilteredCases(filtered);
  };

  const getCaseStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "under review":
      case "hearing scheduled":
        return "info";
      case "awaiting verdict":
        return "warning";
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
      month: "short",
      day: "numeric",
    });
  };

  const getUpcomingIndicator = (hearingDate: string | null) => {
    if (!hearingDate) return null;
    const hearing = new Date(hearingDate);
    const now = new Date();
    const diffTime = hearing.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null;
    if (diffDays === 0) return <Chip label="Today" color="error" size="small" />;
    if (diffDays === 1) return <Chip label="Tomorrow" color="warning" size="small" />;
    if (diffDays <= 7) return <Chip label={`${diffDays} days`} color="info" size="small" />;
    return null;
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

  return (
    <Box>
      <PageHeader
        title="My Assigned Cases"
        subtitle="View and manage your assigned cases"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadCases}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(JUDGE_ROUTES.CREATE_STATEMENT)}
            >
              Record Statement
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by case no, type, or accused..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            {CASE_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCases.length} of {cases.length} cases
        </Typography>
      </Box>

      {/* Cases Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Case No.</TableCell>
              <TableCell>Case Type</TableCell>
              <TableCell>Accused</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hearing Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <Gavel
                      sx={{
                        fontSize: 64,
                        color: "text.disabled",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Cases Found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      {searchQuery || filterStatus !== "All"
                        ? "Try adjusting your filters"
                        : "You have no assigned cases yet"}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((caseItem) => (
                <TableRow key={caseItem.caseId} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Gavel fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600}>
                        {caseItem.caseNo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{caseItem.caseType}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {caseItem.accusedName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={caseItem.caseStatus}
                      color={getCaseStatusColor(caseItem.caseStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {caseItem.hearingDate ? formatDate(caseItem.hearingDate) : "Not Set"}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 0.5 }}>
                        {caseItem.hearingDate && getUpcomingIndicator(caseItem.hearingDate)}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${JUDGE_ROUTES.CASE_DETAIL}/${caseItem.caseId}`
                          )
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Case">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate(
                            `${JUDGE_ROUTES.UPDATE_CASE}/${caseItem.caseId}`
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
