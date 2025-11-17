import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Refresh,
  PersonSearch,
  Visibility,
  Warning,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { STATION_ROUTES, PAKISTAN_PROVINCES } from "@/utils/stationConstants";
import accusedApi, { AccusedDto } from "@/api/accusedApi";
import challanApi from "@/api/challanApi";
import { ChallanDto } from "@/models/Challan";
import { dateHelpers } from "@/utils/stationFilters";

export const ViewAccusedPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [accused, setAccused] = useState<AccusedDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // View Dialog
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    accused: AccusedDto | null;
    challans: ChallanDto[];
    loadingChallans: boolean;
  }>({ open: false, accused: null, challans: [], loadingChallans: false });

  useEffect(() => {
    loadAccused();
  }, []);

  const loadAccused = async () => {
    setLoading(true);
    try {
      const data = await accusedApi.getAllAccused();
      setAccused(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load accused records",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (accusedId: number) => {
    const accusedPerson = accused.find((a) => a.accusedId === accusedId);
    if (!accusedPerson) return;

    setViewDialog({
      open: true,
      accused: accusedPerson,
      challans: [],
      loadingChallans: true,
    });

    try {
      const challans = await challanApi.getChallansByAccused(accusedId);
      setViewDialog((prev) => ({ ...prev, challans, loadingChallans: false }));
    } catch (error: any) {
      enqueueSnackbar("Failed to load accused challans", { variant: "error" });
      setViewDialog((prev) => ({ ...prev, loadingChallans: false }));
    }
  };

  const getFilteredAccused = () => {
    return accused.filter((person) => {
      const matchesSearch =
        !searchQuery ||
        person.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.cnic.includes(searchQuery) ||
        person.contactNo?.includes(searchQuery);

      const matchesProvince =
        !provinceFilter || person.province === provinceFilter;
      const matchesCity = !cityFilter || person.city === cityFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && person.hasPendingChallans) ||
        (statusFilter === "clear" && !person.hasPendingChallans);

      return matchesSearch && matchesProvince && matchesCity && matchesStatus;
    });
  };

  const filteredAccused = getFilteredAccused();

  // Get unique cities
  const cities = Array.from(
    new Set(accused.map((a) => a.city).filter(Boolean))
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Accused Records"
        subtitle="Search and view accused violation history"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Accused" },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAccused}
          >
            Refresh
          </Button>
        }
      />

      {/* Search & Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search by name, CNIC, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Grid>

          {/* Province Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Province</InputLabel>
              <Select
                value={provinceFilter}
                label="Province"
                onChange={(e) => setProvinceFilter(e.target.value)}
              >
                <MenuItem value="">All Provinces</MenuItem>
                {PAKISTAN_PROVINCES.map((province) => (
                  <MenuItem key={province} value={province}>
                    {province}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* City Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>City</InputLabel>
              <Select
                value={cityFilter}
                label="City"
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <MenuItem value="">All Cities</MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Has Pending Challans</MenuItem>
                <MenuItem value="clear">Clear Record</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Clear Filters */}
          {(searchQuery ||
            provinceFilter ||
            cityFilter ||
            statusFilter !== "all") && (
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery("");
                  setProvinceFilter("");
                  setCityFilter("");
                  setStatusFilter("all");
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Statistics */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                {filteredAccused.length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Accused Found
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "warning.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "warning.main",
                }}
              >
                {filteredAccused.filter((a) => a.hasPendingChallans).length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                With Pending Challans
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
              <Box
                sx={{ fontSize: "2rem", fontWeight: 700, color: "error.main" }}
              >
                {filteredAccused.reduce(
                  (sum, a) => sum + (a.totalChallans || 0),
                  0
                )}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Total Challans
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "success.main",
                }}
              >
                PKR{" "}
                {filteredAccused
                  .reduce((sum, a) => sum + (a.totalPenalties || 0), 0)
                  .toLocaleString()}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Total Penalties
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Accused Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "secondary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Accused Info
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Contact
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Location
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Challans
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Total Penalties
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccused.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No accused records found
                </TableCell>
              </TableRow>
            ) : (
              filteredAccused.map((person) => (
                <TableRow key={person.accusedId} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonSearch color="secondary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {person.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CNIC: {person.cnic}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {person.contactNo || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {person.city || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {person.province || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={person.totalChallans || 0}
                      size="small"
                      color={
                        (person.totalChallans || 0) > 3
                          ? "error"
                          : (person.totalChallans || 0) > 0
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="error.main"
                    >
                      PKR {(person.totalPenalties || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {person.hasPendingChallans ? (
                      <Chip
                        label="Pending Challans"
                        size="small"
                        color="warning"
                        icon={<Warning />}
                      />
                    ) : (
                      <Chip label="Clear" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View History">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleView(person.accusedId)}
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

      {/* View Accused History Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() =>
          setViewDialog({
            open: false,
            accused: null,
            challans: [],
            loadingChallans: false,
          })
        }
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonSearch />
            Accused History - {viewDialog.accused?.fullName}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.accused && (
            <Box>
              {/* Accused Details */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.accused.fullName}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    CNIC
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.accused.cnic}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Contact Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.accused.contactNo || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    City
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.accused.city || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Province
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.accused.province || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.accused.address || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  {viewDialog.accused.hasPendingChallans && (
                    <Chip
                      label="Has Pending Challans"
                      color="warning"
                      icon={<Warning />}
                    />
                  )}
                </Grid>
              </Grid>

              {/* Summary Statistics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "warning.light",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h4"
                      color="warning.main"
                      fontWeight={700}
                    >
                      {viewDialog.accused.totalChallans || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Challans
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "error.light",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h5"
                      color="error.main"
                      fontWeight={700}
                    >
                      PKR{" "}
                      {(
                        viewDialog.accused.totalPenalties || 0
                      ).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Penalties
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Challan History */}
              <Typography variant="h6" gutterBottom>
                Challan History ({viewDialog.challans.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {viewDialog.loadingChallans ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : viewDialog.challans.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ p: 3 }}
                >
                  No challans found for this accused
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Challan #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Violation</TableCell>
                        <TableCell>Penalty</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Station</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDialog.challans.map((challan) => (
                        <TableRow key={challan.challanId}>
                          <TableCell>#{challan.challanId}</TableCell>
                          <TableCell>
                            {dateHelpers.formatDate(challan.issueDateTime)}
                          </TableCell>
                          <TableCell>
                            <Chip label={challan.plateNumber} size="small" />
                          </TableCell>
                          <TableCell>{challan.violationType}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="error.main"
                            >
                              PKR {challan.penaltyAmount?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={challan.status} size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {challan.stationName}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setViewDialog({
                open: false,
                accused: null,
                challans: [],
                loadingChallans: false,
              })
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
