import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from 'notistack';
import authApi from '@/api/authApi';
import { RegisterAdminDto } from '@/models/Auth';
import { ROUTES } from '@/utils/constants';
import { validation, validationMessages } from '@/utils/validation';

export const RegisterAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterAdminDto>({
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterAdminDto) => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await authApi.registerAdmin(data);

      // Auto-login after registration
      login(response.token, response);

      enqueueSnackbar('Admin account created successfully!', {
        variant: 'success',
      });

      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Admin may already exist.';
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 5 }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 2,
                  fontSize: '40px',
                }}
              >
                🔊
              </Box>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
                Register First Admin
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create the initial administrator account
              </Typography>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
              This is a one-time registration. After the first admin is created, this page will be
              disabled.
            </Alert>

            {/* Error Message */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
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
                    placeholder="Enter full name"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

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
                    placeholder="admin@noisesentinel.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              <Controller
                name="username"
                control={control}
                rules={{
                  required: validationMessages.required('Username'),
                  minLength: {
                    value: 3,
                    message: validationMessages.minLength('Username', 3),
                  },
                  validate: (value) =>
                    validation.username(value) || validationMessages.username,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    placeholder="admin"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

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
                    placeholder="Enter password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ mb: 2 }}
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

              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: validationMessages.required('Confirm password'),
                  validate: (value) =>
                    validation.passwordMatch(password, value) ||
                    validationMessages.passwordMatch,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Re-enter password"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{ mb: 3 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, mb: 2 }}
              >
                {loading ? 'Creating Admin Account...' : 'Register Admin'}
              </Button>
            </form>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  onClick={() => navigate(ROUTES.LOGIN)}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};