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
  Chip,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useSnackbar } from 'notistack';
import authApi from '@/api/authApi';
import { LoginDto } from '@/models/Auth';
import { ROUTES, ROLES } from '@/utils/constants';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await authApi.login(data);

      // ✅ BLOCK Police Officers - they should use Mobile App
      if (response.role === ROLES.POLICE_OFFICER) {
        setErrorMessage(
          'Police Officers cannot access the web portal. Please use the Mobile App.'
        );
        enqueueSnackbar('Access Denied: Please use the Mobile App', {
          variant: 'error',
        });
        return;
      }

      // Save token and user data
      login(response.token, response);

      enqueueSnackbar(`Welcome back, ${response.fullName}!`, {
        variant: 'success',
      });

      // ✅ Redirect based on role
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
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
        <Card
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: 'visible',
          }}
        >
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
                NoiseSentinel
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Web Portal Login
              </Typography>
              
              {/* ✅ ADD: Supported Roles */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip label="Admin" size="small" color="error" />
                <Chip label="Court Authority" size="small" color="warning" />
                <Chip label="Station Authority" size="small" color="info" />
                <Chip label="Judge" size="small" color="success" />
              </Box>
            </Box>

            {/* ✅ ADD: Mobile App Notice */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Police Officers:</strong> Please use the Mobile App for field operations.
            </Alert>

            {/* Error Message */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="username"
                control={control}
                rules={{ required: 'Username is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    placeholder="Enter your username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    fullWidth
                    sx={{ mb: 2 }}
                    autoComplete="username"
                    autoFocus
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter your password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    sx={{ mb: 3 }}
                    autoComplete="current-password"
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

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No admin account yet?{' '}
                <Link
                  onClick={() => navigate(ROUTES.REGISTER_ADMIN)}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  Register First Admin
                </Link>
              </Typography>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="caption" color="text.secondary">
                🔒 Authorized Personnel Only
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};