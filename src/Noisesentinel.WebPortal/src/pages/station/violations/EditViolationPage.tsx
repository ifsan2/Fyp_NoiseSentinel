import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { STATION_ROUTES } from "@/utils/stationConstants";
import violationApi from "@/api/violationApi";
import { UpdateViolationDto } from "@/models/Violation";

export const EditViolationPage: React.FC = () => {
  const navigate = useNavigate();
  const { violationId } = useParams<{ violationId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateViolationDto>();

  useEffect(() => {
    if (violationId) {
      loadViolation();
    }
  }, [violationId]);

  const loadViolation = async () => {
    setLoadingData(true);
    try {
      const data = await violationApi.getViolationById(parseInt(violationId!));
      reset({
        violationId: data.violationId,
        violationType: data.violationType,
        description: data.description,
        penaltyAmount: data.penaltyAmount,
        sectionOfLaw: data.sectionOfLaw,
        isCognizable: data.isCognizable,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load violation",
        { variant: "error" }
      );
      navigate(STATION_ROUTES.VIOLATIONS);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UpdateViolationDto) => {
    setLoading(true);
    try {
      await violationApi.updateViolation(data);
      enqueueSnackbar("Violation updated successfully", { variant: "success" });
      navigate(STATION_ROUTES.VIOLATIONS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update violation",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Edit Violation Type"
        subtitle="Update violation type information"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Violations", path: STATION_ROUTES.VIOLATIONS },
          { label: "Edit Violation" },
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
                  {loading ? "Updating..." : "Update Violation"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
