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
} from "@mui/material";
import { Add as AddIcon, Warning as WarningIcon } from "@mui/icons-material";
import firApi from "@/api/firApi";
import { CognizableChallanDto } from "@/models/Fir";
import { useAuth } from "@/contexts/AuthContext";

export default function CognizableChallansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [challans, setChallans] = useState<CognizableChallanDto[]>([]);
  const [filteredChallans, setFilteredChallans] = useState<
    CognizableChallanDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCognizableChallans();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredChallans(challans);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChallans(
        challans.filter(
          (c) =>
            c.accusedName.toLowerCase().includes(query) ||
            c.accusedCnic.includes(query) ||
            c.vehiclePlateNumber.toLowerCase().includes(query) ||
            c.violationType.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, challans]);

  const loadCognizableChallans = async () => {
    try {
      setLoading(true);
      setError(null);

      // Backend will automatically filter by user's station based on auth token
      const data = await firApi.getCognizableChallans();
      setChallans(data);
      setFilteredChallans(data);
    } catch (err: any) {
      console.error("Failed to load cognizable challans:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load cognizable challans. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileFir = (challanId: number) => {
    navigate(`/station/fir/create/${challanId}`);
  };

  const getSeverityColor = (soundLevel: number) => {
    if (soundLevel >= 100) return "error";
    if (soundLevel >= 85) return "warning";
    return "success";
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
              <WarningIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Cognizable Challans
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These challans are eligible for FIR filing due to serious
              violations
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/station/fir/list")}
          >
            View All FIRs
          </Button>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search by accused name, CNIC, vehicle, or violation type"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            {filteredChallans.length === 0 ? (
              <Alert severity="info">
                {searchQuery
                  ? "No challans found matching your search."
                  : "No cognizable challans available for FIR filing."}
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Challan ID</strong>
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
                        <strong>Penalty</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Issue Date</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Officer</strong>
                      </TableCell>
                      <TableCell align="center">
                        <strong>Action</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredChallans.map((challan) => (
                      <TableRow
                        key={challan.challanId}
                        hover
                        sx={{
                          backgroundColor: challan.hasFir
                            ? "#f5f5f5"
                            : "inherit",
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            #{challan.challanId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {challan.accusedName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            CNIC: {challan.accusedCnic}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {challan.vehiclePlateNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {challan.violationType}
                          </Typography>
                          {challan.mlClassification && (
                            <Chip
                              label={challan.mlClassification}
                              size="small"
                              color="primary"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${challan.soundLevelDBa} dB(A)`}
                            color={getSeverityColor(challan.soundLevelDBa)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            Rs. {challan.penaltyAmount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(
                              challan.issueDateTime
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(
                              challan.issueDateTime
                            ).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {challan.officerName}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {challan.hasFir ? (
                            <Chip
                              label="FIR Filed"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => handleFileFir(challan.challanId)}
                            >
                              File FIR
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Summary */}
            {filteredChallans.length > 0 && (
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Chip
                  label={`Total: ${filteredChallans.length}`}
                  color="primary"
                />
                <Chip
                  label={`Pending FIR: ${
                    filteredChallans.filter((c) => !c.hasFir).length
                  }`}
                  color="error"
                />
                <Chip
                  label={`FIR Filed: ${
                    filteredChallans.filter((c) => c.hasFir).length
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
