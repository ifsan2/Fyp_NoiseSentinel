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
  Collapse,
} from "@mui/material";
import {
  Visibility,
  Search,
  Refresh,
  Description,
  Gavel,
  AccountBalance,
  FilterList,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { COURT_ROUTES } from "@/utils/courtConstants";
import caseStatementApi from "@/api/caseStatementApi";
import { CaseStatementListItem } from "@/models/CaseStatement";

// Group statements by case
interface CaseGroup {
  caseNo: string;
  courtName: string;
  judgeName: string;
  statementCount: number;
  statements: CaseStatementListItem[];
}

export const ViewCaseStatementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [statements, setStatements] = useState<CaseStatementListItem[]>([]);
  const [groupedCases, setGroupedCases] = useState<CaseGroup[]>([]);
  const [filteredCases, setFilteredCases] = useState<CaseGroup[]>([]);
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJudge, setFilterJudge] = useState("All");

  useEffect(() => {
    loadStatements();
  }, []);

  useEffect(() => {
    groupAndFilterStatements();
  }, [searchQuery, filterJudge, statements]);

  const loadStatements = async () => {
    setLoading(true);
    try {
      const data = await caseStatementApi.getAllCaseStatements();
      setStatements(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load case statements",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const groupAndFilterStatements = () => {
    // First filter statements
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

    // Group statements by case number
    const grouped: Map<string, CaseGroup> = new Map();

    filtered.forEach((stmt) => {
      if (!grouped.has(stmt.caseNo)) {
        grouped.set(stmt.caseNo, {
          caseNo: stmt.caseNo,
          courtName: stmt.courtName,
          judgeName: stmt.judgeName,
          statementCount: 0,
          statements: [],
        });
      }

      const group = grouped.get(stmt.caseNo)!;
      group.statements.push(stmt);
      group.statementCount = group.statements.length;
    });

    // Sort statements within each group by date (newest first)
    grouped.forEach((group) => {
      group.statements.sort(
        (a, b) =>
          new Date(b.statementDate).getTime() -
          new Date(a.statementDate).getTime()
      );
    });

    // Convert to array and sort by case number
    const groupedArray = Array.from(grouped.values()).sort((a, b) =>
      a.caseNo.localeCompare(b.caseNo)
    );

    setGroupedCases(groupedArray);
    setFilteredCases(groupedArray);
  };

  const toggleCase = (caseNo: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseNo)) {
      newExpanded.delete(caseNo);
    } else {
      newExpanded.add(caseNo);
    }
    setExpandedCases(newExpanded);
  };

  const expandAll = () => {
    setExpandedCases(new Set(filteredCases.map((c) => c.caseNo)));
  };

  const collapseAll = () => {
    setExpandedCases(new Set());
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

      {/* Results count and expand/collapse actions */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCases.length} case(s) with {statements.length} total
          statement(s)
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" onClick={expandAll}>
            Expand All
          </Button>
          <Button size="small" onClick={collapseAll}>
            Collapse All
          </Button>
        </Box>
      </Box>

      {/* Grouped Cases Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50}></TableCell>
              <TableCell>Case No.</TableCell>
              <TableCell>Judge</TableCell>
              <TableCell>Court</TableCell>
              <TableCell>Statements</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 8, textAlign: "center" }}>
                    <Description
                      sx={{
                        fontSize: 64,
                        color: "text.disabled",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
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
              filteredCases.map((caseGroup) => (
                <React.Fragment key={caseGroup.caseNo}>
                  {/* Case Header Row */}
                  <TableRow hover sx={{ bgcolor: "action.hover" }}>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleCase(caseGroup.caseNo)}
                      >
                        {expandedCases.has(caseGroup.caseNo) ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Gavel fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight={600}>
                          {caseGroup.caseNo}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Gavel fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {caseGroup.judgeName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccountBalance fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {caseGroup.courtName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${caseGroup.statementCount} Statement${
                          caseGroup.statementCount > 1 ? "s" : ""
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Case Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `${COURT_ROUTES.CASE_DETAIL}/${caseGroup.statements[0].caseId}`
                            )
                          }
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Statements Rows */}
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{
                        p: 0,
                        borderBottom: expandedCases.has(caseGroup.caseNo)
                          ? 1
                          : 0,
                      }}
                    >
                      <Collapse
                        in={expandedCases.has(caseGroup.caseNo)}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box sx={{ bgcolor: "background.default", p: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Statement By</TableCell>
                                <TableCell>Statement Date</TableCell>
                                <TableCell>Preview</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {caseGroup.statements.map((statement) => (
                                <TableRow key={statement.statementId} hover>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {statement.statementBy}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box>
                                      <Typography variant="body2">
                                        {formatDate(statement.statementDate)}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {getDaysAgo(statement.statementDate)}
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ maxWidth: 400 }}>
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
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
