import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Save } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import authApi from '@/api/authApi';
import { CreateCourtAuthorityDto } from '@/models/Auth';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { ROUTES } from '@/utils/constants';
import { validation, validationMessages } from '@/utils/validation';

export const CreateCourtAuthorityPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourtAuthorityDto>({
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: CreateCourtAuthorityDto) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await authApi.createCourtAuthority(data);

      setSuccessMessage(
        `Court Authority account "${response.username}" created successfully!`
      );
      enqueueSnackbar('Court Authority created successfully!', {
        variant: 'success',
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        reset();
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to create Court Authority account.';
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Court Authority"
        subtitle="Create a new court administrator who can manage judges"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Create Court Authority' },
        ]}
      />

      <FormCard title="Court Authority Account Details">
        {/* Success Message */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

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
                  maxLength: {
                    value: 255,
                    message: validationMessages.maxLength('Full name', 255),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    placeholder="e.g., Lahore High Court Admin"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    required
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
                  maxLength: {
                    value: 255,
                    message: validationMessages.maxLength('Email', 255),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="Email"
                    placeholder="e.g., lhc@court.gov.pk"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
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
                  minLength: {
                    value: 3,
                    message: validationMessages.minLength('Username', 3),
                  },
                  maxLength: {
                    value: 255,
                    message: validationMessages.maxLength('Username', 255),
                  },
                  validate: (value) =>
                    validation.username(value) || validationMessages.username,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    placeholder="e.g., lhc_admin"
                    error={!!errors.username}
                    helperText={
                      errors.username?.message ||
                      'Letters, numbers, underscores, and hyphens only'
                    }
                    required
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
                  minLength: {
                    value: 8,
                    message: validationMessages.minLength('Password', 8),
                  },
                  validate: (value) =>
                    validation.password(value) || validationMessages.password,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter secure password"
                    error={!!errors.password}
                    helperText={
                      errors.password?.message ||
                      'Min 8 chars, uppercase, lowercase, number, special char'
                    }
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Info Box */}
            <Grid item xs={12}>
              <Alert severity="info">
                <strong>Court Authority Permissions:</strong>
                <br />
                • Can create Judge accounts for their court
                <br />
                • Can view all FIRs and create Cases
                <br />
                • Can assign Judges to Cases
                <br />• Cannot issue Challans or file FIRs
              </Alert>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
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
                  {loading ? 'Creating Account...' : 'Create Court Authority'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};