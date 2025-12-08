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
  Description,
  Gavel,
  AccountBalance,
  FilterList,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import caseStatementApi from "@/api/caseStatementApi";
import { CaseStatementListItem } from "@/models/CaseStatement";

export const ViewCaseStatementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [statements, setStatements] = useState<CaseStatementListItem[]>([]);
  const [filteredStatements, setFilteredStatements] = useState<
    CaseStatementListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJudge, setFilterJudge] = useState("All");

  useEffect(() => {
    loadStatements();
  }, []);

  useEffect(() => {
    filterStatements();
  }, [searchQuery, filterJudge, statements]);

  const loadStatements = async () => {
    setLoading(true);
    try {
      const data = await caseStatementApi.getAllCaseStatements();
      setStatements(data);
      setFilteredStatements(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load case statements",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const filterStatements = () => {
    let filtered = [...statements];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (stmt) =>
          stmt.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stmt.statementBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stmt.judgeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stmt.courtName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by judge
    if (filterJudge && filterJudge !== "All") {
      filtered = filtered.filter((stmt) => stmt.judgeName === filterJudge);
    }

    setFilteredStatements(filtered);
  };

  // Get unique judges for filter
  const uniqueJudges = Array.from(
    new Set(statements.map((s) => s.judgeName))
  ).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
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
        title="Case Statements"
        subtitle="View judge statements, proceedings, and verdicts"
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadStatements}
          >
            Refresh
          </Button>
        }
      />

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search by case no, judge, or court..."
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
            label="Filter by Judge"
            value={filterJudge}
            onChange={(e) => setFilterJudge(e.target.value)}
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
            <MenuItem value="All">All Judges</MenuItem>
            {uniqueJudges.map((judge) => (
              <MenuItem key={judge} value={judge}>
                {judge}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredStatements.length} of {statements.length} case
          statements
        </Typography>
      </Box>

      {/* Case Statements Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Case No.</TableCell>
              <TableCell>Statement By</TableCell>
              <TableCell>Judge</TableCell>
              <TableCell>Court</TableCell>
              <TableCell>Statement Date</TableCell>
              <TableCell>Preview</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStatements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <Description
                      sx={{
                        fontSize: 64,
                        color: "text.disabled",
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Case Statements Found
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Case statements will appear here once judges record their
                      proceedings and verdicts.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredStatements.map((statement) => (
                <TableRow key={statement.statementId} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Description fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600}>
                        {statement.caseNo}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {statement.statementBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Gavel fontSize="small" color="action" />
                      <Typography variant="body2">
                        {statement.judgeName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccountBalance fontSize="small" color="action" />
                      <Typography variant="body2">
                        {statement.courtName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatDate(statement.statementDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getDaysAgo(statement.statementDate)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {statement.statementPreview ||
                        "No preview available..."}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Full Statement">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.STATEMENT_DETAIL}/${statement.statementId}`
                          )
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Case">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate(
                            `${COURT_ROUTES.CASE_DETAIL}/${statement.caseId}`
                          )
                        }
                      >
                        <Description fontSize="small" />
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
