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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { STATION_ROUTES, OFFICER_RANKS } from '@/utils/stationConstants';
import { validation, validationMessages } from '@/utils/validation';
import stationApi from '@/api/stationApi';
import stationOfficerApi from '@/api/stationOfficerApi';
import { CreateStationOfficerDto } from '@/models/StationOfficer';
import { PoliceStationDto } from '@/models/Station';

export const CreateOfficerPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stations, setStations] = useState<PoliceStationDto[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStationOfficerDto>({
    defaultValues: {
      isInvestigationOfficer: false,
      postingDate: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    setLoadingStations(true);
    try {
      const data = await stationApi.getAllStations();
      setStations(data);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to load stations',
        { variant: 'error' }
      );
    } finally {
      setLoadingStations(false);
    }
  };

  const onSubmit = async (data: CreateStationOfficerDto) => {
    setLoading(true);
    try {
      await stationOfficerApi.createOfficer(data);
      enqueueSnackbar('Police Officer created successfully', {
        variant: 'success',
      });
      navigate(STATION_ROUTES.OFFICERS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to create officer',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingStations) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Create Police Officer"
        subtitle="Add a new police officer to the system"
        breadcrumbs={[
          { label: 'Dashboard', path: STATION_ROUTES.DASHBOARD },
          { label: 'Police Officers', path: STATION_ROUTES.OFFICERS },
          { label: 'Create Officer' },
        ]}
      />

      {stations.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No police stations found. Please create a police station first before
          adding officers.
        </Alert>
      )}

      <FormCard title="Officer Information">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Full Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="fullName"
                control={control}
                rules={{
                  required: validationMessages.required('Full name'),
                  minLength: {
                    value: 3,
                    message: validationMessages.minLength('Full name', 3),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    placeholder="e.g., Muhammad Ahmed Khan"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: validationMessages.required('Email'),
                  validate: (value) =>
                    validation.email(value) || validationMessages.email,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="Email"
                    placeholder="e.g., officer.ahmed@police.gov.pk"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Username */}
            <Grid item xs={12} md={6}>
              <Controller
                name="username"
                control={control}
                rules={{
                  required: validationMessages.required('Username'),
                  validate: (value) =>
                    validation.username(value) || validationMessages.username,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    placeholder="e.g., officer_ahmed"
                    error={!!errors.username}
                    helperText={
                      errors.username?.message ||
                      'Letters, numbers, underscores, hyphens only'
                    }
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} md={6}>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: validationMessages.required('Password'),
                  validate: (value) =>
                    validation.password(value) || validationMessages.password,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Password"
                    error={!!errors.password}
                    helperText={
                      errors.password?.message ||
                      'Min 8 chars, uppercase, lowercase, number, special char'
                    }
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* CNIC */}
            <Grid item xs={12} md={4}>
              <Controller
                name="cnic"
                control={control}
                rules={{
                  required: validationMessages.required('CNIC'),
                  pattern: {
                    value: /^\d{5}-\d{7}-\d{1}$/,
                    message: 'CNIC format: 12345-1234567-1',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CNIC"
                    placeholder="12345-1234567-1"
                    error={!!errors.cnic}
                    helperText={errors.cnic?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} md={4}>
              <Controller
                name="contactNo"
                control={control}
                rules={{ required: validationMessages.required('Contact number') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    placeholder="+92-300-1234567"
                    error={!!errors.contactNo}
                    helperText={errors.contactNo?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Badge Number */}
            <Grid item xs={12} md={4}>
              <Controller
                name="badgeNumber"
                control={control}
                rules={{ required: validationMessages.required('Badge number') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Badge Number"
                    placeholder="e.g., PKL-2025-001"
                    error={!!errors.badgeNumber}
                    helperText={errors.badgeNumber?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Rank */}
            <Grid item xs={12} md={4}>
              <Controller
                name="rank"
                control={control}
                rules={{ required: validationMessages.required('Rank') }}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.rank}>
                    <InputLabel>Rank</InputLabel>
                    <Select {...field} label="Rank">
                      <MenuItem value="">Select Rank</MenuItem>
                      {OFFICER_RANKS.map((rank) => (
                        <MenuItem key={rank} value={rank}>
                          {rank}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.rank && (
                      <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                        {errors.rank.message}
                      </Box>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Station Assignment */}
            <Grid item xs={12} md={4}>
              <Controller
                name="stationId"
                control={control}
                rules={{ required: validationMessages.required('Station') }}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.stationId}>
                    <InputLabel>Assign to Station</InputLabel>
                    <Select {...field} label="Assign to Station">
                      <MenuItem value="">Select Station</MenuItem>
                      {stations.map((station) => (
                        <MenuItem key={station.stationId} value={station.stationId}>
                          {station.stationName} ({station.stationCode})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.stationId && (
                      <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                        {errors.stationId.message}
                      </Box>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Posting Date */}
            <Grid item xs={12} md={4}>
              <Controller
                name="postingDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    label="Posting Date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Investigation Officer */}
            <Grid item xs={12}>
              <Controller
                name="isInvestigationOfficer"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Investigation Officer (IO)"
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
                  onClick={() => navigate(STATION_ROUTES.OFFICERS)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading || stations.length === 0}
                >
                  {loading ? 'Creating...' : 'Create Officer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};