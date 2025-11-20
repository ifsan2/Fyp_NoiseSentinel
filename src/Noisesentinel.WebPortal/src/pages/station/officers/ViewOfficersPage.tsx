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
  Chip,
  SelectChangeEvent,
  Card,
  CardContent,
  Typography,
  alpha,
} from "@mui/material";
import { Search, Add, Refresh, FileDownload } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { OfficerTable } from "@/components/station/tables/OfficerTable";
import { STATION_ROUTES, OFFICER_RANKS } from "@/utils/stationConstants";
import stationApi from "@/api/stationApi";
import stationOfficerApi from "@/api/stationOfficerApi";
import userApi from "@/api/userApi";
import { PoliceOfficerDetailsDto } from "@/models/User";
import { PoliceStationDto } from "@/models/Station";
import { stationFilters } from "@/utils/stationFilters";
import { stationExport } from "@/utils/stationExport";
import { useTheme } from "@mui/material/styles";

export const ViewOfficersPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<PoliceOfficerDetailsDto[]>([]);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
  const [ioFilter, setIoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("active");

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    officerId: number | null;
    officerName: string;
  }>({ open: false, officerId: null, officerName: "" });

  useEffect(() => {
    loadData();

    // Check if stationId is in URL params
    const stationIdParam = searchParams.get("stationId");
    if (stationIdParam) {
      setSelectedStations([parseInt(stationIdParam)]);
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [officersData, stationsData] = await Promise.all([
        stationOfficerApi.getAllOfficers(),
        stationApi.getAllStations(),
      ]);

      setOfficers(officersData);
      setStations(stationsData);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load officers",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = (userId: number) => {
    navigate(`${STATION_ROUTES.OFFICER_DETAIL}/${userId}`);
  };

  const handleEdit = (officerId: number) => {
    navigate(`${STATION_ROUTES.EDIT_OFFICER}/${officerId}`);
  };

  const handleTransfer = (officerId: number) => {
    navigate(`${STATION_ROUTES.TRANSFER_OFFICER}/${officerId}`);
  };

  const handleDeleteClick = (officerId: number, officerName: string) => {
    setDeleteDialog({ open: true, officerId, officerName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.officerId) return;

    try {
      await stationOfficerApi.deleteOfficer(deleteDialog.officerId);
      enqueueSnackbar("Officer deleted successfully", { variant: "success" });
      setDeleteDialog({ open: false, officerId: null, officerName: "" });
      loadData();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to delete officer",
        { variant: "error" }
      );
    }
  };

  const handleToggleOfficerStatus = async (
    officerId: number,
    currentStatus: boolean
  ) => {
    try {
      if (currentStatus) {
        await userApi.deactivatePoliceOfficer(officerId);
        enqueueSnackbar("Officer deactivated successfully", {
          variant: "success",
        });
      } else {
        await userApi.activatePoliceOfficer(officerId);
        enqueueSnackbar("Officer activated successfully", {
          variant: "success",
        });
      }
      loadData();
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message ||
          `Failed to ${currentStatus ? "deactivate" : "activate"} officer`,
        { variant: "error" }
      );
    }
  };

  const handleExport = () => {
    const filteredData = getFilteredOfficers();
    stationExport.exportOfficers(filteredData);
    enqueueSnackbar("Officers exported successfully", { variant: "success" });
  };

  const getFilteredOfficers = () => {
    const isActiveFilter =
      statusFilter === "active"
        ? true
        : statusFilter === "inactive"
        ? false
        : undefined;

    const isIOFilter =
      ioFilter === "io" ? true : ioFilter === "non-io" ? false : undefined;

    return stationFilters.filterOfficers(
      officers,
      searchQuery,
      selectedStations.length > 0 ? selectedStations : undefined,
      selectedRanks.length > 0 ? selectedRanks : undefined,
      isIOFilter,
      isActiveFilter
    );
  };

  const filteredOfficers = getFilteredOfficers();

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
        title="Police Officers"
        subtitle="Manage police officers across all stations"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Police Officers" },
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
              onClick={() => navigate(STATION_ROUTES.CREATE_OFFICER)}
            >
              Create Officer
            </Button>
          </>
        }
      />

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={3}>
            <TextField
              placeholder="Search officers..."
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

          {/* Rank Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Rank</InputLabel>
              <Select
                multiple
                value={selectedRanks}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  const value = e.target.value;
                  setSelectedRanks(typeof value === "string" ? [] : value);
                }}
                label="Rank"
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {OFFICER_RANKS.map((rank) => (
                  <MenuItem key={rank} value={rank}>
                    {rank}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* IO Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={ioFilter}
                label="Type"
                onChange={(e) => setIoFilter(e.target.value)}
              >
                <MenuItem value="all">All Officers</MenuItem>
                <MenuItem value="io">Investigation Officers</MenuItem>
                <MenuItem value="non-io">Regular Officers</MenuItem>
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
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Clear Filters */}
        {(searchQuery ||
          selectedStations.length > 0 ||
          selectedRanks.length > 0 ||
          ioFilter !== "all" ||
          statusFilter !== "active") && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchQuery("");
                setSelectedStations([]);
                setSelectedRanks([]);
                setIoFilter("all");
                setStatusFilter("active");
              }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
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
                  {filteredOfficers.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Officers Found
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
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
                  {filteredOfficers.filter((o) => o.isActive).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
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
                  {
                    filteredOfficers.filter((o) => o.isInvestigationOfficer)
                      .length
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Investigation Officers
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
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
                    color: theme.palette.primary.main,
                  }}
                >
                  {filteredOfficers.reduce(
                    (sum, o) => sum + (o.totalChallans || 0),
                    0
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Challans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Officers Table */}
      <OfficerTable
        officers={filteredOfficers}
        onView={handleView}
        onEdit={handleEdit}
        onTransfer={handleTransfer}
        onDelete={(officerId) => {
          const officer = officers.find((o) => o.officerId === officerId);
          if (officer) handleDeleteClick(officerId, officer.fullName);
        }}
        onToggleStatus={handleToggleOfficerStatus}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete officer{" "}
          <strong>{deleteDialog.officerName}</strong>?
          <br />
          This will deactivate the officer's account.
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
