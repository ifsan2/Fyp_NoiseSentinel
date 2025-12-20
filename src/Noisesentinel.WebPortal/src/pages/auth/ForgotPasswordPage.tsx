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
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ShieldOutlined,
  Email,
  Lock,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import authApi from "@/api/authApi";
import { ROUTES, PASSWORD_REGEX } from "@/utils/constants";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

const steps = ["Enter Email", "Verify OTP", "New Password"];

export const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Step tracking
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field errors
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setEmailError("");
    setErrorMessage("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const message = await authApi.forgotPassword(email);
      setSuccessMessage(message);
      setActiveStep(1);
      enqueueSnackbar("OTP sent to your email", { variant: "success" });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to send OTP. Please try again.";
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setOtpError("");
    setErrorMessage("");

    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      const message = await authApi.verifyResetOtp({ email, otp });
      setSuccessMessage(message);
      setActiveStep(2);
      enqueueSnackbar("OTP verified successfully", { variant: "success" });
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid or expired OTP";
      setOtpError(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    setPasswordError("");
    setConfirmPasswordError("");
    setErrorMessage("");

    let hasError = false;

    if (!newPassword) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (!PASSWORD_REGEX.test(newPassword)) {
      setPasswordError(
        "Password must have 8+ chars, uppercase, lowercase, number, and special character"
      );
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      setLoading(true);
      const message = await authApi.resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      enqueueSnackbar("Password reset successfully!", { variant: "success" });
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to reset password";
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      enqueueSnackbar("OTP resent to your email", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar("Failed to resend OTP", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your email address and we'll send you an OTP to reset your
              password.
            </Typography>

            <TextField
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={!!emailError}
              helperText={emailError}
              fullWidth
              sx={{ mb: 3 }}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleRequestOtp}
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600, mb: 2 }}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Enter Verification Code
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a 6-digit code to <strong>{email}</strong>
            </Typography>

            <TextField
              label="OTP Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(value);
                setOtpError("");
              }}
              error={!!otpError}
              helperText={otpError}
              fullWidth
              sx={{ mb: 3 }}
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  fontSize: "1.5rem",
                  letterSpacing: "0.5rem",
                  textAlign: "center",
                },
              }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleVerifyOtp}
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600, mb: 2 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Didn't receive the code?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleResendOtp}
                  disabled={loading}
                  sx={{ fontWeight: 600, cursor: "pointer" }}
                >
                  Resend OTP
                </Link>
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Set New Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a strong password for your account
            </Typography>

            <TextField
              label="New Password"
              placeholder="Enter new password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              error={!!passwordError}
              helperText={passwordError}
              fullWidth
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              placeholder="Confirm new password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError("");
              }}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              fullWidth
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Requirements */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.02)"
                    : "rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1 }}
              >
                Password requirements:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography
                  component="li"
                  variant="caption"
                  color={
                    newPassword.length >= 8 ? "success.main" : "text.secondary"
                  }
                >
                  Minimum 8 characters
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  color={
                    /[A-Z]/.test(newPassword)
                      ? "success.main"
                      : "text.secondary"
                  }
                >
                  At least one uppercase letter
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  color={
                    /[a-z]/.test(newPassword)
                      ? "success.main"
                      : "text.secondary"
                  }
                >
                  At least one lowercase letter
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  color={
                    /\d/.test(newPassword) ? "success.main" : "text.secondary"
                  }
                >
                  At least one number
                </Typography>
                <Typography
                  component="li"
                  variant="caption"
                  color={
                    /[@$!%*?&]/.test(newPassword)
                      ? "success.main"
                      : "text.secondary"
                  }
                >
                  At least one special character (@$!%*?&)
                </Typography>
              </Box>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleResetPassword}
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 600, mb: 2 }}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
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

      {/* Back Button */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1000,
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(ROUTES.LOGIN)}
          sx={{ fontWeight: 500 }}
        >
          Back to Login
        </Button>
      </Box>

      <Box sx={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <BrandLogo size="medium" showText={true} />
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel
                StepIconProps={{
                  icon:
                    activeStep > index ? (
                      <CheckCircle color="success" />
                    ) : undefined,
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Card */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          {/* Error Alert */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
              {errorMessage}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && activeStep === 1 && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: "8px" }}>
              {successMessage}
            </Alert>
          )}

          {/* Step Content */}
          {renderStepContent()}
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              color: theme.palette.text.disabled,
            }}
          >
            <ShieldOutlined sx={{ fontSize: 16 }} />
            <Typography variant="caption">Secure Password Reset</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
