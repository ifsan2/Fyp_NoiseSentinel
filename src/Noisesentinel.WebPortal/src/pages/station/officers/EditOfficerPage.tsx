import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { FormCard } from "@/components/common/FormCard";
import { STATION_ROUTES, OFFICER_RANKS } from "@/utils/stationConstants";
import { validation, validationMessages } from "@/utils/validation";
import stationOfficerApi from "@/api/stationOfficerApi";
import { UpdateStationOfficerDto } from "@/models/User";

export const EditOfficerPage: React.FC = () => {
  const navigate = useNavigate();
  const { officerId } = useParams<{ officerId: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStationOfficerDto>();

  useEffect(() => {
    if (officerId) {
      loadOfficer();
    }
  }, [officerId]);

  const loadOfficer = async () => {
    setLoadingData(true);
    try {
      // Get officer details via User endpoint
      const officers = await stationOfficerApi.getAllOfficers();
      const officer = officers.find(
        (o) => o.officerId === parseInt(officerId!)
      );

      if (!officer) {
        throw new Error("Officer not found");
      }

      reset({
        fullName: officer.fullName,
        email: officer.email,
        cnic: officer.cnic,
        contactNo: officer.contactNo,
        badgeNumber: officer.badgeNumber,
        rank: officer.rank,
        isInvestigationOfficer: officer.isInvestigationOfficer,
      });
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to load officer",
        { variant: "error" }
      );
      navigate(STATION_ROUTES.OFFICERS);
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: UpdateStationOfficerDto) => {
    setLoading(true);
    try {
      await stationOfficerApi.updateOfficer(parseInt(officerId!), data);
      enqueueSnackbar("Officer updated successfully", { variant: "success" });
      navigate(STATION_ROUTES.OFFICERS);
    } catch (error: any) {
      enqueueSnackbar(
        error.response?.data?.message || "Failed to update officer",
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
        title="Edit Police Officer"
        subtitle="Update officer information"
        breadcrumbs={[
          { label: "Dashboard", path: STATION_ROUTES.DASHBOARD },
          { label: "Police Officers", path: STATION_ROUTES.OFFICERS },
          { label: "Edit Officer" },
        ]}
      />

      <FormCard title="Officer Information">
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
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    required
                    fullWidth
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
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="email"
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* CNIC */}
            <Grid item xs={12} md={4}>
              <Controller
                name="cnic"
                control={control}
                rules={{
                  required: validationMessages.required("CNIC"),
                  pattern: {
                    value: /^\d{5}-\d{7}-\d{1}$/,
                    message: "CNIC format: 12345-1234567-1",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CNIC"
                    placeholder="12345-1234567-1"
                    error={!!errors.cnic}
                    helperText={errors.cnic?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Contact Number */}
            <Grid item xs={12} md={4}>
              <Controller
                name="contactNo"
                control={control}
                rules={{
                  required: validationMessages.required("Contact number"),
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Number"
                    placeholder="+92-300-1234567"
                    error={!!errors.contactNo}
                    helperText={errors.contactNo?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Badge Number */}
            <Grid item xs={12} md={4}>
              <Controller
                name="badgeNumber"
                control={control}
                rules={{
                  required: validationMessages.required("Badge number"),
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Badge Number"
                    error={!!errors.badgeNumber}
                    helperText={errors.badgeNumber?.message}
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Rank */}
            <Grid item xs={12} md={6}>
              <Controller
                name="rank"
                control={control}
                rules={{ required: validationMessages.required("Rank") }}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.rank}>
                    <InputLabel>Rank</InputLabel>
                    <Select {...field} label="Rank">
                      <MenuItem value="">Select Rank</MenuItem>
                      {OFFICER_RANKS.map((rank) => (
                        <MenuItem key={rank} value={rank}>
                          {rank}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.rank && (
                      <Box
                        sx={{
                          color: "error.main",
                          fontSize: "0.75rem",
                          mt: 0.5,
                        }}
                      >
                        {errors.rank.message}
                      </Box>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Investigation Officer */}
            <Grid item xs={12} md={6}>
              <Controller
                name="isInvestigationOfficer"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    }
                    label="Investigation Officer (IO)"
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
                  onClick={() => navigate(STATION_ROUTES.OFFICERS)}
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
                  {loading ? "Updating..." : "Update Officer"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </FormCard>
    </Box>
  );
};
