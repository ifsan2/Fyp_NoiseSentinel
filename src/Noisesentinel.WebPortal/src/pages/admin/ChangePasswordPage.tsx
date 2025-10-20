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
import { ChangePasswordDto } from '@/models/Auth';
import { PageHeader } from '@/components/common/PageHeader';
import { FormCard } from '@/components/common/FormCard';
import { ROUTES } from '@/utils/constants';
import { validation, validationMessages } from '@/utils/validation';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordDto>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ChangePasswordDto) => {
    try {
      setLoading(true);
      setErrorMessage('');

      await authApi.changePassword(data);

      enqueueSnackbar('Password changed successfully!', {
        variant: 'success',
      });

      reset();
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to change password.';
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Change Password"
        subtitle="Update your account password"
        breadcrumbs={[
          { label: 'Dashboard', path: ROUTES.DASHBOARD },
          { label: 'Change Password' },
        ]}
      />

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <FormCard title="Change Password">
            {/* Error Message */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Current Password */}
                <Grid item xs={12}>
                  <Controller
                    name="currentPassword"
                    control={control}
                    rules={{
                      required: validationMessages.required('Current password'),
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type={showCurrentPassword ? 'text' : 'password'}
                        label="Current Password"
                        placeholder="Enter current password"
                        error={!!errors.currentPassword}
                        helperText={errors.currentPassword?.message}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                edge="end"
                              >
                                {showCurrentPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* New Password */}
                <Grid item xs={12}>
                  <Controller
                    name="newPassword"
                    control={control}
                    rules={{
                      required: validationMessages.required('New password'),
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
                        type={showNewPassword ? 'text' : 'password'}
                        label="New Password"
                        placeholder="Enter new password"
                        error={!!errors.newPassword}
                        helperText={
                          errors.newPassword?.message ||
                          'Min 8 chars, uppercase, lowercase, number, special char'
                        }
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                edge="end"
                              >
                                {showNewPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                      required: validationMessages.required('Confirm password'),
                      validate: (value) =>
                        validation.passwordMatch(newPassword, value) ||
                        validationMessages.passwordMatch,
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        required
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Security Tips */}
                <Grid item xs={12}>
                  <Alert severity="info">
                    <strong>Password Security Tips:</strong>
                    <br />
                    • Use a unique password you don't use elsewhere
                    <br />
                    • Include uppercase, lowercase, numbers, and special characters
                    <br />• Avoid common words or personal information
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
                      {loading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </FormCard>
        </Grid>
      </Grid>
    </Box>
  );
};