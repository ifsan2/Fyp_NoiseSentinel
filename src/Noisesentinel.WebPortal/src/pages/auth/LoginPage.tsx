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
  Chip,
} from "@mui/material";
import { Visibility, VisibilityOff, ShieldOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useSnackbar } from "notistack";
import authApi from "@/api/authApi";
import { LoginDto } from "@/models/Auth";
import { ROUTES, ROLES } from "@/utils/constants";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useTheme } from "@mui/material/styles";

export const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await authApi.login(data);

      // ✅ BLOCK Police Officers - they should use Mobile App
      if (response.role === ROLES.POLICE_OFFICER) {
        setErrorMessage(
          "Police Officers cannot access the web portal. Please use the Mobile App."
        );
        enqueueSnackbar("Access Denied: Please use the Mobile App", {
          variant: "error",
        });
        return;
      }

      // Save token and user data
      login(response.token, response);

      enqueueSnackbar(`Welcome back, ${response.fullName}!`, {
        variant: "success",
      });

      // ✅ Redirect based on role
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
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
      {/* Theme Toggle Button - Fixed Top Right */}
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
              color: theme.palette.text.primary,
              letterSpacing: "-0.02em",
            }}
          >
            Enforce Noise Compliance
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              lineHeight: 1.7,
            }}
          >
            Professional enforcement platform for monitoring, managing, and
            prosecuting noise violations with cutting-edge IoT integration.
          </Typography>

          {/* Feature List */}
          <Box sx={{ textAlign: "left", mt: 6 }}>
            {[
              {
                icon: "🎯",
                title: "Real-time Monitoring",
                desc: "IoT device integration",
              },
              {
                icon: "⚖️",
                title: "Case Management",
                desc: "FIRs, challans, court proceedings",
              },
              {
                icon: "🔒",
                title: "Secure Access",
                desc: "Role-based authorization",
              },
            ].map((feature, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 3,
                  p: 2,
                  borderRadius: "8px",
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

      {/* Right Side - Login Form */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 3, sm: 6, md: 8 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile Logo */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              mb: 4,
              textAlign: "center",
            }}
          >
            <BrandLogo size="medium" showText={true} />
          </Box>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: theme.palette.text.primary,
                letterSpacing: "-0.02em",
              }}
            >
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Supported Roles */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mb: 3,
              p: 2,
              borderRadius: "8px",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ width: "100%", mb: 1, color: theme.palette.text.secondary }}
            >
              Authorized roles:
            </Typography>
            <Chip label="Admin" size="small" sx={{ fontSize: "0.75rem" }} />
            <Chip
              label="Court Authority"
              size="small"
              sx={{ fontSize: "0.75rem" }}
            />
            <Chip
              label="Station Authority"
              size="small"
              sx={{ fontSize: "0.75rem" }}
            />
            <Chip label="Judge" size="small" sx={{ fontSize: "0.75rem" }} />
          </Box>

          {/* Mobile App Notice */}
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: "8px",
              border: `1px solid ${theme.palette.info.main}20`,
            }}
          >
            <Typography variant="body2">
              <strong>Police Officers:</strong> Use the Mobile App for field
              operations.
            </Typography>
          </Alert>

          {/* Error Message */}
          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: "8px",
                border: `1px solid ${theme.palette.error.main}20`,
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="username"
              control={control}
              rules={{ required: "Username is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  placeholder="Enter your username"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  fullWidth
                  sx={{ mb: 2.5 }}
                  autoComplete="username"
                  autoFocus
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: "Password is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type={showPassword ? "text" : "password"}
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
                          size="small"
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
                fontSize: "0.9375rem",
                fontWeight: 600,
                mb: 3,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Register Link */}
          <Box
            sx={{
              textAlign: "center",
              p: 2,
              borderRadius: "8px",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.02)",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No admin account?{" "}
              <Link
                onClick={() => navigate(ROUTES.REGISTER_ADMIN)}
                sx={{
                  cursor: "pointer",
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Register First Admin
              </Link>
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                color: theme.palette.text.disabled,
              }}
            >
              <ShieldOutlined sx={{ fontSize: 16 }} />
              <Typography variant="caption">
                Authorized Personnel Only
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
