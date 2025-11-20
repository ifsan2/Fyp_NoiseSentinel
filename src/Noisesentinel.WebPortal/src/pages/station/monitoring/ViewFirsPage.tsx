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
  Card,
  CardContent,
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
import { useTheme } from "@mui/material/styles";

export const ViewFirsPage: React.FC = () => {
  const theme = useTheme();
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
    const fir = firs.find((f) => f.firId === firId);
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
    (f) => f.firStatus === "Under Investigation"
  ).length;
  const forwardedToCourt = filteredFirs.filter(
    (f) => f.firStatus === "Forwarded to Court"
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
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.error.main,
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

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
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
                  {underInvestigation}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Under Investigation
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
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
                  {forwardedToCourt}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Forwarded to Court
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
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
                  {withCase} / {withoutCase}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  With Case / Without Case
                </Typography>
              </CardContent>
            </Card>
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
                  {viewDialog.fir.firNo}
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
                  {viewDialog.fir.vehiclePlateNumber}
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
                  {viewDialog.fir.stationName}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Sound Level
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.soundLevelDBa} dB(A)
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Filed Date
                </Typography>
                <Typography variant="body1">
                  {dateHelpers.formatDate(viewDialog.fir.dateFiled)}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={viewDialog.fir.firStatus} color="warning" />
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Days Since Filed
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {viewDialog.fir.daysSinceFiled} days
                </Typography>
              </Grid>

              {viewDialog.fir.hasCase && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Case Information
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label="Case Filed" color="primary" />
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
