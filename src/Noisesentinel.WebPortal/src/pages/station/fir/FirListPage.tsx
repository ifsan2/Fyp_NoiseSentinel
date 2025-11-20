import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Grid,
  alpha,
  InputAdornment,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import firApi from "@/api/firApi";
import { FirListItemDto } from "@/models/Fir";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@mui/material/styles";

export default function FirListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [firs, setFirs] = useState<FirListItemDto[]>([]);
  const [filteredFirs, setFilteredFirs] = useState<FirListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [caseFilter, setCaseFilter] = useState<string>("all");

  useEffect(() => {
    loadFirs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, caseFilter, firs]);

  const loadFirs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Backend will automatically filter by user's station based on auth token
      const data = await firApi.getAllFirs();
      setFirs(data);
      setFilteredFirs(data);
    } catch (err: any) {
      console.error("Failed to load FIRs:", err);
      setError(
        err.response?.data?.message || "Failed to load FIRs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...firs];

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.firNo.toLowerCase().includes(query) ||
          f.accusedName.toLowerCase().includes(query) ||
          f.accusedCnic.includes(query) ||
          f.vehiclePlateNumber.toLowerCase().includes(query) ||
          f.violationType.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.firStatus === statusFilter);
    }

    // Case filter
    if (caseFilter === "withCase") {
      filtered = filtered.filter((f) => f.hasCase);
    } else if (caseFilter === "withoutCase") {
      filtered = filtered.filter((f) => !f.hasCase);
    }

    setFilteredFirs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Filed":
        return "info";
      case "UnderInvestigation":
        return "warning";
      case "Completed":
        return "success";
      case "Closed":
        return "default";
      default:
        return "default";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                color: theme.palette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              FIR Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all First Information Reports at your station
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/station/fir/cognizable")}
            sx={{
              py: 1.25,
              px: 3,
              fontWeight: 600,
            }}
          >
            File New FIR
          </Button>
        </Box>

        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.primary.main,
                  }}
                >
                  {filteredFirs.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total FIRs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.info.main,
                  }}
                >
                  {filteredFirs.filter((f) => f.firStatus === "Filed").length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Filed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.warning.main,
                  }}
                >
                  {
                    filteredFirs.filter(
                      (f) => f.firStatus === "UnderInvestigation"
                    ).length
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Investigating
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.success.main,
                  }}
                >
                  {filteredFirs.filter((f) => f.hasCase).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  With Case
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search by FIR No, Accused, CNIC, Vehicle..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Filed">Filed</MenuItem>
                <MenuItem value="UnderInvestigation">
                  Under Investigation
                </MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Case Status</InputLabel>
              <Select
                value={caseFilter}
                label="Case Status"
                onChange={(e) => setCaseFilter(e.target.value)}
              >
                <MenuItem value="all">All Cases</MenuItem>
                <MenuItem value="withCase">With Case</MenuItem>
                <MenuItem value="withoutCase">Without Case</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: "8px",
            border: `1px solid ${theme.palette.error.main}20`,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Table */}
      {!loading && (
        <>
          {filteredFirs.length === 0 ? (
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                textAlign: "center",
                py: 6,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No FIRs Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || statusFilter !== "all" || caseFilter !== "all"
                  ? "Try adjusting your filters."
                  : 'Click "File New FIR" to get started.'}
              </Typography>
            </Card>
          ) : (
            <Card sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <TableContainer>
                <Table sx={{ minWidth: 1200 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.common.white, 0.02)
                            : alpha(theme.palette.common.black, 0.02),
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        FIR NUMBER
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        STATION
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        ACCUSED
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        VEHICLE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        VIOLATION
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        SOUND LEVEL
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        DATE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        STATUS
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                        CASE
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      >
                        ACTION
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFirs.map((fir) => (
                      <TableRow
                        key={fir.firId}
                        hover
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? alpha(theme.palette.common.white, 0.03)
                                : alpha(theme.palette.common.black, 0.02),
                          },
                        }}
                        onClick={() =>
                          navigate(`/station/fir/detail/${fir.firId}`)
                        }
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="error"
                          >
                            {fir.firNo}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fir.daysSinceFiled} days ago
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {fir.stationName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {fir.accusedName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fir.accusedCnic}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {fir.vehiclePlateNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {fir.violationType}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${fir.soundLevelDBa} dB(A)`}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              color: theme.palette.error.main,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(fir.dateFiled).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatStatus(fir.firStatus)}
                            color={getStatusColor(fir.firStatus)}
                            size="small"
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {fir.hasCase ? (
                            <Chip
                              label="Case Filed"
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          ) : (
                            <Chip
                              label="No Case"
                              size="small"
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.text.secondary,
                                  0.1
                                ),
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                                fontSize: "0.75rem",
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/station/fir/detail/${fir.firId}`);
                            }}
                            sx={{
                              fontSize: "0.8125rem",
                              fontWeight: 500,
                              textTransform: "none",
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}
