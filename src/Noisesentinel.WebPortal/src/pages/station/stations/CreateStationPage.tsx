import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { STATION_ROUTES, PAKISTAN_PROVINCES } from '@/utils/stationConstants';
import stationApi from '@/api/stationApi';
import { CreatePoliceStationDto } from '@/models/Station';

export const CreateStationPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePoliceStationDto>();

  const onSubmit = async (data: CreatePoliceStationDto) => {
    setLoading(true);
    try {
      await stationApi.createStation(data);
      enqueueSnackbar('Police Station created successfully', {
        variant: 'success',
      });
      navigate(STATION_ROUTES.STATIONS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to create station',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Police Station"
        subtitle="Register a new police station in the system"
        breadcrumbs={[
          { label: 'Dashboard', path: STATION_ROUTES.DASHBOARD },
          { label: 'Police Stations', path: STATION_ROUTES.STATIONS },
          { label: 'Create Station' },
        ]}
      />

      <FormCard title="Station Information">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Station Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="stationName"
                control={control}
                rules={{ required: 'Station name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Station Name"
                    placeholder="e.g., Lahore Cantonment Police Station"
                    error={!!errors.stationName}
                    helperText={errors.stationName?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Station Code */}
            <Grid item xs={12} md={6}>
              <Controller
                name="stationCode"
                control={control}
                rules={{
                  required: 'Station code is required',
                  pattern: {
                    value: /^[A-Z0-9-]+$/,
                    message: 'Use uppercase letters, numbers, and hyphens only',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Station Code"
                    placeholder="e.g., LHR-CANT"
                    error={!!errors.stationCode}
                    helperText={
                      errors.stationCode?.message ||
                      'Unique code (uppercase, numbers, hyphens)'
                    }
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location/Address"
                    placeholder="e.g., Mall Road, Cantonment Area"
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* District */}
            <Grid item xs={12} md={4}>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="District"
                    placeholder="e.g., Lahore"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Province */}
            <Grid item xs={12} md={4}>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Province</InputLabel>
                    <Select {...field} label="Province">
                      <MenuItem value="">Select Province</MenuItem>
                      {PAKISTAN_PROVINCES.map((province) => (
                        <MenuItem key={province} value={province}>
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={4}>
              <Controller
                name="contact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    placeholder="e.g., +92-42-1234567"
                    fullWidth
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
                  onClick={() => navigate(STATION_ROUTES.STATIONS)}
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
                  {loading ? 'Creating...' : 'Create Station'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};