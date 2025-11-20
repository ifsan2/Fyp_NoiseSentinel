import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff, InfoOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "notistack";
import authApi from "@/api/authApi";
import { RegisterAdminDto } from "@/models/Auth";
import { ROUTES } from "@/utils/constants";
import { validation, validationMessages } from "@/utils/validation";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

export const RegisterAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterAdminDto>({
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterAdminDto) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await authApi.registerAdmin(data);

      // Auto-login after registration
      login(response.token, response);

      enqueueSnackbar("Admin account created successfully!", {
        variant: "success",
      });

      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Admin may already exist.";
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      {/* Theme Toggle Button */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <ThemeToggleButton size="large" />
      </Box>

      {/* Left Side - Branding */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 8,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(99, 102, 241, 0.05)"
              : "rgba(99, 102, 241, 0.03)",
          borderRight: `1px solid ${theme.palette.divider}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.palette.text.primary} 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 480,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <BrandLogo size="large" showText={true} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #A5B4FC 0%, #818CF8 100%)"
                  : "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to Noise Sentinel
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "text.secondary", mb: 4, lineHeight: 1.7 }}
          >
            Create the initial administrator account to get started with the
            system
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              {
                icon: "🔒",
                title: "Secure System",
                desc: "One-time registration for first admin",
              },
              {
                icon: "👥",
                title: "User Management",
                desc: "Create and manage all system users",
              },
              {
                icon: "📊",
                title: "Full Control",
                desc: "Access to all administrative features",
              },
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  p: 2,
                  borderRadius: 2,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(0,0,0,0.02)",
                }}
              >
                <Box
                  sx={{
                    fontSize: "24px",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(99, 102, 241, 0.1)"
                        : "rgba(99, 102, 241, 0.08)",
                    borderRadius: "8px",
                  }}
                >
                  {feature.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Side - Registration Form */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 3, sm: 6, md: 8 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 480 }}>
          {/* Mobile Logo */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "center",
              mb: 4,
            }}
          >
            <BrandLogo size="medium" showText={true} />
          </Box>

          {/* Logo & Title */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Register First Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create the initial administrator account
            </Typography>
          </Box>

          {/* Info Alert */}
          <Alert
            severity="info"
            icon={<InfoOutlined />}
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-message": {
                fontSize: "0.875rem",
              },
            }}
          >
            This is a one-time registration. After the first admin is created,
            this page will be disabled.
          </Alert>

          {/* Error Message */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fullName"
                  control={control}
                  rules={{
                    required: validationMessages.required("Full name"),
                    minLength: {
                      value: 3,
                      message: validationMessages.minLength("Full name", 3),
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      placeholder="Enter full name"
                      fullWidth
                      error={!!errors.fullName}
                      helperText={errors.fullName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: validationMessages.required("Email"),
                    validate: (value) =>
                      validation.email(value) || validationMessages.email,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      label="Email"
                      placeholder="admin@noisesentinel.com"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: validationMessages.required("Username"),
                    minLength: {
                      value: 3,
                      message: validationMessages.minLength("Username", 3),
                    },
                    validate: (value) =>
                      validation.username(value) || validationMessages.username,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Username"
                      placeholder="admin"
                      fullWidth
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: validationMessages.required("Password"),
                    minLength: {
                      value: 8,
                      message: validationMessages.minLength("Password", 8),
                    },
                    validate: (value) =>
                      validation.password(value) || validationMessages.password,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      placeholder="Enter password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
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

              <Grid item xs={12}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: validationMessages.required("Confirm password"),
                    validate: (value) =>
                      validation.passwordMatch(password, value) ||
                      validationMessages.passwordMatch,
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showConfirmPassword ? "text" : "password"}
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      fullWidth
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                              size="small"
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
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
              }}
            >
              {loading ? "Creating Admin Account..." : "Register Admin"}
            </Button>
          </form>

          {/* Login Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                component="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                sx={{
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
