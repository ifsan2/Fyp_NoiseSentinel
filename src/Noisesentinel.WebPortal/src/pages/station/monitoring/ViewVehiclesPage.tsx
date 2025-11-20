import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
  Card,
  CardContent,
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
} from "@mui/material";
import {
  Search,
  Refresh,
  DirectionsCar,
  Visibility,
  Assignment,
  Payment,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/station/cards/StatsCard";
import { STATION_ROUTES } from "@/utils/stationConstants";
import vehicleApi, { VehicleDto } from "@/api/vehicleApi";
import challanApi from "@/api/challanApi";
import { ChallanDto } from "@/models/Challan";
import { dateHelpers } from "@/utils/stationFilters";
import { useTheme } from "@mui/material/styles";

export const ViewVehiclesPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // View Dialog
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    vehicle: VehicleDto | null;
    challans: ChallanDto[];
    loadingChallans: boolean;
  }>({ open: false, vehicle: null, challans: [], loadingChallans: false });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const data = await vehicleApi.getAllVehicles();
      setVehicles(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load vehicles",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.vehicleId === vehicleId);
    if (!vehicle) return;

    setViewDialog({ open: true, vehicle, challans: [], loadingChallans: true });

    try {
      const challans = await challanApi.getChallansByVehicle(vehicleId);
      setViewDialog((prev) => ({ ...prev, challans, loadingChallans: false }));
    } catch (error: any) {
      enqueueSnackbar("Failed to load vehicle challans", { variant: "error" });
      setViewDialog((prev) => ({ ...prev, loadingChallans: false }));
    }
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      !searchQuery ||
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.ownerCnic?.includes(searchQuery)
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
        title="Vehicle Records"
        subtitle="Search and view vehicle violation history"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Vehicles" },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadVehicles}
          >
            Refresh
          </Button>
        }
      />

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              placeholder="Search by plate number, make, owner name, or CNIC..."
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
        </Grid>
      </Box>

      {/* Statistics */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <StatsCard
              title="Vehicles Found"
              value={filteredVehicles.length}
              icon={<DirectionsCar />}
              color="#3B82F6"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StatsCard
              title="Total Challans"
              value={filteredVehicles.reduce(
                (sum, v) => sum + (v.totalChallans || 0),
                0
              )}
              icon={<Assignment />}
              color="#F59E0B"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <StatsCard
              title="Total Penalties"
              value={`PKR ${filteredVehicles
                .reduce((sum, v) => sum + (v.totalPenalties || 0), 0)
                .toLocaleString()}`}
              icon={<Payment />}
              color="#EF4444"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Vehicles Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Vehicle Info
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Owner Info
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Challans
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Total Penalties
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No vehicles found
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.vehicleId} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <DirectionsCar color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {vehicle.plateNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {vehicle.make} {vehicle.model} • {vehicle.color}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {vehicle.ownerName || "N/A"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      CNIC: {vehicle.ownerCnic || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={vehicle.totalChallans || 0}
                      size="small"
                      color={
                        (vehicle.totalChallans || 0) > 3
                          ? "error"
                          : (vehicle.totalChallans || 0) > 0
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
                      PKR {(vehicle.totalPenalties || 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View History">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleView(vehicle.vehicleId)}
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

      {/* View Vehicle History Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() =>
          setViewDialog({
            open: false,
            vehicle: null,
            challans: [],
            loadingChallans: false,
          })
        }
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DirectionsCar />
            Vehicle History - {viewDialog.vehicle?.plateNumber}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewDialog.vehicle && (
            <Box>
              {/* Vehicle Details */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Vehicle Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Plate Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.plateNumber}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Make & Model
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.make} {viewDialog.vehicle.model}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Color
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.color}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Registration Year
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.registrationYear || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Owner Name
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.ownerName || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Owner CNIC
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.ownerCnic || "N/A"}
                  </Typography>
                </Grid>

                <Grid item xs={6} md={4}>
                  <Typography variant="caption" color="text.secondary">
                    Owner Contact
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewDialog.vehicle.ownerContact || "N/A"}
                  </Typography>
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
                  No challans found for this vehicle
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Challan #</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Violation</TableCell>
                        <TableCell>Penalty</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDialog.challans.map((challan) => (
                        <TableRow key={challan.challanId}>
                          <TableCell>#{challan.challanId}</TableCell>
                          <TableCell>
                            {dateHelpers.formatDate(challan.issueDateTime)}
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
                vehicle: null,
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
