import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { SwapHoriz, Cancel, LocalPolice, Business } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { STATION_ROUTES } from "@/utils/stationConstants";
import stationApi from "@/api/stationApi";
import stationOfficerApi from "@/api/stationOfficerApi";
import { PoliceStationDto } from "@/models/Station";
import { PoliceOfficerDetailsDto } from "@/models/User";

interface TransferFormData {
  toStationId: number;
  transferDate: string;
  reason: string;
}

export const TransferOfficerPage: React.FC = () => {
  const navigate = useNavigate();
  const { officerId } = useParams<{ officerId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [officer, setOfficer] = useState<PoliceOfficerDetailsDto | null>(null);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TransferFormData>({
    defaultValues: {
      transferDate: new Date().toISOString().split("T")[0],
    },
  });

  const selectedStationId = watch("toStationId");

  useEffect(() => {
    if (officerId) {
      loadData();
    }
  }, [officerId]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [officersData, stationsData] = await Promise.all([
        stationOfficerApi.getAllOfficers(),
        stationApi.getAllStations(),
      ]);

      const officerData = officersData.find(
        (o) => o.officerId === parseInt(officerId!)
      );

      if (!officerData) {
        throw new Error("Officer not found");
      }

      setOfficer(officerData);
      setStations(stationsData);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || "Failed to load data", {
        variant: "error",
      });
      navigate(STATION_ROUTES.OFFICERS);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (_data: TransferFormData) => {
    if (!officer) return;

    setLoading(true);
    try {
      // Update officer with new station (backend UpdateOfficer should handle station change)
      // For now, we'll need to modify the UpdatePoliceOfficerDto to include stationId
      // This is a limitation - ideally backend should have a dedicated Transfer endpoint

      // Since backend doesn't have transfer endpoint, we notify user
      enqueueSnackbar(
        "Transfer functionality requires backend endpoint. Please update officer and manually change station assignment.",
        { variant: "warning" }
      );

      // Alternative: Navigate to edit page
      navigate(`${STATION_ROUTES.EDIT_OFFICER}/${officerId}`);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to transfer officer",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!officer) {
    return null;
  }

  const newStation = stations.find((s) => s.stationId === selectedStationId);

  return (
    <Box>
      <PageHeader
        title="Transfer Police Officer"
        subtitle="Transfer officer to a different station"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Police Officers", path: STATION_ROUTES.OFFICERS },
          { label: "Transfer Officer" },
        ]}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note:</strong> Backend transfer endpoint is not available. This
        will redirect to edit page where you can manually update station
        assignment.
      </Alert>

      {/* Officer Information Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <LocalPolice /> Officer Information
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {officer.fullName}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary">
                Badge Number
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {officer.badgeNumber}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="caption" color="text.secondary">
                Rank
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                <Chip label={officer.rank} size="small" />
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Current Station
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Business color="primary" />
                <Typography variant="h6" color="primary.main">
                  {officer.stationName}
                </Typography>
                <Chip
                  label={officer.stationCode}
                  size="small"
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <FormCard title="Transfer Details">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* New Station */}
            <Grid item xs={12} md={6}>
              <Controller
                name="toStationId"
                control={control}
                rules={{ required: "Please select new station" }}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.toStationId}>
                    <InputLabel>Transfer To Station</InputLabel>
                    <Select {...field} label="Transfer To Station">
                      <MenuItem value="">Select Station</MenuItem>
                      {stations
                        .filter((s) => s.stationId !== officer.stationId)
                        .map((station) => (
                          <MenuItem
                            key={station.stationId}
                            value={station.stationId}
                          >
                            {station.stationName} ({station.stationCode})
                          </MenuItem>
                        ))}
                    </Select>
                    {errors.toStationId && (
                      <Box
                        sx={{
                          color: "error.main",
                          fontSize: "0.75rem",
                          mt: 0.5,
                        }}
                      >
                        {errors.toStationId.message}
                      </Box>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Transfer Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="transferDate"
                control={control}
                rules={{ required: "Transfer date is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Transfer Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.transferDate}
                    helperText={errors.transferDate?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Reason */}
            <Grid item xs={12}>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Reason for Transfer"
                    placeholder="e.g., Administrative requirement, Officer request, etc."
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Transfer Summary */}
            {selectedStationId && newStation && (
              <Grid item xs={12}>
                <Alert severity="success">
                  <Typography variant="body2" gutterBottom>
                    <strong>Transfer Summary:</strong>
                  </Typography>
                  <Typography variant="body2">
                    Officer: <strong>{officer.fullName}</strong>
                  </Typography>
                  <Typography variant="body2">
                    From: <strong>{officer.stationName}</strong> (
                    {officer.stationCode})
                  </Typography>
                  <Typography variant="body2">
                    To: <strong>{newStation.stationName}</strong> (
                    {newStation.stationCode})
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(STATION_ROUTES.OFFICERS)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SwapHoriz />}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Go to Edit Page"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
