import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Link,
} from "@mui/material";
import { MarkEmailRead, ArrowBack } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import authApi from "@/api/authApi";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { ROUTES, ROLES } from "@/utils/constants";
import { useAuth } from "@/contexts/AuthContext";

interface VerifyEmailForm {
  email: string;
  otp: string;
}

// ✅ Helper function to get role-specific change password route
const getChangePasswordRoute = (role: string): string => {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin/change-password?forced=true";
    case ROLES.COURT_AUTHORITY:
      return "/court/change-password?forced=true";
    case ROLES.STATION_AUTHORITY:
      return "/station/change-password?forced=true";
    case ROLES.JUDGE:
      return "/judge/change-password?forced=true";
    default:
      return "/admin/change-password?forced=true";
  }
};

// ✅ Helper function to get role-specific dashboard route
const getDashboardRoute = (role: string): string => {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin/dashboard";
    case ROLES.COURT_AUTHORITY:
      return "/court/dashboard";
    case ROLES.STATION_AUTHORITY:
      return "/station/dashboard";
    case ROLES.JUDGE:
      return "/judge/dashboard";
    default:
      return "/admin/dashboard";
  }
};

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailForm>({
    defaultValues: {
      email: searchParams.get("email") || "",
      otp: searchParams.get("otp") || "",
    },
  });

  useEffect(() => {
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");

    if (email) setValue("email", email);
    if (otp) setValue("otp", otp);
  }, [searchParams, setValue]);

  const onSubmit = async (data: VerifyEmailForm) => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const authData = await authApi.verifyEmail({
        email: data.email,
        otp: data.otp,
      });

      // ✅ Check if user must change password BEFORE saving token
      if (authData.mustChangePassword) {
        // ✅ IMPORTANT: Save token temporarily so protected route allows access to ChangePassword page
        login(authData.token, authData);

        setSuccessMessage(
          "Email verified! Please change your temporary password."
        );
        enqueueSnackbar("Email verified! Please change your password.", {
          variant: "success",
        });

        // ✅ Navigate to role-specific change password page
        const changePasswordRoute = getChangePasswordRoute(authData.role);
        setTimeout(() => {
          navigate(changePasswordRoute);
        }, 1500);
      } else {
        // ✅ Save token and user data (only if password change NOT required)
        login(authData.token, authData);

        setSuccessMessage(
          "Email verified successfully! Redirecting to dashboard..."
        );
        enqueueSnackbar("Email verified successfully!", {
          variant: "success",
        });

        // ✅ Navigate to role-specific dashboard
        const dashboardRoute = getDashboardRoute(authData.role);
        setTimeout(() => {
          navigate(dashboardRoute);
        }, 1500);
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Verification failed. Please check your OTP.";
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const emailValue = searchParams.get("email");
    if (!emailValue) {
      enqueueSnackbar("Email address is required", { variant: "error" });
      return;
    }

    try {
      setResending(true);
      setErrorMessage("");
      await authApi.resendOtp({ email: emailValue });
      enqueueSnackbar("OTP sent to your email!", { variant: "success" });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to resend OTP.";
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Box sx={{ position: "fixed", top: 16, right: 16, zIndex: 1000 }}>
        <ThemeToggleButton />
      </Box>

      <Paper
        elevation={3}
        sx={{ maxWidth: 500, width: "100%", p: 4, borderRadius: 3 }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <BrandLogo />
        </Box>

        <Box sx={{ textAlign: "center", mb: 4 }}>
          <MarkEmailRead sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Enter the 6-digit code sent to your email
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                type="email"
                disabled={loading || !!searchParams.get("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ mb: 3 }}
              />
            )}
          />

          <Controller
            name="otp"
            control={control}
            rules={{
              required: "OTP is required",
              pattern: {
                value: /^\d{6}$/,
                message: "OTP must be 6 digits",
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="6-Digit OTP"
                type="text"
                inputProps={{ maxLength: 6 }}
                disabled={loading}
                error={!!errors.otp}
                helperText={errors.otp?.message || "Check your email"}
                sx={{ mb: 3 }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Verify Email"
            )}
          </Button>

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?{" "}
              <Link
                component="button"
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend OTP"}
              </Link>
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Link
              component="button"
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              <ArrowBack fontSize="small" /> Back to Login
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
