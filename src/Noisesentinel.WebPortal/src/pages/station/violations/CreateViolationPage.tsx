import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { STATION_ROUTES } from "@/utils/stationConstants";
import violationApi from "@/api/violationApi";
import { CreateViolationDto } from "@/models/Violation";

export const CreateViolationPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateViolationDto>({
    defaultValues: {
      isCognizable: false,
    },
  });

  const onSubmit = async (data: CreateViolationDto) => {
    setLoading(true);
    try {
      await violationApi.createViolation(data);
      enqueueSnackbar("Violation type created successfully", {
        variant: "success",
      });
      navigate(STATION_ROUTES.VIOLATIONS);
    } catch (error: any) {
      // Extract validation errors if they exist
      const validationErrors = error.response?.data?.errors;
      let errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create violation";

      // If there are validation errors, format them nicely
      if (validationErrors && typeof validationErrors === "object") {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(", ")}`;
          })
          .join(" | ");
        errorMessage = errorMessages || errorMessage;
      }

      enqueueSnackbar(errorMessage, { variant: "error" });

      // Log for debugging
      console.error("Create violation error:", {
        status: error.response?.status,
        message: errorMessage,
        validationErrors: validationErrors,
        fullError: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Create Violation Type"
        subtitle="Add a new violation type with penalty details"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Violations", path: STATION_ROUTES.VIOLATIONS },
          { label: "Create Violation" },
        ]}
      />

      <FormCard title="Violation Information">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Violation Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="violationType"
                control={control}
                rules={{
                  required: "Violation name is required",
                  minLength: {
                    value: 3,
                    message: "Violation name must be at least 3 characters",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Violation Name"
                    placeholder="e.g., Modified Silencer"
                    error={!!errors.violationType}
                    helperText={errors.violationType?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Penalty Amount */}
            <Grid item xs={12} md={6}>
              <Controller
                name="penaltyAmount"
                control={control}
                rules={{
                  required: "Penalty amount is required",
                  min: {
                    value: 1,
                    message: "Penalty must be greater than 0",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Penalty Amount (PKR)"
                    placeholder="e.g., 5000"
                    error={!!errors.penaltyAmount}
                    helperText={errors.penaltyAmount?.message}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">PKR</InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    label="Description"
                    placeholder="e.g., Vehicle equipped with modified/tampered exhaust silencer causing excessive noise"
                    multiline
                    rows={3}
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Section of Law */}
            <Grid item xs={12} md={6}>
              <Controller
                name="sectionOfLaw"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value || ""}
                    label="Section of Law"
                    placeholder="e.g., Section 42(6) Motor Vehicle Ordinance 1965"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Is Cognizable */}
            <Grid item xs={12} md={6}>
              <Controller
                name="isCognizable"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Cognizable Offense (FIR can be filed)"
                  />
                )}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(STATION_ROUTES.VIOLATIONS)}
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
                  {loading ? "Creating..." : "Create Violation"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
