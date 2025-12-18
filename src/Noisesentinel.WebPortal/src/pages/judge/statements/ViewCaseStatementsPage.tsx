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
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Tooltip,
  Collapse,
  Chip,
} from "@mui/material";
import {
  Visibility,
  Search,
  Refresh,
  Add,
  Description,
  Edit,
  Delete,
  ExpandMore,
  ExpandLess,
  Gavel,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import caseStatementApi from "@/api/caseStatementApi";
import caseApi from "@/api/caseApi";
import { CaseStatementListItem } from "@/models/CaseStatement";

// Group statements by case
interface CaseGroup {
  caseNo: string;
  courtName: string;
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

  useEffect(() => {
    loadStatements();
  }, []);

  useEffect(() => {
    groupAndFilterStatements();
  }, [searchQuery, statements]);

  const loadStatements = async () => {
    setLoading(true);
    try {
      // Fetch all judge's assigned cases
      const myCases = await caseApi.getMyCases();

      // Fetch statements for all assigned cases
      const allStatements: CaseStatementListItem[] = [];

      for (const caseItem of myCases) {
        try {
          const caseStatements = await caseStatementApi.getStatementsByCase(
            caseItem.caseId
          );
          allStatements.push(...caseStatements);
        } catch (error) {
          // If no statements for this case, continue
          console.log(`No statements for case ${caseItem.caseId}`);
        }
      }

      setStatements(allStatements);
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
    // First filter statements if there's a search query
    let filtered = [...statements];

    if (searchQuery) {
      filtered = filtered.filter(
        (stmt) =>
          stmt.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stmt.statementBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stmt.courtName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Group statements by case number
    const grouped: Map<string, CaseGroup> = new Map();

    filtered.forEach((stmt) => {
      if (!grouped.has(stmt.caseNo)) {
        grouped.set(stmt.caseNo, {
          caseNo: stmt.caseNo,
          courtName: stmt.courtName,
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

  const handleDelete = async (statementId: number) => {
    if (!window.confirm("Are you sure you want to delete this statement?")) {
      return;
    }

    try {
      await caseStatementApi.deleteCaseStatement(statementId);
      enqueueSnackbar("Statement deleted successfully", { variant: "success" });
      loadStatements();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete statement",
        { variant: "error" }
      );
    }
  };

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
        subtitle="View and manage your case statements and proceedings"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadStatements}
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

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search by case no or statement author..."
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
              <TableCell>Court</TableCell>
              <TableCell>Statements</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
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
                      {searchQuery
                        ? "Try adjusting your search"
                        : "Start by recording a case statement"}
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
                      <Typography variant="body2" fontWeight={500}>
                        {caseGroup.courtName}
                      </Typography>
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
                              `${JUDGE_ROUTES.CASE_DETAIL}/${caseGroup.statements[0].caseId}`
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
                      colSpan={5}
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
                                    <Typography variant="body2">
                                      {formatDate(statement.statementDate)}
                                    </Typography>
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
                                            `${JUDGE_ROUTES.STATEMENT_DETAIL}/${statement.statementId}`
                                          )
                                        }
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Statement">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() =>
                                          navigate(
                                            `${JUDGE_ROUTES.EDIT_STATEMENT}/${statement.statementId}`
                                          )
                                        }
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Statement">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleDelete(statement.statementId)
                                        }
                                      >
                                        <Delete fontSize="small" />
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
