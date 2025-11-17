import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
} from "@mui/material";
import {
  Search,
  Refresh,
  FileDownload,
  Warning,
  Assignment,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { ChallanTable } from "@/components/station/tables/ChallanTable";
import { STATION_ROUTES, CHALLAN_STATUSES } from "@/utils/stationConstants";
import stationApi from "@/api/stationApi";
import challanApi from "@/api/challanApi";
import violationApi from "@/api/violationApi";
import { ChallanDto } from "@/models/Challan";
import { PoliceStationDto } from "@/models/Station";
import { ViolationDto } from "@/models/Violation";
import { stationFilters } from "@/utils/stationFilters";
import { stationExport } from "@/utils/stationExport";
import { dateHelpers } from "@/utils/stationFilters";

export const ViewChallansPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [challans, setChallans] = useState<ChallanDto[]>([]);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);
  const [violations, setViolations] = useState<ViolationDto[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedViolations, setSelectedViolations] = useState<number[]>([]);
  const [overdueFilter, setOverdueFilter] = useState<string>("all");
  const [firFilter, setFirFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // View Dialog
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    challan: ChallanDto | null;
  }>({ open: false, challan: null });

  useEffect(() => {
    loadData();

    // Check URL params
    const stationIdParam = searchParams.get("stationId");
    const officerIdParam = searchParams.get("officerId");
    if (stationIdParam) {
      setSelectedStations([parseInt(stationIdParam)]);
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [challansData, stationsData, violationsData] = await Promise.all([
        challanApi.getAllChallans(),
        stationApi.getAllStations(),
        violationApi.getAllViolations(),
      ]);

      // Calculate days overdue for each challan
      const challansWithOverdue = challansData.map((challan) => ({
        ...challan,
        daysOverdue:
          challan.status === "Unpaid"
            ? dateHelpers.getDaysOverdue(challan.dueDateTime)
            : 0,
      }));

      setChallans(challansWithOverdue);
      setStations(stationsData);
      setViolations(violationsData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load challans",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (challanId: number) => {
    const challan = challans.find((c) => c.challanId === challanId);
    if (challan) {
      setViewDialog({ open: true, challan });
    }
  };

  const handleExport = () => {
    const filteredData = getFilteredChallans();
    stationExport.exportChallans(filteredData);
    enqueueSnackbar("Challans exported successfully", { variant: "success" });
  };

  const getFilteredChallans = () => {
    const isOverdue = overdueFilter === "overdue" ? true : undefined;
    const hasFir =
      firFilter === "with-fir"
        ? true
        : firFilter === "without-fir"
        ? false
        : undefined;

    const dateRange =
      startDate && endDate ? { start: startDate, end: endDate } : undefined;

    return stationFilters.filterChallans(
      challans,
      searchQuery,
      selectedStations.length > 0 ? selectedStations : undefined,
      selectedStatuses.length > 0 ? selectedStatuses : undefined,
      isOverdue,
      hasFir,
      dateRange
    );
  };

  const filteredChallans = getFilteredChallans();

  // Calculate statistics
  const totalPenalties = filteredChallans.reduce(
    (sum, c) => sum + (c.penaltyAmount || 0),
    0
  );
  const unpaidCount = filteredChallans.filter(
    (c) => c.status === "Unpaid"
  ).length;
  const overdueCount = filteredChallans.filter(
    (c) => (c.daysOverdue || 0) > 0
  ).length;
  const withFirCount = filteredChallans.filter((c) => c.hasFir).length;

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
        title="Challans Monitoring"
        subtitle="Monitor and track challans across all stations"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Challans" },
        ]}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={handleExport}
            >
              Export
            </Button>
          </>
        }
      />

      {/* Advanced Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              placeholder="Search challans..."
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

          {/* Station Filter */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select
                multiple
                value={selectedStations}
                onChange={(e: SelectChangeEvent<number[]>) => {
                  const value = e.target.value;
                  setSelectedStations(typeof value === "string" ? [] : value);
                }}
                label="Station"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const station = stations.find(
                        (s) => s.stationId === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={station?.stationCode || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {stations.map((station) => (
                  <MenuItem key={station.stationId} value={station.stationId}>
                    {station.stationName} ({station.stationCode})
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
                multiple
                value={selectedStatuses}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  const value = e.target.value;
                  setSelectedStatuses(typeof value === "string" ? [] : value);
                }}
                label="Status"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {CHALLAN_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Overdue Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Overdue</InputLabel>
              <Select
                value={overdueFilter}
                label="Overdue"
                onChange={(e) => setOverdueFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="overdue">Overdue Only</MenuItem>
                <MenuItem value="not-overdue">Not Overdue</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* FIR Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>FIR Status</InputLabel>
              <Select
                value={firFilter}
                label="FIR Status"
                onChange={(e) => setFirFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="with-fir">With FIR</MenuItem>
                <MenuItem value="without-fir">Without FIR</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Clear Filters */}
        {(searchQuery ||
          selectedStations.length > 0 ||
          selectedStatuses.length > 0 ||
          overdueFilter !== "all" ||
          firFilter !== "all" ||
          startDate ||
          endDate) && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchQuery("");
                setSelectedStations([]);
                setSelectedStatuses([]);
                setOverdueFilter("all");
                setFirFilter("all");
                setStartDate("");
                setEndDate("");
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Box>

      {/* Statistics Cards */}
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
                {filteredChallans.length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Total Challans
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
                {unpaidCount}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Unpaid Challans
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "error.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Warning /> {overdueCount}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Overdue Challans
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
                PKR {totalPenalties.toLocaleString()}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Total Penalties
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Challans Table */}
      <ChallanTable challans={filteredChallans} onView={handleView} />

      {/* View Challan Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, challan: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Assignment />
            Challan Details
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.challan && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Challan #{viewDialog.challan.challanId}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Accused Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.challan.accusedName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  CNIC
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.challan.accusedCnic}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Vehicle Plate
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.challan.plateNumber}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Violation
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.challan.violationType}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Penalty Amount
                </Typography>
                <Typography variant="h6" color="error.main" fontWeight={700}>
                  PKR {viewDialog.challan.penaltyAmount?.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={viewDialog.challan.status} color="primary" />
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Issue Date
                </Typography>
                <Typography variant="body1">
                  {dateHelpers.formatDateTime(viewDialog.challan.issueDateTime)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body1">
                  {dateHelpers.formatDate(viewDialog.challan.dueDateTime)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Officer Name
                </Typography>
                <Typography variant="body1">
                  {viewDialog.challan.officerName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Station
                </Typography>
                <Typography variant="body1">
                  {viewDialog.challan.stationName}
                </Typography>
              </Grid>

              {viewDialog.challan.hasFir && (
                <Grid item xs={12}>
                  <Chip label="FIR Filed" color="error" />
                </Grid>
              )}

              {(viewDialog.challan.daysOverdue || 0) > 0 && (
                <Grid item xs={12}>
                  <Chip
                    label={`Overdue by ${viewDialog.challan.daysOverdue} days`}
                    color="error"
                    icon={<Warning />}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, challan: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
