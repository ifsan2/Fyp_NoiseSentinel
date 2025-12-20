import React, { useState } from "react";
import { Box, TextField, Button, Grid, Alert } from "@mui/material";
import { Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import authApi from "@/api/authApi";
import { CreateStationAuthorityDto } from "@/models/Auth";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { ROUTES } from "@/utils/constants";
import { validation, validationMessages } from "@/utils/validation";

export const CreateStationAuthorityPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStationAuthorityDto>({
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
    },
  });

  const onSubmit = async (data: CreateStationAuthorityDto) => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await authApi.createStationAuthority(data);

      setSuccessMessage(
        `Station Authority account "${response.username}" created successfully!`
      );
      enqueueSnackbar("Station Authority created successfully!", {
        variant: "success",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        reset();
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to create Station Authority account.";
      setErrorMessage(message);
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Station Authority"
        subtitle="Create a new police station administrator who can manage officers"
        breadcrumbs={[
          { label: "Dashboard", path: ROUTES.DASHBOARD },
          { label: "Create Station Authority" },
        ]}
      />

      <FormCard title="Station Authority Account Details">
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
                  required: validationMessages.required("Full name"),
                  minLength: {
                    value: 3,
                    message: validationMessages.minLength("Full name", 3),
                  },
                  maxLength: {
                    value: 255,
                    message: validationMessages.maxLength("Full name", 255),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    placeholder="e.g., Lahore Police Admin"
                    fullWidth
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
                  required: validationMessages.required("Email"),
                  validate: (value) =>
                    validation.email(value) || validationMessages.email,
                  maxLength: {
                    value: 255,
                    message: validationMessages.maxLength("Email", 255),
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="Email"
                    placeholder="e.g., lahore@police.gov.pk"
                    fullWidth
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
                  required: validationMessages.required("Username"),
                  minLength: {
                    value: 3,
                    message: validationMessages.minLength("Username", 3),
                  },
                  maxLength: {
                    value: 255,
                    message: validationMessages.maxLength("Username", 255),
                  },
                  validate: (value) =>
                    validation.username(value) || validationMessages.username,
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    placeholder="e.g., lahore_station"
                    fullWidth
                    error={!!errors.username}
                    helperText={
                      errors.username?.message ||
                      "Letters, numbers, underscores, and hyphens only"
                    }
                    required
                  />
                )}
              />
            </Grid>

            {/* Auto-Generated Password Info */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Password:</strong> A secure temporary password will be
                automatically generated and emailed to the user. They can change
                it after their first login.
              </Alert>
            </Grid>

            {/* Info Box */}
            <Grid item xs={12}>
              <Alert severity="info">
                <strong>Station Authority Permissions:</strong>
                <br />
                • Can create Police Officer accounts
                <br />
                • Can register IoT devices and manage Violations
                <br />
                • Can file FIRs for cognizable violations
                <br />
                • Can view all Challans and Emission Reports
                <br />• Cannot issue Challans (only Police Officers can)
              </Alert>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
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
                  {loading ? "Creating Account..." : "Create Station Authority"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
