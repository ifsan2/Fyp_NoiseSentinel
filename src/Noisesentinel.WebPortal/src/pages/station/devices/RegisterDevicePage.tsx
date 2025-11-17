import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { STATION_ROUTES } from "@/utils/stationConstants";
import deviceApi from "@/api/deviceApi";
import { CreateDeviceDto } from "@/models/Device";

export const RegisterDevicePage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDeviceDto>({
    defaultValues: {
      calibrationDate: new Date().toISOString().split("T")[0],
      calibrationStatus: false,
    },
  });

  const onSubmit = async (data: CreateDeviceDto) => {
    setLoading(true);
    try {
      await deviceApi.registerDevice(data);
      enqueueSnackbar("IoT Device registered successfully", {
        variant: "success",
      });
      navigate(STATION_ROUTES.DEVICES);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to register device",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Register IoT Device"
        subtitle="Add a new noise detection device to the system"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "IoT Devices", path: STATION_ROUTES.DEVICES },
          { label: "Register Device" },
        ]}
      />

      <FormCard title="Device Information">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Device Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="deviceName"
                control={control}
                rules={{ required: "Device name is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Device Name"
                    placeholder="e.g., IOT-LHR-001"
                    error={!!errors.deviceName}
                    helperText={errors.deviceName?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Firmware Version */}
            <Grid item xs={12} md={6}>
              <Controller
                name="firmwareVersion"
                control={control}
                rules={{ required: "Firmware version is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Firmware Version"
                    placeholder="e.g., v2.1.5"
                    error={!!errors.firmwareVersion}
                    helperText={errors.firmwareVersion?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Calibration Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="calibrationDate"
                control={control}
                rules={{ required: "Calibration date is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Calibration Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.calibrationDate}
                    helperText={errors.calibrationDate?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Calibration Certificate Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="calibrationCertificateNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Calibration Certificate No"
                    placeholder="e.g., CAL-2025-001"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Calibration Status */}
            <Grid item xs={12} md={6}>
              <Controller
                name="calibrationStatus"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Device is Calibrated"
                  />
                )}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(STATION_ROUTES.DEVICES)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Device"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
