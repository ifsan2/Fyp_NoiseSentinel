import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Devices,
  CheckCircle,
  Cancel,
  Person,
  CalendarToday,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { STATION_ROUTES } from "@/utils/stationConstants";
import deviceApi from "@/api/deviceApi";
import { DeviceDto } from "@/models/Device";

export const DeviceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<DeviceDto | null>(null);

  useEffect(() => {
    if (deviceId) {
      loadDevice();
    }
  }, [deviceId]);

  const loadDevice = async () => {
    setLoading(true);
    try {
      const data = await deviceApi.getDeviceById(parseInt(deviceId!));
      setDevice(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load device details",
        { variant: "error" }
      );
      navigate(STATION_ROUTES.DEVICES);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Not paired yet";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!device) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Device not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Device Details"
        subtitle={`Detailed information about ${device.deviceName}`}
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "IoT Devices", path: STATION_ROUTES.DEVICES },
          { label: device.deviceName },
        ]}
      />

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(STATION_ROUTES.DEVICES)}
        >
          Back to Devices
        </Button>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() =>
            navigate(`${STATION_ROUTES.EDIT_DEVICE}/${device.deviceId}`)
          }
        >
          Edit Device
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Devices sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Device Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Device ID
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                #{device.deviceId}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Device Name
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {device.deviceName}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Firmware Version
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {device.firmwareVersion}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                icon={device.isActive ? <CheckCircle /> : <Cancel />}
                label={device.isActive ? "Active" : "Inactive"}
                color={device.isActive ? "success" : "default"}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Calibration Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarToday sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Calibration Details</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Calibration Status
              </Typography>
              <Chip
                icon={device.calibrationStatus ? <CheckCircle /> : <Cancel />}
                label={
                  device.calibrationStatus ? "Calibrated" : "Not Calibrated"
                }
                color={device.calibrationStatus ? "success" : "warning"}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Calibration Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatDate(device.calibrationDate)}
              </Typography>
            </Box>

            {device.calibrationCertificateNo && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Certificate Number
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {device.calibrationCertificateNo}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Pairing Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Person sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Pairing Information</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Pairing Status
                </Typography>
                <Chip
                  label={device.isPaired ? "Paired (In Use)" : "Available"}
                  color={device.isPaired ? "warning" : "success"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              {device.isPaired && (
                <>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Paired With Officer
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {device.pairedOfficerName || "Unknown"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Pairing Date & Time
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDateTime(device.pairingDateTime)}
                    </Typography>
                  </Grid>
                </>
              )}

              {!device.isPaired && (
                <Grid item xs={12} md={8}>
                  <Typography variant="body2" color="text.secondary">
                    Availability
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {device.calibrationStatus && device.isActive
                      ? "Ready for pairing"
                      : "Not available - Requires calibration or activation"}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
