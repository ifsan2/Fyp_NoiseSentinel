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
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import firApi from "@/api/firApi";
import { FirListItemDto } from "@/models/Fir";
import { useAuth } from "@/contexts/AuthContext";

export default function FirListPage() {
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
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              <DescriptionIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              FIR Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all First Information Reports filed at your station
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            onClick={() => navigate("/station/fir/cognizable")}
          >
            File New FIR
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search by FIR No, Accused, CNIC, Vehicle"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />

          <FormControl sx={{ minWidth: 150 }}>
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

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Case Status</InputLabel>
            <Select
              value={caseFilter}
              label="Case Status"
              onChange={(e) => setCaseFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="withCase">With Case</MenuItem>
              <MenuItem value="withoutCase">Without Case</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Table */}
        {!loading && (
          <>
            {filteredFirs.length === 0 ? (
              <Alert severity="info">
                {searchQuery || statusFilter !== "all" || caseFilter !== "all"
                  ? "No FIRs found matching your filters."
                  : 'No FIRs filed yet. Click "File New FIR" to get started.'}
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>FIR Number</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Station</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Accused Details</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Vehicle</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Violation</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Sound Level</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Filed Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Case</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Action</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFirs.map((fir) => (
                      <TableRow
                        key={fir.firId}
                        hover
                        sx={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(`/station/fir/detail/${fir.firId}`)
                        }
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
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
                          <Typography variant="body2">
                            {fir.accusedName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CNIC: {fir.accusedCnic}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
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
                            color="error"
                            size="small"
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
                          />
                        </TableCell>
                        <TableCell>
                          {fir.hasCase ? (
                            <Chip
                              label="Case Filed"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Chip
                              label="No Case"
                              color="default"
                              size="small"
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
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Summary */}
            {filteredFirs.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Chip label={`Total: ${filteredFirs.length}`} color="primary" />
                <Chip
                  label={`Filed: ${
                    filteredFirs.filter((f) => f.firStatus === "Filed").length
                  }`}
                  color="info"
                />
                <Chip
                  label={`Investigating: ${
                    filteredFirs.filter(
                      (f) => f.firStatus === "UnderInvestigation"
                    ).length
                  }`}
                  color="warning"
                />
                <Chip
                  label={`With Case: ${
                    filteredFirs.filter((f) => f.hasCase).length
                  }`}
                  color="success"
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
}
