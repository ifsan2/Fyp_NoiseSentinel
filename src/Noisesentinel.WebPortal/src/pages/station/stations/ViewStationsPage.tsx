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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, Add, Refresh, FileDownload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { StationTable } from "@/components/station/tables/StationTable";
import { STATION_ROUTES } from "@/utils/stationConstants";
import { PAKISTAN_PROVINCES } from "@/utils/stationConstants";
import stationApi from "@/api/stationApi";
import { PoliceStationDto } from "@/models/Station";
import { stationFilters } from "@/utils/stationFilters";
import { stationExport } from "@/utils/stationExport";

export const ViewStationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    stationId: number | null;
    stationName: string;
  }>({ open: false, stationId: null, stationName: "" });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoading(true);
    try {
      const data = await stationApi.getAllStations();
      setStations(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load stations",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (stationId: number) => {
    navigate(`${STATION_ROUTES.STATION_DETAIL}/${stationId}`);
  };

  const handleEdit = (stationId: number) => {
    navigate(`${STATION_ROUTES.EDIT_STATION}/${stationId}`);
  };

  const handleDeleteClick = (stationId: number, stationName?: string) => {
    setDeleteDialog({ open: true, stationId, stationName: stationName || "" });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.stationId) return;

    try {
      await stationApi.deleteStation(deleteDialog.stationId);
      enqueueSnackbar("Station deleted successfully", { variant: "success" });
      setDeleteDialog({ open: false, stationId: null, stationName: "" });
      loadStations();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete station",
        { variant: "error" }
      );
    }
  };

  const handleExport = () => {
    const filteredData = stationFilters.filterStations(
      stations,
      searchQuery,
      districtFilter,
      provinceFilter
    );
    stationExport.exportStations(filteredData);
    enqueueSnackbar("Stations exported successfully", { variant: "success" });
  };

  const filteredStations = stationFilters.filterStations(
    stations,
    searchQuery,
    districtFilter,
    provinceFilter
  );

  // Get unique districts
  const districts = Array.from(
    new Set(stations.map((s) => s.district).filter(Boolean))
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
        title="Police Stations"
        subtitle="Manage all police stations in the system"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Police Stations" },
        ]}
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadStations}
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
              onClick={() => navigate(STATION_ROUTES.CREATE_STATION)}
            >
              Create Station
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search stations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: 250 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
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

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>District</InputLabel>
          <Select
            value={districtFilter}
            label="District"
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <MenuItem value="">All Districts</MenuItem>
            {districts.map((district) => (
              <MenuItem key={district} value={district}>
                {district}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {(searchQuery || districtFilter || provinceFilter) && (
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery("");
              setDistrictFilter("");
              setProvinceFilter("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ p: 2, bgcolor: "primary.light", borderRadius: 2 }}>
              <Box
                sx={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                {filteredStations.length}
              </Box>
              <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
                Stations Found
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Stations Table */}
      <StationTable
        stations={filteredStations}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{deleteDialog.stationName}</strong>?
          <br />
          This action cannot be undone. Officers must be reassigned before
          deletion.
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
