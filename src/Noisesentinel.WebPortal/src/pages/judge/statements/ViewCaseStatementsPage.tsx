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
} from "@mui/material";
import {
  Visibility,
  Search,
  Refresh,
  Add,
  Description,
  Edit,
  Delete,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { JUDGE_ROUTES } from "@/utils/judgeConstants";
import caseStatementApi from "@/api/caseStatementApi";
import caseApi from "@/api/caseApi";
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

  useEffect(() => {
    loadStatements();
  }, []);

  useEffect(() => {
    filterStatements();
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
          const caseStatements = await caseStatementApi.getStatementsByCase(caseItem.caseId);
          allStatements.push(...caseStatements);
        } catch (error) {
          // If no statements for this case, continue
          console.log(`No statements for case ${caseItem.caseId}`);
        }
      }
      
      setStatements(allStatements);
      setFilteredStatements(allStatements);
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

    if (searchQuery) {
      filtered = filtered.filter(
        (stmt) =>
          stmt.caseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stmt.statementBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStatements(filtered);
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

      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredStatements.length} of {statements.length} statements
        </Typography>
      </Box>

      {/* Statements Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Case No.</TableCell>
              <TableCell>Statement By</TableCell>
              <TableCell>Court</TableCell>
              <TableCell>Statement Date</TableCell>
              <TableCell>Preview</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStatements.length === 0 ? (
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
                    <Typography variant="h6" color="text.secondary" gutterBottom>
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
                    <Typography variant="body2">
                      {statement.courtName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(statement.statementDate)}
                    </Typography>
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
                        onClick={() => handleDelete(statement.statementId)}
                      >
                        <Delete fontSize="small" />
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
