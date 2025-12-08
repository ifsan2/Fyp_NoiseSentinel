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
} from "@mui/material";
import {
  Visibility,
  Search,
  Refresh,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import caseApi from "@/api/caseApi";
import { CaseListItem } from "@/models/Case";

export const ViewCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [searchQuery, cases]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const data = await caseApi.getAllCases();
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

  const filterCases = () => {
    let filtered = [...cases];

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.accusedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.judgeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCases(filtered);
  };

  const getCaseStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "info";
      case "Under Review":
        return "warning";
      case "Closed":
        return "success";
      case "Convicted":
        return "error";
      case "Acquitted":
        return "success";
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

  return (
    <Box>
      <PageHeader
        title="Cases"
        subtitle="Manage court cases"
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
              onClick={() => navigate(COURT_ROUTES.CREATE_CASE)}
            >
              Create Case
            </Button>
          </Box>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search cases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
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
              <TableCell>Accused</TableCell>
              <TableCell>Violation</TableCell>
              <TableCell>Judge</TableCell>
              <TableCell>Court</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Hearing Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" py={3}>
                    No cases found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCases.map((caseItem) => (
                <TableRow key={caseItem.caseId} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {caseItem.caseNo}
                    </Typography>
                  </TableCell>
                  <TableCell>{caseItem.accusedName}</TableCell>
                  <TableCell>{caseItem.violationType}</TableCell>
                  <TableCell>{caseItem.judgeName}</TableCell>
                  <TableCell>{caseItem.courtName}</TableCell>
                  <TableCell>
                    <Chip
                      label={caseItem.caseStatus}
                      size="small"
                      color={getCaseStatusColor(caseItem.caseStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    {caseItem.hearingDate
                      ? new Date(caseItem.hearingDate).toLocaleDateString()
                      : "Not scheduled"}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.CASE_DETAIL}/${caseItem.caseId}`
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
    </Box>
  );
};
