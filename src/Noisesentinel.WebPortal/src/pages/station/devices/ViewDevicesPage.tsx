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
} from "@mui/material";
import { Search, Add, Refresh, FileDownload } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { DeviceTable } from "@/components/station/tables/DeviceTable";
import { STATION_ROUTES } from "@/utils/stationConstants";
import deviceApi from "@/api/deviceApi";
import { DeviceDto } from "@/models/Device";
import { stationFilters } from "@/utils/stationFilters";
import { stationExport } from "@/utils/stationExport";

export const ViewDevicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<DeviceDto[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [calibrationFilter, setCalibrationFilter] = useState<string>("all");
  const [pairedFilter, setPairedFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const devicesData = await deviceApi.getAllDevices();
      setDevices(devicesData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load devices",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (deviceId: number) => {
    navigate(`${STATION_ROUTES.DEVICES}/${deviceId}`);
  };

  const handleEdit = (deviceId: number) => {
    navigate(`${STATION_ROUTES.EDIT_DEVICE}/${deviceId}`);
  };

  const handleExport = () => {
    const filteredData = getFilteredDevices();
    stationExport.exportDevices(filteredData);
    enqueueSnackbar("Devices exported successfully", { variant: "success" });
  };

  const getFilteredDevices = () => {
    const calibrationStatus =
      calibrationFilter === "calibrated"
        ? true
        : calibrationFilter === "not-calibrated"
        ? false
        : undefined;

    const isPaired =
      pairedFilter === "paired"
        ? true
        : pairedFilter === "available"
        ? false
        : undefined;

    return stationFilters.filterDevices(
      devices,
      searchQuery,
      undefined,
      calibrationStatus,
      isPaired
    );
  };

  const filteredDevices = getFilteredDevices();

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
        title="IoT Devices"
        subtitle="Manage noise detection IoT devices"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "IoT Devices" },
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
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate(STATION_ROUTES.REGISTER_DEVICE)}
            >
              Register Device
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              placeholder="Search devices..."
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

          {/* Calibration Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Calibration Status</InputLabel>
              <Select
                value={calibrationFilter}
                label="Calibration Status"
                onChange={(e) => setCalibrationFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="calibrated">Calibrated</MenuItem>
                <MenuItem value="not-calibrated">Not Calibrated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Paired Filter */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Pairing Status</InputLabel>
              <Select
                value={pairedFilter}
                label="Pairing Status"
                onChange={(e) => setPairedFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="paired">Paired (In Use)</MenuItem>
                <MenuItem value="available">Available</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Clear Filters */}
        {(searchQuery ||
          calibrationFilter !== "all" ||
          pairedFilter !== "all") && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchQuery("");
                setCalibrationFilter("all");
                setPairedFilter("all");
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Box sx={{ p: 2, bgcolor: "secondary.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "secondary.main",
                }}
              >
                {filteredDevices.length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Devices Found
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "success.main",
                }}
              >
                {filteredDevices.filter((d) => d.calibrationStatus).length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Calibrated
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ p: 2, bgcolor: "warning.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "warning.main",
                }}
              >
                {filteredDevices.filter((d) => d.isPaired).length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                In Use (Paired)
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box sx={{ p: 2, bgcolor: "info.light", borderRadius: 2 }}>
              <Box
                sx={{ fontSize: "2rem", fontWeight: 700, color: "info.main" }}
              >
                {filteredDevices.filter((d) => !d.isPaired).length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Available
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Devices Table */}
      <DeviceTable
        devices={filteredDevices}
        onView={handleView}
        onEdit={handleEdit}
      />
    </Box>
  );
};
