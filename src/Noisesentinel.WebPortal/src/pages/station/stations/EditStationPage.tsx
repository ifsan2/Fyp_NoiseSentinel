import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { STATION_ROUTES, PAKISTAN_PROVINCES } from '@/utils/stationConstants';
import stationApi from '@/api/stationApi';
import { UpdatePoliceStationDto } from '@/models/Station';

export const EditStationPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePoliceStationDto>();

  useEffect(() => {
    if (id) {
      loadStation();
    }
  }, [id]);

  const loadStation = async () => {
    setLoadingData(true);
    try {
      const data = await stationApi.getStationById(parseInt(id!));
      reset({
        stationId: data.stationId,
        stationName: data.stationName,
        stationCode: data.stationCode,
        location: data.location,
        district: data.district,
        province: data.province,
        contact: data.contact,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to load station',
        { variant: 'error' }
      );
      navigate(STATION_ROUTES.STATIONS);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UpdatePoliceStationDto) => {
    setLoading(true);
    try {
      await stationApi.updateStation(data);
      enqueueSnackbar('Police Station updated successfully', {
        variant: 'success',
      });
      navigate(STATION_ROUTES.STATIONS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update station',
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
        title="Edit Police Station"
        subtitle="Update police station information"
        breadcrumbs={[
          { label: 'Dashboard', path: STATION_ROUTES.DASHBOARD },
          { label: 'Police Stations', path: STATION_ROUTES.STATIONS },
          { label: 'Edit Station' },
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
                    error={!!errors.stationCode}
                    helperText={errors.stationCode?.message}
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
                  <TextField {...field} label="District" fullWidth />
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
                  <TextField {...field} label="Contact Number" fullWidth />
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
                  {loading ? 'Updating...' : 'Update Station'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};