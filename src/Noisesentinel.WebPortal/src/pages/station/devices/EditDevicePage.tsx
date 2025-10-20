import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { STATION_ROUTES } from '@/utils/stationConstants';
import deviceApi from '@/api/deviceApi';
import { UpdateDeviceDto } from '@/models/Device';

export const EditDevicePage: React.FC = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDeviceDto>();

  useEffect(() => {
    if (deviceId) {
      loadDevice();
    }
  }, [deviceId]);

  const loadDevice = async () => {
    setLoadingData(true);
    try {
      const data = await deviceApi.getDeviceById(parseInt(deviceId!));
      reset({
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        firmwareVersion: data.firmwareVersion,
        calibrationDate: data.calibrationDate.split('T')[0],
        calibrationStatus: data.calibrationStatus,
        calibrationCertificateNo: data.calibrationCertificateNo,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to load device',
        { variant: 'error' }
      );
      navigate(STATION_ROUTES.DEVICES);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UpdateDeviceDto) => {
    setLoading(true);
    try {
      await deviceApi.updateDevice(data);
      enqueueSnackbar('Device updated successfully', { variant: 'success' });
      navigate(STATION_ROUTES.DEVICES);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update device',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit IoT Device"
        subtitle="Update device information"
        breadcrumbs={[
          { label: 'Dashboard', path: STATION_ROUTES.DASHBOARD },
          { label: 'IoT Devices', path: STATION_ROUTES.DEVICES },
          { label: 'Edit Device' },
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
                rules={{ required: 'Device name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Device Name"
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
                rules={{ required: 'Firmware version is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Firmware Version"
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
                rules={{ required: 'Calibration date is required' }}
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
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Calibration Status */}
            <Grid item xs={12}>
              <Controller
                name="calibrationStatus"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox checked={field.value} onChange={field.onChange} />
                    }
                    label="Device is Calibrated"
                  />
                )}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
                  {loading ? 'Updating...' : 'Update Device'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};