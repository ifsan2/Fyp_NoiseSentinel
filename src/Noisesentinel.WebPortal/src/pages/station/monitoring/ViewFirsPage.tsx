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
import { Search, Refresh, FileDownload, Report } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FirTable } from "@/components/station/tables/FirTable";
import { STATION_ROUTES, FIR_STATUSES } from "@/utils/stationConstants";
import stationApi from "@/api/stationApi";
import firApi from "@/api/firApi";
import { FirDto } from "@/models/Fir";
import { PoliceStationDto } from "@/models/Station";
import { stationFilters } from "@/utils/stationFilters";
import { stationExport } from "@/utils/stationExport";
import { dateHelpers } from "@/utils/stationFilters";

export const ViewFirsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [firs, setFirs] = useState<FirDto[]>([]);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [caseFilter, setCaseFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // View Dialog
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    fir: FirDto | null;
  }>({ open: false, fir: null });

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
      const [firsData, stationsData] = await Promise.all([
        firApi.getAllFirs(),
        stationApi.getAllStations(),
      ]);

      setFirs(firsData);
      setStations(stationsData);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "Failed to load FIRs", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (firId: number) => {
    const fir = firs.find((f) => f.firid === firId);
    if (fir) {
      setViewDialog({ open: true, fir });
    }
  };

  const handleExport = () => {
    const filteredData = getFilteredFirs();
    stationExport.exportFirs(filteredData);
    enqueueSnackbar("FIRs exported successfully", { variant: "success" });
  };

  const getFilteredFirs = () => {
    const hasCase =
      caseFilter === "with-case"
        ? true
        : caseFilter === "without-case"
        ? false
        : undefined;

    const dateRange =
      startDate && endDate ? { start: startDate, end: endDate } : undefined;

    return stationFilters.filterFirs(
      firs,
      searchQuery,
      selectedStations.length > 0 ? selectedStations : undefined,
      selectedStatuses.length > 0 ? selectedStatuses : undefined,
      hasCase,
      dateRange
    );
  };

  const filteredFirs = getFilteredFirs();

  // Calculate statistics
  const underInvestigation = filteredFirs.filter(
    (f) => f.status === "Under Investigation"
  ).length;
  const forwardedToCourt = filteredFirs.filter(
    (f) => f.status === "Forwarded to Court"
  ).length;
  const withCase = filteredFirs.filter((f) => f.hasCase).length;
  const withoutCase = filteredFirs.filter((f) => !f.hasCase).length;

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
        title="FIRs Monitoring"
        subtitle="Monitor and track First Information Reports across all stations"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "FIRs" },
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
              placeholder="Search FIRs..."
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
                {FIR_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Case Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Case Status</InputLabel>
              <Select
                value={caseFilter}
                label="Case Status"
                onChange={(e) => setCaseFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="with-case">With Case</MenuItem>
                <MenuItem value="without-case">Without Case</MenuItem>
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
          caseFilter !== "all" ||
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
                setCaseFilter("all");
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
            <Box sx={{ p: 2, bgcolor: "error.light", borderRadius: 2 }}>
              <Box
                sx={{ fontSize: "2rem", fontWeight: 700, color: "error.main" }}
              >
                {filteredFirs.length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Total FIRs
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
                {underInvestigation}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Under Investigation
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "success.main",
                }}
              >
                {forwardedToCourt}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Forwarded to Court
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 2 }}>
              <Box
                sx={{ fontSize: "2rem", fontWeight: 700, color: "info.main" }}
              >
                {withCase} / {withoutCase}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                With Case / Without Case
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* FIRs Table */}
      <FirTable firs={filteredFirs} onView={handleView} />

      {/* View FIR Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, fir: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Report />
            FIR Details
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.fir && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="error.main">
                  {viewDialog.fir.firNumber}
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Accused Name
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.accusedName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  CNIC
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.accusedCnic}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Vehicle Plate
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.vehiclePlate}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Violation
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.violationType}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Station
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.stationName} ({viewDialog.fir.stationCode})
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Investigation Officer
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.informantName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Filed Date
                </Typography>
                <Typography variant="body1">
                  {dateHelpers.formatDate(viewDialog.fir.filedDate)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={viewDialog.fir.status} color="warning" />
                </Box>
              </Grid>

              {viewDialog.fir.description && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {viewDialog.fir.description}
                  </Typography>
                </Grid>
              )}

              {viewDialog.fir.hasCase && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Case Information
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={`Case: ${viewDialog.fir.caseNumber}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={viewDialog.fir.caseStatus || "N/A"}
                      color="info"
                    />
                  </Box>
                </Grid>
              )}

              {!viewDialog.fir.hasCase && (
                <Grid item xs={12}>
                  <Chip label="No Case Filed Yet" color="default" />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, fir: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
